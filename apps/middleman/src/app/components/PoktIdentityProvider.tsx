"use client";

import {getCsrfToken, signIn} from "next-auth/react";
import {useEffect} from "react";
import {SiwpMessage} from "@poktscan/vault-siwp";
import { Button } from "@igniter/ui/components/button";
import { PocketLogo } from "@igniter/ui/assets";
import {useWalletConnection} from "@/app/context/WalletConnection";

const PoktIdentityProvider = () => {
  const {
    isWalletAvailable,
    isConnected,
    connectedIdentity,
    connect,
    getChain,
    getPublicKey,
    switchChain,
    signMessage
  } = useWalletConnection();

  // TODO: Change this to use the app settings when they are available.
  const configuredChain = 'testnet';

  const authenticateUser = async (address: string) => {
    try {
      const chainOnWallet = await getChain();

      if (chainOnWallet !== configuredChain?.toLowerCase()) {
        await switchChain('mainnet');
      }

      const message = new SiwpMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Igniter",
        uri: window.location.origin,
        version: "1",
        chainId: configuredChain,
        nonce: await getCsrfToken(),
      });

      const signature = await signMessage(message.prepareMessage(), address);
      const publicKey = await getPublicKey(address);

      signIn("siwp", {
        message: JSON.stringify(message),
        signature,
        publicKey,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      if (isConnected && connectedIdentity) {
        await authenticateUser(connectedIdentity);
      }
    })();
  }, [isConnected, connectedIdentity]);

  return (
    <Button
      onClick={connect}
      variant="secondary"
      disabled={!isWalletAvailable}
    >
      Login with POKT
      <PocketLogo />
    </Button>
  );
};

export default PoktIdentityProvider;
