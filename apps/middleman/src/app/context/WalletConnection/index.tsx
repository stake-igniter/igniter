"use client";

import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {MorseWalletConnection} from "@/app/context/WalletConnection/MorseWalletConnection";

export interface WalletConnection {
  isConnected: boolean;
  connectedIdentity?: string;
  isWalletAvailable: boolean;
  connect(): Promise<void>;
  getChain(): Promise<string>;
  getPublicKey(address: string): Promise<string>;
  getBalance(address: string): Promise<number>;
  switchChain(chain: string): Promise<void>;
  signMessage(message: string, address: string): Promise<string>;
}

export const WalletConnectionContext = createContext<WalletConnection>({
  isConnected: false,
  isWalletAvailable: false,
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
});

/**
 * Wallet connection provider - Exposes an instance of WalletConnection to the app.
 * @param children
 * @constructor
 */
export const WalletConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedIdentity, setConnectedIdentity] = useState<string | undefined>(undefined);


  // TODO: Shannon. Receive the user configuration and instantiate the correct wallet connection.
  const morseConnection = useMemo(() => new MorseWalletConnection(), []);

  useEffect(() => {
    if (morseConnection.isWalletAvailable) {
      setIsWalletAvailable(true);
    }
  }, [morseConnection]);

  const connect = async () => {
    try {
      await morseConnection.connect();
      setIsConnected(morseConnection.isConnected);
      setConnectedIdentity(morseConnection.connectedIdentity);
    } catch (error) {
      console.error(error);
      setIsConnected(morseConnection.isConnected);
      setConnectedIdentity(morseConnection.connectedIdentity);
    }
  }

  return (
    <WalletConnectionContext.Provider value={
      {
        isConnected,
        isWalletAvailable,
        connectedIdentity,
        connect,
        getChain: morseConnection.getChain,
        getPublicKey: morseConnection.getPublicKey,
        getBalance: morseConnection.getBalance,
        switchChain: morseConnection.switchChain,
        signMessage: morseConnection.signMessage,
      }
    }>
      {children}
    </WalletConnectionContext.Provider>
  );
};

export const useWalletConnection = () => useContext(WalletConnectionContext);
