import { NodeStatus } from '@igniter/db/middleman/enums'
import Amount from '@igniter/ui/components/Amount'
import React, { useState } from 'react'
import { clsx } from 'clsx'
import { DrawerDescription, DrawerHeader, DrawerTitle } from '@igniter/ui/components/drawer'
import { Button, ButtonProps } from '@igniter/ui/components/button'
import Summary, { SummaryRow } from '@/app/components/Summary'
import { amountToPokt, getShortAddress } from '@igniter/ui/lib/utils'
import Address from '@igniter/ui/components/Address'
import { CaretSmallIcon } from '@igniter/ui/assets'
import { NodeDetailBody, useAddItemToDetail } from '@/app/detail/Detail'
import TransactionHash from '@igniter/ui/components/TransactionHash'
import { QuickInfoPopOverIcon } from '@igniter/ui/components/QuickInfoPopOverIcon'
import AvatarByString from '@igniter/ui/components/AvatarByString'

function ActionButton({children, ...props}: React.PropsWithChildren & Omit<ButtonProps, 'children'>) {
  return (
    <Button
      {...props}
      className={
        clsx(
          'w-full h-[30px] bg-[color:var(--secondary)] border border-[color:var(--button-2-border)] hover:bg-transparent',
          props.className,
        )
      }
    >
      {children}
    </Button>
  )
}

export default function NodeDetail({
   address,
  ownerAddress,
   status,
   transactions,
   provider,
   operationalFundsAmount,
   stakeAmount
}: NodeDetailBody) {
  const addItem = useAddItemToDetail()
  const [isShowingTransactionDetails, setIsShowingTransactionDetails] = useState(false);

  const summaryRows: Array<SummaryRow> = [
    {
      label: `Node`,
      value: <Address address={address} />,
    },
    {
      label: 'Owner',
      value: (
        <div className={'flex items-center gap-2'}>
          <AvatarByString string={ownerAddress} />
          <span className={'font-mono text-sm'}>
            {getShortAddress(ownerAddress, 5)}
          </span>
        </div>
      )
    },
    {
      label: 'Provider',
      value: provider?.name ?? 'N/A',
    },
    {
      label: 'Operational Funds',
      value: (
        <p className={'text-sm'}>
          <Amount value={amountToPokt(operationalFundsAmount)} />
        </p>
      )
    }
  ]

  if (transactions.length) {
    summaryRows.push({
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
            <span>Transactions ({transactions.length})</span>
          </Button>
        </div>
      ),
      value: null
    })

    if (isShowingTransactionDetails) {
      for (const transaction of transactions) {
        summaryRows.push({
          label: (
            <p
              className={'text-[color:var(--muted-foreground)] h-6 mb-[-4px] hover:bg-transparent'}
            >
              {transaction.type}
            </p>
          ),
          value: (
            <TransactionHash
              hash={transaction.hash}
              onClick={() => {
                addItem({
                  type: 'transaction',
                  body: transaction
                })
              }}
            />
          )
        })
      }
    }
  }

  return (
    <div className={'gap-8 flex flex-col'}>
      <DrawerHeader className={'p-0 gap-2'}>
        <DrawerTitle
          style={{
            fontSize: '1.875rem',
            fontWeight: 400,
          }}
        >
          Node Detail
        </DrawerTitle>
        <DrawerDescription className={'text-sm'}>
          Review the details of your node.
        </DrawerDescription>
      </DrawerHeader>
      <div
        className={
          clsx(
            'relative flex h-[64px] mt-[-5px]',
            (status === NodeStatus.Staked && operationalFundsAmount) && 'gradient-border-slate',
            status === NodeStatus.Unstaking && 'gradient-border-purple',
            ((status === NodeStatus.Staked && !operationalFundsAmount) || status === NodeStatus.Unstaked) && 'gradient-border-orange',
          )
        }
      >
        <div className={`absolute inset-0 flex flex-row items-center bg-[var(--background)] rounded-[8px] p-[18px_25px] justify-between`}>
          <span className="text-[20px] text-[var(--color-white-3)]">
            {status.slice(0, 1).toUpperCase() + status.slice(1)}
          </span>
          <div className="flex flex-row items-center gap-2">
            <p className="font-mono !text-[20px]">
              <Amount value={amountToPokt(stakeAmount)} />
            </p>
          </div>
        </div>
      </div>

      <Summary
        rows={summaryRows}
      />

      {status === NodeStatus.Staked && (
        <div className={'bg-[color:var(--color-slate-2)] h-[109px] rounded-[8px]'}>
          <p className={'px-4 py-[11px] text-[color:var(--color-white-3)]'}>
            Recoup your tokens by unstaking this node. Process can take up to 21 days. Tokens will be withdrawn to your wallet.
          </p>
          <hr className={'border-[color:var(--divider)]'} />
          <div className={'flex flex-row items-center gap-2 p-2'}>
            <ActionButton disabled={true}>
              Unstake
            </ActionButton>
            <QuickInfoPopOverIcon
              title={'Unstake'}
              description={'This feature will be available soon.'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
