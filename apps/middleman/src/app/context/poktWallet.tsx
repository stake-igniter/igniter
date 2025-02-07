"use client";

import { useSession, getCsrfToken, signOut } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { SiwpMessage } from "@poktscan/vault-siwp";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    pocketNetwork: any;
  }
}

export enum PocketNetworkMethod {
  REQUEST_ACCOUNTS = "pokt_requestAccounts",
  ACCOUNTS = "pokt_accounts",
  PUBLIC_KEY = "pokt_publicKey",
  SIGN_MESSAGE = "pokt_signMessage",
  BALANCE = "pokt_balance",
  SEND_TRANSACTION = "pokt_sendTransaction",
  STAKE_NODE = "pokt_stakeNode",
  TX = "pokt_tx",
  CHAIN = "pokt_chain",
  SWITCH_CHAIN = "wallet_switchPocketChain",
  HEIGHT = "pokt_height",
  BLOCK = "pokt_block",
}

export const PoktWalletContext = createContext({
  poktWalletAvailable: false,
  address: null,
  balance: null,
  publicKey: null,
  chain: null,
  isConnected: false,
  connectWallet: () => ({ address: "" }),
  signMessage: async () => {},
  stakeNode: async () => {},
  getAccounts: async () => {},
  loginWithPokt: async (address: string) => ({
    message: "",
    signature: "",
    publicKey: "",
  }),
});

export const usePoktWalletContext = () => useContext(PoktWalletContext);

export const PoktWalletContextProvider = ({ children }: any) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [poktWalletAvailable, setPoktWalletAvailable] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [chain, setChain] = useState<string | "TESTNET">("TESTNET");

  const requestAccounts = async () => {
    try {
      const [address] = await window.pocketNetwork.send(
        PocketNetworkMethod.REQUEST_ACCOUNTS
      );
      setAddress(address);
      setIsConnected(true);
      return address;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const requestPublicKey = async (address: string) => {
    try {
      const res = await window.pocketNetwork.send(
        PocketNetworkMethod.PUBLIC_KEY,
        [{ address }]
      );
      setPublicKey(res.publicKey);
      return res.publicKey;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const connectWallet = async () => {
    try {
      const address = await requestAccounts();
      //TODO: REVIEW THIS. return after timeout, otherwise login errors out instantly.
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ address });
        }, 200);
      });
    } catch (err) {
      signOut({ redirect: Boolean(router.pathname !== "/landing") });
    }
  };

  const loginWithPokt = async (address: string) => {
    try {
      const message = new SiwpMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with POKT to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain.toLowerCase(),
        nonce: await getCsrfToken(),
      });
      const signature = await signMessage(message.prepareMessage(), address);
      const publicKey = await requestPublicKey(address);
      return { message, signature, publicKey };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const getAccounts = async () => {
    return new Promise((resolve, reject) => {
      window.pocketNetwork
        .send(PocketNetworkMethod.ACCOUNTS)
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          console.error(err);
          reject(err);
        });
    });
  };

  const signMessage = async (message: string, address: string) => {
    // should wait for the user to sign the message
    return new Promise((resolve, reject) => {
      window.pocketNetwork
        .send(PocketNetworkMethod.SIGN_MESSAGE, [{ message, address }])
        .then((res: { signature: string }) => {
          resolve(res.signature);
        })
        .catch((err: any) => {
          console.error(err);
          reject(err);
        });
    });
  };

  const stakeNode = async (
    amount,
    chains,
    outputAddress,
    operatorPublicKey,
    serviceURL
  ) => {
    return new Promise((resolve, reject) => {
      window.pocketNetwork
        .send(PocketNetworkMethod.STAKE_NODE, [
          {
            address: outputAddress,
            amount,
            chains,
            operatorPublicKey,
            serviceURL,
          },
        ])
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          console.error(err);
          reject(err);
        });
    });
  };

  useEffect(() => {
    if (!isConnected) return;

    window.pocketNetwork
      .send(PocketNetworkMethod.PUBLIC_KEY, [{ address }])
      .then((res: { publicKey: string }) => {
        setPublicKey(res.publicKey);
      })
      .catch((err: any) => {
        console.error(err);
      });

    window.pocketNetwork
      .send(PocketNetworkMethod.CHAIN)
      .then((res: { chain: string }) => {
        setChain(res.chain);
      })
      .catch((err: any) => {
        console.error(err);
      });

    window.pocketNetwork
      .send(PocketNetworkMethod.BALANCE, [{ address }])
      .then((res: { balance: number }) => {
        setBalance(res.balance);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, [address, isConnected]);

  useEffect(() => {
    // user is loggedn in, wallet should be connected. TODO: REVIEW THIS.
    setTimeout(() => {
      if (typeof window !== "undefined") {
        setPoktWalletAvailable(!!window.pocketNetwork);
      }
    }, 1000);

    if (status === "authenticated") {
      connectWallet();
    }
  }, [status]);

  return (
    <PoktWalletContext.Provider
      value={{
        poktWalletAvailable,
        connectWallet,
        isConnected,
        loginWithPokt,
        signMessage,
        stakeNode,
        getAccounts,
        publicKey,
        chain,
        balance,
        address,
      }}
    >
      {children}
    </PoktWalletContext.Provider>
  );
};
