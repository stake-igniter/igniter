"use server";

import {getApplicationSettings} from "@/actions/ApplicationSettings";
import {listProviders} from "@/actions/Providers";
import {NodeStakeDistributionItem, StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {
  BlockchainProtocol,
} from "@/db/schema";
import {CreateStakeActivityRequest} from "@/lib/models/Activities";
import {createStakeActivity} from "@/lib/dal/activity";

export async function CalculateStakeDistribution(stakeAmount: number): Promise<StakeDistributionOffer[]> {
  const applicationSettings = await getApplicationSettings();
  const providers = await listProviders();

  if (applicationSettings.blockchainProtocol == BlockchainProtocol.Shannon) {
    // TODO: Shannon calculation is to be defined.
    return [];
  }

  const availableNodeSizes = [60000, 45000, 30000, 15000];

  return providers.map(provider => {
    let distribution: NodeStakeDistributionItem[] = [];

    if (provider.enabled && provider.delegatorRewardsAddress && provider.operationalFunds && provider.minimumStake) {
      const allowedSizes = availableNodeSizes.filter(amount => amount >= provider.minimumStake);

      let remaining = stakeAmount;

      distribution = allowedSizes.reduce((acc: NodeStakeDistributionItem[], nodeAmount: number) => {
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
      name: provider.name,
      fee: provider.fee,
      url: provider.url,
      rewards: 'N/A',
      delegatorRewardsAddress: provider.delegatorRewardsAddress || '',
      operationalFundsAmount: provider.operationalFunds,
      stakeDistribution: distribution
    };
  });
}

export async function CreateStakeActivity(request: CreateStakeActivityRequest) {
  return createStakeActivity(request);
}

