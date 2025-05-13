"use client";

import {useState} from "react";
import {PickStakeAmountStep} from "@/app/app/(takeover)/stake/components/PickStakeAmountStep";
import {PickOfferStep} from "@/app/app/(takeover)/stake/components/PickOfferStep";
import {ReviewStep} from "@/app/app/(takeover)/stake/components/ReviewStep";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {StakeSuccessStep} from "@/app/app/(takeover)/stake/components/StakeSuccessStep";
import {redirect} from "next/navigation";
import {AbortConfirmationDialog} from '@/app/app/(takeover)/stake/components/AbortConfirmationDialog'
import { Transaction } from '@/db/schema'
import {allStagesSucceeded, getFailedStage} from "@/app/app/(takeover)/stake/utils";
import {StakingProcessStatus} from "@/app/app/(takeover)/stake/components/ReviewStep/StakingProcess";
import {StageStatus} from "@/app/app/(takeover)/stake/types";

enum StakeActivitySteps {
    PickStakeAmount = 'PickStakeAmount',
    PickOffer = 'PickOffer',
    Review = 'Review',
    Success = 'Success'
}

export default function StakePage() {
    const [step, setStep] = useState<StakeActivitySteps>(StakeActivitySteps.PickStakeAmount);
    const [stakeAmount, setStakeAmount] = useState<number>(0);
    const [selectedOffer, setSelectedOffer] = useState<StakeDistributionOffer | undefined>();
    const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);
    const [isAbortDialogOpen, setAbortDialogOpen] = useState(false);
    const [ownerAddress, setOwnerAddress] = useState<string>('');
    const [stakingErrorMessage, setStakingErrorMessage] = useState<string | undefined>(undefined);

    const errorsMap: Record<keyof StakingProcessStatus, string> = {
      requestSuppliersStatus: 'The staking process failed while requesting suppliers. Please try again later or contact support if the issue persists.',
      transactionSignatureStatus: 'Transaction signature failed. If you rejected the signature request, please note that your signature is required to complete the staking process. Otherwise, check your wallet connection and try again.',
      schedulingTransactionStatus: 'The transaction was signed but could not be scheduled. Please try again or contact support if the issue persists.'
    };

    const handleStakeAmountChange = (amount: number) => {
        setStakeAmount(amount);
        setStep(StakeActivitySteps.PickOffer);
    };

    return (
        <>
            <div className="flex flex-row justify-center w-full">
                {step === StakeActivitySteps.PickStakeAmount && (
                    <PickStakeAmountStep
                        defaultAmount={stakeAmount}
                        onAmountSelected={handleStakeAmountChange}
                        onOwnerAddressSelected={setOwnerAddress}
                        onClose={() => setAbortDialogOpen(true)}
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
                              debugger;
                              setStakingErrorMessage(errorsMap[failedStage]);
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
