"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import type {RelayMinerWithDetails, Region} from "@igniter/db/provider/schema";

export const columns: ColumnDef<RelayMinerWithDetails>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "identity",
    header: "Identity",
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => {
      const region = row.getValue("region") as Region;
      return region.displayName;
    },
  },
  {
    accessorKey: "domain",
    header: "Domain",
    cell: ({ row }) => {
      const domain = row.getValue("domain") as string;
      return domain || '-';
    },
  },
];
