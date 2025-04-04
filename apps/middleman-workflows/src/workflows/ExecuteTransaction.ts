import { log, proxyActivities, startChild } from "@temporalio/workflow";
import { createActivities } from "../activities";
import { TransactionStatus } from "../lib/db/schema";

interface TransactionArgs {
  transactionId: number;
}

export async function ExecuteTransaction(args: TransactionArgs) {
  const { transactionId } = args;

  const {
    getTransaction,
    updateTransaction,
    executeTransaction,
    getBlockHeight,
    verifyTransaction,
    getDependantTransactions,
  } = proxyActivities<ReturnType<typeof createActivities>>({
    startToCloseTimeout: "30s",
    retry: {
      maximumAttempts: 3,
    },
  });

  const transaction = await getTransaction(transactionId);

  if (!transaction || !transaction.signedPayload) {
    throw new Error("Transaction not found");
  }

  const txHeight = await getBlockHeight();

  const hash = await executeTransaction(
    transaction.fromAddress,
    transaction.signedPayload
  );

  if (!hash) {
    throw new Error("Transaction failed");
  }

  const { waitForNextBlock } = proxyActivities<
    ReturnType<typeof createActivities>
  >({
    startToCloseTimeout: "45m",
    heartbeatTimeout: "6m",
    retry: {
      maximumAttempts: 3,
    },
  });

  await waitForNextBlock(txHeight);

  const status = await verifyTransaction(hash);

  const txStatus = (status.code ? "failed" : "success") as TransactionStatus;

  await updateTransaction(transactionId, {
    status: txStatus,
    hash,
  });

  const dependantTransactions = await getDependantTransactions(transactionId);

  for (const transaction of dependantTransactions) {
    await startChild(ExecuteTransaction, {
      args: [
        {
          transactionId: transaction.id,
        },
      ],
      workflowTaskTimeout: "1m",
      workflowId: `ExecuteTransaction-${transaction.id}`,
    });
  }

  if (dependantTransactions.length > 0) {
    log.info(
      `Triggered ${dependantTransactions.length} transactions as child workflows.`
    );
  }

  return hash;
}
