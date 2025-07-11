'use client'

import { useHeightContext } from '../context/Height/height'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLazyQuery } from '@apollo/client'

type VariablesFunction<T> = (currentHeight: number, currentTime: string) => ExtractVariables<T>

function isVariablesFunction<T>(
  variables: ExtractVariables<T> | ((currentHeight: number, currentTime: string) => ExtractVariables<T>) | undefined
): variables is VariablesFunction<T> {
  return typeof variables === 'function'
}

export type DocumentNodeData<T extends TypedDocumentNode<any, any>> = T extends TypedDocumentNode<infer Data, any> ? Data : never;

export type ExtractVariables<T> = T extends TypedDocumentNode<any, infer Variables> ? Variables : never;

export interface FetchOnBlockOptions<
  T extends TypedDocumentNode<any, any>,
  R = DocumentNodeData<T>
> {
  query: T
  variables?:
    | ExtractVariables<T>
    | VariablesFunction<T>
  resultParser?: (result: DocumentNodeData<T>) => R | Promise<R>,
  initialResult?: R,
  initialError: boolean
  skip?: boolean,
  pollInterval?: number
  updateOnNewSession?: boolean
}

export default function useFetchOnBlock<
  T extends TypedDocumentNode<any, any>,
  R = DocumentNodeData<T>
>({
  query,
  variables,
  resultParser,
  initialResult,
  skip,
  pollInterval,
  initialError,
  updateOnNewSession = false
}: FetchOnBlockOptions<T, R>): {
  data: R | null,
  refetch: () => void,
  // error will be true when there is an error and there is no data available to return
  error: boolean
  // isLoading will be true when is loading the first data after refetch is executed
  isLoading: boolean,
} {
  const lastValueRef = useRef<R | null>(initialResult || null)
  const [parsedData, setParsedData] = useState<R | null>(initialResult || null)
  const [error, setError] = useState(initialError)
  const [isLoading, setIsLoading] = useState(false)
  const {currentHeight, currentTime, firstHeight, blocksPerSession} = useHeightContext()
  const firstRenderRef = useRef(true)
  const lastVariablesRef = useRef<FetchOnBlockOptions<T, R>['variables']>(variables)
  const forceLoadingRef = useRef(false)

  const [fetchData] = useLazyQuery(query, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchDataFunction = useCallback(() => {
    let variablesToUse: ExtractVariables<T> | undefined = undefined

    if (isVariablesFunction(variables)) {
      variablesToUse = variables(currentHeight, currentTime)
    } else if (typeof variables === 'object') {
      variablesToUse = variables
    }

    const fetchDataFn = () => {
      setIsLoading(true)
      fetchData({
        variables: variablesToUse,
      }).then(async ({data, error}) => {
        if (data) {
          if (resultParser) {
            const parsed = await resultParser(data)
            lastValueRef.current = parsed
            setParsedData(parsed)
          } else {
            lastValueRef.current = data
            setParsedData(data)
          }

          setError(false)
        }

        if (error) {
          setError(true)
        }
      })
        .catch(() => setError(true))
        .finally(() => {
          setIsLoading(false)
          if (forceLoadingRef.current) {
            forceLoadingRef.current = false
          }
        })
    }

    fetchDataFn()

    if (pollInterval) {
      intervalRef.current = setInterval(fetchDataFn, pollInterval)
    }
  }, [variables, currentHeight, currentTime, resultParser, pollInterval, fetchData])

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    if (skip) return

    if (
      (currentHeight !== firstHeight &&
        (
          !updateOnNewSession ||
          !blocksPerSession ||
          ((currentHeight - 1) % blocksPerSession === 0)
        )
      ) ||
      lastVariablesRef.current !== variables
    ) {
      forceLoadingRef.current = lastVariablesRef.current !== variables
      lastVariablesRef.current = variables
      fetchDataFunction()

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
    // eslint-disable-next-line
  }, [currentHeight, query, variables])

  const data = parsedData || lastValueRef.current

  return {
    data: data ? data : initialResult || null,
    error: data ? false : error,
    isLoading: data && !forceLoadingRef.current ? false : isLoading,
    refetch: fetchDataFunction,
  }
}
