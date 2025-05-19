'use client'
import DataTable from '@igniter/ui/components/DataTable/index'
import { columns, filters, sorts } from './columns'
import { Operation } from '@/app/detail/Detail'
import { MessageType } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { GetUserTransactions } from '@/actions/Transactions'

interface TransactionsTableProps {
  initialTransactions: Awaited<ReturnType<typeof GetUserTransactions>>
}

export default function TransactionsTable({initialTransactions}: TransactionsTableProps) {
  const { data } = useQuery({
    queryKey: ["transactions"],
    queryFn: GetUserTransactions,
    staleTime: Infinity,
    refetchInterval: 60000,
    initialData: initialTransactions,
  });

  return (
    <DataTable
      columns={columns}
      data={
        data.map((tx) => {
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
        })
      }
      filters={filters}
      sorts={sorts}
    />
  )
}
