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
import {useEffect, useMemo, useState} from "react";
import {CheckSuccess, LoaderIcon} from "@igniter/ui/assets";
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {ProviderFee, Transaction as DbTransaction} from "@/db/schema";
import {requestSuppliers} from "@/lib/services/provider";
import {SignedTransaction, TransactionMessage,} from "@/lib/models/Transactions";
import {useApplicationSettings} from "@/app/context/ApplicationSettings";
import {useWalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {CreateStakeTransaction} from "@/actions/Stake";

export interface StakingProcessStatus {
  requestSuppliersDone: boolean;
  transactionSignatureDone: boolean;
  schedulingTransactionDone: boolean;
  isCancellable: boolean;
}

export interface StakingProcessProps {
  offer: StakeDistributionOffer;
  region?: string;
  onStakeCompleted: (result: StakingProcessStatus, transaction?: DbTransaction) => void;
}

enum StakingProcessStep {
  requestSuppliers,
  transactionSignature,
  SchedulingTransaction,
  Completed
}

export function StakingProcess({offer, onStakeCompleted, region}: Readonly<StakingProcessProps>) {
  const [open, setOpen] = useState(false);
  const [stakingStatus, setStakingStatus] = useState<StakingProcessStatus>({
    requestSuppliersDone: false,
    transactionSignatureDone: false,
    schedulingTransactionDone: false,
    isCancellable: true,
  });
  const [currentStep, setCurrentStep] = useState<StakingProcessStep>(StakingProcessStep.requestSuppliers);
  const settings = useApplicationSettings();
  const {connectedIdentity, signTransaction} = useWalletConnection();
  const [transaction, setTransaction] = useState<DbTransaction | null>(null);
  const [transactionMessages, setTransactionMessages] = useState<TransactionMessage[]>([]);
  const [signedTransaction, setSignedTransaction] = useState<SignedTransaction | null>(null);

  const stakeTransactionsCount = useMemo(() => {
    return offer.stakeDistribution.reduce((count, stakeDistribution) => {
      return count + stakeDistribution.qty;
    }, 0);
  }, [offer]);

  useEffect(() => {
    (async () => {
      if (!open || currentStep !== StakingProcessStep.requestSuppliers) {
        return;
      }
      try {
        const suppliers = await requestSuppliers(offer, settings!, region);

        const stakeTransactions: TransactionMessage[] = suppliers.map((supplier) => {
          return {
            typeUrl: '/pocket.supplier.MsgStakeSupplier',
            body: {
              ...supplier,
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
              amount: offer.operationalFundsAmount.toString(),
            },
          };
        });

        setTransactionMessages([...stakeTransactions, ...ofTransactions]);

        setStakingStatus((prev) => ({
          ...prev,
          requestSuppliersDone: true,
        }));

        setCurrentStep(StakingProcessStep.transactionSignature);
      } catch (err) {
        console.log('An error occurred while retrieving the keys from the service provider.');
        console.error(err);
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
          transactionSignatureDone: true,
        }));

        setCurrentStep(StakingProcessStep.SchedulingTransaction);
      } catch (err) {
        console.log('An error occurred while collecting the stake info from the service provider.');
        console.error(err);
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
          schedulingTransactionDone: true,
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
        requestSuppliersDone: false,
        transactionSignatureDone: false,
        schedulingTransactionDone: false,
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
          {stakingStatus.requestSuppliersDone && <CheckSuccess/>}
        </div>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
        <div className="flex flex-row justify-between items-center py-3 px-4">
          <span className="text-[14px]">Transactions Signature</span>
          {stakingStatus.transactionSignatureDone && <CheckSuccess/>}
        </div>
        <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
        <div className="flex flex-row justify-between items-center py-3 px-4 font-size[14px]">
          <span className="text-[14px]">Scheduling Transactions</span>
          {stakingStatus.schedulingTransactionDone && <CheckSuccess/>}
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
