"use client";

import { NodeStatus, Provider, Transaction } from '@/db/schema'
import {
  CopyIcon,
  RewardsDisabledIcon,
  RewardsIcon,
  RightArrowIcon,
} from "@igniter/ui/assets";
import { Button } from "@igniter/ui/components/button";
import {
  FilterGroup,
  SortOption,
} from "@igniter/ui/components/DataTable/index";
import {
  amountToPokt,
  getShortAddress,
  roundAndSeparate,
} from "@igniter/ui/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAddItemToDetail } from '@/app/detail/Detail'

export type Node = {
  id: number;
  address: string;
  rewards: number;
  bin?: string;
  txStatus?: string;
  status: NodeStatus;
  stakeAmount: number;
  balance: number;
  provider?: Provider;
  createdAt: Date;
  transactions: Array<Transaction>;
};

export const columns: ColumnDef<Node>[] = [
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;

      const onClickCopy = useCallback(() => {
        navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard");
      }, [address]);

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-slightly-muted-foreground flex justify-center items-center gap-2 text-pink-1 font-medium">
            {getShortAddress(address, 5)}
            <CopyIcon onClick={onClickCopy} className="cursor-pointer" />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => {
      const provider = row.getValue("provider") as Provider;
      return (
        <div className="flex items-center gap-2">
          <span className="text-slightly-muted-foreground flex justify-center items-center gap-2">
            {provider?.name || "Imported Node"}
          </span>
        </div>
      );
    },
    filterFn: (row, columnId, value) => {
      const provider = row.getValue("provider") as Provider;
      return provider.name.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "rewards",
    header: "Rewards",
    cell: ({ row }) => {
      const rewards = row.getValue("rewards") as number;

      const PositiveRewards = <RewardsIcon />;
      const NoRewards = <RewardsDisabledIcon />;

      return (
        <div className="flex justify-start items-baseline gap-2">
          {rewards > 0 ? PositiveRewards : NoRewards}
          <span className="font-mono">
            {roundAndSeparate(amountToPokt(rewards), 2, 0)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as NodeStatus;
      return (
        <span className="flex justify-center gap-2">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "stakeAmount",
    header: "Stake Amount",
    cell: ({ row }) => {
      const stakeAmount = row.getValue("stakeAmount") as number;
      return (
        <div className="flex items-baseline gap-3 font-mono justify-end">
          {/* Is this currency field  ? */}
          <span>{roundAndSeparate(stakeAmount)}</span>
          <span className="text-muted-foreground">$POKT</span>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number;
      return (
        <div className="flex items-baseline gap-3 font-mono justify-end">
          {/* Is this currency field  ? */}
          <span>{roundAndSeparate(amountToPokt(balance), 2)}</span>
          <span className="text-muted-foreground">$POKT</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const addItem = useAddItemToDetail()
      const node = row.original;
      return (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="border-0"
            onClick={() => {
              addItem({
                type: 'node',
                body: {
                  address: node.address,
                  status: node.status,
                  stakeAmount: node.stakeAmount,
                  operationalFundsAmount: node.balance,
                  transactions: node.transactions.map(t => ({
                    id: t.id,
                    type: t.type,
                    status: t.status,
                    createdAt: t.createdAt!,
                    operations: [],
                    hash: t.hash || '',
                    estimatedFee: t.estimatedFee,
                    consumedFee: t.consumedFee,
                    provider: node.provider?.name || '',
                    providerFee: t.providerFee,
                    typeProviderFee: t.typeProviderFee,
                  })),
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

export const filters: FilterGroup<Node>[] = [
  {
    group: "bin/status",
    items: [
      [
        {
          label: "All Nodes",
          value: "",
          column: "status",
          isDefault: true,
        },
      ],
      // [
      //   { label: "15K", value: 15000, column: "bin" },
      //   { label: "30K", value: 30000, column: "bin" },
      //   { label: "45K", value: 45000, column: "bin" },
      //   { label: "60K", value: 60000, column: "bin" },
      // ],
      // [
      //   { label: "Staking", value: NodeStatus.Staking, column: "status" },
      //   { label: "Staked", value: NodeStatus.Staked, column: "status" },
      //   { label: "Unstaking", value: NodeStatus.Unstaking, column: "status" },
      // ],
      // [
      //   { label: "Errors", value: "", column: "txStatus" },
      //   { label: "Warning", value: "", column: "txStatus" },
      // ],
    ],
  },
  {
    group: "providers",
    items: [
      [
        {
          label: "All Providers",
          value: "",
          column: "provider",
          isDefault: true,
        },
      ],
    ],
  },
];

export const sorts: SortOption<Node>[][] = [
  [
    {
      label: "Most Recent",
      column: "createdAt",
      direction: "desc",
      isDefault: true,
    },
  ],

  // [
  //   { label: "Provider", column: "provider", direction: "desc" },
  //   { label: "Rewards", column: "rewards", direction: "asc" },
  //   { label: "Status", column: "status", direction: "asc" },
  //   { label: "Stake Amount", column: "stakeAmount", direction: "asc" },
  //   { label: "Balance", column: "balance", direction: "asc" },
  // ],
];
