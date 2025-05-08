export interface StakeDistributionOffer {
    id: number;
    publicKey: string;
    name: string;
    fee: string;
    rewards: string;
    regions: string[];
    operationalFundsAmount: number;
    delegatorRewardsAddress: string;
    stakeDistribution: StakeDistributionItem[];
}

export interface StakeDistributionItem {
    revShare: string;
    amount: number;
    qty: number;
}
