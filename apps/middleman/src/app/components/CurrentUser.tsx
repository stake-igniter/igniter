"use client";

import React, {useEffect} from "react";
import {getCsrfToken, signIn, useSession, signOut} from "next-auth/react";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import {SiwpMessage} from "@poktscan/vault-siwp";
import UserMenu from "@igniter/ui/components/UserMenu";
import {WalletPicker} from "@igniter/ui/components/WalletPicker/index";
import {useWalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {DropdownMenuItem, DropdownMenuSeparator} from "@igniter/ui/components/dropdown-menu";
import {Routes} from "@/lib/route-constants";
import {Button} from "@igniter/ui/components/button";
import {LoaderIcon} from "@igniter/ui/assets";

export default function CurrentUser() {
  const currentPath = usePathname();
  const { data, status } = useSession();
  const applicationSettings = useApplicationSettings();

  const {
    isConnected,
    connectedIdentity,
    connect,
    getChain,
    getPublicKey,
    switchChain,
    signMessage
  } = useWalletConnection();

  const settingsChainId = applicationSettings?.chainId!;

  const authenticateUser = async (address: string) => {
    try {
      const chainOnWallet = await getChain();

      if (chainOnWallet !== settingsChainId) {
        await switchChain(settingsChainId);
      }

      const message = new SiwpMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Igniter",
        uri: window.location.origin,
        version: "1",
        chainId: applicationSettings?.chainId,
        nonce: await getCsrfToken(),
      });

      const signature = await signMessage(message.prepareMessage(), address);
      const publicKey = await getPublicKey(address);

      await signIn("siwp", {
        message: JSON.stringify(message),
        signature,
        publicKey,
        redirectTo: '/app',
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

  const isLanding = currentPath === Routes.root;
  const isAdmin = currentPath.startsWith(Routes.adminRoot);
  const isApp = currentPath.startsWith(Routes.appRoot);

  if (status === "loading") {
    return (
      <Button
        className="flex items-center justify-center w-[150px]"
        variant={"secondary"}
        disabled={true}
      >
        <LoaderIcon className="animate-spin" />
      </Button>
    );
  }

  if (status === "authenticated") {
    return (
      <UserMenu user={data.user}>
        {!isLanding && (
          <Link href={Routes.root}>
            <DropdownMenuItem className="max-h-[38px]">
              <span>
                Go to portal
              </span>
            </DropdownMenuItem>
          </Link>
        )}
        {!isApp && (
          <Link href={Routes.appRoot}>
            <DropdownMenuItem className="max-h-[38px]">
              <span>
                Go to App
              </span>
            </DropdownMenuItem>
          </Link>
        )}
        {['owner', 'admin'].includes(data.user.role) && !isAdmin && (
          <Link href={Routes.adminRoot}>
            <DropdownMenuItem className="max-h-[38px]">
              <span>
                Go to Admin
              </span>
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut()}>Sign out</DropdownMenuItem>
      </UserMenu>
    );
  }

  return (
    <WalletPicker onWalletSelect={connect} />
  );
}
