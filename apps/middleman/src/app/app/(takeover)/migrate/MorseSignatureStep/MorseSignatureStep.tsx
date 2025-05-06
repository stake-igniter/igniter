'use client'
import { ActivityHeader } from '@/app/app/(takeover)/stake/components/ActivityHeader'
import { useWalletConnection } from '@igniter/ui/context/WalletConnection/index'
import React, { useState } from 'react'
import { ActivityContentLoading } from '@/app/app/(takeover)/stake/components/ActivityContentLoading'
import { Button } from '@igniter/ui/components/button'

interface MorseSignatureStepProps {
  morseOutputAddress: string;
  signature: string;
  onClose: () => void;
  onBack: () => void;
  setSignature: (signature: string, publicKey: string) => void;
}

export default function MorseSignatureStep({
  onClose,
  onBack,
  morseOutputAddress,
  setSignature,
                                             signature: signatureFromProps
                                           }: Readonly<MorseSignatureStepProps>) {
  const {signMessage, getPublicKey} = useWalletConnection()
  const [{signature: signatureFromState, publicKey, isLoading, error}, setState] = useState<{
    signature: string | null;
    publicKey: string | null;
    isLoading: boolean;
    error: boolean | null;
  }>({
    signature: null,
    publicKey: null,
    isLoading: false,
    error: null,
  });

  const sign = () => {
    setState(prev => ({...prev, isLoading: true}));
    // TODO: We need to replicate the msg expected by shannon nodes at /poktroll/x/migration/types/morse_claim_messages.go
    signMessage('Sign to migrate your nodes', morseOutputAddress).then(signature => {
      getPublicKey(morseOutputAddress).then(publicKey => {
        setState(prev => ({...prev, signature, publicKey, isLoading: false}));
      })
    }).catch(error => {
      setState(prev => ({...prev, error, isLoading: false}));
    })
  }

  const signature = signatureFromProps || signatureFromState;

  let content: React.ReactNode

  if (signature) {
    content = (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <p className="text-center text-green-500">
          Signature successfully verified.
        </p>
      </div>
    )
  } else if (isLoading) {
    content = (
      <ActivityContentLoading />
    )
  } else if (error) {
    content = (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <p className="text-center text-red-500">
          There was an error while signing the message.
        </p>
        <Button
          className="w-full h-[40px]"
          onClick={sign}
        >
          Try again
        </Button>
      </div>
    )
  } else {
    content = (
      <Button
        className="w-full h-[40px]"
        onClick={sign}
      >
        Sign
      </Button>
    )
  }

  return (
    <div
      className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] p-[33px] rounded-b-[12px] gap-8"
    >
      <ActivityHeader
        onClose={onClose}
        onBack={onBack}
        title="Signature"
        subtitle={'To validate the transaction, please sign the message using your morse wallet.'}
      />

      {content}

      <Button
        className="w-full h-[40px]"
        disabled={!signature}
        onClick={() => setSignature(signature!, publicKey)}
      >
        Continue
      </Button>
    </div>
  )
}
