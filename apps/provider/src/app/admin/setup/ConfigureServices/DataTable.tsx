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
  serviceItemActions?: (row: TData) => ReactNode;
  data: TData[];
}

export function DataTable<TData, TValue>({
                                           columns,
                                           data,
                                           addServiceAction,
                                           serviceItemActions,
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
              {serviceItemActions && (
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
                className="bg-[--var(bg-black)] r group"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    className="px-2 !rounded-bl-none !rounded-tl-none"
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                {addServiceAction && <TableCell />}
                {serviceItemActions && (
                  <TableCell className="flex flex-row-reverse px-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {serviceItemActions(row.original)}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={addServiceAction && serviceItemActions
                  ? columns.length + 2
                  : addServiceAction || serviceItemActions
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
