"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {AddressGroup, AddressGroupWithDetails, RelayMiner, Service} from "@/db/schema";
import {Region, RegionDisplay} from "@/lib/models/commons";

export const columns: ColumnDef<AddressGroupWithDetails>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "relayMiner",
    header: "Relay Miner",
    cell: ({ row }) => {
      const rm = row.getValue("relayMiner") as RelayMiner;
      return `${rm.name} (${rm.identity})` || '-';
    },
  },
  {
    accessorKey: "addressGroupServices",
    header: "Services",
    cell: ({ row }) => {
      const addressGroupServices = row.getValue("addressGroupServices") as AddressGroupWithDetails["addressGroupServices"];
      const services  = addressGroupServices.map((as) => as.serviceId);

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
  {
    accessorKey: "linkedAddresses",
    header: "Linked Addresses",
    cell: ({ row }) => {
      const linkedAddresses = row.getValue("linkedAddresses") as string[]
      return linkedAddresses && linkedAddresses.length > 0 ? `${linkedAddresses.length} Linked Addresses` : "No Linked Addresses";
    }
  },
  {
    accessorKey: "private",
    header: "Private",
  },
];
