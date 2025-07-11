"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import { Region } from "@/db/schema";

export const columns: ColumnDef<Region>[] = [
  {
    accessorKey: "displayName",
    header: "Display Name",
  },
  {
    accessorKey: "urlValue",
    header: "URL Value",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date ? new Date(date).toLocaleString() : '-';
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return date ? new Date(date).toLocaleString() : '-';
    },
  },
];
