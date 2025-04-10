"use client";

import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {MorseWalletConnection} from "./MorseWalletConnection";

// TODO: Unify this with apps/middleman/src/lib/models/Transactions.ts:4
export interface ServiceProviderKey {
  address: string;
  amount: number;
  serviceUrl: string;
  chains: string[];
  publicKey: string;
}

export interface SignedTransaction {
  hash: string;
  signedPayload: string;
}

export interface StakeTransactionSignatureRequest extends ServiceProviderKey {
  id: string;
  outputAddress: string;
  delegatorRewards: Record<string, string>;
}

export type SignedStakeTransaction = SignedTransaction & StakeTransactionSignatureRequest;

export interface OperationalFundsTransactionSignatureRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  dependsOn: string;
}

export type SignedOperationalFundsTransaction = SignedTransaction & OperationalFundsTransactionSignatureRequest;

export interface Provider {
  send: (method: string, params?: any[]) => Promise<any>;
}

export interface ProviderInfo {
  uuid?: string;
  name?: string;
  icon?: string;
  rdns?: string;
  provider?: Provider;
};

export interface WalletConnection {
  isConnected: boolean;
  connectedIdentity?: string;
  connect(provider: Provider): Promise<void>;
  getChain(): Promise<string>;
  getPublicKey(address: string): Promise<string>;
  getBalance(address: string): Promise<number>;
  switchChain(chain: string): Promise<void>;
  signMessage(message: string, address: string): Promise<string>;
  getAvailableProviders(): Promise<ProviderInfo[]>;
  signStakeTransactions(transactions: StakeTransactionSignatureRequest[]): Promise<SignedStakeTransaction[]>;
  signOperationalFundsTransactions(transactions: OperationalFundsTransactionSignatureRequest[]): Promise<SignedOperationalFundsTransaction[]>;
  reconnect(address: string): Promise<boolean>;
}

export const WalletConnectionContext = createContext<WalletConnection>({
  isConnected: false,
  connect: async () => {
    console.warn('Method not implemented: connect. Something is wrong with the wallet connection provider.');
  },
  getChain: async () => {
    console.warn('Method not implemented: getChain. Something is wrong with the wallet connection provider.');
    return '';
  },
  getPublicKey: async (address: string) => {
    console.warn('Method not implemented: getPublicKey. Something is wrong with the wallet connection provider.');
    return '';
  },
  getBalance: async (address: string) => {
    console.warn('Method not implemented: getBalance. Something is wrong with the wallet connection provider.');
    return 0;
  },
  switchChain: async () => {
    console.warn('Method not implemented: switchChain. Something is wrong with the wallet connection provider.');
  },
  signMessage: async () => {
    console.warn('Method not implemented: signMessage. Something is wrong with the wallet connection provider.');
    return '';
  },
  getAvailableProviders: async (): Promise<ProviderInfo[]> => {
    console.warn('Method not implemented: getProvidersInfo. Something is wrong with the wallet connection provider.');
    return [];
  },
  reconnect: async (address: string)=> {
    console.warn('Method not implemented: reconnect. Something is wrong with the wallet connection provider.');
    return false;
  },
  async signStakeTransactions(transactions: StakeTransactionSignatureRequest[]): Promise<SignedStakeTransaction[]> {
    console.warn('Method not implemented: signStakeTransactions. Something is wrong with the wallet connection provider.');
    return [];
  },
  async signOperationalFundsTransactions(transactions: OperationalFundsTransactionSignatureRequest[]): Promise<SignedOperationalFundsTransaction[]> {
    console.warn('Method not implemented: signOperationalFundsTransactions. Something is wrong with the wallet connection provider.');
    return [];
  },
});

/**
 * Wallet connection provider - Exposes an instance of WalletConnection to the app.
 * @param children
 * @param reconnect
 * @constructor
 */
export const WalletConnectionProvider = ({ children, expectedIdentity }: { expectedIdentity?: string, children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedIdentity, setConnectedIdentity] = useState<string | undefined>(undefined);

  // TODO: Shannon. Receive the user configuration and instantiate the correct wallet connection.
  const morseConnection = useMemo(() => new MorseWalletConnection(), []);

  const connect = useCallback(async (provider?: Provider) => {
    try {
      await morseConnection.connect(provider);
      setIsConnected(morseConnection.isConnected);
      setConnectedIdentity(morseConnection.connectedIdentity);
    } catch (error) {
      console.error(error);
      setIsConnected(morseConnection.isConnected);
      setConnectedIdentity(morseConnection.connectedIdentity);
    }
  }, []);

  const reconnect = useCallback(async (address: string) => {
    const reconnected = await morseConnection.reconnect(address);

    setIsConnected(morseConnection.isConnected);
    setConnectedIdentity(morseConnection.connectedIdentity);

    if (!reconnected) {
      throw new Error('Failed to reconnect');
    }

    return true;
  }, []);

  useEffect(() => {
    if (expectedIdentity) {
      (async () => {
        await reconnect(expectedIdentity);
      })();
    }
  }, [expectedIdentity]);

  return (
    <WalletConnectionContext.Provider value={
      {
        isConnected,
        connectedIdentity,
        connect,
        reconnect,
        getChain: morseConnection.getChain,
        getPublicKey: morseConnection.getPublicKey,
        getBalance: morseConnection.getBalance,
        switchChain: morseConnection.switchChain,
        signMessage: morseConnection.signMessage,
        getAvailableProviders: morseConnection.getAvailableProviders,
        signStakeTransactions: morseConnection.signStakeTransactions,
        signOperationalFundsTransactions: morseConnection.signOperationalFundsTransactions,
      }
    }>
      {children}
    </WalletConnectionContext.Provider>
  );
};

export const useWalletConnection = () => useContext(WalletConnectionContext);
