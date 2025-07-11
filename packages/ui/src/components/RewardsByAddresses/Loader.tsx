import type { RewardItem } from './RewardsByAddressChart'
import RewardsByAddressCard from './Card'
import BaseLineBarChart from '../BaseLineBarChart/BaseLineBarChart'
import React from 'react'
import { Search } from 'lucide-react'
import { Skeleton } from '../skeleton'
import { clsx } from 'clsx'

function ItemsSelectorLoader() {
  return (
    <div className={'border border-[color:--divider] p-4 h-full w-full bg-[color:--main-background]'}>

      <div className={'h-[30px] flex flex-row items-center gap-1 border border-[color:--divider] bg-[color:--background] px-2'}>
        <Search className={'stroke-1 min-w-4 w-4 h-4 text-[color:--secondary]'} />
        <p className={'text-[color:--secondary] ml-0.5 tracking-wider text-xs select-none'}>
          Search...
        </p>
      </div>

      <div className={'flex flex-row gap-2 items-center mt-2'}>
        {Array.from({length: 3}).map((_, index) => (
          <Skeleton key={index} className={'w-[50px] h-5 rounded-2xl'} />
        ))}
      </div>

      <div
        className={'overflow-y-auto grow min-h-0 flex flex-col gap-3 mt-4 h-[calc(100%-50px-24px)]'}
      >
        {Array.from({length: 5}).map((_, index) => (
          <Skeleton key={index} className={'w-full h-5'} />
        ))}
      </div>
    </div>
  )
}

interface ContentLoaderProps {
  chartType: 'line' | 'bar'
  hideSelector?: boolean
}

export function ContentLoader({chartType, hideSelector}: ContentLoaderProps) {
  return (
    <>
      <div
        className={
          clsx(
            'order-2 xl:order-1 w-full xl:w-[calc(100%-260px-16px)]',
            hideSelector && 'h-full xl:h-[328px]',
            !hideSelector && 'h-[184px] xl:h-[328px]'
          )
        }
      >
        <BaseLineBarChart
          yAxisKey={'totalAmount'}
          yAxisLabel={'Rewards (POKT)'}
          chartType={chartType}
          isLoading={true}
          data={{} as Record<string, Array<RewardItem>>}
        />
      </div>
      {!hideSelector && (
        <div className={'h-[260px] xl:h-[calc(100%-16px)] w-full xl:min-w-[260px] xl:w-[260px] order-1 xl:order-2'}>
          <ItemsSelectorLoader />
        </div>
      )}
    </>
  )
}

interface LoaderProps {
  chartType: 'line' | 'bar'
}

export default function RewardsByAddressesLoader({chartType}: LoaderProps) {
  return (
    <RewardsByAddressCard
      disabled={true}
    >
      <div className={'flex flex-col xl:flex-row items-center px-4 pt-2 pb-4 h-[calc(100%-44px)] gap-4'}>
        <ContentLoader chartType={chartType} />
      </div>
    </RewardsByAddressCard>
  )
}
