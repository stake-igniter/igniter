'use client';

import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/app/(takeover)/stake/components/ActivityHeader";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {toCurrencyFormat} from "@igniter/ui/lib/utils";
import {QuickInfoPopOverIcon} from "@igniter/ui/components/QuickInfoPopOverIcon";
import {CaretSmallIcon, CornerIcon} from "@igniter/ui/assets";
import {useMemo, useState} from "react"
import {useApplicationSettings} from "@/app/context/ApplicationSettings";

export interface ReviewStepProps {
    amount: number;
    selectedOffer: StakeDistributionOffer;
    onConfirm: (amount: number) => void;
    onBack: () => void;
}

export function ReviewStep({onConfirm, amount, selectedOffer, onBack}: Readonly<ReviewStepProps>) {
    const [isShowingTransactionDetails, setIsShowingTransactionDetails] = useState<boolean>(false);
    const applicationSettings = useApplicationSettings();

    const prospectTransactions = useMemo(() => {
        return selectedOffer.stakeDistribution.reduce<number[]>((txs, stakeDistribution) => {
            return [...txs, ...Array.from({length: stakeDistribution.qty}, () => stakeDistribution.amount)];
        }, []);
    }, [selectedOffer]);

    return (
        <div
            className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                onBack={onBack}
                title="Review"
                subtitle="Please review the details of your stake operation."
            />

            <div className="relative flex h-[64px] gradient-border-slate">
                <div className={`absolute inset-0 flex flex-row items-center m-[0.5px] bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
                    <span className="text-[20px] text-[var(--color-white-3)]">
                        Stake
                    </span>
                    <span className="flex flex-row items-center gap-2">
                        <span className="font-mono text-[20px] text-[var(--color-white-1)]">
                            {toCurrencyFormat(amount)}
                        </span>
                        <span className="font-mono text-[20px] text-[var(--color-white-3)]">
                            $POKT
                        </span>
                    </span>
                </div>
            </div>

            <div className="flex flex-col bg-[var(--color-slate-2)] p-0 rounded-[8px]">
                <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
                    Upon clicking Stake, you will be prompted to sign transactions with your wallet to finalize the stake operation.
                </span>
                <div className="h-[1px] bg-[var(--slate-dividers)]" />
                <div className="p-2">
                    <Button variant="secondaryBorder" className="w-full">
                        About Staking
                    </Button>
                </div>
            </div>

            <div className="flex flex-col p-0 rounded-[8px] border border-[var(--black-dividers)]">
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
                        <span>
                            Service Fee
                        </span>
                        <QuickInfoPopOverIcon
                            title="Service Fee"
                            description="The % of the rewards that this website retain for handling the service."
                            url={''}
                        />
                    </span>
                    <span className="text-[14px] text-[var(--color-white-1)]">
                        {applicationSettings?.fee}%
                    </span>
                </span>
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
                        <span>
                            Network Fee
                        </span>
                        <QuickInfoPopOverIcon
                            title="Network Fee"
                            description="The amount of $POKT that will be charged as a network fee per transaction."
                            url={''}
                        />
                    </span>
                    <span className="flex flex-row gap-2">
                        <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                            0.01
                        </span>
                        <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                            $POKT
                        </span>
                    </span>
                </span>
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
                        <span>
                            Operational Funds
                        </span>
                        <QuickInfoPopOverIcon
                            title="Operational Funds"
                            description="Small amount of $POKT required per node to process relays."
                            url={''}
                        />
                    </span>
                    <span className="flex flex-row gap-2">
                        <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                            1.00
                        </span>
                        <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                            $POKT
                        </span>
                    </span>
                </span>
            </div>

            <div key="stake-details" className="flex flex-col p-0 rounded-[8px] border border-[var(--black-dividers)]">
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
                        <span>
                            Provider Fee
                        </span>
                        <QuickInfoPopOverIcon
                            title="Provider Fee"
                            description="The % of the rewards that the node operator retain for providing the service."
                            url={''}
                        />
                    </span>
                    <span className="text-[14px] text-[var(--color-white-1)]">
                        {selectedOffer.fee}%
                    </span>
                </span>
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="text-[14px] text-[var(--color-white-3)]">
                        Provider
                    </span>
                    <span className="text-[14px] text-[var(--color-white-1)]">
                        {selectedOffer.name}
                    </span>
                </span>
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="flex flex-row items-center gap-2 hover:cursor-pointer" onClick={() => setIsShowingTransactionDetails(!isShowingTransactionDetails)}>
                        {isShowingTransactionDetails && (
                            <CaretSmallIcon className="transform rotate-90" />
                        )}
                        {!isShowingTransactionDetails && (
                            <CaretSmallIcon />
                        )}
                        <span className="text-[14px] text-[var(--color-white-3)]">
                            {`Transactions to Sign (${prospectTransactions.length * 2})`}
                        </span>
                    </span>
                </span>
                {isShowingTransactionDetails && prospectTransactions.map((tx, index) => (
                    <>
                        <span key={`stake-${index}`} className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                            <span className="text-[14px] text-[var(--color-white-3)]">
                                {`Stake (${tx})`}
                            </span>
                            <span className="flex flex-row gap-2">
                                <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                                    {tx}
                                </span>
                                <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                                    $POKT
                                </span>
                            </span>
                        </span>
                        <span key={`of-${index}`} className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                            <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
                                <CornerIcon />
                                <span>
                                    Operational Funds
                                </span>
                            </span>
                            <span className="flex flex-row gap-2">
                                <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                                    1.00
                                </span>
                                <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                                    $POKT
                                </span>
                            </span>
                        </span>
                    </>
                ))}
            </div>

            <Button
                className="w-full h-[40px]"
            >
                Stake
            </Button>
        </div>
    );
}
