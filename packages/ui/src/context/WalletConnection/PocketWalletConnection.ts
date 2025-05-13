import {ProviderInfo, WalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {
  Provider, SignedTransaction, TransactionMessage,
} from "./";

export enum PocketMethod {
  REQUEST_ACCOUNTS = "pokt_requestAccounts",
  PUBLIC_KEY = "pokt_publicKey",
  SIGN_MESSAGE = "pokt_signMessage",
  SIGN_TRANSACTION = "pokt_signTransaction",
  BALANCE = "pokt_balance",
  CHAIN = "pokt_chain",
  SWITCH_CHAIN = "wallet_switchPocketChain",
  ACCOUNTS = "pokt_accounts",
}

export enum PocketNetworkTransactionTypes {
  NodeStake = "node_stake",
  NodeUnstake = "node_unstake",
  Send = "send",
}

export class PocketWalletConnection implements WalletConnection {
  isConnected: boolean;
  connectedIdentity?: string | undefined;
  private _provider?: Provider;

  constructor() {
    this.isConnected = false;
  }

  connect = async (provider?: Provider): Promise<void> => {
    this._provider = provider ?? window.pocketShannon;
    try {
      const [connectedIdentity] = await this.provider.send(
        PocketMethod.REQUEST_ACCOUNTS
      );

      this.isConnected = true;
      this.connectedIdentity = connectedIdentity;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  reconnect = async (address: string): Promise<boolean> => {
    try {
      const accounts = await this.provider.send(PocketMethod.ACCOUNTS);

      if (accounts.includes(address)) {
        this.connectedIdentity = address;
        this.isConnected = true;
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Something failed while interacting with the Pocket Network wallet provider. method: ${PocketMethod.ACCOUNTS}`);
      return false;
    }
  }

  getChain = async (): Promise<string> => {
    try {
      return await this.provider.send(
        PocketMethod.CHAIN,
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getPublicKey = async (address: string): Promise<string> => {
    try {
      const { publicKey } = await this.provider.send(
        PocketMethod.PUBLIC_KEY,
        [{ address }]
      );
      return publicKey;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getBalance = async (address: string): Promise<number> => {
    try {
      const { balance } = await this.provider.send(
        PocketMethod.BALANCE,
        [{ address }]
      );
      return balance;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  switchChain = async (chainId: string): Promise<void> => {
    try {
      await this.provider.send(
        PocketMethod.SWITCH_CHAIN,
        [{ chainId }],
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  signMessage = async (message: string, address: string): Promise<string> => {
    try {
      const { signature } = await this.provider.send(PocketMethod.SIGN_MESSAGE, [{ message, address }]);
      return signature;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getAvailableProviders = async (): Promise<ProviderInfo[]> => {
    return new Promise<ProviderInfo[]>((resolve) => {
      const detectedProviders: ProviderInfo[] = [];

      const handleProviderAnnouncement = (event: Event) => {
        const { detail } = event as CustomEvent<any>;
        if (detail) {
          detectedProviders.push({
            ...detail.info,
            provider: detail.provider,
          });
        }
      };

      window.addEventListener("pocket_shannon:announceProvider", handleProviderAnnouncement);

      window.dispatchEvent(new Event("pocket_shannon:requestProvider"));

      setTimeout(() => {
        window.removeEventListener("pocket_shannon:announceProvider", handleProviderAnnouncement);
        resolve(detectedProviders);
      }, 500);
    });
  };

  signTransaction = async (messages: TransactionMessage[]): Promise<SignedTransaction> => {
    const transaction = {
      address: this.connectedIdentity ?? "",
      messages,
    };

    try {
      const { signature, transactionHex, rawTx, fee  } = await this.provider.send(PocketMethod.SIGN_TRANSACTION, [transaction]);
      return {
        address: this.connectedIdentity ?? "",
        signedPayload: transactionHex,
        unsignedPayload: rawTx,
        signature,
        estimatedFee: fee,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  get provider() {
    return this._provider ?? window.pocketShannon;
  }
}
