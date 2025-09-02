import {
  ProtobufRpcClient,
  QueryClient,
  StargateClient,
} from '@cosmjs/stargate'
import {
  Comet38Client,
  connectComet,
} from '@cosmjs/tendermint-rpc'
import {
  QueryAllBalancesRequest,
  QueryBalanceRequest,
  QueryClientImpl as BankQueryClientImpl,
  QuerySpendableBalanceByDenomRequest,
} from '@/proto/generated/cosmos/bank/v1beta1/query'
import { Buffer } from 'buffer'
import {
  QueryClientImpl as SupplierQueryClientImpl,
  QueryGetSupplierRequest,
  QueryGetSupplierResponse,
} from '@/proto/generated/pocket/supplier/query'
import {
  PocketExtension,
  SendTransactionResult,
  TransactionResult,
} from '@/types'
import { Coin } from '@/proto/generated/cosmos/base/v1beta1/coin'
import { Supplier } from '@/proto/generated/pocket/shared/supplier'

export * from './types'

/**
 * Creates a Protobuf-based RPC client for querying a blockchain using a QueryClient.
 *
 * This client sends Protobuf-encoded requests to a specified service and method
 * and returns the Protobuf-encoded response received from the blockchain. It uses
 * the provided QueryClient for ABCI queries, enabling interaction with the
 * blockchain's query interface.
 *
 * @param {QueryClient} base - The base instance of QueryClient used to execute ABCI queries.
 * @param {number} [height] - Optional block height for which the queries should be executed.
 *                            If not provided, the latest block height is used.
 *
 * @returns {ProtobufRpcClient} A client capable of making Protobuf-encoded RPC requests.
 */
const createProtobufRpcClient = function (base: QueryClient, height?: number): ProtobufRpcClient {
  return {
    request: async (service: string, method: string, data: Uint8Array): Promise<Uint8Array> => {
      const path = `/${service}/${method}`
      const response = await base.queryAbci(path, data, height)
      return response.value
    },
  }
}

/**
 * Creates a new QueryClient with Pocket extension methods.
 * @param height Optional block height for which the queries should be executed.
 */
const setupPocketExtension = (height?: number) => (base: QueryClient): PocketExtension => {
  const rpc = createProtobufRpcClient(base, height)

  // Use this service to get easy typed access to query methods
  // This cannot be used for proof verification
  const bankQueryService = new BankQueryClientImpl(rpc)
  const supplierQueryService = new SupplierQueryClientImpl(rpc)

  return {
    bank: {
      balance: async (address: string, denom: string = 'upokt') => {
        let { balance } = await bankQueryService.Balance(
          QueryBalanceRequest.fromPartial({ address, denom }),
        )

        if (!balance) balance = Coin.fromPartial({ denom, amount: '0' })

        return balance
      },
      spendableBalanceByDenom: async (address: string, denom: string = 'upokt') => {
        let { balance } = await bankQueryService.SpendableBalanceByDenom(
          QuerySpendableBalanceByDenomRequest.fromPartial({ address, denom }),
        )

        if (!balance) balance = Coin.fromPartial({ denom, amount: '0' })

        return balance
      },
      allBalances: async (address: string) => {
        const { balances } = await bankQueryService.AllBalances(
          QueryAllBalancesRequest.fromPartial({ address: address }),
        )
        return balances
      },
    },
    supplier: {
      getSupplier: async (operatorAddress: string) => {
        const { supplier } = await supplierQueryService.Supplier(
          QueryGetSupplierRequest.fromPartial({ operatorAddress }),
        )
        return supplier || null
      },
    },
  }
}

/**
 * Returns a QueryClient with PocketExtension initialized using the provided Comet38Client.
 *
 * @param {Comet38Client} cometClient - The client to be used for creating the QueryClient.
 * @param {number} [height] - Optional height parameter to set up the PocketExtension.
 * @return {QueryClient & PocketExtension} The QueryClient with the added PocketExtension.
 */
export default function getQueryClient(cometClient: Comet38Client, height?: number): QueryClient & PocketExtension {
  return QueryClient.withExtensions(
    cometClient,
    setupPocketExtension(height),
  )
}

/**
 * A class that provides a wrapper around the StargateClient and Comet38Client for interacting with the blockchain.
 * It provides methods to connect, disconnect, get the balance, get the height, send a transaction, and retrieve transaction details.
 * It also provides methods to get the supplier address for a given address.
 */
export class PocketBlockchain {
  protected readonly rpcUrl: string
  protected readonly denom: string
  protected stargateClient: StargateClient | undefined
  protected cometClient: Comet38Client | undefined

  /**
   * @param rpcUrl bech32 Cosmos SDK RPC endpoint, e.g. https://rpc.cosmos.network
   * @param denom  staking token denom, e.g. "uatom" or "upokt"
   */
  private constructor(rpcUrl: string, denom: string = 'upokt') {
    this.rpcUrl = rpcUrl
    this.denom = denom
  }

  /**
   * Sets up a new instance of the Blockchain class and establishes a connection.
   *
   * @param {string} rpcUrl - The RPC URL for the blockchain connection.
   * @param {string} [denom='upokt'] - The denomination to be used, defaults to 'upokt'.
   * @return {Promise<Blockchain>} A promise that resolves to an instance of the Blockchain class.
   */
  static async setup(rpcUrl: string, denom: string = 'upokt') {
    const blockchain = new PocketBlockchain(rpcUrl, denom)
    await blockchain.connect()
    return blockchain
  }

  /**
   * Connects to the blockchain and initializes the client.
   * NOTE: This method should be called before using any other methods, otherwise they will do it.
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    try {
      if (!this.cometClient) this.cometClient = await connectComet(this.rpcUrl) as Comet38Client
      if (!this.stargateClient) this.stargateClient = await StargateClient.create(this.cometClient, {})
    } catch (error) {
      console.error('Failed to connect to the blockchain:', error)
      throw new Error('Failed to connect to the blockchain.')
    }
  }

  /**
   * Returns the configured StargateClient instance.
   * @throws Error if the client is not initialized
   */
  async getStargateClient(): Promise<StargateClient> {
    if (!this.stargateClient) {
      await this.connect()
    }
    return this.stargateClient!
  }

  /**
   * Returns the configured Comet38Client instance.
   * @throws Error if the client is not initialized
   */
  async getCometClient(): Promise<Comet38Client> {
    if (!this.cometClient) {
      await this.connect()
    }

    return this.cometClient!
  }

  /** Disconnects StartGate client. */
  disconnect(): void {
    if (this.stargateClient) {
      this.stargateClient.disconnect()
      this.stargateClient = undefined
    }
    if (this.cometClient) {
      this.cometClient.disconnect()
      this.cometClient = undefined
    }
  }

  /** Returns the numeric token balance for `address` in the configured `denom`. */
  async getBalance(address: string, height?: number): Promise<number> {
    const client = await this.getCometClient()
    const queryClient = getQueryClient(client, height)

    const coin = await queryClient.bank.balance(address, this.denom)

    return parseInt(coin.amount, 10)
  }

  /** Returns the latest block height from the chain. */
  async getHeight(): Promise<number> {
    const client = await this.getStargateClient()

    try {
      return await client.getHeight()
    } catch (err) {
      console.error(err)
      throw new Error('Unable to fetch the height from the blockchain.')
    }
  }

  /**
   * Broadcasts a signed transaction (hex-encoded) to the network.
   * @param payload hex string of the signed tx bytes
   * @returns transactionHash and the full BroadcastTxResponse
   */
  async sendTransaction(payload: string): Promise<SendTransactionResult> {
    const client = await this.getStargateClient()
    const txBytes = Buffer.from(payload, 'hex')
    try {
      const transactionHash = await client.broadcastTxSync(txBytes)
      return { transactionHash, success: true }
    } catch (error) {
      const { code, message } = error as { code: number; message: string }
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
    const client = await this.getStargateClient()

    try {
      const tx = await client.getTx(txHash)

      if (!tx) {
        return null
      }

      return {
        hash: txHash,
        height: tx.height,
        index: tx.txIndex,
        gasUsed: tx.gasUsed,
        gasWanted: tx.gasWanted,
        success: tx.code === 0,
        code: tx.code,
      }
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return null
    }
  }

  /**
   * Retrieves the supplier address for a given address.
   * @param address Supplier address to look up.
   * @param height The height to query for.
   * @returns The supplier address or null if not found.
   */
  async getSupplier(address: string, height?: number): Promise<Supplier | null> {
    const client = await this.getCometClient()
    const queryClient = getQueryClient(client, height)

    try {
      return await queryClient.supplier.getSupplier(address)
    } catch (e) {
      if((e as Error).message.includes('code = NotFound')) {
        return null
      }
      throw e
    }
  }
}
