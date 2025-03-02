import {WalletConnection} from "@/app/context/WalletConnection";

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

    constructor() {
        this.isConnected = false;
    }

    get isWalletAvailable(): boolean {
      /**
       * TODO: Improve this with feature detection. We need to be able to validate whether the available wallet supports are requirements.
       */
      return !!window.pocketNetwork;
    }

    connect = async (): Promise<void> => {
      try {
        const [connectedIdentity] = await window.pocketNetwork.send(
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
      return await window.pocketNetwork.send(
        PocketMorseMethod.CHAIN,
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getPublicKey = async (address: string): Promise<string> => {
    try {
      const { publicKey } = await window.pocketNetwork.send(
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
      const { balance } = await window.pocketNetwork.send(
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
      await window.pocketNetwork.send(
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
      const { signature } = await window.pocketNetwork.send(PocketMorseMethod.SIGN_MESSAGE, [{ message, address }]);
      return signature;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
