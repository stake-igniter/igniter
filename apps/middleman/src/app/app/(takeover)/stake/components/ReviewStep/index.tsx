'use client';

import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/app/(takeover)/stake/components/ActivityHeader";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import { getShortAddress, toCurrencyFormat } from '@igniter/ui/lib/utils'
import {QuickInfoPopOverIcon} from "@igniter/ui/components/QuickInfoPopOverIcon";
import {CaretSmallIcon, CornerIcon} from "@igniter/ui/assets";
import {useMemo, useState} from "react"
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {StakingProcess, StakingProcessStatus} from "@/app/app/(takeover)/stake/components/ReviewStep/StakingProcess";
import {Transaction} from "@/db/schema";
import React from "react";
import { UserAvatar } from '@igniter/ui/components/UserAvatar'

export interface ReviewStepProps {
    amount: number;
    selectedOffer: StakeDistributionOffer;
    errorMessage?: string;
    ownerAddress: string;
    onStakeCompleted: (status: StakingProcessStatus, transaction?: Transaction) => void;
    onBack: () => void;
    onClose: () => void;
}

export function ReviewStep({onStakeCompleted, amount, selectedOffer, ownerAddress, errorMessage, onBack, onClose}: Readonly<ReviewStepProps>) {
    const [isShowingTransactionDetails, setIsShowingTransactionDetails] = useState<boolean>(false);
    const applicationSettings = useApplicationSettings();

    const prospectTransactions = useMemo(() => {
        return selectedOffer.stakeDistribution.reduce<number[]>((txs, stakeDistribution) => {
            return [...txs, ...Array.from({length: stakeDistribution.qty}, () => stakeDistribution.amount)];
        }, []);
    }, [selectedOffer]);

    // TODO: Add way to get fee before signing transaction
    const totalNetworkFee = useMemo(() => {
        return prospectTransactions.length * 0.01;
    }, [prospectTransactions]);

    const totalTransactionsToSign = useMemo(() => {
        return prospectTransactions.length * 2;
    }, [prospectTransactions])

    return (
        <div
            className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                onBack={onBack}
                onClose={onClose}
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
                {!errorMessage && (
                  <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
                    Upon clicking Stake, you will be prompted to sign transactions with your wallet to finalize the stake operation.
                  </span>
                )}
                {errorMessage && (
                  <span className="text-[14px] text-[var(--color-white-3)] p-[11px_16px]">
                    {errorMessage}
                  </span>
                )}
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
                {/*<span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">*/}
                {/*    <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">*/}
                {/*        <span>*/}
                {/*            Network Fee*/}
                {/*        </span>*/}
                {/*        <QuickInfoPopOverIcon*/}
                {/*            title="Network Fee"*/}
                {/*            description="The amount of $POKT that will be charged as a network fee per transaction."*/}
                {/*            url={''}*/}
                {/*        />*/}
                {/*    </span>*/}
                {/*    <span className="flex flex-row gap-2">*/}
                {/*        <span className="font-mono text-[14px] text-[var(--color-white-1)]">*/}
                {/*            {totalNetworkFee}*/}
                {/*        </span>*/}
                {/*        <span className="font-mono text-[14px] text-[var(--color-white-3)]">*/}
                {/*            $POKT*/}
                {/*        </span>*/}
                {/*    </span>*/}
                {/*</span>*/}
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
                            {toCurrencyFormat(prospectTransactions.length * selectedOffer.operationalFundsAmount, 2, 2)}
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
                {/*TODO: Only show this when there are more than one connected identity? or when the owner address is different than the connected identity signed in?*/}
                <span className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                    <span className="text-[14px] text-[var(--color-white-3)]">
                        Owner Address
                    </span>
                    <span className="flex flex-row items-center text-[14px] text-[var(--color-white-1)]">
                        <UserAvatar address={ownerAddress} selectedAvatar={1} />
                        <span className="ml-2 font-mono">
                            {getShortAddress(ownerAddress, 5)}
                        </span>
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
                            {`Operations (${totalTransactionsToSign})`}
                        </span>
                    </span>
                </span>
                {isShowingTransactionDetails && prospectTransactions.map((tx, index) => (
                    <React.Fragment key={index}>
                        <span key={`stake-${index}`} className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                            <span className="text-[14px] text-[var(--color-white-3)]">
                                {`Stake`}
                            </span>
                            <span className="flex flex-row gap-2">
                                <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                                    {toCurrencyFormat(tx, 2, 2)}
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
                                    {toCurrencyFormat(selectedOffer.operationalFundsAmount, 2, 2)}
                                </span>
                                <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                                    $POKT
                                </span>
                            </span>
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <StakingProcess
              ownerAddress={ownerAddress}
              offer={selectedOffer}
              onStakeCompleted={onStakeCompleted}
            />
        </div>
    );
}
