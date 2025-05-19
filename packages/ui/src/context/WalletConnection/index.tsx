"use client";

import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {PocketWalletConnection} from "./PocketWalletConnection";
import { PocketMorseWalletConnection } from './PocketMorseWalletConnection'

// TODO: Unify this with apps/middleman/src/lib/models/Transactions.ts:4
export interface SupplierStake {
  operatorAddress: string;
  stakeAmount: string;
  services: {
    serviceId: string;
    revShare: {
      address: string;
      revSharePercentage: number;
    }[];
    endpoints: {
      url: string;
      rpcType: string;
      configs: { }
    }[];
  }[];
}

export interface StakeTransactionSignaturePayload extends SupplierStake {
  ownerAddress: string;
  signer: string;
}

export interface OperationalFundsTransactionSignaturePayload {
  toAddress: string;
  amount: string;
}

export type TransactionMessage = StakeMessage | FundsMessage;

export interface StakeMessage {
  typeUrl: '/pocket.supplier.MsgStakeSupplier';
  body: StakeTransactionSignaturePayload;
}

export interface FundsMessage {
  typeUrl: '/cosmos.bank.v1beta1.MsgSend';
  body: OperationalFundsTransactionSignaturePayload;
}

export interface SignedTransaction {
  address: string;
  signedPayload: string;
  unsignedPayload: string;
  estimatedFee: number,
  signature: string;
}


export interface Provider {
  send: (method: string, params?: any[]) => Promise<any>;
  addListener?: (type: 'accountsChanged', listener: (data: Array<string>) => void) => void;
  removeListener?: (type: 'accountsChanged', listener: (data: Array<string>) => void) => void;
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
  signTransaction(messages: TransactionMessage[]): Promise<SignedTransaction>;
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
  signTransaction: async (messages: TransactionMessage[]) : Promise<SignedTransaction> => {
    console.warn('Method not implemented: signTransaction. Something is wrong with the wallet connection provider.');
    return {
      address: '',
      signedPayload: '',
      unsignedPayload: '',
      signature: '',
      estimatedFee: 0,
    };
  },
});

export interface WalletConnectionProviderProps {
  protocol?: 'shannon' | 'morse',
  expectedIdentity?: string,
  children: ReactNode
  onDisconnect?: () => void
}

/**
 * Wallet connection provider - Exposes an instance of WalletConnection to the app.
 * @param children
 * @param reconnect
 * @constructor
 */
export const WalletConnectionProvider = ({  protocol = 'shannon', children, expectedIdentity, onDisconnect }: WalletConnectionProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedIdentity, setConnectedIdentity] = useState<string | undefined>(undefined);
  const [allConnectedIdentities, setAllConnectedIdentities] = useState<Array<string>>([]);
  const [connectedProvider, setConnectedProvider] = useState<Provider | undefined>(undefined);

  const pocketConnection  = useMemo(() => protocol === 'shannon' ? new PocketWalletConnection() : new PocketMorseWalletConnection(), [protocol]);

  const connect = useCallback(async (provider?: Provider) => {
    try {
      await pocketConnection.connect(provider);
      setConnectedProvider(provider)
      setIsConnected(pocketConnection.isConnected);
      setConnectedIdentity(pocketConnection.connectedIdentity);
    } catch (error) {
      console.error(error);
      setIsConnected(pocketConnection.isConnected);
      setConnectedIdentity(pocketConnection.connectedIdentity);
    }
  }, []);

  const reconnect = useCallback(async (address: string) => {
    const reconnected = await pocketConnection.reconnect(address);

    setIsConnected(pocketConnection.isConnected);
    setConnectedIdentity(pocketConnection.connectedIdentity);
    setConnectedProvider(pocketConnection.provider);

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

  useEffect(() => {
    if (connectedProvider &&  connectedProvider.addListener) {
      const listener = (addresses: Array<string>) => {
        if (connectedIdentity && onDisconnect && !addresses.includes(connectedIdentity)) {
          onDisconnect()
        } else {
          setAllConnectedIdentities(addresses)
        }
      }

      connectedProvider.addListener('accountsChanged', listener);

      return () => {
        connectedProvider.removeListener!('accountsChanged', listener);
      }
    }
  }, [connectedProvider, connectedIdentity, onDisconnect])

  return (
    <WalletConnectionContext.Provider value={
      {
        isConnected,
        connectedIdentity,
        connect,
        reconnect,
        getChain: pocketConnection.getChain,
        getPublicKey: pocketConnection.getPublicKey,
        getBalance: pocketConnection.getBalance,
        switchChain: pocketConnection.switchChain,
        signMessage: pocketConnection.signMessage,
        getAvailableProviders: pocketConnection.getAvailableProviders,
        signTransaction: pocketConnection.signTransaction,
      }
    }>
      {children}
    </WalletConnectionContext.Provider>
  );
};

export const useWalletConnection = () => useContext(WalletConnectionContext);
