"use server";

import {getApplicationSettings} from "@/actions/ApplicationSettings";
import {ListProviders} from "@/actions/Providers";
import {StakeDistributionItem, StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {SignedMemo, SignedMemoPayload, SignedTransaction} from '@igniter/ui/models';
import {ApplicationSettings, CreateTransaction, ProviderFee, TransactionStatus, TransactionType} from "@/db/schema";
import {insert} from "@/lib/dal/transaction";
import {getCurrentUserIdentity} from "@/lib/utils/actions";
import {getCompressedPublicKeyFromAppIdentity, signPayload} from "@/lib/crypto";

export interface CreateStakeTransactionRequest {
  offer: StakeDistributionOffer;
  transaction: SignedTransaction;
}

export interface CreateSignedMemoRequest {
  settings: ApplicationSettings;
}

export async function CalculateStakeDistribution(stakeAmount: number): Promise<StakeDistributionOffer[]> {
  const applicationSettings = await getApplicationSettings();
  const providers = await ListProviders();

  const availableNodeSizes = [applicationSettings.minimumStake];

  return providers.map(provider => {
    let distribution: StakeDistributionItem[] = [];

    if (provider.enabled && provider.operationalFunds && provider.minimumStake) {
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
      fee: provider.fee!,
      feeType: provider.feeType || ProviderFee.Fixed,
      regions: provider.regions || [],
      rewards: 'N/A',
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

export async function CreateSignedMemo(request: CreateSignedMemoRequest) : Promise<SignedMemo> {
  const signedMemoPayload: SignedMemoPayload = {
    t: new Date().toISOString(),
    a: request.settings.delegatorRewardsAddress!,
    f: request.settings.fee?.toString() ?? '',
  };

  const canonicalPayload = JSON.stringify(
    Object.fromEntries(Object.entries(signedMemoPayload).sort())
  );

  const signature = await signPayload(JSON.stringify(canonicalPayload));

  const publicKey = await getCompressedPublicKeyFromAppIdentity();

  return {
    ...signedMemoPayload,
    s: signature.toString('base64url'),
    p: publicKey.toString('base64url'),
  };
}
