'use client'
import { ActivityHeader } from '@/app/app/(takeover)/stake/components/ActivityHeader'
import { Button } from '@igniter/ui/components/button'
import React, { useState } from 'react'
import { useWalletConnection } from '@igniter/ui/context/WalletConnection/index'
import { WalletPicker } from '@igniter/ui/components/WalletPicker/index'

interface ConnectStepProps {
  selectedMorseAddress?: string;
  onClose: () => void;
  setMorseOutputAddress: (address: string) => void;
}

export default function ConnectStep({
  selectedMorseAddress,
                                      onClose,
                                      setMorseOutputAddress,
}: Readonly<ConnectStepProps>) {
  const {connectedIdentity, connect} = useWalletConnection();

  const address = selectedMorseAddress || connectedIdentity;

  return (
    <div
      className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8"
    >
      <ActivityHeader
        title="Migration"
        subtitle="Select your Morse Wallet (address that the nodes has as custodial) to migrate your Nodes."
        onClose={onClose}
      />
      {address ? (
        <div className="flex flex-col gap-3">
          <p>Wallet connected:</p>
          <p>{address}</p>
        </div>
        ) : (
        <WalletPicker onWalletSelect={connect} />
      )}
      <Button
        disabled={!address}
        className="w-full h-[40px]"
        onClick={() => setMorseOutputAddress(address!)}
      >
        Continue
      </Button>
    </div>
  )
}
