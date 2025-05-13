import {StargateClient} from '@cosmjs/stargate';
import { Buffer } from 'buffer'

export interface SendTransactionResult {
  transactionHash: string;
  success: boolean;
  code?: number;
  message?: string;
}

export interface TransactionResult {
  hash: string;
  height: number;
  index?: number;
  gasUsed?: bigint;
  gasWanted?: bigint;
  success: boolean;
  code: number;
}

export interface IBlockchain {
  sendTransaction(payload: string): Promise<SendTransactionResult>;
  getBalance(address: string): Promise<number>;
  getHeight(): Promise<number>;
  getTransaction(txHash: string): Promise<TransactionResult | null>;
}

export class Blockchain implements IBlockchain {
  private readonly rpcUrl: string;
  private readonly denom: string;

  /**
   * @param rpcUrl bech32 Cosmos SDK RPC endpoint, e.g. https://rpc.cosmos.network
   * @param denom  staking token denom, e.g. "uatom" or "upokt"
   */
  constructor(rpcUrl: string, denom: string = 'upokt') {
    this.rpcUrl = rpcUrl;
    this.denom = denom;
  }

  /** Returns the numeric token balance for `address` in the configured `denom`. */
  async getBalance(address: string): Promise<number> {
    const client = await StargateClient.connect(this.rpcUrl);
    const coin = await client.getBalance(address, this.denom);
    return parseInt(coin.amount, 10);
  }

  /** Returns the latest block height from the chain. */
  async getHeight(): Promise<number> {

    const client = await StargateClient.connect(this.rpcUrl);

    try {
      return await client.getHeight();
    } catch (err) {
      console.error(err);
      throw new Error('Unable to fetch the height from the blockchain.');
    }
  }

  /**
   * Broadcasts a signed transaction (hex-encoded) to the network.
   * @param payload hex string of the signed tx bytes
   * @returns transactionHash and the full BroadcastTxResponse
   */
  async sendTransaction(payload: string): Promise<SendTransactionResult> {
    const client = await StargateClient.connect(this.rpcUrl);
    const txBytes = Buffer.from(payload, 'hex');
    try {
      const transactionHash = await client.broadcastTxSync(txBytes);
      return { transactionHash, success: true };
    } catch (error) {
      const { code, message } = error as { code: number; message: string };
      return {
        transactionHash: '',
        success: false,
        code,
        message,
      }
    }
  }

  /**
   * Retrieves transaction details by transaction hash
   * @param txHash The transaction hash to look up
   * @returns Transaction details or null if not found
   */
  async getTransaction(txHash: string): Promise<TransactionResult | null> {
    const client = await StargateClient.connect(this.rpcUrl);

    try {
      const tx = await client.getTx(txHash);

      if (!tx) {
        return null;
      }

      return {
        hash: txHash,
        height: tx.height,
        index: tx.txIndex,
        gasUsed: tx.gasUsed,
        gasWanted: tx.gasWanted,
        success: tx.code === 0,
        code: tx.code,
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }
}
