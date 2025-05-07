import { heartbeat, sleep } from "@temporalio/activity";
import { RawTxRequest } from "@pokt-foundation/pocketjs-types";
import { BlockchainProvider } from "@/lib/blockchain";
import * as transactionDAL from "../lib/dal/transaction";
import * as providerDAL from "../lib/dal/provider";
import {
  Provider,
  ProviderStatus,
  Transaction,
} from "../lib/db/schema";
import {REQUEST_IDENTITY_HEADER, REQUEST_SIGNATURE_HEADER} from "../lib/constants";
import {signPayload} from "../lib/crypto"
import {getApplicationSettingsFromDatabase} from "../lib/dal/applicationSettings";

export const createActivities = (blockchainProvider: BlockchainProvider) => ({
  async getTransaction(transactionId: number) {
    const transaction = await transactionDAL.getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  },
  async listProviders() {
    return providerDAL.list();
  },
  async fetchProviderStatus(providers: Provider[]) {
    let identity: string;
    let signature: string;

    try {
      const applicationSettings = await getApplicationSettingsFromDatabase();
      identity = applicationSettings?.appIdentity ?? '';
    } catch (error) {
      throw new Error("Unable to load the application settings and determine the identity of the app");
    }

    try {
      const signatureBuffer = await signPayload(JSON.stringify({}));
      signature = signatureBuffer.toString('base64');
    } catch (error) {
      console.error(error);
      throw new Error('Unable to sign the payload.');
    }

    const providerStatus = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const STATUS_URL = `${provider.url}/api/status`;
          const status = await fetch(STATUS_URL, {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
              "Content-Type": "application/json",
              [REQUEST_IDENTITY_HEADER]: identity,
              [REQUEST_SIGNATURE_HEADER]: signature,
            },
          });

          const { healthy, ...statusProps } = await status.json();

          if (healthy) {
            return {
              ...statusProps,
              id: provider.id,
              status: ProviderStatus.Healthy,
            };
          } else {
            return {
              id: provider.id,
              status: ProviderStatus.Unhealthy,
            };
          }
        } catch (error) {
          console.error("Error fetching provider status:", error);
          return {
            id: provider.id,
            status: ProviderStatus.Unreachable,
          };
        }
      })
    );

    return providerStatus.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          ...result.reason,
        };
      }
    });
  },
  async updateProviders(providers: Provider[]) {
    await providerDAL.updateProviders(providers);
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
      heartbeat();
      currentHeight = await blockchainProvider.getBlockNumber();
    }
    return true;
  },
  async verifyTransaction(hash: string) {
    const tx = await blockchainProvider.getTransaction(hash);
    if (!tx) {
      throw new Error("Transaction data is incomplete or not found");
    }
    return [tx.tx_result, tx.stdTx.msg] as const;
  },
  // async parseNodesPublicKey(
  //   nodes: (Omit<NewNode, "address"> & { publicKey: string })[]
  // ) {
  //   return nodes.map(({ publicKey, ...rest }) => ({
  //     ...rest,
  //     address: addressFromPublicKey(Buffer.from(publicKey, "hex")),
  //   }));
  // },
  // async insertNodes(nodes: NewNode[]) {
  //   return await nodeDAL.insertNodes(nodes);
  // },
});
