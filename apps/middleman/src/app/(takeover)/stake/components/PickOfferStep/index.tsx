'use client';

import {useEffect, useState} from "react";
import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/(takeover)/stake/components/ActivityHeader";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {toCurrencyFormat} from "@igniter/ui/lib/utils";
import {ProviderOfferItem} from "@/app/(takeover)/stake/components/PickOfferStep/ProviderOfferItem";

export interface PickOfferStepProps {
    amount: number;
    defaultOffer?: StakeDistributionOffer;
    onOfferSelected: (offer: StakeDistributionOffer) => void;
    onBack: () => void;
}

export function PickOfferStep({onOfferSelected, amount, onBack, defaultOffer}: Readonly<PickOfferStepProps>) {
    const [selectedOffer, setSelectedOffer] = useState<StakeDistributionOffer | undefined>(defaultOffer);
    {/* TODO: Calculate the amount based on POKT. Using the function provided by currency context. Show the currency from the context. */}
    const subtitle = `Pick a node runner for your ${toCurrencyFormat(amount)} $POKT stake.`;

    const offers: StakeDistributionOffer[] = [
        {
            id: 1,
            name: "Poktscan",
            fee: 5,
            rewards: 10,
            stakeDistribution: []
        },
        {
            id: 2,
            name: "QuantumSpider",
            fee: 4,
            rewards: 12,
            stakeDistribution: []
        },
        {
            id: 3,
            name: "StakeNodes",
            fee: 6,
            rewards: 8,
            stakeDistribution: []
        },
        {
            id: 4,
            name: "Node Fleet",
            fee: 3,
            rewards: 15,
            stakeDistribution: []
        }
    ];

    useEffect(() => {
        if (!selectedOffer && offers) {
            setSelectedOffer(offers[0]);
        }
    }, []);

    return (
        <div
            className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                onBack={onBack}
                title="Provider"
                subtitle={subtitle}
            />

            {offers.map((offer) => (
                <ProviderOfferItem
                    key={offer.id}
                    offer={offer}
                    isSelected={selectedOffer?.id === offer.id}
                    onSelect={() => setSelectedOffer(offer)}
                />
            ))}

            <Button
                className="w-full h-[40px]"
                disabled={!selectedOffer}
                onClick={() => onOfferSelected(selectedOffer!)}
            >
                Continue
            </Button>
        </div>
    );
}
