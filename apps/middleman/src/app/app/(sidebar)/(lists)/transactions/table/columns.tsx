"use client";

import { ProviderFee, TransactionStatus, TransactionType } from '@/db/schema'
import { ActivitySuccessIcon, ActivityWarningIcon, RightArrowIcon, WarningIcon } from '@igniter/ui/assets'
import { Button } from '@igniter/ui/components/button'
import { FilterGroup, SortOption } from '@igniter/ui/components/DataTable/index'
import { amountToPokt } from '@igniter/ui/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Operation, useAddItemToDetail } from '@/app/detail/Detail'
import Amount from '@igniter/ui/components/Amount'

export type Transaction = {
  id: number;
  type: TransactionType;
  status: TransactionStatus;
  operations: Array<Operation>;
  createdAt: Date;
  totalValue: number;
  hash: string,
  estimatedFee: number,
  consumedFee?: number,
  provider: string,
  providerFee?: number | null,
  typeProviderFee?: ProviderFee | null,
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as TransactionType;
      const status = row.getValue("status") as TransactionStatus;
      return (
        <div className="flex items-center gap-2">
          <span
            className={type === TransactionType.Unstake ? "rotate-180" : ""}
            style={{ display: "inline-block" }}
          >
            {status === TransactionStatus.Failure ? (
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
      const status = row.getValue("status") as TransactionStatus;

      return (
        <div className="flex items-baseline gap-2">
          {status === TransactionStatus.Failure && <WarningIcon />}
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
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
          <Amount value={amountToPokt(totalValue)} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => {
      const addItem = useAddItemToDetail()

      return (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="border-0"
            onClick={() => {
              addItem({
                type: 'transaction',
                body: {
                  type: row.original.type,
                  status: row.original.status,
                  createdAt: row.original.createdAt,
                  operations: row.original.operations,
                  hash: row.original.hash,
                  estimatedFee: row.original.estimatedFee,
                  consumedFee: row.original.consumedFee,
                  provider: row.original.provider,
                  providerFee: row.original.providerFee,
                  typeProviderFee: row.original.typeProviderFee,
                }
              })
            }}
          >
            <RightArrowIcon style={{ width: "18px", height: "18px" }} />
          </Button>
        </div>
      );
    },
  },
];

export const filters: FilterGroup<Transaction>[] = [
  {
    group: "type/status",
    items: [
      [{ label: "All Transaction", value: "", column: "type", isDefault: true }],

      [
        { label: "Stake", value: TransactionType.Stake, column: "type" },
        { label: "Upstake", value: TransactionType.Upstake, column: "type" },
        { label: "Unstake", value: TransactionType.Unstake, column: "type" },
      ],

      [
        { label: "Success", value: TransactionStatus.Success, column: "status" },
        { label: "Failure", value: TransactionStatus.Failure, column: "status" },
        { label: "Pending", value: TransactionStatus.Pending, column: "status" },
      ],
    ],
  },
];

export const sorts: SortOption<Transaction>[][] = [
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
    { label: "Status", column: "status", direction: "asc" },
    { label: "Type", column: "type", direction: "asc" },
  ],
];
