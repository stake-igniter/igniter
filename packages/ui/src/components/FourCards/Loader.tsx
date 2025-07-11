import React from "react"
import { combineByIndex, LabelByIndex, ValueByIndex } from './utils'
import { Skeleton } from '../skeleton'
import FourCard from './FourCard'

interface LoadingSummaryProps {
  defaultSkeleton?: React.ReactNode
  labels: LabelByIndex
  skeletonsPerIndex?: ValueByIndex<React.ReactNode | undefined>
  containerClassName?: string
}

export default function FourCardsLoader({
  defaultSkeleton,
  labels,
  skeletonsPerIndex,
  containerClassName,
}: LoadingSummaryProps) {
  const defaultSummarySkeleton = defaultSkeleton || (
    <Skeleton className={'h-[18px] mt-[6px] w-4/6'} />
  )

  return (
    <FourCard
      containerClassName={containerClassName}
      items={
        combineByIndex(
          labels,
          {
            1: skeletonsPerIndex?.['1'] || defaultSummarySkeleton,
            2: skeletonsPerIndex?.['2'] || defaultSummarySkeleton,
            3: skeletonsPerIndex?.['3'] || defaultSummarySkeleton,
            4: skeletonsPerIndex?.['4'] || defaultSummarySkeleton,
          }
        )
      }
    />
  )
}
