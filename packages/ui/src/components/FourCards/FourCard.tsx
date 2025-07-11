import React from 'react'
import { clsx } from 'clsx'

export interface CardItem {
  label: string
  children: React.ReactNode
}

interface FourCardsProps {
  items: [CardItem, CardItem, CardItem, CardItem]
  containerClassName?: string
}

export default function FourCard({items, containerClassName}: FourCardsProps) {
  return (
    <div
      className={
        clsx(
          "grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xs:grid-rows-4 sm:grid-rows-2 lg:grid-rows-1 gap-4 sm:gap-6",
          containerClassName,
        )
      }
    >
      {items.map((item) => (
        <div key={item.label} className={"card-container bg-[color:--main-background] m-h-80 w-full p-4 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
          <p className={"text-xs text-[color:--secondary]"}>
            {item.label}
          </p>
          {item.children}
        </div>
      ))}
    </div>
  )
}
