import {Button} from "@igniter/ui/components/button";
import Currency from "@igniter/ui/components/Currency";

export interface AmountDisplayProps {
    balance: number;
    amount: number;
    onMaxSelected: () => void;
}

export function AmountDisplay({balance, amount, onMaxSelected}: Readonly<AmountDisplayProps>) {
    return (
        <div className="flex flex-col w-full border border-[--black-dividers] rounded-[8px]">
            <div className="flex flex-row w-full h-[55px] bg-[#10161e] justify-between items-center p-4">
                <Currency amount={amount} variant="large" />
                <span className="flex flex-row items-center gap-3">
                    <Button
                        onClick={onMaxSelected}
                        className="h-[30px] text-[var(--color-white-1)]"
                    >
                        Max
                    </Button>
                    <span className="text-[20px] text-[var(--color-white-3)]">$POKT</span>
                </span>
            </div>
            <div className="flex flex-row items-center justify-between w-full h-[44px] border-t border-[--black-dividers] p-4">
                <span className="text-[var(--color-white-3)]">
                    Balance
                </span>
                <span className="flex flex-row gap-1">
                    <Currency amount={balance} />
                    <span className="text-[14px] text-[var(--color-white-3)]">$POKT</span>
                </span>
            </div>
        </div>
    )
}
