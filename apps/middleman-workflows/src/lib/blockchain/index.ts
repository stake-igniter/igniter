import {
  TransactionResponse,
  Block,
  Transaction,
  GetNodesOptions,
  Paginable,
  Node,
  Account,
  RawTxRequest,
} from "@pokt-foundation/pocketjs-types";

export interface BlockchainProvider {
  getBalance(address: string | Promise<string>): Promise<bigint>;
  sendTransaction(transaction: RawTxRequest): Promise<TransactionResponse>;
  getBlock(blockNumber: number): Promise<Block>;
  getTransaction(transactionHash: string): Promise<Transaction>;
  getBlockNumber(): Promise<number>;
  getNodes(getNodesOptions: GetNodesOptions): Promise<Paginable<Node>>;
  getNode({
    address,
    blockHeight,
  }: {
    address: string | Promise<string>;
    blockHeight?: number;
  }): Promise<Node>;
  getAccount(address: string | Promise<string>): Promise<Account>;
}
