'use client'

import QuickDetailProvider, {QuickDetailRendererMap} from '@igniter/ui/components/QuickDetails/Provider'
import NodeDetailCard from '@/app/detail/NodeDetail'
import TxDetailCard   from '@/app/detail/TransactionDetail'
import type { MiddlemanQuickDetailItem } from '@/app/detail/types'

const quickDetailRenderers: QuickDetailRendererMap<MiddlemanQuickDetailItem> = {
  node:        ({body}) => <NodeDetailCard {...body} />,
  transaction: ({body}) => <TxDetailCard   {...body} />,
}

export default function QuickDetailProviderBridge(
  { children }: { children: React.ReactNode },
) {
  return (
    <QuickDetailProvider<MiddlemanQuickDetailItem> renderers={quickDetailRenderers}>
      {children}
    </QuickDetailProvider>
  )
}