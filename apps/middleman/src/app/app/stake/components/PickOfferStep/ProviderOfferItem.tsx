import ProviderIcon from '@/app/assets/icons/dark/providers.svg';
import {StakeDistributionOffer} from '@/lib/models/StakeDistributionOffer';
import {
    CheckIcon,
    FeeIcon,
    FeeDisabledIcon,
    InfoIcon,
    RewardsIcon,
    RewardsDisabledIcon
} from '@igniter/ui/assets';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@igniter/ui/components/popover';
import {toCurrencyFormat} from "@igniter/ui/lib/utils";

export interface ProviderOfferItemProps {
    offer: StakeDistributionOffer;
    isSelected?: boolean;
    onSelect?: (offer: StakeDistributionOffer) => void;
    disabled?: boolean;
}

export function ProviderOfferItem({ isSelected, offer, onSelect, disabled }: Readonly<ProviderOfferItemProps>) {
    const className =
        isSelected
            ? 'relative flex h-[88px] gradient-border-purple'
            : 'relative flex h-[88px] rounded-[8px] border-[2px] border-[--black-dividers]';

    return (
        <div className={className} onClick={() => onSelect?.(offer)}>
            <div className={`absolute inset-0 flex flex-row items-center m-[0.5px] bg-[var(--background)] rounded-[8px] p-[20px_25px] ${isSelected ? 'justify-between' : 'flex-start'}`}>
                <span className="flex flex-row items-center gap-5">
                    <span>
                        <ProviderIcon />
                    </span>
                    <span className="flex flex-col gap-2">
                        <span className="flex flex-row items-center gap-2">
                            <span className={`${disabled ? 'text-[var(--color-white-3)]' : ''}`}>{offer.name}</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <InfoIcon />
                                </PopoverTrigger>
                                <PopoverContent className="flex flex-col w-[260px] bg-[var(--color-slate-2)] p-0">
                                    <span className="text-[14px] font-medium text-[var(--color-white-1)] p-[12px_16px]">
                                        About {offer.name}
                                    </span>
                                    <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                                    <span className="flex flex-col gap-2.5 p-[12px_16px]">
                                        <span className="flex flex-row items-center justify-between">
                                            <span className="flex flex-row items-center gap-2">
                                                <FeeIcon />
                                                <span>Fee</span>
                                            </span>
                                            <span className="font-mono">
                                                {offer.fee}%
                                            </span>
                                        </span>
                                        <span className="text-[14px] text-[var(--color-white-3)]">
                                            Share of rewards providers charge for node running services.
                                        </span>
                                    </span>
                                    <div className="h-[1px] bg-[var(--slate-dividers)]"></div>
                                    <span className="flex flex-col gap-2.5 p-[12px_16px]">
                                        <span className="flex flex-row items-center justify-between">
                                            <span className="flex flex-row items-center gap-2">
                                                <RewardsIcon />
                                                <span>Rewards</span>
                                            </span>
                                            <span className="font-mono">
                                                {toCurrencyFormat(Number(offer.rewards), 2)}
                                            </span>
                                        </span>
                                        <span className="text-[14px] text-[var(--color-white-3)]">
                                            Net $POKT rewards for the last 7 days per 15,000 $POKT staked.
                                        </span>
                                    </span>
                                </PopoverContent>
                            </Popover>
                        </span>
                        <span>
                            {!disabled && !isSelected && (
                                <span className="flex flex-row items-center gap-4">
                                    <span className="flex flex-row items-center gap-2">
                                        <FeeIcon />
                                        <span className="font-mono leading-[1.6] relative top-[0.05em] text-[14px]">{`${offer.fee}%`}</span>
                                    </span>
                                    <span className="flex flex-row items-center gap-2">
                                        <RewardsIcon />
                                        <span className="font-mono leading-[1.6] relative top-[0.05em] text-[14px]">{offer.rewards}</span>
                                    </span>
                                </span>
                            )}
                            {!disabled && isSelected && (
                                <span className="flex flex-row items-center gap-4 text-[var(--color-white-2)]">
                                    <span className="flex flex-row items-center gap-2">
                                        <FeeIcon />
                                        <span className="font-mono leading-[1.6] relative top-[0.05em] text-[14px]">{`${offer.fee}%`}</span>
                                    </span>
                                    <span className="flex flex-row items-center gap-2">
                                        <RewardsIcon />
                                        <span className="font-mono leading-[1.6] relative top-[0.05em] text-[14px]">{offer.rewards}</span>
                                    </span>
                                </span>
                            )}
                            {disabled && (
                                <span className="flex flex-row items-center gap-4 text-[var(--color-white-3)]">
                                    <span className="flex flex-row items-center gap-2">
                                        <FeeDisabledIcon />
                                        <span className="font-mono leading-[1.6] relative top-[0.05em] text-[14px]">{`${offer.fee}%`}</span>
                                    </span>
                                    <span className="flex flex-row items-center gap-2">
                                        <RewardsDisabledIcon />
                                        <span className="font-mono leading-[1.6] relative top-[0.05em] text-[14px]">{offer.rewards}</span>
                                    </span>
                                </span>
                            )}
                        </span>
                    </span>
                </span>
                {isSelected && (
                    <span>
                        <CheckIcon />
                    </span>
                )}
            </div>
        </div>
    );
}
