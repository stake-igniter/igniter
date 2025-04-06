"use client";

import {Button} from "@igniter/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter, DialogTitle,
    DialogTrigger,
} from "@igniter/ui/components/dialog";
import {CheckSuccess, LoaderIcon} from "@igniter/ui/assets";


export interface AbortConfirmationDialogProps {
    isOpen: boolean;
    onResponse: (abort: true) => void;
}

export function AbortConfirmationDialog({ isOpen, onResponse }: Readonly<AbortConfirmationDialogProps>) {
    return (
        <Dialog open={isOpen}>
            <DialogContent
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
                className="gap-0 w-[360px] p-0 rounded-lg bg-[var(--color-slate-2)]"
                hideClose
            >
                <DialogTitle asChild>
                    <div className="flex flex-row justify-between items-center py-3 px-4">
                        <span className="text-[14px]">Abort Stake</span>
                    </div>
                </DialogTitle>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <div className="flex flex-row justify-between items-center py-3 px-4">
                    <span className="text-[14px] text-[var(--color-white-3)]">
                        Are you sure you want to abort this stake? Be certain you can restart the stake process anytime.
                    </span>
                </div>
                <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                <DialogFooter className="p-2 flex flex-row ">
                    <Button
                        variant={'secondaryStretch'}
                        onClick={() => onResponse(true)}
                    >
                        Abort Stake
                    </Button>
                    <Button
                        variant={'secondaryStretch'}
                        onClick={() => onResponse(false)}
                    >
                        Continue Stake
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
