"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import type { Service } from "@igniter/db/provider/schema";

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "endpoints",
    header: "Protocols",
    cell: ({ row }) => {
      const endpoints = row.getValue("endpoints") as Service["endpoints"];

      if (!endpoints || endpoints.length === 0) {
        return "-";
      }

      return (
        <div className="flex gap-2">
          {endpoints.map((endpoint, index) => (
            <div key={`protocol-${endpoint.rpcType}-${index}`} title={endpoint.url} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer">
              {endpoint.rpcType}
            </div>
          ))}
        </div>
      );
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
