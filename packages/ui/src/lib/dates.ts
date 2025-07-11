import {
  addDaysToUtc,
  addHoursToUtc,
  getDateFromIsoString, getUtcEndOfDay,
  getUtcEndOfHour, getUtcStartOfDay, getUtcStartOfHour,
} from '../components/BaseLineBarChart/utils'

export enum Time {
  Last24h = 'last24h',
  Last48h = 'last48h',
  Last7d = 'last7d',
  Last30d = 'last30d',
}

const hoursTime = [Time.Last24h, Time.Last48h]


export function getValidTime(time: string, defaultTime = Time.Last7d) {
  let timeSelected = defaultTime

  if (Object.values(Time).includes(time as Time)) {
    timeSelected = time as Time
  }

  return timeSelected
}

export function getStartAndEndDateBasedOnTime(dateStr: string, timeStr: string, endAndStartOfUnit = false) {
  const time = getValidTime(timeStr)

  let end = getDateFromIsoString(dateStr)

  let start: Date

  switch (time) {
    case Time.Last24h: {
      start = addHoursToUtc(end, -23)
      break
    }
    case Time.Last48h: {
      start = addHoursToUtc(end, -47)
      break
    }
    case Time.Last7d: {
      start = addDaysToUtc(end, -6)
      break
    }
    case Time.Last30d: {
      start = addDaysToUtc(end, -29)
      break
    }
  }

  if (endAndStartOfUnit) {
    const isHours = hoursTime.includes(time)
    end = isHours ? getUtcEndOfHour(end) : getUtcEndOfDay(end)
    start = isHours ? getUtcStartOfHour(start) : getUtcStartOfDay(start)
  }

  return {
    start,
    end,
    truncInterval: hoursTime.includes(time) ? 'hour' as const : 'day' as const,
  }
}
