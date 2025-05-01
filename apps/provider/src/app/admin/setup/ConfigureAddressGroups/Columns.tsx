"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import { AddressGroup } from "@/db/schema";

export const columns: ColumnDef<AddressGroup>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "clients",
    header: "Clients",
    cell: ({ row }) => {
      const clients = row.getValue("clients") as string[];

      if (!clients || clients.length === 0) {
        return "-";
      } else {
        return clients.length;
      }
    },
  }
];
