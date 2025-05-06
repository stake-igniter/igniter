import {ProviderInfo, WalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {
  Provider,
  StakeTransactionSignatureRequest,
  OperationalFundsTransactionSignatureRequest,
  SignedOperationalFundsTransaction,
  SignedStakeTransaction,
} from "./";

export enum PocketMethod {
  REQUEST_ACCOUNTS = "pokt_requestAccounts",
  PUBLIC_KEY = "pokt_publicKey",
  SIGN_MESSAGE = "pokt_signMessage",
  SIGN_BULK_TRANSACTION = "pokt_bulkSignTransaction",
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

export class PocketMorseWalletConnection implements WalletConnection {
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

      window.addEventListener("pocket:announceProvider", handleProviderAnnouncement);

      window.dispatchEvent(new Event("pocket:requestProvider"));

      setTimeout(() => {
        window.removeEventListener("pocket:announceProvider", handleProviderAnnouncement);
        resolve(detectedProviders);
      }, 500);
    });
  };

  signStakeTransactions = async (txs: StakeTransactionSignatureRequest[]): Promise<SignedStakeTransaction[]> => {
    const transactions = txs.map((tx, id) => ({
      id,
      type: PocketNetworkTransactionTypes.NodeStake,
      transaction: {
        amount: (tx.amount * 1e6).toString(),
        serviceURL: tx.serviceUrl,
        chains: tx.chains,
        // TODO: change when we add separate identity and managed addresses.
        address: this.connectedIdentity,
        outputAddress: this.connectedIdentity,
        operatorPublicKey: tx.publicKey,
        rewardDelegators: Object.entries(tx.delegatorRewards).reduce((delegatorRewards, [key, value]) => ({
          ...delegatorRewards,
          [key]: Number(value),
        }), {}),
        // TODO: Add configurable memo
      },
    }));

    const {signatures}: {signatures: { id: string; signature: string; transactionHex: string; }[]} = await this.provider.send(PocketMethod.SIGN_BULK_TRANSACTION, transactions);

    return txs.map((tx, id) => {
      const signature = signatures.find((s) => s.id.toString() === id.toString());

      if (!signature) {
        throw new Error('Signature for transaction was not found.');
      }

      return {
        ...tx,
        signedPayload: signature.transactionHex,
      };
    });
  }

  signOperationalFundsTransactions = async (txs: OperationalFundsTransactionSignatureRequest[]): Promise<SignedOperationalFundsTransaction[]> => {
    const transactions = txs.map((tx, id) => ({
      id,
      type: PocketNetworkTransactionTypes.Send,
      transaction: {
        from: tx.fromAddress,
        to: tx.toAddress,
        amount: (tx.amount * 1e6).toString(),
        // TODO: Add configurable memo
      },
    }));

    const {signatures}: {signatures: { id: string; signature: string; transactionHex: string; }[]} = await this.provider.send(PocketMethod.SIGN_BULK_TRANSACTION, transactions);

    return txs.map((tx, id) => {
      const signature = signatures.find((s) => s.id.toString() === id.toString());

      if (!signature) {
        throw new Error('Signature for transaction was not found.');
      }

      return {
        ...tx,
        signedPayload: signature.transactionHex,
      };
    });
  }

  get provider() {
    return this._provider ?? window.pocketNetwork;
  }
}
