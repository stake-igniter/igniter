export interface StakeDistributionOffer {
    id: number;
    publicKey: string;
    name: string;
    fee: string;
    rewards: string;
    operationalFundsAmount: number;
    delegatorRewardsAddress: string;
    stakeDistribution: NodeStakeDistributionItem[];
}

export interface NodeStakeDistributionItem {
    amount: number;
    qty: number;
}
