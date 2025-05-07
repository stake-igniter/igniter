"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import { Delegator } from "@/db/schema";
import { Checkbox } from "@igniter/ui/components/checkbox";
import { useState } from "react";
import {UpdateDelegator} from "@/actions/Delegators";

export const columns: ColumnDef<Delegator>[] = [
  {
    accessorKey: "enabled",
    header: "Enabled",
    cell: ({ row, table }) => {
      const delegator = row.original;
      const [isChecked, setIsChecked] = useState(delegator.enabled);
      const [isUpdating, setUpdating] = useState(false);

      const handleToggle = async (checked: boolean) => {
        setUpdating(true);
        setIsChecked(checked);

        try {
          await UpdateDelegator(delegator.identity, { enabled: checked });
        } catch (error) {
          setIsChecked(!checked);
          console.error('Error updating delegator status:', error);
        } finally {
          setUpdating(false);
        }
      };

      if (isUpdating) return (
        <div className="flex items-center justify-start px-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        </div>
      )

      return (
        <div className="flex items-center justify-start px-4">
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleToggle}
            aria-label="Toggle enabled status"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "identity",
    header: "Identity",
  },
  {
    accessorKey: "publicKey",
    header: "Public Key",
  },
];
