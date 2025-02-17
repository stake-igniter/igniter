"use client";

import { Button } from "@igniter/ui/components/button";
import PoktIcon from "@/app/assets/pocket_logo.svg";
import { usePoktWalletContext } from "@/app/context/poktWallet";
import { signIn } from "next-auth/react";
import { createUserAndSignIn } from "../actions";
import { useActionState, useEffect, useState } from "react";

interface PoktIdentityProviderProps {
  withSignUp?: boolean;
}

interface SignUpData {
  address: string;
  message: string;
  signature: string;
  publicKey: string;
}

const PoktIdentityProvider: React.FC<PoktIdentityProviderProps> = ({
  withSignUp = false,
}) => {
  const { connectWallet, poktWalletAvailable, verifyPoktIdentity, address } =
    usePoktWalletContext();

  const [state, formAction] = useActionState(createUserAndSignIn, null, "n/a");
  const [signUpData, setSignUpData] = useState<SignUpData>({
    address: "",
    message: "",
    signature: "",
    publicKey: "",
  });

  const handleLogin = async () => {
    try {
      const { address } = await connectWallet();
      const { message, signature, publicKey } =
        await verifyPoktIdentity(address);

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

  const handleSignUp = async () => {
    try {
      const { address } = await connectWallet();
      const { message, signature, publicKey } =
        await verifyPoktIdentity(address);

      setSignUpData({ address, message, signature, publicKey });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    //SUBMIT FORM

    const handleCreateUser = async () => {
      try {
        await fetch("/api/signup", {
          method: "POST",
          body: JSON.stringify(signUpData),
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (signUpData) {
      handleCreateUser();
    }
  }, [signUpData]);

  return (
    <div>
      <Button
        onClick={handleSignUp}
        variant="secondary"
        disabled={!poktWalletAvailable}
      >
        Login with POKT
        <PoktIcon />
      </Button>
      <form action={formAction}>
        <input type="hidden" name="address" value={signUpData?.address} />
        <input type="hidden" name="message" value={signUpData?.message} />
        <input type="hidden" name="signature" value={signUpData?.signature} />
        <input type="hidden" name="publicKey" value={signUpData?.publicKey} />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default PoktIdentityProvider;
