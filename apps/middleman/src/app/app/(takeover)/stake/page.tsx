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
                        selectedOffer={selectedOffer!}
                        onStakeCompleted={(result, activity) => {
                            if (
                                result.requestStakeKeysDone &&
                                result.stakeSignatureDone &&
                                result.operationalFundsSignatureDone &&
                                result.schedulingTransactionsDone
                            ) {
                                setStep(StakeActivitySteps.Success);
                                setTransaction(activity)
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
