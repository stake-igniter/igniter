import { heartbeat, sleep } from "@temporalio/activity";
import { RawTxRequest } from "@pokt-foundation/pocketjs-types";
import { BlockchainProvider } from "../lib/blockchain";
import * as activityDAL from "../lib/dal/activity";
import * as transactionDAL from "../lib/dal/transaction";
import * as providerDAL from "../lib/dal/provider";
import {
  Activity,
  Provider,
  ProviderStatus,
  Transaction,
} from "../lib/db/schema";

export const createActivities = (blockchainProvider: BlockchainProvider) => ({
  async getActivity(activityId: number) {
    const activity = await activityDAL.getActivity(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return activity;
  },
  async updateActivity(activityId: number, payload: Partial<Activity>) {
    const activity = await activityDAL.getActivity(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return await activityDAL.updateActivity(activityId, payload);
  },
  async getTransaction(transactionId: number) {
    const transaction = await transactionDAL.getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  },
  async getProviders() {
    const providers = await providerDAL.list();
    return providers;
  },
  async fetchProviderStatus(providers: Provider[]) {
    const providerStatus = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const STATUS_URL = `${provider.url}/api/status`;
          const status = await fetch(STATUS_URL, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const statusResponse = await status.json();

          let finalStatus;
          if (statusResponse.healthy) {
            finalStatus = ProviderStatus.Healthy;
          } else {
            finalStatus = ProviderStatus.Unhealthy;
          }

          return { ...provider, status: finalStatus };
        } catch (error) {
          console.error("Error fetching provider status:", error);
          return { ...provider, status: ProviderStatus.Unreachable };
        }
      })
    );

    const updatedProviders = providerStatus.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          ...result.reason,
        };
      }
    });

    return updatedProviders;
  },
  async updateProvidersStatus(providers: Provider[]) {
    await providerDAL.updatedProvidersStatus(providers);
  },
  async getDependantTransactions(transactionId: number) {
    return await transactionDAL.getDependantTransactions(transactionId);
  },
  async updateTransaction(
    transactionId: number,
    payload: Partial<Transaction>
  ) {
    const transaction = await transactionDAL.getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return await transactionDAL.updateTransaction(transactionId, payload);
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
