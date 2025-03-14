import {ProviderInfo, WalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {Provider} from "./";

export enum PocketMorseMethod {
  REQUEST_ACCOUNTS = "pokt_requestAccounts",
  PUBLIC_KEY = "pokt_publicKey",
  SIGN_MESSAGE = "pokt_signMessage",
  BALANCE = "pokt_balance",
  CHAIN = "pokt_chain",
  SWITCH_CHAIN = "wallet_switchPocketChain",
}

export class MorseWalletConnection implements WalletConnection {
    isConnected: boolean;
    connectedIdentity?: string | undefined;
    private _provider?: Provider;

    constructor() {
      this.isConnected = false;
    }

    connect = async (provider: Provider): Promise<void> => {
      this._provider = provider;
      try {
        const [connectedIdentity] = await this._provider?.send(
          PocketMorseMethod.REQUEST_ACCOUNTS
        );

        this.isConnected = true;
        this.connectedIdentity = connectedIdentity;
      } catch (err) {
        console.error(err);
        throw err;
      }
    };

  getChain = async (): Promise<string> => {
    try {
      return await this._provider?.send(
        PocketMorseMethod.CHAIN,
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getPublicKey = async (address: string): Promise<string> => {
    try {
      const { publicKey } = await this._provider?.send(
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
      const { balance } = await this._provider?.send(
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
      await this._provider?.send(
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
      const { signature } = await this._provider?.send(PocketMorseMethod.SIGN_MESSAGE, [{ message, address }]);
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

}
