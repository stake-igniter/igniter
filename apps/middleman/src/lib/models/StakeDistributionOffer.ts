import {ProviderFee} from "@/db/schema";

export interface StakeDistributionOffer {
    id: number;
    publicKey: string;
    fee: string;
    feeType: ProviderFee;
    name: string;
    rewards: string;
    regions: string[];
    operationalFundsAmount: number;
    delegatorRewardsAddress: string;
    stakeDistribution: StakeDistributionItem[];
}

export interface StakeDistributionItem {
    amount: number;
    qty: number;
}
