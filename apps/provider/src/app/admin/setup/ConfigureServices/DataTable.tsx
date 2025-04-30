"use client"

import type {
  ColumnDef,
} from '@igniter/ui/components/table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@igniter/ui/components/table"
import {ReactNode} from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  addServiceAction?: ReactNode;
  deleteServiceAction?: (row: TData) => ReactNode;
  data: TData[];
}

export function DataTable<TData, TValue>({
                                           columns,
                                           data,
                                           addServiceAction,
                                           deleteServiceAction,
                                         }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-[--var(bg-black)] hover:bg-[--var(bg-black)]"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
              {deleteServiceAction && (
                <TableHead />
              )}
              {addServiceAction && (
                <TableHead
                  className="flex flex-row-reverse px-0"
                  >
                  {addServiceAction}
                </TableHead>
              )}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-[--var(bg-black)] group"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {addServiceAction && <TableCell />}
                {deleteServiceAction && (
                  <TableCell className="flex flex-row-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                    {deleteServiceAction(row.original)}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={addServiceAction && deleteServiceAction
                  ? columns.length + 2
                  : addServiceAction || deleteServiceAction
                    ? columns.length + 1
                    : columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>

          )}
        </TableBody>
      </Table>
    </div>
  )
}
