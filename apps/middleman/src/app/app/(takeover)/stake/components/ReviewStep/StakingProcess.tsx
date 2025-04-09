"use client";

import {Button} from "@igniter/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter, DialogTitle,
    DialogTrigger,
} from "@igniter/ui/components/dialog";
import {DialogClose} from "@igniter/ui/components/dialog";
import {useEffect, useState} from "react";
import {CheckSuccess, LoaderIcon} from "@igniter/ui/assets";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {
    Activity,
    ActivityStatus,
    ActivityType,
    ApplicationSettings,
    TransactionStatus,
    TransactionType
} from "@/db/schema";
import {requestKeys} from "@/lib/services/provider";
import {createStakeTransaction} from "@/lib/models/Transactions";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {useWalletConnection} from "@igniter/ui/context/WalletConnection/index";

export interface StakingProcessStatus {
    requestStakeKeysDone: boolean;
    stakeSignatureDone: boolean;
    operationalFundsSignatureDone: boolean;
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
        isCancellable: true,
    });
    const [currentStep, setCurrentStep] = useState<StakingProcessStep>(StakingProcessStep.RequestKeys);
    const settings = useApplicationSettings();
    const { connectedIdentity } = useWalletConnection();

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



            } catch (err) {
                console.log('An error occurred while retrieving the keys from the service provider.');
                console.error(err);
            }
        })();
    }, [open, currentStep]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        (async () => {
            if (!open || currentStep !== StakingProcessStep.StakeSignature) {
                return;
            }

            try {
                // TODO: request stake signatures from the wallet connection.

                timeout = setTimeout(() => {
                    setStakingStatus((prev) => ({
                        ...prev,
                        stakeSignatureDone: true,
                    }));

                    setCurrentStep(StakingProcessStep.OperationalFundsSignature);
                }, 3000);
            } catch (err) {
                console.log('An error occurred while collecting the stake info from the service provider.');
                console.error(err);
            }
        })();

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, [open, currentStep]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        (async () => {
            if (!open || currentStep !== StakingProcessStep.OperationalFundsSignature) {
                return;
            }

            try {
                // TODO: Create the activity object and store it

                timeout = setTimeout(() => {
                    setStakingStatus((prev) => ({
                        ...prev,
                        operationalFundsSignatureDone: true,
                        isCancellable: false,
                    }));

                    setCurrentStep(StakingProcessStep.SchedulingTransactions);
                }, 3000);

                return () => {
                    clearTimeout(timeout);
                }
            } catch (err) {
                console.log('An error occurred while collecting the stake info from the service provider.');
                console.error(err);
            }
        })();

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, [open, currentStep]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        (async () => {
            if (!open || currentStep !== StakingProcessStep.SchedulingTransactions) {
                return;
            }

            try {
                // TODO: request of signatures from the wallet connection.

                timeout = setTimeout(() => {
                    setStakingStatus((prev) => ({
                        ...prev,
                        schedulingTransactionsDone: true,
                    }));

                    setCurrentStep(StakingProcessStep.Completed);
                }, 3000);

                return () => {
                    clearTimeout(timeout);
                }
            } catch (err) {
                console.log('An error occurred while collecting the stake info from the service provider.');
                console.error(err);
            }
        })();

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, [open, currentStep]);

    useEffect(() => {
        if (open && currentStep === StakingProcessStep.Completed) {
            const sampleActivity: Activity = {
                id: 1,
                type: ActivityType.Stake,
                status: ActivityStatus.Pending,
                seenOn: new Date("2025-04-01T12:00:00Z"),
                createdAt: new Date("2025-04-01T11:50:00Z"),
                updatedAt: new Date("2025-04-01T11:55:00Z"),

                transactions: [
                    {
                        id: 101,
                        hash: "0xabc123",
                        type: TransactionType.Stake,
                        status: TransactionStatus.Pending,
                        executionHeight: null,
                        executionTimestamp: null,
                        verificationHeight: null,
                        verificationTimestamp: null,
                        amount: 10000,
                        dependsOn: null,
                        signedPayload: "signed_payload_data_1",
                        fromAddress: "0xWalletAddress1",
                        signatureTimestamp: new Date("2025-04-01T11:51:00Z"),
                        activityId: 1,
                        createdAt: new Date("2025-04-01T11:51:30Z"),
                        updatedAt: new Date("2025-04-01T11:51:30Z"),
                    },
                    {
                        id: 102,
                        hash: "0xdef456",
                        type: TransactionType.Send,
                        status: TransactionStatus.Pending,
                        executionHeight: null,
                        executionTimestamp: null,
                        verificationHeight: null,
                        verificationTimestamp: null,
                        amount: 5000,
                        dependsOn: 101, // referencing the first transaction
                        signedPayload: "signed_payload_data_2",
                        fromAddress: "0xWalletAddress2",
                        signatureTimestamp: new Date("2025-04-01T11:52:00Z"),
                        activityId: 1,
                        createdAt: new Date("2025-04-01T11:52:30Z"),
                        updatedAt: new Date("2025-04-01T11:52:30Z"),
                    },
                ],
            };
            setTimeout(() => {
                onStakeCompleted({
                    ...stakingStatus,
                }, sampleActivity);
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
                operationalFundsSignatureDone: false,
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
                    <span className="text-[14px]">Stake Signature (0/0)</span>
                    {stakingStatus.stakeSignatureDone && <CheckSuccess/>}
                </div>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <div className="flex flex-row justify-between items-center py-3 px-4 font-size[14px]">
                    <span className="text-[14px]">Operational Funds Signature (0/0)</span>
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
