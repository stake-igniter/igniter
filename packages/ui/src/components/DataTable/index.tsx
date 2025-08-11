"use client";
import React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  SortingState,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@igniter/ui/components/table";

import FilterDropdown from "./FilterDropdown";
import SortDropdown from "./SortDropdown";
import Pagination from "./Pagination";
import { Skeleton } from '../skeleton'
import { Button } from '../button'

export interface FilterItem<TData> {
  label: string;
  value: string | number | boolean;
  column: keyof TData;
  isDefault?: boolean;
}

export interface FilterGroup<TData> {
  group: string;
  items: FilterItem<TData>[][];
}

export interface SortOption<TData> {
  label: string;
  column: keyof TData;
  direction: "asc" | "desc";
  isDefault?: boolean;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters: FilterGroup<TData>[];
  sorts: SortOption<TData>[][];
  isLoading?: boolean;
  skeletonRows?: number;
  isError?: boolean
  refetch?: () => void
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  sorts,
  isLoading,
  skeletonRows = 6,
  isError,
  refetch,
}: DataTableProps<TData, TValue>) {
  const defaultSort = sorts.flat().find((sort) => sort.isDefault);

  const [sorting, setSorting] = React.useState<SortingState>(
    defaultSort ? [{
      id: String(defaultSort.column),
      desc: defaultSort.direction === "desc",
    }] : []
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  const defaultFilters = filters.flatMap((filterGroup) =>
    filterGroup.items.flatMap((filter) => filter.find((f) => f.isDefault) || [])
  );


  const selectedSort = sorts
    .flat()
    .find((sort) => sort.column === sorting[0]?.id);
  const currentDirection = sorting[0]?.desc ? "desc" : "asc";

  let tableBody: React.ReactNode;

  if (isLoading) {
    tableBody = new Array(skeletonRows).fill(null).map((_, index) => (
      <TableRow key={index} className={'pointer-events-none'}>
        {columns.map((_, colIndex) => (
          <TableCell key={`${index}-${colIndex}`}>
            <Skeleton className={'w-4/5 h-4 !bg-[color:#383838]'} />
          </TableCell>
        ))}
      </TableRow>
    ))
  } else if (isError) {
    tableBody = (
      <TableRow className={'hover:bg-[color:var(--color-card)]'}>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          There was an error loading the data.
          {refetch && (
            <Button onClick={refetch} className={'h-[30px] ml-2'}>
              Retry
            </Button>
          )}
        </TableCell>
      </TableRow>
    )
  } else {
    tableBody = table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )
  }

  return (
    <div>
      <div className="flex items-center justify-end space-x-2 pb-6">
        <div className="flex items-center gap-2">
          {filters.map((filterGroup, groupIndex) => (
            <FilterDropdown
              key={groupIndex}
              filterGroup={filterGroup}
              columnFilters={columnFilters}
              table={table}
              defaultLabel={defaultFilters[groupIndex]?.label || ""}
              disabled={isLoading || isError}
            />
          ))}
          {
            sorts.length > 0 && (
              <SortDropdown
                sorts={sorts}
                table={table}
                selectedSort={selectedSort}
                defaultSort={defaultSort}
                currentDirection={currentDirection}
                disabled={isLoading || isError}
              />
            )
          }
        </div>
      </div>

      <Table>
        <TableBody>
          {tableBody}
        </TableBody>
      </Table>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
        disabled={isLoading || isError}
      />
    </div>
  );
}
