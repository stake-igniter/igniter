"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {RelayMinerWithDetails, Region} from "@/db/schema";
import {FilterGroup} from "@igniter/ui/components/DataTable/index";
import {ListRelayMiners} from "@/actions/RelayMiners";

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
        filterFn: (row, _columnId, value) => {
            const region = row.getValue("region") as Region;
            return region.id === value;
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
    {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => {
            const updatedAt = new Date(row.getValue("updatedAt"));
            return (
                <span className="font-mono text-slightly-muted-foreground flex justify-center gap-2">
          {updatedAt.toLocaleString()}
        </span>
            );
        },
    },
];

export function getFilters(miners: Awaited<ReturnType<typeof ListRelayMiners>>): Array<FilterGroup<RelayMinerWithDetails>> {
    return [
        {
            group: 'region',
            items: [
                [{label: "All Regions", value: "", column: "region", isDefault: true}],
                (miners.map((miner) => ({
                    label: miner.region.displayName,
                    value: miner.region.id,
                    column: "region"
                })))
            ]
        }
    ]
}
