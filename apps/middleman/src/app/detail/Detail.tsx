'use client'

import React, { createContext, useContext, useState } from 'react'
import {NodeStatus, Provider, ProviderFee, TransactionStatus, TransactionType} from '@/db/schema'
import DetailResolver from '@/app/detail/DetailResolver'
import { MessageType } from '@/lib/constants'

export interface NodeDetailBody {
  id: number
  address: string;
  ownerAddress: string;
  status: NodeStatus;
  provider: Provider | null;
  stakeAmount: number;
  operationalFundsAmount: number;
  transactions: Array<TransactionDetailBody>;
}

export interface NodeDetail {
  type: 'node'
  body: NodeDetailBody
}

export interface SendOperation {
  typeUrl: MessageType.Send
  value: {
    fromAddress: string
    toAddress: string
    amount: Array<{
      denom: string
      amount: number
    }>
  }
}

export interface StakeOperation {
  typeUrl: MessageType.Stake
  value: {
    signer: string
    ownerAddress: string
    operatorAddress: string
    stake: {
      denom: string
      amount: number
    }
    services: Array<{
      serviceId: string
      endpoints: Array<{
        url: string
        rpcType: string
        configs: Array<{
          key: string
          value: string
        }>
      }>
      revShare: Array<{
        address: string
        revSharePercentage: string
      }>
    }>
  }
}

export interface UnstakeOperation {
  typeUrl: MessageType.Unstake
  value: {
    signer: string
    operatorAddress: string
  }
}

export type Operation = StakeOperation | UnstakeOperation | SendOperation

export interface TransactionDetailBody {
  id: number
  type: TransactionType
  hash: string
  status: TransactionStatus
  createdAt: Date | string | number;
  operations: Array<Operation>
  estimatedFee: number
  consumedFee?: number | null
  provider: string
  providerFee?: number | null
  typeProviderFee?: ProviderFee | null
}

export interface TransactionDetail {
  type: 'transaction'
  body: TransactionDetailBody
}

export type DetailItem = NodeDetail | TransactionDetail

interface DetailContextProps {
  addItem: (item: DetailItem | Promise<DetailItem>) => void
  items: Array<DetailItem | Promise<DetailItem>>
  updateItem: (item: DetailItem | Promise<DetailItem>, index: number) => void
}

const DetailContext = createContext<DetailContextProps>({
  addItem: () => {},
  updateItem: () => {},
  items: []
})

export default function QuickDetailProvider({children}: React.PropsWithChildren) {
  const [items, setItems] = useState<Array<DetailItem | Promise<DetailItem>>>([])

  const addItem = (item: DetailItem | Promise<DetailItem>) => {
    setItems(prev => [...prev, item])
  }

  const updateItem = (item: DetailItem | Promise<DetailItem>, index: number) => {
    setItems(prev => {
      prev[index] = item
      return [...prev]
    })
  }

  return (
    <DetailContext.Provider
      value={{
        addItem,
        items,
        updateItem,
      }}
    >
      <DetailResolver
        items={items}
        clearItems={() => setItems([])}
        back={() => setItems(prev => prev.slice(0, prev.length - 1))}
      />
      {children}
    </DetailContext.Provider>
  )
}

export function useAddItemToDetail() {
  const context = useContext(DetailContext)

  if (!context) {
    throw new Error('useAddItemToDetail must be used within a QuickDetailProvider.')
  }

  return context.addItem
}

export function useDetailContext() {
  const context = useContext(DetailContext)

  if (!context) {
    throw new Error('useDetailContext must be used within a QuickDetailProvider.')
  }

  return context
}
