"use client";

import { Button } from "@/app/components/button";
import PoktIcon from "@/app/assets/pocket_logo.svg";
import { usePoktWalletContext } from "@/app/context/poktWallet";
import { signIn } from "next-auth/react";
import { createUser } from "@/lib/dal";
import { revalidatePath } from "next/cache";

interface PoktIdentityProviderProps {
  withSignUp: boolean;
  role: any;
}

const PoktIdentityProvider = () => {
  const { connectWallet, poktWalletAvailable, loginWithPokt } =
    usePoktWalletContext();

  const handleLogin = async () => {
    try {
      const { address } = await connectWallet();
      const { message, signature, publicKey } = await loginWithPokt(address);

      signIn("siwp", {
        message: JSON.stringify(message),
        signature,
        publicKey,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Button
        onClick={handleLogin}
        variant="secondary"
        disabled={!poktWalletAvailable}
      >
        Login with POKT
        <PoktIcon />
      </Button>
    </div>
  );
};

export default PoktIdentityProvider;
