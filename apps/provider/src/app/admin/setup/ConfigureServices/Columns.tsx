"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import { Service } from "@/db/schema";

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "serviceId",
    header: "Service ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "revSharePercentage",
    header: "Revenue Share %",
    cell: ({ row }) => {
      const percentage = row.getValue("revSharePercentage");
      return percentage === null ? "-" : `${percentage}%`;
    },
  },
  {
    accessorKey: "endpoints",
    header: "Endpoints",
    cell: ({ row }) => {
      const endpoints = row.getValue("endpoints") as Service["endpoints"];

      if (!endpoints || endpoints.length === 0) {
        return "-";
      }

      return (
        <div className="flex flex-col gap-2">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {endpoint.rpcType}
              </div>
              <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full truncate max-w-[200px]" title={endpoint.url}>
                {endpoint.url}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
];
