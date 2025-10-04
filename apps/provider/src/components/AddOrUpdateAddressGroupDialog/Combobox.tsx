"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { cn } from '@igniter/ui/lib/utils';
import { Button } from "@igniter/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@igniter/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@igniter/ui/components/popover"

export type ComboboxItem = {
  value: string
  label: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  defaultValue?: string
  onSelect?: (value: string) => void
  className?: string
  popoverWidth?: string
}

export function Combobox({
                           items,
                           placeholder = "Select an item...",
                           searchPlaceholder = "Search...",
                           emptyMessage = "No item found.",
                           onSelect,
                           className,
                           popoverWidth = "w-[200px]"
                         }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            "hover:bg-transparent",
            className
          )}
        >
          <span className="text-muted-foreground font-normal">{placeholder}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0")}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={onSelect}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
