import {heartbeat, sleep} from "@temporalio/activity";
import {IBlockchain} from "@/lib/blockchain";
import * as transactionDAL from "../lib/dal/transaction";
import * as providerDAL from "../lib/dal/provider";
import * as nodesDAL from '../lib/dal/nodes';
import {
  CreateNode,
  Node,
  NodeStatus,
  Provider,
  ProviderStatus,
  Transaction,
  TransactionStatus,
} from "../lib/db/schema";
import {REQUEST_IDENTITY_HEADER, REQUEST_SIGNATURE_HEADER} from "../lib/constants";
import {signPayload} from "../lib/crypto"
import {getApplicationSettingsFromDatabase} from "../lib/dal/applicationSettings";
import {extractStakedNodes} from "@/workflows/utils";

export const delegatorActivities = (blockchainProvider: IBlockchain) => ({
  async getTransaction(transactionId: number) {
    const transaction = await transactionDAL.getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found on the database");
    }
    return {
      id: transaction.id,
      hash: transaction.hash,
      status: transaction.status,
    };
  },
  async listTransactions() {
      const txs = await transactionDAL.listByStatus(TransactionStatus.Pending);
      return txs.map(({ id }) => id);
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
  async executeTransaction(transactionId: number) {
    const transaction = await transactionDAL.getTransaction(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (!transaction.signedPayload) {
      throw new Error("Transaction is not signed");
    }

    return blockchainProvider.sendTransaction(transaction.signedPayload);
  },
  async getBlockHeight() {
    return await blockchainProvider.getHeight();
  },
  async waitForNextBlock(txHeight: number): Promise<boolean> {
    let currentHeight = await blockchainProvider.getHeight();
    while (currentHeight < txHeight + 1) {
      await sleep(30 * 1000);
      heartbeat();
      currentHeight = await blockchainProvider.getHeight();
    }
    return true;
  },
  async verifyTransaction(hash: string) {
    const tx = await blockchainProvider.getTransaction(hash);
    if (!tx) {
      throw new Error("Transaction data is incomplete or not found");
    }
    return [tx.success, tx.code, tx.gasUsed?.toString() || "0"] as const;
  },
  async createNewNodesFromTransaction(transactionId: number) : Promise<Pick<Node, 'id'>[]> {
    try {
      const transaction = await transactionDAL.getTransaction(transactionId);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const newlyStakedNodes = extractStakedNodes(transaction);

      const newNodes: CreateNode[] = newlyStakedNodes.map(({ address, stakeAmount, balance, ownerAddress }) => ({
        status: NodeStatus.Staked,
        ownerAddress,
        stakeAmount,
        balance,
        address,
        providerId: transaction.providerId,
        createdBy: transaction.createdBy,
      }));

      return nodesDAL.insert(newNodes, transaction.id);
    } catch (error) {
      console.log('Something went wrong while parsing the transaction to extract the staked nodes information.');
      console.error(error);
      return [];
    }
  },
});
