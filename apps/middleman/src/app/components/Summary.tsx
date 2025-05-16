'use client';

import React from 'react'
import { QuickInfoPopOverIcon } from '@igniter/ui/components/QuickInfoPopOverIcon'

export interface SummaryRow {
  label: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
}

interface SummaryProps {
  rows: Array<SummaryRow>;
}

export default function Summary({
  rows
}: SummaryProps) {
  return (
    <div className="flex flex-col p-0 rounded-[8px] border border-[var(--black-dividers)]">
      {rows.map((row, index) => (
        <div key={index} className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--black-dividers)] last:border-none">
          <div className="flex flex-row items-center gap-2 text-[14px] text-[var(--color-white-3)]">
            {typeof row.label === 'string' ? (
              <span>
                {row.label}
              </span>
            ) : row.label}
            {row.description && (
              <QuickInfoPopOverIcon
                title={row.label}
                description={row.description}
                url={''}
              />
            )}
          </div>
          {typeof row.value === 'string' ? (
            <span className="text-[14px] text-[var(--color-white-1)]">
              {row.value}
            </span>
          ) : row.value}
        </div>
      ))}
    </div>
  )
}
