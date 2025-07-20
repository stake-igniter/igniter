"use client"

import { ColumnDef } from '@igniter/ui/components/table';
import { Delegator } from "@/db/schema";
import React, { useState } from "react";
import {UpdateDelegator} from "@/actions/Delegators";
import {Switch} from "@igniter/ui/components/switch";

export const columns: ColumnDef<Delegator>[] = [
  {
    accessorKey: "enabled",
    header: "Enabled",
    cell: ({ row }) => {
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
        <div className="flex items-center justify-start px-4 min-w-5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        </div>
      )

      return (
        <div className="flex items-center justify-start">
          <Switch
              checked={isChecked}
              onCheckedChange={handleToggle}
              className="border-[var(--slate-dividers)]"
              aria-label={`Enable ${delegator.name} as delegator`}
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
  }
];
