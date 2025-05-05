"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {AddressGroup, AddressGroupWithDetails, Service} from "@/db/schema";
import {Region, RegionDisplay} from "@/lib/models/commons";

export const columns: ColumnDef<AddressGroupWithDetails>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "addressCount",
    header: "Addresses",
  },
  {
    accessorKey: "services",
    header: "Services",
    cell: ({ row }) => {
      const services = row.getValue("services") as AddressGroupWithDetails["services"];

      if (!services || services.length === 0) {
        return "-";
      }

      return (
        <div className="flex gap-2">
          {services.map((service) => (
            <div key={service} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer">
              {service}
            </div>
          ))}
        </div>
      );
    },
  },
];
