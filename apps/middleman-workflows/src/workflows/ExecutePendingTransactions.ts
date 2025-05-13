import {proxyActivities, WorkflowIdReusePolicy} from "@temporalio/workflow";
import { delegatorActivities } from "../activities";
import {executeChild} from "@temporalio/workflow";

export interface ExecutePendingTransactionsArgs {}

export async function ExecutePendingTransactions(args: ExecutePendingTransactionsArgs) {
  const { listTransactions } =
    proxyActivities<ReturnType<typeof delegatorActivities>>({
      startToCloseTimeout: "30s",
      retry: {
        maximumAttempts: 3,
      },
    });

  const txIds = await listTransactions();

  for (const txId of txIds) {
    await executeChild("ExecuteTransaction", {
      args: [{ transactionId: txId }],
      workflowId: `ExecuteTransaction-${txId}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY,
      retry: {
        maximumAttempts: 5,
      },
    }).catch((err) => {
      if (err.name === "WorkflowExecutionAlreadyStartedError") {
        console.log(`Workflow with ID=${txId} is already running, skipping.`);
      } else {
        throw err;
      }
    });
  }
}
