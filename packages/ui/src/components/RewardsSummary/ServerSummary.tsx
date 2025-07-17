import { summaryVariables } from './operations'
import Summary from './Summary'
import { getLatestBlock } from '../../api/blocks'
import { getServerApolloClient } from '../../lib/graphql/server'
import { summaryDocument } from '@igniter/graphql/rewards'

interface ServerSummaryProps {
  addresses: Array<string>
  supplierAddresses: Array<string>
  isOwners: boolean
  graphQlUrl: string
  noDataMessage?: string
}

export default async function ServerSummary({
  addresses,
  supplierAddresses,
  noDataMessage,
  isOwners,
  graphQlUrl,
}: ServerSummaryProps) {
  let data, error = false

  if (addresses.length) {
    try {
      const latestBlock = await getLatestBlock(graphQlUrl)

      const response = await getServerApolloClient(graphQlUrl).query({
        query: summaryDocument,
        variables: summaryVariables(
          isOwners,
          addresses,
          supplierAddresses,
          latestBlock.timestamp
        )
      })

      data = response.data
    } catch {
      error = true
    }
  }

  return (
    <Summary
      isOwners={isOwners}
      addresses={addresses}
      supplierAddresses={supplierAddresses}
      noDataMessage={noDataMessage}
      initialError={error}
      initialData={data || null}
    />
  )
}
