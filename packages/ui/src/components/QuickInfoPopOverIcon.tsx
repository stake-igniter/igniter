'use client';

import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {InfoIcon} from "../assets";
import {Button} from "./button";

export interface QuickInfoPopOverIconProps {
    title: string;
    description: string;
    actionText?: string;
    url: string;
}

export function QuickInfoPopOverIcon({title, description, actionText} : Readonly<QuickInfoPopOverIconProps>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <InfoIcon />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col w-[260px] bg-[var(--color-slate-2)] p-0">
                <span className="text-[14px] text-[var(--color-white-1)] p-[12px_16px]">
                    {title}
                </span>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <span className="text-[14px] text-[var(--color-white-3)] p-[12px_16px]">
                    {description}
                </span>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <Button variant="secondaryBorder" className="w-full">
                    {actionText ?? 'Learn More'}
                </Button>
            </PopoverContent>
        </Popover>
    );
}
