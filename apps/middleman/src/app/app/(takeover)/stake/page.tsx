"use client";

import {useState} from "react";
import {PickStakeAmountStep} from "@/app/app/(takeover)/stake/components/PickStakeAmountStep";
import {PickOfferStep} from "@/app/app/(takeover)/stake/components/PickOfferStep";
import {ReviewStep} from "@/app/app/(takeover)/stake/components/ReviewStep";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";

enum StakeActivitySteps {
    PickStakeAmount = 'PickStakeAmount',
    PickOffer = 'PickOffer',
    Review = 'Review',
}

export default function StakePage() {
    const [step, setStep] = useState<StakeActivitySteps>(StakeActivitySteps.PickStakeAmount);
    const [stakeAmount, setStakeAmount] = useState<number>(0);
    const [selectedOffer, setSelectedOffer] = useState<StakeDistributionOffer | undefined>();

    const handleStakeAmountChange = (amount: number) => {
        setStakeAmount(amount);
        setStep(StakeActivitySteps.PickOffer);
    };

    return (
        <div className="flex flex-row justify-center w-full">
            {step === StakeActivitySteps.PickStakeAmount && (
                <PickStakeAmountStep defaultAmount={stakeAmount} onAmountSelected={handleStakeAmountChange} />
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
                />
            )}

            {step === StakeActivitySteps.Review && (
                <ReviewStep
                    amount={stakeAmount}
                    selectedOffer={selectedOffer!}
                    onConfirm={() => {

                    }}
                    onBack={() => {
                        setStep(StakeActivitySteps.PickOffer);
                    }}
                />
            )}
        </div>
    );
}
