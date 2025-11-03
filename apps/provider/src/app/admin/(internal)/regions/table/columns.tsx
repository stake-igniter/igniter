'use client'

import type { Region } from '@igniter/db/provider/schema'
import React from 'react'
import { ColumnDef } from '@igniter/ui/components/table'
import {CsvColumnDef} from "@igniter/ui/lib/csv";

export const columns: Array<ColumnDef<Region> & CsvColumnDef<Region>> = [
  {
    accessorKey: 'displayName',
    header: 'Display Name',
  },
  {
    accessorKey: 'urlValue',
    header: 'URL Value',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return <span>{date.toLocaleString()}</span>
    },
  },
]
