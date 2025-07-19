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
import {LoaderIcon} from "@igniter/ui/assets";
import { getShortAddress } from '@igniter/ui/lib/utils'

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
    signMessage,
    clearConnectedIdentity
  } = useWalletConnection();

  const authenticateUser = async (address: string) => {
    try {
      if (status === 'loading') {
        return;
      }

      const chainOnWallet = await getChain();

      if (applicationSettings && (chainOnWallet !== applicationSettings?.chainId)) {
        await switchChain(applicationSettings?.chainId);
      }

      if (status === 'authenticated') {
        return;
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

      // TODO: save key in a constants file
      localStorage.setItem('last-signed-in-identity', getShortAddress(address));

      await signIn("siwp", {
        message: JSON.stringify(message),
        signature,
        publicKey,
        redirectTo: '/app',
      });
    } catch (error) {
      if ((error as {message: string})?.message === "The user rejected the request.") {
        clearConnectedIdentity()
      } else {
        // TODO: show feedback that something went wrong
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (isConnected && connectedIdentity && applicationSettings) {
        await authenticateUser(connectedIdentity);
      }
    })();
  }, [isConnected, connectedIdentity, applicationSettings, status]);

  const isLanding = currentPath === Routes.root;
  const isAdmin = currentPath.startsWith(Routes.adminRoot);
  const isApp = currentPath.startsWith(Routes.appRoot);

  if (status === "loading") {
    return (
      <div
        className="flex items-center justify-center w-[150px] h-9 bg-[color:var(--secondary)] rounded-md opacity-50"
      >
        <LoaderIcon className="animate-spin" />
      </div>
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
