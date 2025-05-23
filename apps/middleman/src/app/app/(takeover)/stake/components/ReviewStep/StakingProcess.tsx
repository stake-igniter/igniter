"use client";

import {Button} from "@igniter/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@igniter/ui/components/dialog";
import {useEffect, useState} from "react";
import {CheckSuccess, LoaderIcon, XIcon} from "@igniter/ui/assets";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {Transaction as DbTransaction} from "@/db/schema";
import {requestSuppliers} from "@/lib/services/provider";
import {SignedTransaction, TransactionMessage,} from "@/lib/models/Transactions";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {useWalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {CreateStakeTransaction} from "@/actions/Stake";
import {StageStatus} from "@/app/app/(takeover)/stake/types";
import {stageFailed, stageSucceeded} from "@/app/app/(takeover)/stake/utils";

export interface StakingProcessStatus {
  requestSuppliersStatus: StageStatus;
  transactionSignatureStatus: StageStatus;
  schedulingTransactionStatus: StageStatus;
}

export interface StakingProcessProps {
  offer: StakeDistributionOffer;
  ownerAddress: string;
  region?: string;
  onStakeCompleted: (result: StakingProcessStatus, transaction?: DbTransaction) => void;
}

enum StakingProcessStep {
  requestSuppliers,
  transactionSignature,
  SchedulingTransaction,
  Completed
}

export function StakingProcess({offer, onStakeCompleted, ownerAddress, region}: Readonly<StakingProcessProps>) {
  const [open, setOpen] = useState(false);
  const [isCancellable, setIsCancellable] = useState<boolean>(true);
  const [stakingStatus, setStakingStatus] = useState<StakingProcessStatus>({
    requestSuppliersStatus: 'pending',
    transactionSignatureStatus: 'pending',
    schedulingTransactionStatus: 'pending',
  });
  const [currentStep, setCurrentStep] = useState<StakingProcessStep>(StakingProcessStep.requestSuppliers);
  const settings = useApplicationSettings();
  const {connectedIdentity, signTransaction} = useWalletConnection();
  const [transaction, setTransaction] = useState<DbTransaction | null>(null);
  const [transactionMessages, setTransactionMessages] = useState<TransactionMessage[]>([]);
  const [signedTransaction, setSignedTransaction] = useState<SignedTransaction | null>(null);

  useEffect(() => {
    (async () => {
      if (!open || currentStep !== StakingProcessStep.requestSuppliers) {
        return;
      }
      try {
        const suppliers = await requestSuppliers(offer, settings!, ownerAddress, region);

        const stakeTransactions: TransactionMessage[] = suppliers.map((supplier) => {
          return {
            typeUrl: '/pocket.supplier.MsgStakeSupplier',
            body: {
              ...supplier,
              stakeAmount: (Number(supplier.stakeAmount) * 1e6).toString(),
              ownerAddress: connectedIdentity!,
              signer: connectedIdentity!,
            },
          };
        });

        const ofTransactions: TransactionMessage[] = suppliers.map(supplier => {
          return {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            body: {
              toAddress: supplier.operatorAddress,
              amount: (offer.operationalFundsAmount * 1e6).toString(),
            },
          };
        });

        setTransactionMessages([...stakeTransactions, ...ofTransactions]);

        setStakingStatus((prev) => ({
          ...prev,
          requestSuppliersStatus: 'success',
        }));

        setCurrentStep(StakingProcessStep.transactionSignature);
      } catch (err) {
        const { message } = err as Error;
        console.log('An error occurred while retrieving the supplier stake info. Error:', message);
        handleFailedStage('requestSuppliersStatus');
      }
    })();
  }, [open, currentStep]);

  useEffect(() => {
    (async () => {
      if (!open || currentStep !== StakingProcessStep.transactionSignature) {
        return;
      }

      try {
        const signedTx = await signTransaction(transactionMessages);

        setSignedTransaction(signedTx);

        setStakingStatus((prev) => ({
          ...prev,
          transactionSignatureStatus: 'success',
        }));

        setIsCancellable(false);

        setCurrentStep(StakingProcessStep.SchedulingTransaction);
      } catch (err) {
        const { message } = err as Error;
        console.log('An error occurred while collecting the signature.Error:', message);
        handleFailedStage('transactionSignatureStatus');
      }
    })();
  }, [open, currentStep]);

  useEffect(() => {
    (async () => {
      if (!open || currentStep !== StakingProcessStep.SchedulingTransaction) {
        return;
      }

      try {
        const createdTransaction = await CreateStakeTransaction({
          offer,
          transaction: signedTransaction!,
        });

        setTransaction(createdTransaction);

        setStakingStatus((prev) => ({
          ...prev,
          schedulingTransactionStatus: 'success',
        }));

        setCurrentStep(StakingProcessStep.Completed);
      } catch (err) {
        const { message } = err as Error;
        console.log('An error occurred while scheduling the signed transactions. Error:', message);
        handleFailedStage('schedulingTransactionStatus');
      }
    })();
  }, [open, currentStep]);

  useEffect(() => {
    if (open && currentStep === StakingProcessStep.Completed) {
      setTimeout(() => {
        onStakeCompleted({
          ...stakingStatus,
        }, transaction!);
        setOpen(false);
      }, 1000);
    }
  }, [open, currentStep]);

  function handleOpenChanged(open: boolean) {
    setOpen(open);

    if (!open) {
      setCurrentStep(StakingProcessStep.requestSuppliers);
      setStakingStatus({
        requestSuppliersStatus: 'pending',
        transactionSignatureStatus: 'pending',
        schedulingTransactionStatus: 'pending',
      });
      setIsCancellable(false);
    }
  }

  function handleFailedStage(stageName: keyof StakingProcessStatus) {
    setStakingStatus((prev) => ({
      ...prev,
      [stageName]: 'error',
    }));

    setTimeout(() => {
      setStakingStatus(currentStatus => {
        onStakeCompleted(currentStatus);
        handleOpenChanged(false);
        return currentStatus;
      });
    }, 1000);

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
          {stageSucceeded(stakingStatus.requestSuppliersStatus) && <CheckSuccess/>}
          {stageFailed(stakingStatus.requestSuppliersStatus) && <XIcon className={`fill-current text-[var(--color-destructive)]`}/>}
        </div>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
        <div className="flex flex-row justify-between items-center py-3 px-4">
          <span className="text-[14px]">Transactions Signature</span>
          {stageSucceeded(stakingStatus.transactionSignatureStatus) && <CheckSuccess/>}
          {stageFailed(stakingStatus.transactionSignatureStatus) && <XIcon className={`fill-current text-[var(--color-destructive)]`}/>}
        </div>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
        <div className="flex flex-row justify-between items-center py-3 px-4 font-size[14px]">
          <span className="text-[14px]">Scheduling Transactions</span>
          {stageSucceeded(stakingStatus.schedulingTransactionStatus) && <CheckSuccess/>}
          {stageFailed(stakingStatus.schedulingTransactionStatus) && <XIcon className={`fill-current text-[var(--color-destructive)]`}/>}
        </div>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
        <DialogFooter className="p-2">
          <DialogClose className="w-full" asChild>
            <Button
              disabled={!isCancellable}
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
