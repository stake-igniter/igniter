import { StakeDistributionOffer } from '@/lib/models/StakeDistributionOffer'
import React, { useMemo, useState } from 'react'
import { useApplicationSettings } from '@/app/context/ApplicationSettings'
import { ActivityHeader } from '@/app/app/(takeover)/stake/components/ActivityHeader'
import { getShortAddress, toCompactFormat, toCurrencyFormat } from '@igniter/ui/lib/utils'
import { Button } from '@igniter/ui/components/button'
import Summary, { SummaryRow } from '@/app/components/Summary'
import { CaretSmallIcon } from '@igniter/ui/assets'

interface ReviewStepProps {
  morseOutputAddress: string;
  nodes: Array<string>;
  selectedOffer: StakeDistributionOffer;
  onClose: () => void;
  onBack: () => void;
}

// TODO: Add balance and stake amount to node list
export default function ReviewStep({
  morseOutputAddress,
  nodes,
  selectedOffer,
  onClose,
  onBack,
}: ReviewStepProps) {
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

  const amount = 15001

  const summaryRows: Array<SummaryRow> = [
    {
      label: 'Provider Fee',
      value: `${selectedOffer.fee}%`,
      description: 'The % of the rewards that the node operator retain for providing the service.'
    },
    {
      label: 'Provider',
      value: selectedOffer.name,
    },
    {
      // TODO: Add between ( ) the amount of messages (operations) the transaction will have
      label: (
        <div className={'flex items-center gap-2'}>
          <Button
            variant={'ghost'}
            className={'p-0 h-6 !items-center border-none mb-[-4px] hover:bg-transparent w-full'}
            onClick={() => setIsShowingTransactionDetails(prev => !prev)}
          >
            <CaretSmallIcon
              style={{
                transform: isShowingTransactionDetails ? 'rotate(90deg)' : undefined,
                marginRight: isShowingTransactionDetails ? 0 : '-6px',
                marginLeft: isShowingTransactionDetails ? '-6px' : 0,
                marginBottom: '-6px'
              }}
            />
            <span>Operations ({nodes.length})</span>
          </Button>
        </div>
      ),
      value: null,
    }
  ]

  if (isShowingTransactionDetails) {
    // TODO: Add balance and stake amount to node list
    summaryRows.push(
      ...nodes.map((node, index) => ({
        label: 'Node',
        value: (
          <p>
            {getShortAddress(node, 4)}{' '}
            <span className={'text-[color:var(--muted-foreground)]'}>
              ({toCompactFormat(amount)})
            </span>
          </p>
        ),
      }))
    )
  }

  return (
    <div
      className="flex flex-col w-[480px] border-x border-b border-[--balck-deviders] bg-[--black-1] p-[33px] rounded-b-[12px] gap-8"
    >
      <ActivityHeader
        onBack={onBack}
        onClose={onClose}
        title="Review"
        subtitle="Please review the details of your migration."
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
            Upon clicking Migrate, you will be prompted to sign the transaction with your wallet to finalize the migration operation.
        </span>
        <div className="h-[1px] bg-[var(--slate-dividers)]" />
        <div className="p-2">
          <Button variant="secondaryBorder" className="w-full">
            About Migration
          </Button>
        </div>
      </div>

      <Summary
        rows={[
          {
            label: 'Service Fee',
            value: `${applicationSettings?.fee}%`,
            description: 'The % of the rewards that this website retain for handling the service.'
          },
          {
            label: 'Network Fee',
            value: <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                {totalNetworkFee}
            </span>,
          },
          // TODO: Calculate based on the number of nodes that have less balance than the operational funds needed by the selected offer
          {
            label: 'Operational Funds',
            value: <span className="font-mono text-[14px] text-[var(--color-white-1)]">
                {toCurrencyFormat(prospectTransactions.length * selectedOffer.operationalFundsAmount, 2, 2)}
            </span>,
          }
        ]}
      />

      <Summary rows={summaryRows} />

    </div>
  )
}
