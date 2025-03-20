"use client";

import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {MorseWalletConnection} from "./MorseWalletConnection";

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
  }
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
      }
    }>
      {children}
    </WalletConnectionContext.Provider>
  );
};

export const useWalletConnection = () => useContext(WalletConnectionContext);
