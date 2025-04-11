import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@igniter/ui/components/dropdown-menu";
import { CheckSmallIcon } from "@igniter/ui/assets";
import { ColumnFiltersState, Table } from "@tanstack/react-table";

interface FilterDropdownProps<TData> {
  filterGroup: {
    group: string;
    items: Array<{
      label: string;
      value: string | number;
      column: keyof TData;
      isDefault?: boolean;
    }>[];
  };
  columnFilters: ColumnFiltersState;
  table: Table<TData>;
  defaultLabel: string;
}

export default function FilterDropdown<TData>({
  filterGroup,
  columnFilters,
  table,
  defaultLabel,
}: FilterDropdownProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2 py-2 px-4">
          <span className="text-sm">
            {filterGroup.items
              .flat()
              .find((filter) =>
                columnFilters.some((f) => f.value === filter.value)
              )?.label || defaultLabel}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {filterGroup.items.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.map((filter) => (
              <DropdownMenuItem
                key={filter.value}
                className="min-w-[130px] px-4 py-2 cursor-pointer rounded-lg flex items-center justify-between hover:bg-secondary"
                onClick={() => {
                  if (!filter.value) {
                    table.resetColumnFilters();
                  } else {
                    table.setColumnFilters((_) => [
                      {
                        id: String(filter.column),
                        value: filter.value,
                      },
                    ]);
                  }
                }}
              >
                <span className="text-sm">{filter.label}</span>
                {columnFilters.some(
                  (activeFilter) => activeFilter.value === filter.value
                ) && <CheckSmallIcon />}
              </DropdownMenuItem>
            ))}
            {groupIndex < filterGroup.items.length - 1 && (
              <DropdownMenuSeparator />
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
