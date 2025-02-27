"use client";

import { Button } from "@igniter/ui/components/button";
import { PocketLogo } from "@igniter/ui/assets";
import { usePoktWalletContext } from "@/app/context/poktWallet";
import { signIn } from "next-auth/react";

interface PoktIdentityProviderProps {
  withSignUp?: boolean;
}

const PoktIdentityProvider: React.FC<PoktIdentityProviderProps> = () => {
  const { connectWallet, poktWalletAvailable, verifyPoktIdentity } =
    usePoktWalletContext();

  const handleLogin = async () => {
    try {
      const { address } = await connectWallet();
      const { message, signature, publicKey } =
        await verifyPoktIdentity(address);

      signIn("siwp", {
        message: JSON.stringify(message),
        signature,
        publicKey,
        redirectTo: "/app",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      variant="secondary"
      disabled={!poktWalletAvailable}
    >
      Login with POKT
      <PocketLogo />
    </Button>
  );
};

export default PoktIdentityProvider;
