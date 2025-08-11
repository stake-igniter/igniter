"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import {CopyIcon} from "@igniter/ui/assets";
import {FilterGroup, SortOption} from "@igniter/ui/components/DataTable/index";
import {Provider} from "@/db/schema";
import {useState} from "react";
import {UpdateEnabled, UpdateVisibility} from "@/actions/Providers";
import {Button} from "@igniter/ui/components/button";

export const columns: ColumnDef<Provider>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "identity",
    header: "Identity",
    cell: ({ row }) => {

      const identity = row.original.identity;
      const shortenedIdentity = `${identity.slice(0, 6)}...${identity.slice(-6)}`;

      return (
        <div className="flex items-center space-x-2">
          <span>{shortenedIdentity}</span>
          <button
            onClick={() => navigator.clipboard.writeText(identity)}
            className="p-1 rounded"
            title="Copy to clipboard"
          >
            <CopyIcon />
          </button>
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
  {
    header: "enabled",
    cell: ({ row }) => {
      const provider = row.original;
      const [isEnabled, setIsEnabled] = useState(provider.enabled);
      const [isVisible, setIsVisible] = useState(provider.visible);
      const [isUpdating, setUpdating] = useState(false);

      if (isUpdating) return (
        <div className="flex items-center justify-end px-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        </div>
      )

      return (
        <div className="flex items-center justify-end space-x-2">
          <Button
            disabled={!isVisible}
            variant="outline"
            size="sm"
            onClick={async () => {
              setUpdating(true);
              await UpdateEnabled(provider.identity, !isEnabled);
              setIsEnabled(!isEnabled);
              setUpdating(false);
            }}
          >
            {isEnabled ? "Disable" : "Enable"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setUpdating(true);
              await UpdateVisibility(provider.identity, !isVisible);
              setIsVisible(!isVisible);
              setUpdating(false);
            }}
          >
            {isVisible ? "Hide" : "Show"}
          </Button>
        </div>
      );
    },
  },
];

export const sorts: Array<Array<SortOption<Provider>>> = [
  [
    {
      label: "Name",
      column: "name",
      direction: "desc",
      isDefault: true,
    },
  ],
];

export const filters: Array<FilterGroup<Provider>> = [
  {
    group: "enabled",
    items: [
      [{label: "All", value: "", column: "enabled", isDefault: true}],
      [
        {label: "Enabled", value: true, column: "enabled"},
        {label: "Disabled", value: false, column: "enabled"}
      ],
    ]
  },
  {
    group: "visibility",
    items: [
      [{label: "All", value: "", column: "visible", isDefault: true}],
      [
        {label: "Visible", value: true, column: "visible"},
        {label: "Hidden", value: false, column: "visible"}
      ],
    ]
  },
];
