import {ProviderInfo, WalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {
  Provider,
  StakeTransactionSignatureRequest,
  OperationalFundsTransactionSignatureRequest,
  SignedOperationalFundsTransaction,
  SignedStakeTransaction,
} from "./";

export enum PocketMorseMethod {
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


export class MorseWalletConnection implements WalletConnection {
  isConnected: boolean;
  connectedIdentity?: string | undefined;
  private _provider?: Provider;

  constructor() {
    this.isConnected = false;
  }

  connect = async (provider?: Provider): Promise<void> => {
    this._provider = provider ?? window.pocketNetwork;
    try {
      const [connectedIdentity] = await this.provider.send(
        PocketMorseMethod.REQUEST_ACCOUNTS
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
      const accounts = await this.provider.send(PocketMorseMethod.ACCOUNTS);

      if (accounts.includes(address)) {
        this.connectedIdentity = address;
        this.isConnected = true;
        return true;
      }

      return false;
    } catch (error) {
      console.warn(`Something failed while interacting with the Pocket Network wallet provider. method: ${PocketMorseMethod.ACCOUNTS}`);
      return false;
    }
  }

  getChain = async (): Promise<string> => {
    try {
      return await this.provider.send(
        PocketMorseMethod.CHAIN,
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getPublicKey = async (address: string): Promise<string> => {
    try {
      const { publicKey } = await this.provider.send(
        PocketMorseMethod.PUBLIC_KEY,
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
        PocketMorseMethod.BALANCE,
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
        PocketMorseMethod.SWITCH_CHAIN,
        [{ chainId }],
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  signMessage = async (message: string, address: string): Promise<string> => {
    try {
      const { signature } = await this.provider.send(PocketMorseMethod.SIGN_MESSAGE, [{ message, address }]);
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

      window.addEventListener("pocket:announceProvider", handleProviderAnnouncement);

      window.dispatchEvent(new Event("pocket:requestProvider"));

      setTimeout(() => {
        window.removeEventListener("pocket:announceProvider", handleProviderAnnouncement);
        resolve(detectedProviders);
      }, 500);
    });
  };

  async signStakeTransactions(transactions: StakeTransactionSignatureRequest[]): Promise<SignedStakeTransaction[]> {
    return Promise.all(transactions.map(async (tx) => {
      const signatureResult = await this.provider.send(PocketMorseMethod.SIGN_TRANSACTION, [{
        type: PocketNetworkTransactionTypes.NodeStake,
        transaction: {
          amount: tx.amount,
          serviceURL: tx.serviceUrl,
          // TODO: change when we add separte identity and managed addresses.
          address: this.connectedIdentity,
          outputAddress: this.connectedIdentity,
          operatorPublicKey: tx.publicKey,
          rewardDelegators: tx.delegatorRewards,
          // TODO: Add configurable memo
        },
      }]);

      return {
        ...tx,
        signedPayload: signatureResult.signature,
        hash: signatureResult.transactionHex,
      };
    }));
  }

  async signOperationalFundsTransactions(transactions: OperationalFundsTransactionSignatureRequest[]): Promise<SignedOperationalFundsTransaction[]> {
    return Promise.all(transactions.map(async (tx) => {
      const signatureResult = await this.provider.send(PocketMorseMethod.SIGN_TRANSACTION, [{
        type: PocketNetworkTransactionTypes.Send,
        transaction: {
          from: tx.fromAddress,
          to: tx.toAddress,
          amount: tx.amount,
          // TODO: Add configurable memo
        },
      }]);

      return {
        ...tx,
        signedPayload: signatureResult.signature,
        hash: signatureResult.transactionHex,
      };
    }));
  }

  get provider() {
    return this._provider ?? window.pocketNetwork;
  }
}
