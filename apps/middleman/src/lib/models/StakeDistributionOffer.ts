import {StakeBin} from "@/types";

export interface StakeDistributionOffer {
    id: number;
    name: string;
    fee: number;
    rewards: number;
    stakeDistribution: NodeStakeDistributionItem[];
}

export interface NodeStakeDistributionItem {
    bin: StakeBin;
    qty: number;
}
