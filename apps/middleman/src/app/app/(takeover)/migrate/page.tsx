'use client'

import { useState } from 'react'
import { AbortConfirmationDialog } from '@/app/app/(takeover)/stake/components/AbortConfirmationDialog'
import { redirect } from 'next/navigation'
import ConnectStep from '@/app/app/(takeover)/migrate/ConnectStep/ConnectStep'
import { WalletConnectionProvider } from '@igniter/ui/context/WalletConnection/index'
import SelectNodesStep from '@/app/app/(takeover)/migrate/SelectNodesStep/SelectNodesStep'
import MorseSignatureStep from '@/app/app/(takeover)/migrate/MorseSignatureStep/MorseSignatureStep'
import { StakeDistributionOffer } from '@/lib/models/StakeDistributionOffer'
import { PickOfferStep } from '@/app/app/(takeover)/stake/components/PickOfferStep'
import { useApplicationSettings } from '@/app/context/ApplicationSettings'
import ReviewStep from '@/app/app/(takeover)/migrate/ReviewStep/ReviewStep'

enum MigrateActivitySteps {
  Connect = 'Connect',
  Signature = 'Signature',
  SelectNodes = 'SelectNodes',
  PickOffer = 'PickOffer',
  Review = 'Review',
}

export default function MigratePage() {
  const [step, setStep] = useState<MigrateActivitySteps>(MigrateActivitySteps.Connect);
  const [isAbortDialogOpen, setAbortDialogOpen] = useState(false);
  const [morseOutputAddress, setMorseOutputAddress] = useState<string>('');
  const [nodes, setNodes] = useState<Array<string>>([]);
  const [signature, setSignature] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<StakeDistributionOffer | undefined>();

  const applicationSettings = useApplicationSettings();

  const handleSelectMorseWallet = (address: string) => {
    setMorseOutputAddress(address);
    setStep(MigrateActivitySteps.Signature);
  }

  const handleSignature = (signature: string, publicKey: string) => {
    setPublicKey(publicKey);
    setSignature(signature);
    setStep(MigrateActivitySteps.SelectNodes);
  }

  const handleSelectNodes = (nodes: Array<string>) => {
    setNodes(nodes);
    setStep(MigrateActivitySteps.PickOffer);
  }

  console.log({ morseOutputAddress, nodes, signature, publicKey, selectedOffer, minStake: applicationSettings?.minimumStake });

  return (
    <>
      <div className="flex flex-row justify-center w-full">
        {[MigrateActivitySteps.Connect, MigrateActivitySteps.Signature].includes(step) && (
          <WalletConnectionProvider protocol={'morse'} expectedIdentity={morseOutputAddress}>
            {step === MigrateActivitySteps.Connect && (
              <ConnectStep
                selectedMorseAddress={morseOutputAddress}
                setMorseOutputAddress={handleSelectMorseWallet}
                onClose={() => setAbortDialogOpen(true)}
              />
            )}

            {step === MigrateActivitySteps.Signature && (
              <MorseSignatureStep
                signature={signature}
                morseOutputAddress={morseOutputAddress}
                setSignature={handleSignature}
                onClose={() => setAbortDialogOpen(true)}
                onBack={() => setStep(MigrateActivitySteps.Connect)}
              />
            )}
          </WalletConnectionProvider>
        )}

        {step === MigrateActivitySteps.SelectNodes && (
          <SelectNodesStep
            morseOutputAddress={morseOutputAddress}
            selectedNodes={nodes}
            setNodes={handleSelectNodes}
            onClose={() => setAbortDialogOpen(true)}
            onBack={() => setStep(MigrateActivitySteps.Signature)}
          />
        )}

        {step === MigrateActivitySteps.PickOffer && (
          <PickOfferStep
            amount={15001}
            defaultOffer={selectedOffer}
            onOfferSelected={(offer) => {
              setSelectedOffer(offer);
              setStep(MigrateActivitySteps.Review);
            }}
            onBack={() => {
              setStep(MigrateActivitySteps.SelectNodes);
            }}
            onClose={() => setAbortDialogOpen(true)}
          />
        )}

        {step === MigrateActivitySteps.Review && (
          <ReviewStep
            morseOutputAddress={morseOutputAddress}
            nodes={nodes}
            selectedOffer={selectedOffer!}
            onClose={() => {
              redirect('/app');
            }}
            onBack={() => {
              setStep(MigrateActivitySteps.PickOffer);
            }}
          />
        )}

      </div>
      <AbortConfirmationDialog
        type={'migration'}
        isOpen={isAbortDialogOpen}
        onResponse={(abort) => {
          setAbortDialogOpen(false);
          if (abort) {
            redirect("/app");
          }
        }}
      />
    </>
  )
}
