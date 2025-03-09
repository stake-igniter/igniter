"use client";

import {Button} from "@igniter/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@igniter/ui/components/dialog";
import DialogContentSectionHeader from "@igniter/ui/components/DialogContentSectionHeader";
import WalletPickerItem, {WalletPickerItemProps} from "./components/WalletPickerItem";
import {DialogClose} from "../dialog";
import {useWalletConnection} from "../../context/WalletConnection";
import {useEffect, useState} from "react";


export function WalletPicker() {
    const [detectedProvider, setDetectedProvider] = useState<WalletPickerItemProps[]>([]);
    const { getAvailableProviders } = useWalletConnection();

    useEffect(() => {
        (async () => {
            try {
                const providers = await getAvailableProviders();
                const walletPickerItems = providers.map((provider) => ({
                    name: provider.name,
                    icon: provider.icon,
                }));

                setDetectedProvider(walletPickerItems);
            } catch (err) {
                console.error(err);
                setDetectedProvider([]);
            }
        })();
    }, [getAvailableProviders]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"secondary"}>Connect Wallet</Button>
            </DialogTrigger>
            <DialogContent className="w-[320px] pt-[20px] pb-[8px] px-[8px] rounded-lg shadow-[0_2px_12px_0_var(--shadow-1)] bg-[var(--color-slate-2)]" hideClose>
                <div className="px-[16px] flex flex-col gap-5">
                    <DialogHeader>
                        <DialogTitle className="!text-[16px] font-[var(--font-sans)] text-[var(--color-white-1)]">
                            Connect Wallet
                        </DialogTitle>
                        <DialogDescription className="!text-[14px] font-[var(--font-sans)] text-[var(--color-white-3)]">
                            Login anonymously using your wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <DialogContentSectionHeader text="detected" />
                        {detectedProvider.length > 0 && detectedProvider.map((provider, index) => (
                            <WalletPickerItem key={index} {...provider} />
                        ))}
                        {detectedProvider.length <= 0 && (
                            <DialogDescription className="!text-[14px] font-[var(--font-sans)] text-[var(--color-white-3)]">
                                No wallets detected.
                            </DialogDescription>
                        )}
                    </div>
                    {/*<div className="flex flex-col gap-2">*/}
                    {/*    <DialogContentSectionHeader text="popular" />*/}
                    {/*</div>*/}
                </div>
                <div className="absolute bottom-[54px] w-[318px] h-[1px] bg-[var(--slate-dividers)]"></div>
                <DialogFooter className="mt-4">
                    <DialogClose className="w-full" asChild>
                        <Button variant={'secondaryStretch'} type="submit">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
