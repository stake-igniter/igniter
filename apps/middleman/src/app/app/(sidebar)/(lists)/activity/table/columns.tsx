"use client";

import { ActivityStatus, ActivityType, TransactionStatus } from "@/db/schema";
import {
  ActivitySuccessIcon,
  ActivityWarningIcon,
  RightArrowIcon,
  WarningIcon,
} from "@igniter/ui/assets";
import { Button } from "@igniter/ui/components/button";
import {
  FilterGroup,
  SortOption,
} from "@igniter/ui/components/DataTable/index";
import { roundAndSeparate } from "@igniter/ui/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export type Activity = {
  id: number;
  type: ActivityType;
  status: ActivityStatus;
  transactions: any[];
  createdAt: Date;
  totalValue: number;
};

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as ActivityType;
      const status = row.getValue("status") as ActivityStatus;
      return (
        <div className="flex items-center gap-2">
          <span
            className={type === ActivityType.Unstake ? "rotate-180" : ""}
            style={{ display: "inline-block" }}
          >
            {status === ActivityStatus.Failure ? (
              <ActivityWarningIcon />
            ) : (
              <ActivitySuccessIcon />
            )}
          </span>
          <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      const rowValue = row.getValue(columnId);
      return rowValue === value;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ActivityStatus;
      const original = row.original as Activity;
      const txs = original.transactions;

      const failedTxs = txs.filter(
        (tx) => tx.status === TransactionStatus.Failure
      );
      const successTxs = txs.filter(
        (tx) => tx.status === TransactionStatus.Success
      );

      const failedCount = failedTxs.length;
      const successCount = successTxs.length;
      const totalCount = txs.length;

      return (
        <div className="flex items-baseline gap-2">
          {failedCount ? <WarningIcon /> : null}
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          <span className="font-mono text-muted-foreground">{`(${successCount}/${totalCount})`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      return (
        <span className="font-mono text-slightly-muted-foreground flex justify-center gap-2">
          {createdAt.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      const totalValue = row.getValue("totalValue") as number;
      return (
        <div className="flex items-baseline gap-3 font-mono justify-end">
          {/* Is this currency field  ? */}
          <span>{roundAndSeparate(totalValue, 2)}</span>
          <span className="text-muted-foreground">$POKT</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const activity = row.original;
      return (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" className="border-0">
            <RightArrowIcon style={{ width: "18px", height: "18px" }} />
          </Button>
        </div>
      );
    },
  },
];

export const filters: FilterGroup<Activity>[] = [
  {
    group: "type/status",
    items: [
      [{ label: "All Activity", value: "", column: "type", isDefault: true }],

      [
        { label: "Stake", value: ActivityType.Stake, column: "type" },
        { label: "Upstake", value: ActivityType.Upstake, column: "type" },
        { label: "Unstake", value: ActivityType.Unstake, column: "type" },
      ],

      [
        { label: "Success", value: ActivityStatus.Success, column: "status" },
        { label: "Failure", value: ActivityStatus.Failure, column: "status" },
        { label: "Pending", value: ActivityStatus.Pending, column: "status" },
      ],
    ],
  },
];

export const sorts: SortOption<Activity>[][] = [
  [
    {
      label: "Most Recent",
      column: "createdAt",
      direction: "desc",
      isDefault: true,
    },
  ],

  [
    { label: "Amount", column: "totalValue", direction: "desc" },
    { label: "Date", column: "createdAt", direction: "desc" },
    { label: "Status", column: "status", direction: "asc" },
    { label: "Type", column: "type", direction: "asc" },
  ],
];
