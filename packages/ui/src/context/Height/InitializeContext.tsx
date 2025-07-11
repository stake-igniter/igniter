import React from 'react'
import HeightContextProvider from './height'
import { getLatestBlock, getNumBlocksPerSession } from '../../api/blocks'

interface InitializeHeightContextProps {
  graphQlUrl: string
  children: React.ReactNode
}

export default async function InitializeHeightContext({
  graphQlUrl,
  children,
}: InitializeHeightContextProps) {
  const [latestBlock, blocksPerSession] = await Promise.all([
    getLatestBlock(graphQlUrl),
    getNumBlocksPerSession(graphQlUrl)
  ])

  return (
    <HeightContextProvider
      firstHeight={Number(latestBlock?.height?.toString() || 0)}
      blocksPerSession={blocksPerSession}
      firstTime={latestBlock?.timestamp}
    >
      {children}
    </HeightContextProvider>
  )
}
