"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {AddressGroupWithDetails} from "@/db/schema";
import {Region, RegionDisplay} from "@/lib/models/commons";
import {FilterGroup, SortOption} from "@igniter/ui/components/DataTable/index";


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
    accessorKey: "addressGroupServices",
    header: "Services",
    cell: ({ row }) => {
      const addressGroupServices = row.getValue("addressGroupServices") as AddressGroupWithDetails["addressGroupServices"];
      const services  = addressGroupServices.map((as) => as.service.name);

      if (!services || services.length === 0) {
        return "-";
      }

      return (
        <div className="flex gap-2">
          {services.slice(0, 3).map((service) => (
            <div key={service} className="bg-blue-100 text-blue-800 text-xs p-1 rounded-[4px] cursor-pointer">
              {service}
            </div>
          ))}
          {services.length > 3 && (
            <span className="py-1 rounded-full">
              + {services.length - 3}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "private",
    header: "Private",
    cell: ({ row }) => {
      const privateAddressGroup = row.getValue("private") as boolean;
      return privateAddressGroup ? "Private" : "Public";
    }
  },
  {
    accessorKey: "keysCount",
    header: "Keys",
    cell: ({ row }) => {

      const keysCount = row.getValue("keysCount") as number | undefined;
      return keysCount ? `${keysCount} keys` : "No keys";
    }
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

export const sorts: Array<Array<SortOption<AddressGroupWithDetails>>> = [
  [
    {
      label: "Most Recent",
      column: "updatedAt",
      direction: "desc",
      isDefault: true,
    },
  ],
]

export const filters: Array<FilterGroup<AddressGroupWithDetails>> = [
  {
    group: "visibility",
    items: [
      [{label: "All", value: "", column: "private", isDefault: true}],
      [
        {label: "Private", value: true, column: "private"},
        {label: "Public", value: false, column: "private"}
      ],
    ]
  },
];

