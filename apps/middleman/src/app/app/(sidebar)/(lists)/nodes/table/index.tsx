'use client'

import DataTable from '@igniter/ui/components/DataTable/index'
import { columns, filters, NodeDetails, sorts } from './columns'
import { GetUserNodes } from '@/actions/Nodes'
import { useQuery } from '@tanstack/react-query'
import { DetailItem, useDetailContext } from '@/app/detail/Detail'
import { useEffect } from 'react'


export default function NodesTable() {
  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["nodes"],
    queryFn: GetUserNodes,
    refetchInterval: 60000,
  });
  const {items, updateItem} = useDetailContext()

  useEffect(() => {
    const updateDetailItem = (item: DetailItem, index: number) => {
      if (item.type === 'node') {
        const node = data?.find((n) => n.id === item.body.id)

        if (node) {
          updateItem({
            type: "node",
            body: {
              id: node.id,
              address: node.address,
              ownerAddress: node.ownerAddress,
              status:  node.status,
              provider: node.provider || null,
              stakeAmount: Number(node.stakeAmount),
              operationalFundsAmount: node.balance,
              transactions: node.transactionsToNodes.map((transaction) => transaction.transaction).map(t => ({
                id: t.id,
                type: t.type,
                status: t.status,
                createdAt: t.createdAt!,
                operations: JSON.parse(t.unsignedPayload).body.messages,
                hash: t.hash || '',
                estimatedFee: t.estimatedFee,
                consumedFee: t.consumedFee,
                provider: node.provider?.name || '',
                providerFee: t.providerFee,
                typeProviderFee: t.typeProviderFee,
              })),
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
        item.then((awaitedItem) => updateDetailItem(awaitedItem, i))
      } else {
        updateDetailItem(item, i)
      }
    }
  }, [data])

  const nodes: Array<NodeDetails> = data?.map((node) => ({
    ...node,
    provider: node.provider ?? null,
    stakeAmount: node.stakeAmount,
    transactions: node.transactionsToNodes.map((transaction) => transaction.transaction),
  })) || [];

  return (
    <DataTable
      columns={columns}
      data={nodes}
      filters={filters}
      sorts={sorts}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
    />
  )
}
