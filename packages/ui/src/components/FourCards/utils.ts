import React from 'react'
import { CardItem } from '@/app/components/FourCard'

export interface ValueByIndex<T> {
  1: T
  2: T
  3: T
  4: T
}

export type LabelByIndex = ValueByIndex<string>
export type ComponentByIndex = ValueByIndex<React.ReactNode>

export function combineByIndex(labels: LabelByIndex, components: ComponentByIndex): [CardItem, CardItem, CardItem, CardItem] {
  return [
    {
      label: labels[1],
      children: components[1]
    },
    {
      label: labels[2],
      children: components[2]
    },
    {
      label: labels[3],
      children: components[3]
    },
    {
      label: labels[4],
      children: components[4]
    },
  ]
}
