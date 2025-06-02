import {
  proxyActivities,
} from "@temporalio/workflow";
import { delegatorActivities } from "../activities";
import {TransactionStatus} from "../lib/db/schema";
import {SendTransactionResult} from "@/lib/blockchain";


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
    createNewNodesFromTransaction,
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

  const txHeight = await getBlockHeight();

  let result: SendTransactionResult | null = null;

  if (!transaction.hash) {
    result = await executeTransaction(
      transaction.id,
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
  }

  const { waitForNextBlock } = proxyActivities<
    ReturnType<typeof delegatorActivities>
  >({
    startToCloseTimeout: "45m",
    heartbeatTimeout: "6m",
    retry: {
      maximumAttempts: 200,
    },
  });

  await waitForNextBlock(txHeight);

  const [success, code, gasUsed] = await verifyTransaction(result?.transactionHash || transaction.hash!);

  const txStatus = success ? TransactionStatus.Success : TransactionStatus.Failure;

  const verificationHeight = await getBlockHeight();

  await updateTransaction(transactionId, {
    status: txStatus,
    verificationHeight,
    consumedFee: Number(gasUsed || 0),
  });

  if (success) {
    const newNodes = await createNewNodesFromTransaction(transaction.id);

    return {
      ...transaction,
      status: txStatus,
      hash: result?.transactionHash || transaction.hash,
      txHeight,
      newNodes: newNodes || [],
      code,
    };
  }

  return {
    ...transaction,
    status: txStatus,
    hash: result?.transactionHash || transaction.hash,
    txHeight,
    newNodes: [],
    code,
  };
}
