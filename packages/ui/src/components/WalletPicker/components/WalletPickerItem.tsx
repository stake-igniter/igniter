import { ComponentType } from "react";
import { HorizontalArrowIcon } from "@igniter/ui/assets";

export interface WalletPickerItemProps {
    name: string;
    icon: string;
}

export default function WalletPickerItem({ name, icon  }: Readonly<WalletPickerItemProps>) {
    return (
        <div
            className="w-full h-[40px] flex flex-row items-center justify-between gap-2 rounded-lg bg-transparent transition-all duration-200 ease-in-out px-2 hover:bg-[var(--sidebar-accent)] cursor-pointer -ml-2 group"
        >
            <div className="flex gap-4 items-center">
                <img src={icon} alt={name} className="h-6 w-6" />
                <span className="font-[var(--font-sans)] text-[14px] text-[var(--color-white-1)]">
                    {name}
                </span>
            </div>
            <HorizontalArrowIcon className="hidden group-hover:block rotate-180 transition-transform duration-200" />
        </div>
    );
}
