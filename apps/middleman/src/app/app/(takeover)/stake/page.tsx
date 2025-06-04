"use client";

import { useEffect, useState } from 'react'
import {PickStakeAmountStep} from "@/app/app/(takeover)/stake/components/PickStakeAmountStep";
import {PickOfferStep} from "@/app/app/(takeover)/stake/components/PickOfferStep";
import {ReviewStep} from "@/app/app/(takeover)/stake/components/ReviewStep";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {StakeSuccessStep} from "@/app/app/(takeover)/stake/components/StakeSuccessStep";
import {redirect} from "next/navigation";
import {AbortConfirmationDialog} from '@igniter/ui/components/AbortConfirmationDialog'
import { Transaction } from '@/db/schema'
import {allStagesSucceeded, getFailedStage} from "@/app/app/(takeover)/stake/utils";
import {StakingProcessStatus} from "@/app/app/(takeover)/stake/components/ReviewStep/StakingProcess";
import { useWalletConnection } from '@igniter/ui/context/WalletConnection/index'
import OwnerAddressStep from '@/app/app/(takeover)/stake/components/OwnerAddressStep'
import Loading from '@/app/app/(takeover)/stake/components/Loading'

enum StakeActivitySteps {
    OwnerAddress = 'OwnerAddress',
    PickStakeAmount = 'PickStakeAmount',
    PickOffer = 'PickOffer',
    Review = 'Review',
    Success = 'Success'
}

export default function StakePage() {
  const {connectedIdentity, connectedIdentities, isConnected} = useWalletConnection()
    const [step, setStep] = useState<StakeActivitySteps>(
      connectedIdentities && connectedIdentities.length > 1 ?
        StakeActivitySteps.OwnerAddress :
        StakeActivitySteps.PickStakeAmount
    );

    const [stakeAmount, setStakeAmount] = useState<number>(0);
    const [selectedOffer, setSelectedOffer] = useState<StakeDistributionOffer | undefined>();
    const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);
    const [isAbortDialogOpen, setAbortDialogOpen] = useState(false);
    const [ownerAddress, setOwnerAddress] = useState<string>(
      connectedIdentities!.length > 1 ?
      '' : connectedIdentity!
    );
    const [stakingErrorMessage, setStakingErrorMessage] = useState<string | undefined>(undefined);

    const errorsMap: Record<keyof StakingProcessStatus, string> = {
      requestSuppliersStatus: 'The staking process failed while requesting suppliers. Please try again later or contact support if the issue persists.',
      transactionSignatureStatus: 'Transaction signature failed. If you rejected the signature request, please note that your signature is required to complete the staking process. Otherwise, check your wallet connection and try again.',
      schedulingTransactionStatus: 'The transaction was signed but could not be scheduled. Please try again or contact support if the issue persists.'
    };

  useEffect(() => {
    if (isConnected) {
      setOwnerAddress(
        connectedIdentities!.length > 1 ?
          '' : connectedIdentity!
      )
      setStep(
        connectedIdentities!.length > 1 ?
          StakeActivitySteps.OwnerAddress :
          StakeActivitySteps.PickStakeAmount
      );
    }
  }, [isConnected])

    const handleOwnerAddressChange = (address: string) => {
      setOwnerAddress(address);
      setStep(StakeActivitySteps.PickStakeAmount);
    }

    const handleStakeAmountChange = (amount: number) => {
        setStakeAmount(amount);
        setStep(StakeActivitySteps.PickOffer);
    };

    if (!isConnected) {
      return (
        <div className="flex flex-row justify-center w-full">
          <Loading />
        </div>
      );
    }

    return (
        <>
            <div className="flex flex-row justify-center w-full">
                {step === StakeActivitySteps.OwnerAddress && (
                  <OwnerAddressStep
                    onClose={() => setAbortDialogOpen(true)}
                    onOwnerAddressSelected={handleOwnerAddressChange}
                    selectedOwnerAddress={ownerAddress}
                  />
                )}

                {step === StakeActivitySteps.PickStakeAmount && (
                    <PickStakeAmountStep
                        ownerAddress={ownerAddress}
                        defaultAmount={stakeAmount}
                        onAmountSelected={handleStakeAmountChange}
                        onClose={() => setAbortDialogOpen(true)}
                        onBack={
                          connectedIdentities!.length > 1 ?
                            () => setStep(StakeActivitySteps.OwnerAddress) :
                            undefined
                        }
                    />
                )}

                {step === StakeActivitySteps.PickOffer && (
                    <PickOfferStep
                        amount={stakeAmount}
                        defaultOffer={selectedOffer}
                        onOfferSelected={(offer) => {
                            setSelectedOffer(offer);
                            setStep(StakeActivitySteps.Review);
                        }}
                        onBack={() => {
                            setStep(StakeActivitySteps.PickStakeAmount);
                        }}
                        onClose={() => setAbortDialogOpen(true)}
                    />
                )}

                {step === StakeActivitySteps.Review && (
                    <ReviewStep
                        amount={stakeAmount}
                        errorMessage={stakingErrorMessage}
                        selectedOffer={selectedOffer!}
                        ownerAddress={ownerAddress}
                        onStakeCompleted={(result, transaction) => {
                            if (allStagesSucceeded(result)) {
                                setStep(StakeActivitySteps.Success);
                                setTransaction(transaction)
                            } else {
                              const failedStage = getFailedStage(result);
                              if (failedStage) {
                                setStakingErrorMessage(errorsMap[failedStage]);
                              }
                            }
                        }}
                        onBack={() => {
                            setStep(StakeActivitySteps.PickOffer);
                        }}
                        onClose={() => setAbortDialogOpen(true)}
                    />
                )}

                {step === StakeActivitySteps.Success && (
                    <StakeSuccessStep
                        transaction={transaction!}
                        amount={stakeAmount}
                        selectedOffer={selectedOffer!}
                        onClose={() => {
                            redirect('/app');
                        }}
                    />
                )}
            </div>
            <AbortConfirmationDialog
                isOpen={isAbortDialogOpen}
                onResponse={(abort) => {
                    setAbortDialogOpen(false);
                    if (abort) {
                        redirect("/app");
                    }
                }}
            />
        </>
    );
}
