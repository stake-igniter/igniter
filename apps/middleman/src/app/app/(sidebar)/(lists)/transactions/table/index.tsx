'use client'
import DataTable from '@igniter/ui/components/DataTable/index'
import { columns, filters, sorts } from './columns'
import { DetailItem, Operation, useDetailContext } from '@/app/detail/Detail'
import { MessageType } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { GetUserTransactions } from '@/actions/Transactions'
import { useEffect } from 'react'

export default function TransactionsTable() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: GetUserTransactions,
    refetchInterval: 60000,
  });
  const {items, updateItem} = useDetailContext()

  useEffect(() => {
    const updateTxDetail = (item: DetailItem, index: number) => {
      if (item.type === 'transaction') {
        const newTx = data?.find((tx) => tx.id === item.body.id)

        if (newTx) {
          updateItem({
            type: "transaction",
            body: {
              id: newTx.id,
              type: newTx.type,
              hash: newTx.hash || '',
              status: newTx.status,
              createdAt: new Date(newTx.createdAt!),
              operations: JSON.parse(newTx.unsignedPayload).body.messages,
              estimatedFee: newTx.estimatedFee,
              consumedFee: newTx.consumedFee,
              provider: newTx.provider?.name || '',
              providerFee: newTx.providerFee,
              typeProviderFee: newTx.typeProviderFee
            }
          }, index)
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!

      // in theory, this promise is already awaited because when we push a new item,
      // it shows to the user so if it was a promise, it will be awaited
      if ('then' in item) {
        item.then((awaitedItem) => updateTxDetail(awaitedItem, i))
      } else {
        updateTxDetail(item, i)
      }
    }
  }, [data])

  return (
    <DataTable
      columns={columns}
      data={
        data?.map((tx) => {
          const operations = JSON.parse(tx.unsignedPayload).body.messages as Array<Operation>

          return {
            id: tx.id,
            type: tx.type,
            status: tx.status,
            createdAt: new Date(tx.createdAt!),
            totalValue: operations.reduce((acc, op) => {
              if (op.typeUrl === MessageType.Send) {
                return acc + Number(op.value.amount.at(0)?.amount || 0)
              }

              if (op.typeUrl === MessageType.Stake) {
                return acc + Number(op.value.stake.amount)
              }

              return acc
            }, 0),
            operations,
            hash: tx.hash || '',
            estimatedFee: tx.estimatedFee,
            consumedFee: tx.consumedFee,
            provider: tx.provider?.name || '',
            providerFee: tx.providerFee,
            typeProviderFee: tx.typeProviderFee,
          }
        }) || []
      }
      filters={filters}
      sorts={sorts}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
    />
  )
}
