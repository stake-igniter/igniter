import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {ApplicationSettings} from "@/db/schema";

export interface ServiceProviderKey {
    address: string;
    amount: number;
    serviceUrl: string;
    chains: string[];
}

export interface StakeTransaction extends ServiceProviderKey {
    outputAddress: string;
    delegatorRewards: Record<string, string>;
}

export interface OperationalFundsTransaction {
    fromAddress: string;
    toAddress: string;
    amount: number;
}

export interface CreateStakeTransactionParams {
    offer: StakeDistributionOffer;
    settings: ApplicationSettings;
    key: ServiceProviderKey;
    outputAddress: string;
}

export interface CreateOperationalFundsTransactionParams {
    offer: StakeDistributionOffer;
    stakeTransaction: StakeTransaction;
}

export function createStakeTransaction(params: CreateStakeTransactionParams): StakeTransaction {
    return {
        ...params.key,
        outputAddress: params.outputAddress,
        delegatorRewards: {
            [params.offer.delegatorRewardsAddress]: params.offer.fee,
            [params.settings.delegatorRewardsAddress]: params.settings.fee,
        },
    };
}

export function createOperationalFundsTransaction(params: CreateOperationalFundsTransactionParams): OperationalFundsTransaction {
    return {
        fromAddress: params.stakeTransaction.outputAddress,
        toAddress: params.stakeTransaction.address,
        amount: params.offer.operationalFundsAmount,
    };
}
