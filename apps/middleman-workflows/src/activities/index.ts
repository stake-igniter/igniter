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
  Transaction,
  TransactionStatus,
} from "@/lib/db/schema";
import {extractStakedNodes} from "@/workflows/utils";
import {providerServiceInstance} from "@/lib/provider";

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
      return txs.map(({ id, createdAt }) => ({ id, createdAt }));
  },
  async listProviders() {
    return providerDAL.list();
  },

  async fetchProviderStatus(providers: Provider[]) {
    const { signature, identity } = await providerServiceInstance.signPayload(JSON.stringify({}));

    const providerStatus = await Promise.allSettled(
      providers.map(async (provider) =>
        providerServiceInstance.status(provider, signature, identity))
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
  async createNewNodesFromTransaction(transactionId: number) : Promise<Pick<Node, 'id' | 'address'>[]> {
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
  async notifyProviderOfStakedAddresses(transactionId: number) {
    try {
      const transaction = await transactionDAL.getTransaction(transactionId);

      if (!transaction || !transaction.providerId) {
        return {
          success: false,
          message: 'Transaction not found or transaction is not associated to a provider.',
        }
      }

      const provider = await providerDAL.getProvider(transaction.providerId);

      if (!provider) {
        return {
          success: false,
          message: 'Provider not found.',
        }
      }

      const newlyStakedNodes = extractStakedNodes(transaction);

      const addresses = newlyStakedNodes.map(({ address }) => address);

      await providerServiceInstance.markStaked(addresses, provider);

      return {
        success: true,
        message: 'Successfully marked the addresses as staked.',
        addresses,
      };
    } catch (error) {
      const {message} = error as Error;
      console.log('Something went wrong while notifying the provider of the staked addresses.');
      console.error(error);
      return {
        success: false,
        message: message || 'An unknown error occurred while notifying the provider of the staked addresses.',
      }
    }
  }
});
