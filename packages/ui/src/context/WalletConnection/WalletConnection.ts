import type { Provider } from './index'
import type { SignedMemo, SignedTransaction, TransactionMessage } from '../../lib/models'

export interface WalletSettings {
  apiUrl: string;
  chainId: string;
}

export abstract class WalletConnection {
  protected _provider: Provider;
  protected _apiUrl: string;
  protected _chainId: string;

  constructor(provider: Provider, settings: WalletSettings) {
    this._provider = provider;
    this._apiUrl = settings.apiUrl;
    this._chainId = settings.chainId;
  }

  abstract name: string;
  abstract isConnected: boolean;
  abstract connectedIdentity?: string | undefined;
  abstract connectedIdentities?: Array<string> | undefined;
  abstract connect(): Promise<Array<string>>;
  abstract connectIdentity(address: string): void;
  abstract clearConnectedIdentity(): void;
  abstract getChain(): Promise<string>;
  abstract getPublicKey(address: string): Promise<string>;
  abstract getBalance(address: string): Promise<number>;
  abstract switchChain(chain: string): Promise<void>;
  abstract signMessage(message: string, address: string): Promise<string>;
  abstract reconnect(address: string): Promise<boolean>;
  abstract signTransaction(messages: TransactionMessage[], signer?: string, memo?: SignedMemo): Promise<SignedTransaction>;
  abstract get provider(): Provider;
}
