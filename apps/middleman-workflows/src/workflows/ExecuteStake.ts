import {
  ApplicationFailure,
  log,
  proxyActivities,
  startChild,
} from "@temporalio/workflow";
import { ExecuteTransaction } from "./ExecuteTransaction";
import { createActivities } from "../activities";
import {
  ActivityStatus,
  ActivityType,
  NewNode,
  NodeStatus,
} from "../lib/db/schema";
import { StakeTransactionMsg } from "../lib/types";
import { amountToPokt } from "./utils";

export interface StakeArgs {
  activityId: number;
}

export async function ExecuteStake(args: StakeArgs) {
  const { activityId } = args;

  const { getActivity, updateActivity, insertNodes, parseNodesPublicKey } =
    proxyActivities<ReturnType<typeof createActivities>>({
      startToCloseTimeout: "30s",
      retry: {
        maximumAttempts: 3,
      },
    });

  const activity = await getActivity(activityId);

  if (activity?.type !== ActivityType.Stake) {
    return "Activity is not a Stake, skipping";
  }

  if (activity.status !== ActivityStatus.Pending) {
    return "Activity is in process or already finished, skipping";
  }

  await updateActivity(activityId, {
    status: ActivityStatus.InProgress,
  });

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

  const activityStatus =
    failedWorkflows.length > 0
      ? ActivityStatus.Failure
      : ActivityStatus.Success;

  await updateActivity(activityId, {
    status: activityStatus,
  });

  if (failedWorkflows.length > 0) {
    log.error(`Failed workflows: ${failedWorkflows.length}`);
  }
  if (successfulWorkflows.length > 0) {
    log.info(`Successful workflows: ${successfulWorkflows.length}`);
  }

  if (successfulWorkflows.length > 0) {
    const nodes = successfulWorkflows.map((result) => {
      const transaction = result.value;
      const txMsg = transaction.txMsg as StakeTransactionMsg;
      const stakeParams = txMsg.value;
      return {
        publicKey: stakeParams.public_key.value,
        stakeAmount: amountToPokt(stakeParams.value),
        chains: stakeParams.chains,
        serviceUrl: stakeParams.service_url,
        outputAddress: stakeParams.output_address,
        status: NodeStatus.Staked,
        userId: transaction.userId,
        providerId: 0,
        balance: 0,
        rewards: 0,
      };
    });
    const nodesWithAddresses = await parseNodesPublicKey(nodes);
    await insertNodes(nodesWithAddresses as NewNode[]);
  }

  if (failedWorkflows.length > 0) {
    throw new ApplicationFailure("1 or more stake transactions failed");
  }

  return "Stake completed";
}
