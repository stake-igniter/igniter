import { ProviderFee, TransactionStatus, TransactionType } from '@/db/schema'
import { clsx } from 'clsx'
import { DrawerDescription, DrawerHeader, DrawerTitle } from '@igniter/ui/components/drawer'
import { amountToPokt, toCompactFormat, toDateFormat } from '@igniter/ui/lib/utils'
import { Button } from '@igniter/ui/components/button'
import Summary, { SummaryRow } from '@/app/components/Summary'
import { useApplicationSettings } from '@/app/context/ApplicationSettings'
import Amount from '@igniter/ui/components/Amount'
import { CaretSmallIcon, CornerIcon, WarningIcon } from '@igniter/ui/assets'
import React, { useState } from 'react'
import TransactionHash from '@igniter/ui/components/TransactionHash'
import { BaseQuickInfoTooltip } from '@igniter/ui/components/BaseQuickInfoTooltip'
import Address from '@igniter/ui/components/Address'
import { Operation, SendOperation, TransactionDetailBody } from '@/app/detail/Detail'
import { MessageType } from '@/lib/constants'

function ActionButton({children}: React.PropsWithChildren) {
  return (
    <Button
      className={'w-full h-[30px] bg-[color:var(--secondary)] border border-[color:var(--button-2-border)] hover:bg-transparent'}
    >
      {children}
    </Button>
  )
}

function SmallAmount({value}: {value: number}) {
  return (
    <p className={'text-sm'}>
      <Amount value={value} />
    </p>
  )
}

const labelByStatus: Record<TransactionStatus, string> = {
  pending: 'Pending',
  success: 'Success',
  failure: 'Failure',
  not_executed: 'Not Executed',
}

function getOperationRows(operations: Array<Operation>, transactionType: TransactionType): Array<SummaryRow> {
  const rows: Array<SummaryRow> = []

  switch (transactionType) {
    case TransactionType.Stake: {
      for (const operation of operations) {
        if (operation.typeUrl === MessageType.Stake) {
          const sendOperation = operations.find((op) => op.typeUrl === MessageType.Send && op.value.toAddress === operation.value.operatorAddress)! as SendOperation

          rows.push({
            label: `Stake (${toCompactFormat(Number(operation.value.stake.amount) / 1e6)})`,
            value: <Address address={operation.value.operatorAddress} />,
          }, {
            label: (
              <div className={'flex items-center gap-2'}>
                <CornerIcon />
                <p>Operational Funds</p>
              </div>
            ),
            value: <SmallAmount value={amountToPokt(sendOperation.value.amount.at(0)?.amount || 0)} />,
          })
        }
      }
      break
    }
    case TransactionType.Unstake: {
      for (const operation of operations) {
        if (operation.typeUrl === MessageType.Unstake) {
          rows.push({
            label: 'Node',
            value: <Address address={operation.value.operatorAddress} />,
          })
        }
      }
      break
    }
    case TransactionType.OperationalFunds: {
      for (const operation of operations) {
        if (operation.typeUrl === MessageType.Send) {
          rows.push({
            label: 'Node',
            value: <Address address={operation.value.toAddress} />,
          }, {
            label: (
              <div className={'flex items-center gap-2'}>
                <CornerIcon />
                <p>Operational Funds</p>
              </div>
            ),
            value: <SmallAmount value={Number(operation.value.amount.at(0)?.amount || 0) / 1e6} />,
          })
        }
      }
      break
    }
    case TransactionType.Upstake: {
      for (const operation of operations) {
        if (operation.typeUrl === MessageType.Stake) {
          rows.push({
            label: 'Node',
            value: <Address address={operation.value.operatorAddress} />,
          })
        }
      }
      break
    }
  }

  return rows
}

interface UnstakeSummaryProps {
  networkFee: number
}

function UnstakeSummary({networkFee}: UnstakeSummaryProps) {
  return (
    <Summary
      rows={[
        {
          label: 'Network Fee',
          value: <SmallAmount value={networkFee} />,
        },
      ]}
    />
  )
}

interface UpstakeSummaryProps {
  networkFee: number
}

function UpstakeSummary({networkFee}: UpstakeSummaryProps) {
  const applicationSettings = useApplicationSettings();

  return (
    <Summary
      rows={[
        {
          label: 'Service Fee',
          value: `${applicationSettings?.fee}%`,
          description: 'The % of the rewards that this website retain for handling the service.'
        },
        {
          label: 'Network Fee',
          value: <SmallAmount value={networkFee} />,
        },
      ]}
    />
  )
}

interface StakeSummaryProps {
  status: TransactionStatus
  operations: Array<Operation>
  networkFee: number
}

function StakeSummary({operations, status, networkFee}: StakeSummaryProps) {
  const applicationSettings = useApplicationSettings();

  const operationalFunds = operations.reduce((acc, op) => {
    if (op.typeUrl !== MessageType.Send) return acc
    return acc + Number(op.value.amount.at(0)?.amount || 0)
  }, 0) / 1e6

  return (
    <>
      {status === TransactionStatus.Pending && (
        <div className={'bg-[color:var(--color-slate-2)] h-[109px] rounded-[8px]'}>
          <p className={'px-4 py-[11px] text-[color:var(--color-white-3)]'}>
            Stake is being processed. Avoid moving funds from your wallet for at least one hour to prevent funding errors.
          </p>
          <hr className={'border-[color:var(--divider)]'} />
          <div className={'p-2'}>
            <ActionButton>
              About Staking
            </ActionButton>
          </div>
        </div>
      )}

      <Summary
        rows={[
          {
            label: 'Service Fee',
            value: `${applicationSettings?.fee}%`,
            description: 'The % of the rewards that this website retain for handling the service.'
          },
          {
            label: 'Network Fee',
            value: <SmallAmount value={networkFee} />,
          },
          {
            label: 'Operational Funds',
            value: <SmallAmount value={operationalFunds} />,
          },
        ]}
      />
    </>
  )
}

export default function TransactionDetail({
  type,
  hash,
  status,
  createdAt,
  operations,
  estimatedFee,
  consumedFee,
  provider,
  providerFee,
  typeProviderFee,
}: TransactionDetailBody) {
  const [isShowingTransactionDetails, setIsShowingTransactionDetails] = useState(false);

  const summaryRows: Array<SummaryRow> = [
    {
      label: 'Timestamp',
      value: toDateFormat(new Date(createdAt)),
    },
    {
      label: 'Status',
      value: (
        <div className={'flex items-center gap-2'}>
          {status === TransactionStatus.Failure && (
            <BaseQuickInfoTooltip
              title={'Not Enough Coins'}
              description={'Validator does not have enough coins in their account.'}
              actionText={'View In Explorer'}
            >
              <Button variant={'icon'} className={'h-4 w-4 mr-[-6px] mb-[-5px]'}>
                <WarningIcon />
              </Button>
            </BaseQuickInfoTooltip>
          )}
          <p>
            {labelByStatus[status]}
          </p>
        </div>
      ),
    },
    {
      label: 'Transaction',
      value: hash ? <TransactionHash hash={hash} /> : '',
    },
    {
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
            <span>Operations ({operations.length})</span>
          </Button>
        </div>
      ),
      value: null
    }
  ]

  if (type === TransactionType.Stake) {
    summaryRows.unshift(
      {
        label: 'Provider Fee',
        value: `${typeProviderFee === ProviderFee.UpTo ? 'Up to' : ''} ${providerFee || 0}%`,
      },
      {
        label: 'Provider',
        value: provider || 'N/A',
      },
    )
  }

  const fee = (consumedFee || estimatedFee) / 1e6

  if (type === TransactionType.OperationalFunds) {
    summaryRows.unshift({
      label: 'Network Fee',
      value: <SmallAmount value={fee} />,
    })
  }

  if (isShowingTransactionDetails) {
    summaryRows.push(...getOperationRows(operations, type))
  }

  const totalValue = operations.reduce((acc, op) => {
    if (type === TransactionType.Stake || type === TransactionType.Upstake) {
      if (op.typeUrl === MessageType.Stake) {
        return acc + Number(op.value.stake.amount)
      }
    }

    if (type === TransactionType.OperationalFunds) {
      if (op.typeUrl === MessageType.Send) {
        return acc + Number(op.value.amount.at(0)?.amount || 0)
      }
    }

    return acc
  }, 0) / 1e6

  return (
    <div className={'gap-8 flex flex-col'}>
      <DrawerHeader className={'p-0 gap-2'}>
        <DrawerTitle
          style={{
            fontSize: '1.875rem',
            fontWeight: 400,
          }}
        >
          {`${type} Detail`}
        </DrawerTitle>
        <DrawerDescription className={'text-sm'}>
          Review the details of your {type.toLowerCase()} operation.
        </DrawerDescription>
      </DrawerHeader>


      <div
        className={
          clsx(
            'relative flex h-[64px] mt-[-5px]',
            status === TransactionStatus.Pending && 'gradient-border-slate',
            status === TransactionStatus.Success && (type === TransactionType.Unstake ? 'gradient-border-purple' : 'gradient-border-green'),
            status === TransactionStatus.Failure && 'gradient-border-orange'
          )
        }
      >
        <div className={`absolute inset-0 flex flex-row items-center bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
          <span className="text-[20px] text-[var(--color-white-3)]">
            {type === TransactionType.OperationalFunds ? 'Amount' : type}
          </span>
          <div className="flex flex-row items-center gap-2">
            <p className="font-mono !text-[20px]">
              <Amount value={totalValue} maxFractionDigits={0} minimumFractionDigits={0} />
            </p>
          </div>
        </div>
      </div>

      {type === TransactionType.Stake && <StakeSummary operations={operations} status={status} networkFee={fee} />}
      {type === TransactionType.Upstake && <UpstakeSummary networkFee={fee} />}
      {type === TransactionType.Unstake && <UnstakeSummary networkFee={fee} />}

      <Summary
        rows={summaryRows}
      />
    </div>
  )
}
