import {Button} from "@igniter/ui/components/button";

export default function Services() {
    return (
        <div className="flex flex-row items-center px-[59px] justify-between h-[154px] bg-[var(--color-black-1)] border-b border-[var(--black-dividers)]">
            <span className="font-[var(--font-sans)] text-[23px] leading-[2.09] text-white">
              Non-Custodial Staking. Get Started Now.
            </span>
            <Button variant={'secondary'}>Connect Wallet</Button>
        </div>
    );
}
