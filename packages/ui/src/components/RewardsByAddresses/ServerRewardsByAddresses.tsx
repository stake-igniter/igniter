import { cookies } from 'next/headers'
import {
  rewardsByAddressAndTimeGroupByDateVariables,
} from './operations'
import DataProvider from '../../context/data'
import { ChartTypeProvider } from '../BaseLineBarChart/ChartType'
import { chartTypeCookieKey, timeSelectedCookieKey } from './constants'
import RewardsByAddressCard from './Card'
import RewardsByAddressChart from './RewardsByAddressChart'
import CardActions from './CardActions'
import { GroupAllProvider } from './GroupAllSwitch'
import { rewardsByAddressAndTimeGroupByDateDocument } from '@igniter/graphql/rewards'
import { getLatestBlock } from '../../api/blocks'
import { getServerApolloClient } from '../../lib/graphql/server'
import { getValidTime, Time } from '../../lib/dates'
import { SelectedTimeProvider } from './TimeSelector'

interface RewardsByAddressesProps {
  addresses: Array<string>
  supplierAddresses: Array<string>
  graphQlUrl: string
  noDataMessage?: string
}

export default async function ServerRewardsByAddresses({
  addresses,
  supplierAddresses,
  graphQlUrl,
  noDataMessage,
}: RewardsByAddressesProps) {
  let
    data,
    variables,
    error = false,
    chartType: 'line' | 'bar' = 'line',
    timeSelected = Time.Last7d

  if (addresses.length) {
    try {
      const cookiesAwaited = await cookies()
      const timeSelected = getValidTime(
        cookiesAwaited.get(timeSelectedCookieKey)?.value || ''
      )
      chartType = cookiesAwaited?.get(chartTypeCookieKey)?.value === 'bar' ? 'bar' : 'line'

      const latestBlock = await getLatestBlock(graphQlUrl)

      variables = rewardsByAddressAndTimeGroupByDateVariables(
        addresses,
        supplierAddresses,
        latestBlock.timestamp,
        timeSelected,
      )

      const response = await getServerApolloClient(graphQlUrl)
        .query({
          query: rewardsByAddressAndTimeGroupByDateDocument,
          variables,
        })

      data = response.data
    } catch {
      error = true
    }
  }

  return (
    <ChartTypeProvider
      defaultChartType={chartType}
    >
      <SelectedTimeProvider
        defaultTime={timeSelected}
      >
        <DataProvider
          initialData={[]}
        >
          <GroupAllProvider>
            <RewardsByAddressCard
              actions={(
                <CardActions />
              )}
            >
              <RewardsByAddressChart
                initialError={error}
                addresses={addresses}
                supplierAddresses={supplierAddresses}
                noDataMessage={noDataMessage}
                initialData={data || null}
                initialVariables={variables || null}
              />
            </RewardsByAddressCard>
          </GroupAllProvider>
        </DataProvider>
      </SelectedTimeProvider>
    </ChartTypeProvider>
  )
}
