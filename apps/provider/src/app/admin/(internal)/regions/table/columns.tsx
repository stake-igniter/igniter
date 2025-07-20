"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import { Region } from "@/db/schema";
import React from "react";

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
            const date = new Date(row.getValue("createdAt"));
            return <span>{date.toLocaleString()}</span>;
        },
    },
];
