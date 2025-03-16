'use client';

import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/(takeover)/stake/components/ActivityHeader";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";

export interface ReviewStepProps {
    amount: number;
    selectedOffer: StakeDistributionOffer;
    onConfirm: (amount: number) => void;
    onBack: () => void;
}

export function ReviewStep({onConfirm, amount, selectedOffer, onBack}: Readonly<ReviewStepProps>) {
    return (
        <div
            className="flex flex-col w-[480px] h-[488px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                onBack={onBack}
                title="Review"
                subtitle="Please review the details of your stake operation."
            />

            <Button
                className="w-full h-[40px]"
            >
                Stake
            </Button>
        </div>
    );
}
