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

  const txs = await listTransactions();

  for (const {id, createdAt} of txs) {
    const workflowId = `ExecuteTransaction-${id}-${createdAt}`;
    await executeChild("ExecuteTransaction", {
      workflowId,
      args: [{ transactionId: id }],
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY,
      retry: {
        maximumAttempts: 5,
      },
    }).catch((err) => {
      if (err.name === "WorkflowExecutionAlreadyStartedError") {
        console.log(`Workflow with ID=${workflowId} is already running, skipping.`);
      } else {
        throw err;
      }
    });
  }
}
