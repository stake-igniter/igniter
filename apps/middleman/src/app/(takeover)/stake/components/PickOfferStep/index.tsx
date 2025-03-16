'use client';

import {useEffect, useMemo, useState} from "react";
import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/(takeover)/stake/components/ActivityHeader";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {toCurrencyFormat} from "@igniter/ui/lib/utils";
import {ProviderOfferItem} from "@/app/(takeover)/stake/components/PickOfferStep/ProviderOfferItem";
import {CaretIcon} from "@igniter/ui/assets";

export interface PickOfferStepProps {
    amount: number;
    defaultOffer?: StakeDistributionOffer;
    onOfferSelected: (offer: StakeDistributionOffer) => void;
    onBack: () => void;
}

export function PickOfferStep({onOfferSelected, amount, onBack, defaultOffer}: Readonly<PickOfferStepProps>) {
    const [selectedOffer, setSelectedOffer] = useState<StakeDistributionOffer | undefined>(defaultOffer);
    const [isShowingUnavailable, setIsShowingUnavailable] = useState<boolean>(false);
    {/* TODO: Calculate the amount based on POKT. Using the function provided by currency context. Show the currency from the context. */}
    const subtitle = `Pick a node runner for your ${toCurrencyFormat(amount)} $POKT stake.`;

    const offers: StakeDistributionOffer[] = useMemo(() => {
        return [
            {
                id: 1,
                name: "Poktscan",
                fee: 20,
                rewards: 203.18,
                stakeDistribution: [
                    {
                        bin:'45k',
                        qty: 1,
                    }
                ]
            },
            {
                id: 2,
                name: "QuantumSpider",
                fee: 15,
                rewards: 182.77,
                stakeDistribution: [
                    {
                        bin:'45k',
                        qty: 1,
                    }
                ]
            },
            {
                id: 3,
                name: "StakeNodes",
                fee: 30,
                rewards: 225.04,
                stakeDistribution: [
                    {
                        bin:'45k',
                        qty: 1,
                    }
                ]
            },
            {
                id: 4,
                name: "Node Fleet",
                fee: 25,
                rewards: 133.25,
                stakeDistribution: [
                    {
                        bin:'45k',
                        qty: 1,
                    }
                ]
            },
            {
                id: 5,
                name: "Easy2Stake",
                fee: 20,
                rewards: 174.90,
                stakeDistribution: []
            },
            {
                id: 6,
                name: "Nodies",
                fee: 30,
                rewards: 78.26,
                stakeDistribution: []
            }
        ];
    }, []);

    const availableOffers = useMemo(() => {
        return offers.filter((offer) => offer.stakeDistribution.length > 0);
    }, [offers]);

    const unavailableOffers = useMemo(() => {
        return offers.filter((offer) => offer.stakeDistribution.length === 0);
    }, [offers]);

    const hasUnavailableOffers = useMemo(() => {
        return unavailableOffers.length > 0;
    }, [unavailableOffers])

    useEffect(() => {
        if (!selectedOffer && offers) {
            setSelectedOffer(offers[0]);
        }
    }, [offers, selectedOffer]);

    return (
        <div
            className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                onBack={onBack}
                title="Provider"
                subtitle={subtitle}
            />

            <div className="flex flex-col gap-3">
                {availableOffers.map((offer) => (
                    <ProviderOfferItem
                        key={offer.id}
                        offer={offer}
                        isSelected={selectedOffer?.id === offer.id}
                        onSelect={() => setSelectedOffer(offer)}
                    />
                ))}
            </div>

            {hasUnavailableOffers && !isShowingUnavailable && (
                <span className="flex flex-row items-center gap-3 hover:cursor-pointer" onClick={() => setIsShowingUnavailable(true)}>
                    <CaretIcon />
                    <span className="text-[14px] text-[var(--color-white-3)]">
                        Not Available
                    </span>
                </span>
            )}

            {hasUnavailableOffers && isShowingUnavailable && (
                <span className="flex flex-row items-center gap-3 hover:cursor-pointer" onClick={() => setIsShowingUnavailable(false)}>
                    <CaretIcon className="transform rotate-90" />
                    <span className="text-[14px] text-[var(--color-white-3)]">
                        Not Available
                    </span>
                </span>
            )}

            {hasUnavailableOffers && isShowingUnavailable && (
                <div className="-mb-4.5 p-[11px_16px] bg-[var(--color-slate-2)] rounded-[8px]">
                    <span className="text-[14px] text-[var(--color-white-3)]">
                        Some providers are ineligible for the selected stake amount.
                    </span>
                </div>
            )}

            {hasUnavailableOffers && isShowingUnavailable && (
                <div className="flex flex-col gap-3">
                    {unavailableOffers.map((offer) => (
                        <ProviderOfferItem
                            key={offer.id}
                            offer={offer}
                            disabled={true}
                        />
                    ))}
                </div>
            )}

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
