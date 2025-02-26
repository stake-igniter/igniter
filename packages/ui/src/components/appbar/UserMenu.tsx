import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import { getRandomInt, getShortAddress } from "../../../../../apps/middleman/src/lib/utils";

export default function UserMenu() {
  const randomAvatar = getRandomInt(1, 4);
  const tempAddress = "1234512234db6eab078c0526f0531565f5b66789";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2 border rounded-md p-2">
          <UserAvatar address={tempAddress} selectedAvatar={randomAvatar} />
          <span className="font-mono text-sm">
            {getShortAddress(tempAddress, 5)}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="max-h-[38px]">
          <UserAvatar address={tempAddress} selectedAvatar={randomAvatar} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
