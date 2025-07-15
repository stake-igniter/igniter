'use client'

import {
  WalletConnectionProvider as UiWalletConnectionProvider,
  WalletConnectionProviderProps,
} from '@igniter/ui/context/WalletConnection/index'
import { signOut } from 'next-auth/react'

export function WalletConnectionProvider(props: WalletConnectionProviderProps) {
  return (
    <UiWalletConnectionProvider
      {...props}
      onDisconnect={signOut}
    />
  )
}
