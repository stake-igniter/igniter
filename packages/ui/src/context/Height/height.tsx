'use client'

import { createContext, useContext, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { blockSubscriptionDocument } from '@igniter/graphql'

interface HeightContext {
  currentHeight: number
  firstHeight: number
  blocksPerSession: number
  currentTime: string
}

const HeightContext = createContext<HeightContext>({
  currentHeight: 0,
  firstHeight: 0,
  blocksPerSession: 0,
  currentTime: '',
});

interface HeightContextProviderProps {
  children: React.ReactNode
  firstHeight: number
  firstTime: string
  blocksPerSession: number
}

export default function HeightContextProvider({children, firstHeight, firstTime, blocksPerSession}: HeightContextProviderProps) {
  const [{currentHeight, currentTime}, setState] = useState({
    currentHeight: Number(firstHeight),
    currentTime: firstTime,
  })

  useSubscription(blockSubscriptionDocument, {
    onData: (data) => {
      const block = data?.data?.data?.blocks
      if (block && Number(block.id) > currentHeight) {
        setState({
          currentHeight: Number(block.id),
          currentTime: block._entity?.timestamp || currentTime,
        })
      }
    }
  })

  return (
    <HeightContext.Provider
      value={{
        currentHeight,
        currentTime,
        firstHeight,
        blocksPerSession,
      }}
    >
      {children}
    </HeightContext.Provider>
  )
}

export function useHeightContext() {
  return useContext(HeightContext)
}
