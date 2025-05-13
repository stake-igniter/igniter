import {
  ApplicationFailure,
  log,
  proxyActivities,
  startChild,
} from "@temporalio/workflow";
import { delegatorActivities } from "../activities";
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
  } = proxyActivities<ReturnType<typeof delegatorActivities>>({
    startToCloseTimeout: "30s",
    retry: {
      maximumAttempts: 3,
    },
  });

  const transaction = await getTransaction(transactionId);

  if (transaction.status !== TransactionStatus.Pending) {
    throw new Error("Transaction is not pending");
  }

  if (!transaction.signedPayload) {
    throw new Error("Transaction has no signed payload");
  }

  const txHeight = await getBlockHeight();

  const result = await executeTransaction(
    transaction.signedPayload
  );

  if (!result.transactionHash) {
    await updateTransaction(transactionId, {
      status: TransactionStatus.Failure,
      code: result.code,
      log: result.message || 'unknown error',
    });

    return {
      ...transaction,
      status: TransactionStatus.Failure,
      code: result.code,
      log: result.message || 'unknown error',
    }
  }

  await updateTransaction(transactionId, {
    executionHeight: txHeight,
    hash: result.transactionHash,
  });

  const { waitForNextBlock } = proxyActivities<
    ReturnType<typeof delegatorActivities>
  >({
    startToCloseTimeout: "45m",
    heartbeatTimeout: "6m",
    retry: {
      maximumAttempts: 3,
    },
  });

  await waitForNextBlock(txHeight);

  const [success, code] = await verifyTransaction(result.transactionHash);

  const txStatus = success ? TransactionStatus.Success : TransactionStatus.Failure;

  const verificationHeight = await getBlockHeight();

  await updateTransaction(transactionId, {
    status: txStatus,
    verificationHeight,
  });

  if (txStatus === TransactionStatus.Failure) {
    throw new ApplicationFailure(
      `Transaction ${transaction.id} failed with code: ${code}`
    );
  }

  return {
    ...transaction,
    status: txStatus,
    hash: result.transactionHash,
    txHeight,
    code,
  };
}
