import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {ApplicationSettings} from "@/db/schema";
import {generateId} from "@igniter/ui/lib/utils";

export interface ServiceProviderKey {
    address: string;
    amount: number;
    serviceUrl: string;
    chains: string[];
    publicKey: string;
}

export interface SignedTransaction {
    hex: string;
    signedPayload: string;
}

export interface StakeTransactionSignatureRequest extends ServiceProviderKey {
    id: string;
    outputAddress: string;
    delegatorRewards: Record<string, string>;
}

export type SignedStakeTransaction = SignedTransaction & StakeTransactionSignatureRequest;

export interface OperationalFundsTransactionSignatureRequest {
    fromAddress: string;
    toAddress: string;
    amount: number;
    dependsOn: string;
}

export type SignedOperationalFundsTransaction = SignedTransaction & OperationalFundsTransactionSignatureRequest;

export interface CreateStakeTransactionParams {
    offer: StakeDistributionOffer;
    settings: ApplicationSettings;
    key: ServiceProviderKey;
    outputAddress: string;
}

export interface CreateOperationalFundsTransactionParams {
    offer: StakeDistributionOffer;
    stakeTransaction: SignedStakeTransaction;
}

export function createStakeTransaction(params: CreateStakeTransactionParams): StakeTransactionSignatureRequest {
    return {
        id: generateId(25),
        ...params.key,
        outputAddress: params.outputAddress,
        delegatorRewards: {
            [params.offer.delegatorRewardsAddress]: params.offer.fee,
            [params.settings.delegatorRewardsAddress]: params.settings.fee,
        },
    };
}

export function createOperationalFundsTransaction(params: CreateOperationalFundsTransactionParams): OperationalFundsTransactionSignatureRequest {
    return {
        fromAddress: params.stakeTransaction.outputAddress,
        toAddress: params.stakeTransaction.address,
        amount: params.offer.operationalFundsAmount,
        dependsOn: params.stakeTransaction.hex.slice(0, 200),
    };
}
