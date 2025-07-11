import { StakeStatus, summaryDocument, SupplierFilter } from '@igniter/graphql'
import { addHoursToUtc, getDateFromIsoString } from '../BaseLineBarChart/utils'
import { ExtractVariables } from '../../hooks/useFetchOnNewBlock'

export function summaryVariables(
  filterForOwners: boolean,
  addresses: Array<string>,
  dateStr: string,
): ExtractVariables<typeof summaryDocument> {
  const date = getDateFromIsoString(dateStr)

  const addressesFilter: SupplierFilter = filterForOwners ? {
    ownerId: {
      in: addresses
    }
  } : {
    serviceConfigs: {
      some: {
        or: addresses.map(address => ({
          revShare: {
            contains: [{ address }]
          }
        }))
      }
    }
  }

  const stakedStatus: StakeStatus = 'Staked'

  return {
    filter: {
      stakeStatus: {
        equalTo: stakedStatus
      },
      ...addressesFilter,
    },
    currentDate: date.toISOString(),
    last24Hours: addHoursToUtc(date, -24).toISOString(),
    last48Hours: addHoursToUtc(date, -48).toISOString(),
    addresses: addresses,
  }
}
