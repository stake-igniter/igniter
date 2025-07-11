'use client'
import React, { useState } from 'react'
import { Time } from '../../lib/dates'
import { setCookie } from '../../lib/cookies'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'

interface SelectedTimeContextProps {
  selectedTime: Time;
  setSelectedTime: (time: Time) => void;
}

const SelectedTimeContext = React.createContext<SelectedTimeContextProps>({
  selectedTime: Time.Last7d,
  setSelectedTime: () => {},
})

interface SelectedTimeProviderProps {
  defaultTime: Time;
  children: React.ReactNode
}

function SelectedTimeProvider({children, defaultTime}: SelectedTimeProviderProps) {
  const [selectedTime, setSelectedTime] = useState<Time>(defaultTime)

  return (
    <SelectedTimeContext.Provider value={{selectedTime, setSelectedTime}}>
      {children}
    </SelectedTimeContext.Provider>
  )
}

function useSelectedTime() {
  const context = React.useContext(SelectedTimeContext)

  if (!context) {
    throw new Error('useSelectedTime must be used within a SelectedTimeProvider')
  }

  return context
}

const labelByTime: Record<Time, string> = {
  [Time.Last24h]: 'Last 24h',
  [Time.Last48h]: 'Last 48h',
  [Time.Last7d]: 'Last 7d',
  [Time.Last30d]: 'Last 30d',
}

interface TimeSelectorProps {
  includeLabel?: boolean;
  options?: Time[];
  cookieKey?: string;
  disabled?: boolean
}

function TimeSelector({
  cookieKey,
  disabled,
  includeLabel = true,
  options = [Time.Last24h, Time.Last48h, Time.Last7d, Time.Last30d,],
}: TimeSelectorProps) {
  const {selectedTime, setSelectedTime} = useSelectedTime()

  return (
    <div className={'flex flex-row items-center gap-3 h-[30px]'}>
      {includeLabel && (
        <label className={'text-sm'}>
          Time
        </label>
      )}
      <Select
        disabled={disabled}
        value={selectedTime}
        onValueChange={(newValue) => {
          if (cookieKey) {
            setCookie(cookieKey, newValue)
          }

          setSelectedTime(newValue as Time)
        }}
      >
        <SelectTrigger className={'min-w-20 w-fit gap-1 h-[26px] text-xs bg-[color:--main-background]'}>
          <SelectValue placeholder={'Time'} />
        </SelectTrigger>
        <SelectContent>
          {options?.map(option => (
            <SelectItem value={option} key={option}>
              {labelByTime[option] || option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export {
  SelectedTimeProvider,
  TimeSelector,
  useSelectedTime
}
