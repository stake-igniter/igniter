import React, { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@igniter/ui/components/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import { getRandomInt, getShortAddress } from "@igniter/ui/lib/utils";

export interface UserMenuProps {
  user: {
    identity: string;
    role: string;
  };
  children: ReactNode;
}

export default function UserMenu({ user, children }: Readonly<UserMenuProps>) {
  const randomAvatar = getRandomInt(1, 4);
  const address = user.identity;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2 p-2">
          <UserAvatar address={address} selectedAvatar={randomAvatar} />
          <span className="font-mono text-sm">
            {getShortAddress(address, 5)}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
