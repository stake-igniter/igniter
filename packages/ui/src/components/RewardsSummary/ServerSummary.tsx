import { summaryVariables } from './operations'
import Summary from './Summary'
import { getLatestBlock } from '../../api/blocks'
import { getServerApolloClient } from '../../lib/graphql/server'
import { summaryDocument } from '@igniter/graphql/rewards'

interface ServerSummaryProps {
  addresses: Array<string>
  isOwners: boolean
  graphQlUrl: string
}

export default async function ServerSummary({
  addresses,
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
      initialError={error}
      initialData={data || null}
    />
  )
}
