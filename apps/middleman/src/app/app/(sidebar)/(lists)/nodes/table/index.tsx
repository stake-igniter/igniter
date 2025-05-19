'use client'

import DataTable from '@igniter/ui/components/DataTable/index'
import { columns, filters, sorts, Node } from './columns'
import { GetUserNodes } from '@/actions/Nodes'
import { useQuery } from '@tanstack/react-query'

interface NodesTableProps {
  initialNodes: Awaited<ReturnType<typeof GetUserNodes>>
}

export default function NodesTable({initialNodes}: NodesTableProps) {
  const { data } = useQuery({
    queryKey: ["nodes"],
    queryFn: GetUserNodes,
    staleTime: Infinity,
    refetchInterval: 60000,
    initialData: initialNodes,
  });

  const nodes: Array<Node> = data.map((node) => ({
    ...node,
    provider: node.provider ?? undefined,
    stakeAmount: Number(node.stakeAmount),
    transactions: node.transactionsToNodes.map((transaction) => transaction.transaction),
  }));

  return (
    <DataTable
      columns={columns}
      data={nodes}
      filters={filters}
      sorts={sorts}
    />
  )
}
