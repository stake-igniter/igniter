import ProviderIcon from '@/app/assets/icons/dark/providers.svg';
import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {CheckIcon, FeeIcon, FeeDisabledIcon, InfoIcon, RewardsIcon, RewardsSelectedIcon} from "@igniter/ui/assets";

export interface ProviderOfferItemProps {
    offer: StakeDistributionOffer;
    isSelected?: boolean;
    onSelect?: (offer: StakeDistributionOffer) => void;
    disabled?: boolean;
}

export function ProviderOfferItem({ isSelected, offer, onSelect, disabled }: Readonly<ProviderOfferItemProps>) {
    const className =
        isSelected
            ? 'relative flex h-[88px] gradient-border'
            : 'relative flex h-[88px] rounded-[8px] border-[2px] border-[--black-dividers]';

    return (
        <div className={className} onClick={() => onSelect?.(offer)}>
            <div className={`absolute inset-0 flex flex-row items-center m-[0.5px] bg-[var(--background)] rounded-[8px] ${disabled ? '' : 'hover:cursor-pointer'} p-[20px_25px] ${isSelected ? 'justify-between' : 'flex-start'}`}>
                <span className="flex flex-row items-center gap-5">
                    <span>
                        <ProviderIcon />
                    </span>
                    <span className="flex flex-col gap-2">
                        <span className="flex flex-row items-center gap-2">
                            <span className={`${disabled ? 'text-[var(--color-white-3)]' : ''}`}>{offer.name}</span>
                            <InfoIcon />
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
                                        <RewardsSelectedIcon />
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
                                        <RewardsIcon />
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
