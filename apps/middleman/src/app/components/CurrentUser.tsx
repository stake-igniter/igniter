"use client";

import UserMenu from "@igniter/ui/components/UserMenu";
import {WalletPicker} from "@igniter/ui/components/WalletPicker/index";
import {useSession} from "next-auth/react";


export default function CurrentUser() {
  const session = useSession();

  if (session && session.status === "authenticated") {
    return (
      <UserMenu />
    );
  }

  return (
    <WalletPicker onWalletSelect={console.log} />
  );
}
