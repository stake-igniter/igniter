"use client";

import {Button} from "@igniter/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter, DialogTitle,
    DialogTrigger,
} from "@igniter/ui/components/dialog";
import {DialogClose} from "@igniter/ui/components/dialog";
import {useEffect, useMemo, useState} from "react";
import {CheckSuccess, LoaderIcon} from "@igniter/ui/assets";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import { Activity } from "@/db/schema";
import {requestKeys} from "@/lib/services/provider";
import {
    createOperationalFundsTransaction,
    createStakeTransaction,
    StakeTransactionSignatureRequest,
    SignedOperationalFundsTransaction,
    SignedStakeTransaction, OperationalFundsTransactionSignatureRequest,
} from "@/lib/models/Transactions";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {useWalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {CreateStakeActivity} from "@/actions/Stake";

export interface StakingProcessStatus {
    requestStakeKeysDone: boolean;
    stakeSignatureDone: boolean;
    signedStakeTransactionsCount: number;
    operationalFundsSignatureDone: boolean;
    signedOperationalFundsTransactionsCount: number;
    schedulingTransactionsDone: boolean;
    isCancellable: boolean;
}

export interface StakingProcessProps {
    offer: StakeDistributionOffer;
    onStakeCompleted: (result: StakingProcessStatus, activity?: Activity) => void;
}

enum StakingProcessStep {
    RequestKeys,
    StakeSignature,
    OperationalFundsSignature,
    SchedulingTransactions,
    Completed
}

export function StakingProcess({ offer, onStakeCompleted }: Readonly<StakingProcessProps>) {
    const [open, setOpen] = useState(false);
    const [stakingStatus, setStakingStatus] = useState<StakingProcessStatus>({
        requestStakeKeysDone: false,
        stakeSignatureDone: false,
        operationalFundsSignatureDone: false,
        schedulingTransactionsDone: false,
        signedStakeTransactionsCount: 0,
        signedOperationalFundsTransactionsCount: 0,
        isCancellable: true,
    });
    const [currentStep, setCurrentStep] = useState<StakingProcessStep>(StakingProcessStep.RequestKeys);
    const settings = useApplicationSettings();
    const { connectedIdentity, signStakeTransactions, signOperationalFundsTransactions } = useWalletConnection();
    const [unsignedStakeTransactions, setUnsignedStakeTransactions] = useState<StakeTransactionSignatureRequest[]>([]);
    const [stakeTransactions, setStakeTransactions] = useState<SignedStakeTransaction[]>([]);
    const [unsignedOperationalFundsTransactions, setUnsignedOperationalFundsTransactions] = useState<OperationalFundsTransactionSignatureRequest[]>([])
    const [operationalFundsTransactions, setOperationalFundsTransactions] = useState<SignedOperationalFundsTransaction[]>([])
    const [activity, setActivity] = useState<Activity>();

    const stakeTransactionsCount = useMemo(() => {
        return offer.stakeDistribution.reduce((count, stakeDistribution) => {
            return count + stakeDistribution.qty;
        }, 0);
    }, [offer]);

    useEffect(() => {
        (async () => {
            if (!open || currentStep !== StakingProcessStep.RequestKeys) {
                return;
            }
            try {
                const keys = await requestKeys(offer);
                const stakeTransactions = keys.map((key) =>
                    createStakeTransaction({
                        key,
                        offer,
                        settings: settings!,
                        outputAddress: connectedIdentity!,
                    }));

                setUnsignedStakeTransactions(stakeTransactions);
                setStakingStatus((prev) => ({
                    ...prev,
                    requestStakeKeysDone: true,
                }));
                setCurrentStep(StakingProcessStep.StakeSignature);
            } catch (err) {
                console.log('An error occurred while retrieving the keys from the service provider.');
                console.error(err);
            }
        })();
    }, [open, currentStep]);

    useEffect(() => {
        (async () => {
            if (!open || currentStep !== StakingProcessStep.StakeSignature) {
                return;
            }

            try {
                const signedTransactions = await signStakeTransactions(unsignedStakeTransactions);

                setStakeTransactions(signedTransactions);

                setStakingStatus((prev) => ({
                    ...prev,
                    stakeSignatureDone: true,
                    signedStakeTransactionsCount: signedTransactions.length,
                }));

                const ofTransactions =
                  signedTransactions.map((stakeTransaction) =>
                    createOperationalFundsTransaction({
                        stakeTransaction,
                        offer,
                    }));

                setUnsignedOperationalFundsTransactions(ofTransactions);

                setCurrentStep(StakingProcessStep.OperationalFundsSignature);
            } catch (err) {
                console.log('An error occurred while collecting the stake info from the service provider.');
                console.error(err);
            }
        })();
    }, [open, currentStep]);

    useEffect(() => {
        (async () => {
            if (!open || currentStep !== StakingProcessStep.OperationalFundsSignature) {
                return;
            }

            try {
                const signedOFTransactions = await signOperationalFundsTransactions(unsignedOperationalFundsTransactions);

                setOperationalFundsTransactions(signedOFTransactions);

                setStakingStatus((prev) => ({
                    ...prev,
                    operationalFundsSignatureDone: true,
                    isCancellable: false,
                    signedOperationalFundsTransactionsCount: signedOFTransactions.length,
                }));

                setCurrentStep(StakingProcessStep.SchedulingTransactions);
            } catch (err) {
                console.log('An error occurred while collecting the stake info from the service provider.');
                console.error(err);
            }
        })();
    }, [open, currentStep]);

    useEffect(() => {
        (async () => {
            if (!open || currentStep !== StakingProcessStep.SchedulingTransactions) {
                return;
            }

            try {
                const activity = await CreateStakeActivity({
                    offer,
                    stakeTransactions,
                    operationalFundsTransactions,
                });

                setActivity(activity);

                setStakingStatus((prev) => ({
                    ...prev,
                    schedulingTransactionsDone: true,
                }));

                setCurrentStep(StakingProcessStep.Completed);
            } catch (err) {
                console.log('An error occurred while collecting the stake info from the service provider.');
                console.error(err);
            }
        })();
    }, [open, currentStep]);

    useEffect(() => {
        if (open && currentStep === StakingProcessStep.Completed) {
            setTimeout(() => {
                onStakeCompleted({
                    ...stakingStatus,
                }, activity);
                setOpen(false);
            }, 1000);
        }
    }, [open, currentStep]);

    function handleOpenChanged(open: boolean) {
        console.log('open changed', open);
        setOpen(open);

        if (!open) {
            setCurrentStep(StakingProcessStep.RequestKeys);
            setStakingStatus({
                requestStakeKeysDone: false,
                stakeSignatureDone: false,
                signedStakeTransactionsCount: 0,
                operationalFundsSignatureDone: false,
                signedOperationalFundsTransactionsCount: 0,
                schedulingTransactionsDone: false,
                isCancellable: true,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChanged}>
            <DialogTrigger asChild>
                <Button>Stake</Button>
            </DialogTrigger>
            <DialogContent
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
                className="gap-0 w-[280px] p-0 rounded-lg bg-[var(--color-slate-2)]"
                hideClose
            >
                <DialogTitle asChild>
                    <div className="flex flex-row justify-between items-center py-3 px-4">
                        <span className="text-[14px]">Processing</span>
                        <LoaderIcon className="animate-spin"/>
                    </div>
                </DialogTitle>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <div className="flex flex-row justify-between items-center py-3 px-4">
                    <span className="text-[14px]">Requesting Keys</span>
                    {stakingStatus.requestStakeKeysDone && <CheckSuccess/>}
                </div>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <div className="flex flex-row justify-between items-center py-3 px-4">
                    <span className="text-[14px]">Stake Signature ({`${stakingStatus.signedStakeTransactionsCount}`}/{`${stakeTransactionsCount}`})</span>
                    {stakingStatus.stakeSignatureDone && <CheckSuccess/>}
                </div>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <div className="flex flex-row justify-between items-center py-3 px-4 font-size[14px]">
                    <span className="text-[14px]">Operational Funds Signature ({`${stakingStatus.signedOperationalFundsTransactionsCount}`}/{`${stakeTransactionsCount}`})</span>
                    {stakingStatus.operationalFundsSignatureDone && <CheckSuccess/>}
                </div>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <div className="flex flex-row justify-between items-center py-3 px-4 font-size[14px]">
                    <span className="text-[14px]">Scheduling Transactions</span>
                    {stakingStatus.schedulingTransactionsDone && <CheckSuccess/>}
                </div>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <DialogFooter className="p-2">
                    <DialogClose className="w-full" asChild>
                        <Button
                            disabled={!stakingStatus.isCancellable}
                            variant={'secondaryBorder'}
                            type="submit">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
