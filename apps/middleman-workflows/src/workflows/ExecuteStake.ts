import { log, proxyActivities, startChild } from "@temporalio/workflow";
import { ExecuteTransaction } from "./ExecuteTransaction";
import { createActivities } from "../activities";
import { ActivityStatus, ActivityType } from "../lib/db/schema";

export interface StakeArgs {
  activityId: number;
}

export async function ExecuteStake(args: StakeArgs) {
  const { activityId } = args;

  const { getMiddlemanActivity, updateMiddlemanActivity } = proxyActivities<
    ReturnType<typeof createActivities>
  >({
    startToCloseTimeout: "30s",
    retry: {
      maximumAttempts: 3,
    },
  });

  const activity = await getMiddlemanActivity(activityId);

  if (activity?.type !== ActivityType.Stake) {
    return "Activity is not a Stake, skipping";
  }

  const nonDependantTransactions = activity.transactions.filter(
    (transaction) => !transaction.dependsOn
  );

  const childWorkflows = [];
  for (const transaction of nonDependantTransactions) {
    const handle = await startChild(ExecuteTransaction, {
      args: [
        {
          transactionId: transaction.id,
        },
      ],
      workflowTaskTimeout: "1m",
      workflowId: `ExecuteTransaction-${transaction.id}`,
    });
    childWorkflows.push(handle.result());
  }

  log.info(`Waiting for ${childWorkflows.length} child workflows completion`);

  const results = await Promise.allSettled(childWorkflows);

  const failedWorkflows = results.filter(
    (result) => result.status === "rejected"
  );
  const successfulWorkflows = results.filter(
    (result) => result.status === "fulfilled"
  );

  const activityStatus = (
    failedWorkflows.length > 0 ? "failed" : "success"
  ) as ActivityStatus;

  await updateMiddlemanActivity(activityId, {
    status: activityStatus,
  });

  log.info(`Successful workflows: ${successfulWorkflows.length}`);
  log.error(`Failed workflows: ${failedWorkflows.length}`);

  if (failedWorkflows.length > 0) {
    throw new Error("1 or more stake transactions failed");
  }

  return "Stake completed";
}
