export interface StakeDistributionOffer {
    id: number;
    name: string;
    fee: string;
    rewards: string;
    operationalFundsAmount: number;
    delegatorRewardsAddress: string;
    url: string;
    stakeDistribution: NodeStakeDistributionItem[];
}

export interface NodeStakeDistributionItem {
    amount: number;
    qty: number;
}
