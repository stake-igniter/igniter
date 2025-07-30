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
import {Provider, useWalletConnection} from "@igniter/ui/context/WalletConnection/index";
import {useEffect, useState} from "react";
import { getShortAddress } from "../../lib/utils";
import { Checkbox } from '../checkbox'
import AvatarByString from "../AvatarByString";

export interface WalletPickerProps {
    onWalletSelect?: (provider: Provider) => void;
}

export function WalletPicker({ onWalletSelect }: Readonly<WalletPickerProps>) {
    const [detectedProvider, setDetectedProvider] = useState<WalletPickerItemProps[]>([]);
    const [open, setOpen] = useState(false);
    const { getAvailableProviders, connect, connectedIdentities, connectIdentity, } = useWalletConnection();
    const [status, setStatus] = useState<'wallet' | 'account'>('wallet')
    const [selectedAccount, setSelectedAccount] = useState('')

    useEffect(() => {
        setTimeout(() => {
            setStatus('wallet')
            setSelectedAccount('')
        }, 150)
    }, [open])

    useEffect(() => {
        (async () => {
            try {
                const providers = await getAvailableProviders();
                const walletPickerItems = providers.map((provider) => ({
                    name: provider.name,
                    icon: provider.icon,
                    provider: provider.provider!,
                    onSelect: onWalletSelect,
                }));

                setDetectedProvider(walletPickerItems);
            } catch (err) {
                console.error(err);
                setDetectedProvider([]);
            }
        })();
    }, [getAvailableProviders]);

    const onSelectProvider = async (provider: Provider) => {
        const connectedIdentities = await connect(provider);

        if (connectedIdentities.length === 1) {
            setOpen(false)
            connectIdentity(connectedIdentities.at(0)!)
        } else {
            setStatus('account')
        }
    }

    const onSelectAccount = () => {
        if (selectedAccount === '') return
        connectIdentity(selectedAccount)
        setOpen(false)
    }

    let content: React.ReactNode

    if (status === 'wallet') {
        content = (
          <>
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
                      {detectedProvider.length > 0 && detectedProvider.map(({onSelect, ...providerProps}, index) => (
                        <WalletPickerItem key={index} {...providerProps} onSelect={onSelectProvider} />
                      ))}
                      {detectedProvider.length <= 0 && (
                        <DialogDescription className="!text-[14px] font-[var(--font-sans)] text-[var(--color-white-3)]">
                            No wallets detected.
                        </DialogDescription>
                      )}
                  </div>
              </div>
              <div className="absolute bottom-[54px] w-[318px] h-[1px] bg-[var(--slate-dividers)]"></div>
              <DialogFooter className="mt-4">
                  <DialogClose className="w-full" asChild>
                      <Button variant={'secondaryStretch'} onClick={() => setOpen(false)}>Cancel</Button>
                  </DialogClose>
              </DialogFooter>
          </>
        )
    } else if (status === 'account') {
        // todo: add key to constants
        const lastSignedInIdentity = localStorage.getItem('last-signed-in-identity')

        let addressLastSignedIn = ''

        if (lastSignedInIdentity) {
            addressLastSignedIn = connectedIdentities?.find(address => getShortAddress(address) === lastSignedInIdentity) || ''
        }

        const addresses = addressLastSignedIn ? connectedIdentities!.filter(address => address !== addressLastSignedIn) : connectedIdentities!

        content = (
          <>
              <DialogHeader>
                  <DialogTitle className="!text-[16px] font-[var(--font-sans)] text-[var(--color-white-1)]">
                      Select your Account
                  </DialogTitle>
                  <DialogDescription className="!text-[14px] font-[var(--font-sans)] text-[var(--color-white-3)]">
                      Select the account you want to use to sign in.
                  </DialogDescription>
              </DialogHeader>
              <div className={'flex flex-col gap-2 h-full overflow-y-auto'}>
                  {addressLastSignedIn && (
                    <>
                        <div
                          className="border border-amber-100 w-full h-11 cursor-pointer select-none flex flex-row items-center gap-2 py-3 pl-3 pr-4 bg-(--input-bg) border rounded-lg"
                          onClick={() => setSelectedAccount(addressLastSignedIn)}
                        >
                            <AvatarByString string={addressLastSignedIn} />
                            <div className="flex flex-col w-full gap-0">
                                <p className="font-mono text-sm">
                                    {getShortAddress(addressLastSignedIn, 5)}
                                </p>
                            </div>
                            <Checkbox
                              checked={selectedAccount === addressLastSignedIn}
                            />
                        </div>
                        <p className={'!text-[10px] mb-4'}>
                            It appears this was the last account you signed in with.
                        </p>
                        <div className="absolute top-[160px] left-0 w-[318px] h-[1px] bg-[var(--slate-dividers)]"></div>
                    </>
                  )}
                  {addresses!.map((address) => (
                    <div
                      key={address}
                      className="w-full h-11 cursor-pointer select-none flex flex-row items-center gap-2 py-3 pl-3 pr-4 bg-(--input-bg) border rounded-lg"
                      onClick={() => setSelectedAccount(address)}
                    >
                        <AvatarByString string={address} />
                        <div className="flex flex-col w-full gap-0">
                            <p className="font-mono text-sm">
                                {getShortAddress(address, 5)}
                            </p>
                        </div>
                        <Checkbox
                          checked={selectedAccount === address}
                        />
                    </div>
                  ))}
              </div>
              <div className="absolute bottom-[54px] w-[318px] h-[1px] bg-[var(--slate-dividers)]"></div>
              <DialogFooter className="mt-2">
                  <DialogClose className="w-full" asChild>
                      <Button variant={'secondaryStretch'} onClick={() => setOpen(false)}>Cancel</Button>
                  </DialogClose>
                  <Button
                    disabled={!connectedIdentities?.includes(selectedAccount) || false}
                    variant={'secondaryStretch'}
                    onClick={onSelectAccount}
                  >
                      Accept
                  </Button>
              </DialogFooter>
          </>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"secondary"}>Connect Wallet</Button>
            </DialogTrigger>
            <DialogContent className="w-[320px] pt-[20px] pb-[8px] px-[8px] rounded-lg shadow-[0_2px_12px_0_var(--shadow-1)] bg-[var(--color-slate-2)]" hideClose>
                {content}
            </DialogContent>
        </Dialog>
    );
}
