import {ProviderFee} from "@/db/schema";

export interface StakeDistributionOffer {
    id: number;
    identity: string;
    fee: number;
    feeType: ProviderFee;
    name: string;
    rewards: string;
    regions: string[];
    operationalFundsAmount: number;
    stakeDistribution: StakeDistributionItem[];
}

export interface StakeDistributionItem {
    amount: number;
    qty: number;
}
