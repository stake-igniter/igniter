import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";

export interface ProviderOfferItemProps {
    offer: StakeDistributionOffer;
    isSelected?: boolean;
    onSelect: (offer: StakeDistributionOffer) => void;
}

export function ProviderOfferItem({ isSelected, offer, onSelect }: Readonly<ProviderOfferItemProps>) {
    const className =
        isSelected
            ? 'relative flex h-[88px] p-[20px_25px] gradient-border'
            : 'relative flex h-[88px] p-[20px_25px] rounded-[8px] border border-[--black-dividers]';

    return (
        <div className={className} onClick={() => onSelect(offer)}>
            <div className="absolute inset-0 m-[0.5px] bg-[var(--background)] rounded-[8px] cursor-pointer">
                <span>
                    {/* Icon */}
                </span>
                <span>
                    {/* Provider Details */}
                </span>
                {isSelected && (
                    <span>
                        {/* Checkmark */}
                    </span>
                )}
            </div>
        </div>
    );
}
