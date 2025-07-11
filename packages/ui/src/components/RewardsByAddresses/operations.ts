import { getStartAndEndDateBasedOnTime } from '../../lib/dates'
import { ExtractVariables } from '../../hooks/useFetchOnNewBlock'
import { rewardsByAddressAndTimeGroupByDateDocument } from '@igniter/graphql'

export function rewardsByAddressAndTimeGroupByDateVariables(
  addresses: Array<string>,
  dateStr: string,
  timeSelected: string
): ExtractVariables<typeof rewardsByAddressAndTimeGroupByDateDocument> {
  const {end, truncInterval, start} = getStartAndEndDateBasedOnTime(dateStr, timeSelected, true)

  return {
    addresses,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}
