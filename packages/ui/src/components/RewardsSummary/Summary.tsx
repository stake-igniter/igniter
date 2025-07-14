'use client'

import React, { useCallback } from 'react'
import ErrorRetry from '../ErrorRetry'
import FourCard from '../FourCards/FourCard'
import { combineByIndex } from '../FourCards/utils'
import { labels } from './constants'
import NoData from '../NoData'
import { amountToPokt, toCurrencyFormat } from '../../lib/utils'
import useFetchOnBlock, { DocumentNodeData } from '../../hooks/useFetchOnNewBlock'
import { summaryDocument } from '@igniter/graphql/rewards'
import { summaryVariables } from './operations'
import SummaryLoader from './Loader'

function Value({value}: {value: string}) {
  return (
    <p className={'mt-1 sm:text-lg font-medium'}>
      {value}
    </p>
  )
}

interface SummaryProps {
  isOwners: boolean
  addresses: Array<string>
  initialData: DocumentNodeData<typeof summaryDocument> | null
  initialError: boolean
}

export default function Summary({
  isOwners,
  addresses,
  initialError,
  initialData
}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => {
    return summaryVariables(isOwners, addresses, currentTime)
  }, [isOwners, addresses])

  const { data, error, refetch, isLoading } = useFetchOnBlock({
    query: summaryDocument,
    variables,
    initialResult: initialData,
    initialError,
    skip: !addresses.length,
    updateOnNewSession: true,
  })

  if (isLoading) {
    return <SummaryLoader />
  } else if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <ErrorRetry
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the summary data.'}
        />
      </div>
    )
  }

  if (!addresses.length) {
    return (
      <div className={'rounded-lg border h-[130px] pt-2 border-[color:--divider] bg-[color:--main-background] base-shadow flex w-full items-center justify-center'}>
        <NoData label={'Select addresses to see the data.'} />
      </div>
    )
  }

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: (
              <Value
                value={
                  toCurrencyFormat(
                    data?.suppliers?.totalCount || 0,
                  )
                }
              />
            ),
            2: (
              <Value
                value={
                  toCurrencyFormat(
                    amountToPokt(
                      data?.suppliers?.aggregates?.sum?.stakeAmount
                    ),
                    2,
                  )
                }
              />
            ),
            3: (
              <Value
                value={
                  toCurrencyFormat(
                    amountToPokt(
                      data?.last24h
                    ),
                    2,
                  )
                }
              />
            ),
            4: (
              <Value
                value={
                  toCurrencyFormat(
                    amountToPokt(
                      data?.last48h
                    ),
                    2,
                  )
                }
              />
            ),
          }
        )
      }
    />
  )
}
