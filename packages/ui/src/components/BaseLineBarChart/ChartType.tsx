'use client'
import React, { createContext, useContext, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { setCookie } from '../../lib/cookies'

type ChartType = 'bar' | 'line'

interface ChartTypeContextProps {
  chartType: ChartType
  setChartType: (chartType: ChartType) => void
}

const ChartTypeContext = createContext<ChartTypeContextProps>({
  chartType: 'line',
  setChartType: () => {},
})

function ChartTypeProvider({children, defaultChartType = 'line'}: {children: React.ReactNode, defaultChartType?: string}) {
  const [chartType, setChartType] = useState<ChartType>(
    defaultChartType === 'line' ? 'line' : defaultChartType === 'bar' ? 'bar' : 'line'
  )

  return (
    <ChartTypeContext.Provider value={{chartType, setChartType}}>
      {children}
    </ChartTypeContext.Provider>
  )
}

function useChartType() {
  const context = useContext(ChartTypeContext)

  if (context === undefined) {
    throw new Error('useChartType must be used within a ChartTypeProvider')
  }

  return context
}

interface ChartTypeSelectProps {
  chartTypeCookieKey: string
}

function ChartTypeSelect({chartTypeCookieKey}: ChartTypeSelectProps) {
  const {chartType, setChartType} = useChartType()

  return (
    <div className={'flex flex-row items-center gap-2 h-[30px]'}>
      <label className={'text-xs tracking-wider text-center text-[color:--secondary]'}>
        Type
      </label>
      <Select
        value={chartType}
        onValueChange={(newValue) => {
          setCookie(chartTypeCookieKey, newValue)
          setChartType(newValue as ChartType)
        }}
      >
        <SelectTrigger className={'w-[80px] text-xs h-[30px] border-[1px]'}>
          <p>
            <SelectValue placeholder={'Chart Type'} />
          </p>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'line'}>
            Line
          </SelectItem>
          <SelectItem value={'bar'}>
            Bar
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export {
  ChartTypeProvider,
  ChartTypeSelect,
  useChartType
}
