"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {RelayMiner} from "@/db/schema";
import {Region, RegionDisplay} from "@/lib/models/commons";
import {FilterGroup, SortOption} from "@igniter/ui/components/DataTable/index";


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

export const sorts: Array<Array<SortOption<RelayMiner>>> = [
    [
        {
            label: "Most Recent",
            column: "updatedAt",
            direction: "desc",
            isDefault: true,
        },
    ],
]

export const filters: Array<FilterGroup<RelayMiner>> = [
    {
        group: "region",
        items: [
            [{label: "All Regions", value: "", column: "region", isDefault: true}],
            [
                {label: "US", value: "us", column: "region"},
                {label: "EU", value: "eu", column: "region"},
                {label: "APAC", value: "apac", column: "region"}
            ],
        ]
    },
];
