"use server";

import {getApplicationSettings} from "@/actions/ApplicationSettings";
import {listProviders} from "@/actions/Providers";
import {StakeDistributionItem, StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {CreateStakeActivityRequest} from "@/lib/models/Activities";
import {createStakeActivity} from "@/lib/dal/activity";

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
          acc.push({ amount: nodeAmount, qty, revShare: applicationSettings.fee });
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
      publicKey: provider.publicKey,
      regions: provider.regions || [],
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

