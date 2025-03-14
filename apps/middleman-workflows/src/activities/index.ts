import { heartbeat, sleep, ApplicationFailure } from "@temporalio/activity";
import { BlockchainProvider } from "../lib/blockchain";
import {
  createActivity,
  getActivity,
  updateActivity,
} from "../lib/dal/activity";
import {
  getDependantTransactions,
  getTransaction,
  updateTransaction,
} from "../lib/dal/transaction";
import { RawTxRequest } from "@pokt-foundation/pocketjs-types";
import { Activity, Transaction } from "../lib/db/schema";

export const createActivities = (blockchainProvider: BlockchainProvider) => ({
  async getMiddlemanActivity(activityId: number) {
    const activity = await getActivity(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return activity;
  },
  async updateMiddlemanActivity(
    activityId: number,
    payload: Partial<Activity>
  ) {
    const activity = await getActivity(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return await updateActivity(activityId, payload);
  },
  async getMiddlemanTransaction(transactionId: number) {
    const transaction = await getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  },
  async getMiddlemanDependantTransactions(transactionId: number) {
    return await getDependantTransactions(transactionId);
  },
  async updateMiddlemanTransaction(
    transactionId: number,
    payload: Partial<Transaction>
  ) {
    const transaction = await getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return await updateTransaction(transactionId, payload);
  },
  async executeTransaction(address: string, signedPayload: string) {
    const request = new RawTxRequest(address, signedPayload);
    const txResponse = await blockchainProvider.sendTransaction(request);
    return txResponse.txHash;
  },
  async getBlockHeight() {
    return await blockchainProvider.getBlockNumber();
  },
  async waitForNextBlock(txHeight: number): Promise<boolean> {
    let currentHeight = await blockchainProvider.getBlockNumber();
    while (currentHeight < txHeight + 2) {
      await sleep(5 * 60 * 1000);
      await heartbeat();
      currentHeight = await blockchainProvider.getBlockNumber();
    }
    return true;
  },
  async verifyTransaction(hash: string) {
    const tx = await blockchainProvider.getTransaction(hash);
    return tx.tx_result;
  },
  async simulateTransaction(transactionId: number) {
    await sleep(3 * 60 * 1000);
    return {
      transactionId,
      status: "success",
    };
  },
});
