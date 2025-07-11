import { graphql } from './gql'

export const rewardsByAddressAndTimeGroupByDateDocument = graphql(`
  query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(
      addresses: $addresses, 
      startDate: $startDate, 
      endDate: $endDate, 
      truncInterval: $truncInterval
    )
  }
`)

export const summaryDocument = graphql(`
  query nodesSummary(
    $filter: SupplierFilter!,
    $addresses: [String!]!,
    $currentDate: Datetime!,
    $last24Hours: Datetime!,
    $last48Hours: Datetime!
  ) {
    suppliers(
      filter: $filter
    ) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    last24h: getRewardsByAddressesAndTime(
      addresses: $addresses,
      startDate: $last24Hours,
      endDate: $currentDate,
    )

    last48h: getRewardsByAddressesAndTime(
      addresses: $addresses,
      startDate: $last48Hours,
      endDate: $currentDate,
    )
  }
`)
