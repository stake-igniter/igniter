'use client'

import QuickDetailProvider, {QuickDetailRendererMap} from '@igniter/ui/components/QuickDetails/Provider'
import type { ProviderQuickDetailItem } from '@/app/admin/details/types'
import KeyDetailsCard from './KeyDetail'

const quickDetailRenderers: QuickDetailRendererMap<ProviderQuickDetailItem> = {
  key: ({body}) => <KeyDetailsCard {...body} />,
}

export default function QuickDetailProviderBridge(
  { children }: { children: React.ReactNode },
) {
  return (
    <QuickDetailProvider<ProviderQuickDetailItem> renderers={quickDetailRenderers}>
      {children}
    </QuickDetailProvider>
  )
}