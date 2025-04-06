'use client';

import {useMemo, useState} from "react";
import {Button} from "@igniter/ui/components/button";
import {ActivityHeader} from "@/app/app/(takeover)/stake/components/ActivityHeader";
import {ActivityContentLoading} from "@/app/app/(takeover)/stake/components/ActivityContentLoading";
import {toCompactFormat, toCurrencyFormat, toDateFormat} from "@igniter/ui/lib/utils";
import {Activity, Transaction, TransactionStatus, TransactionType} from "@/db/schema";
import {QuickInfoPopOverIcon} from "@igniter/ui/components/QuickInfoPopOverIcon";
import {CaretSmallIcon, CornerIcon, LoaderIcon} from "@igniter/ui/assets";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";

export interface StakeSuccessProps {
    amount: number;
    selectedOffer: StakeDistributionOffer;
    activity: Activity;
    onClose: () => void;
}

export function StakeSuccessStep({amount, selectedOffer, activity, onClose}: Readonly<StakeSuccessProps>) {
    const [isShowingTransactionDetails, setIsShowingTransactionDetails] = useState<boolean>(false);
    const applicationSettings = useApplicationSettings();
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

    const isViewReady = useMemo(() => {
        return amount && amount > 0 &&
            applicationSettings;
    }, [amount, applicationSettings]);

    const activityTransactions = useMemo(() => {
        return activity.transactions;
    }, [activity]);

    const totalNetworkFee = useMemo(() => {
        return activityTransactions.length * 0.01;
    }, [activityTransactions]);

    const activityTransactionsMap: Map<Transaction, Transaction[]> = useMemo(() => {
        const map = new Map<Transaction, Transaction[]>();

        const rootTransactions = activityTransactions.filter(tx => tx.dependsOn === null);

        rootTransactions.forEach(rootTx => {
            const dependentTransactions = activityTransactions.filter(tx => tx.dependsOn === rootTx.id);
            map.set(rootTx, dependentTransactions);
        });

        return map;
    }, [activityTransactions]);
    
    const executedTransactions = useMemo(() => {
        return activityTransactions.filter(tx => tx.status !== TransactionStatus.Pending);
    }, [activityTransactions]);

    return (
        <div
            className="flex flex-col w-[480px] border-x border-b border-[--black-dividers] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8">
            <ActivityHeader
                title="Success!"
                subtitle="Below are the details of your stake operation."
                onClose={onClose}
            />

            {!isViewReady && (
                <ActivityContentLoading/>
            )}

            {isViewReady && (
                <>
                    <div className="relative flex h-[64px] gradient-border-green">
                        <div
                            className={`absolute inset-0 flex flex-row items-center m-[0.5px] bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
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
                            Stake is being processed. Avoid moving funds from your wallet for at least one hour to prevent funding errors.
                        </span>
                        <div className="h-[1px] bg-[var(--slate-dividers)]"/>
                        <div className="p-2">
                            <Button variant="secondaryBorder" className="w-full">
                                About Staking
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col p-0 rounded-[8px] border border-[var(--black-dividers)]">
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
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
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
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
                                {totalNetworkFee}
                            </span>
                            <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                                $POKT
                            </span>
                            </span>
                        </span>
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
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
                                {toCurrencyFormat(activityTransactions.length * selectedOffer.operationalFundsAmount, 2, 2)}
                            </span>
                            <span className="font-mono text-[14px] text-[var(--color-white-3)]">
                                $POKT
                            </span>
                        </span>
                    </span>
                    </div>
                    <div key="stake-details"
                         className="flex flex-col p-0 rounded-[8px] border border-[var(--black-dividers)]">
                    <span
                        className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
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
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                            <span className="text-[14px] text-[var(--color-white-3)]">
                                Provider
                            </span>
                            <span className="text-[14px] text-[var(--color-white-1)]">
                                {selectedOffer.name}
                            </span>
                        </span>
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                            <span className="text-[14px] text-[var(--color-white-3)]">
                                Timestamp
                            </span>
                            <span className="text-[14px] text-[var(--color-white-1)]">
                                {toDateFormat(activity.createdAt)}
                            </span>
                        </span>
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                            <span className="text-[14px] text-[var(--color-white-3)]">
                                Status
                            </span>
                            <span className="text-[14px] text-[var(--color-white-1)]">
                                {`${activity.status} (${executedTransactions.length}/${activityTransactions.length})`}
                            </span>
                        </span>
                        <span
                            className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                        <span className="flex flex-row items-center gap-2 hover:cursor-pointer"
                          onClick={() => setIsShowingTransactionDetails(!isShowingTransactionDetails)}>
                        {isShowingTransactionDetails && (
                            <CaretSmallIcon className="transform rotate-90"/>
                        )}
                        {!isShowingTransactionDetails && (
                            <CaretSmallIcon/>
                        )}
                        <span className="text-[14px] text-[var(--color-white-3)]">
                            {`Transactions (${activityTransactions.length})`}
                        </span>
                    </span>
                </span>

                        {isShowingTransactionDetails && Array.from(activityTransactionsMap.keys()).map((tx, index) => (
                            <>
                                <span key={`stake-${index}`}
                                      className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                                    <span className="text-[14px] text-[var(--color-white-3)]">
                                        {tx.type === TransactionType.Stake && `Stake (${toCompactFormat(tx.amount)})`}
                                        {tx.type ===  TransactionType.Unstake && `Unstake (${toCompactFormat(tx.amount)})`}
                                    </span>
                                    <span className="flex flex-row gap-2">
                                        <span className="text-[14px] text-[var(--color-white-1)]">
                                            {tx.status}
                                        </span>
                                    </span>
                                </span>
                                {activityTransactionsMap.get(tx)?.map((tx, index) => (
                                    <span key={`dependant-tx-${index}`}
                                          className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)]">
                                    <span className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
                                        <CornerIcon/>
                                        <span>
                                            {tx.type ===  TransactionType.Send && 'Operational Funds'}
                                        </span>
                                        </span>
                                        <span className="flex flex-row gap-2">
                                            <span className="text-[14px] text-[var(--color-white-1)]">
                                                {tx.status}
                                            </span>
                                        </span>
                                    </span>
                                ))}
                            </>
                        ))}
                    </div>
                </>
            )}

            <Button
                className="w-full h-[40px]"
                onClick={() => {
                    setIsRedirecting(true);
                    onClose();
                }}
            >
                {isRedirecting && (
                    <LoaderIcon className="animate-spin"/>
                )}
                {!isRedirecting && 'Close'}
            </Button>
        </div>
    );
}
