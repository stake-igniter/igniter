export interface StakeDistributionOffer {
    id: number;
    name: string;
    fee: number;
    rewards: number;
    stakeDistribution: NodeStakeDistributionItem[];
}

export interface NodeStakeDistributionItem {
    bin: '15k' | '30k' | '45k' | '60k' | 'Validator';
    qty: number;
}
