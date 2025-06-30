"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {RelayMiner} from "@/db/schema";
import {Region, RegionDisplay} from "@/lib/models/commons";

export const columns: ColumnDef<RelayMiner>[] = [
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
      return RegionDisplay[region];
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
