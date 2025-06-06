"use server";

import {getApplicationSettings} from "@/actions/ApplicationSettings";
import {listProviders} from "@/actions/Providers";
import {StakeDistributionItem, StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {SignedTransaction} from "@/lib/models/Transactions";
import {CreateTransaction, ProviderFee, TransactionStatus, TransactionType} from "@/db/schema";
import {insert} from "@/lib/dal/transaction";
import {getCurrentUserIdentity} from "@/lib/utils/actions";

export interface CreateStakeTransactionRequest {
  offer: StakeDistributionOffer;
  transaction: SignedTransaction;
}

export async function CalculateStakeDistribution(stakeAmount: number): Promise<StakeDistributionOffer[]> {
  const applicationSettings = await getApplicationSettings();
  const providers = await listProviders();

  const availableNodeSizes = [applicationSettings.minimumStake];

  return providers.map(provider => {
    let distribution: StakeDistributionItem[] = [];

    if (provider.enabled && provider.delegatorRewardsAddress && provider.operationalFunds && provider.minimumStake) {
      const allowedSizes = availableNodeSizes.filter(amount => amount >= provider.minimumStake);

      let remaining = stakeAmount;

      distribution = allowedSizes.reduce((acc: StakeDistributionItem[], nodeAmount: number) => {
        if (remaining <= 0) return acc;
        const qty = Math.floor(remaining / nodeAmount);
        if (qty > 0) {
          acc.push({ amount: nodeAmount, qty });
          remaining -= qty * nodeAmount;
        }
        return acc;
      }, []);

      if (remaining !== 0) {
        distribution = [];
      }
    }

    return {
      id: provider.id,
      identity: provider.identity,
      name: provider.name,
      fee: provider.fee || '',
      feeType: provider.feeType || ProviderFee.Fixed,
      publicKey: provider.publicKey,
      regions: provider.regions || [],
      rewards: 'N/A',
      delegatorRewardsAddress: provider.delegatorRewardsAddress || '',
      operationalFundsAmount: provider.operationalFunds,
      stakeDistribution: distribution
    };
  });
}

export async function CreateStakeTransaction(request: CreateStakeTransactionRequest) {
  const userIdentity = await getCurrentUserIdentity();

  const creatingTransaction: CreateTransaction = {
    type: TransactionType.Stake,
    status: TransactionStatus.Pending,
    signedPayload: request.transaction.signedPayload,
    fromAddress: request.transaction.address,
    unsignedPayload: request.transaction.unsignedPayload,
    providerFee: Number(request.offer.fee),
    providerId: request.offer.identity,
    estimatedFee: request.transaction.estimatedFee,
    consumedFee: 0,
    typeProviderFee: request.offer.feeType,
    createdBy: userIdentity,
  };

  return insert(creatingTransaction);
}

