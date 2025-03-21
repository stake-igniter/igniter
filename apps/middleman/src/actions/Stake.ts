import {NodeStakeDistributionItem, StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {getApplicationSettings} from "@/actions/ApplicationSettings";
import {BlockchainProtocol} from "@/db/schema";
import {listProviders} from "@/actions/Providers";

export async function CalculateStakeDistribution(stakeAmount: number): Promise<StakeDistributionOffer[]> {
  const applicationSettings = await getApplicationSettings();
  const providers = await listProviders();

  if (applicationSettings.blockchainProtocol == BlockchainProtocol.Shannon) {
    // TODO: Shannon calculation is to be defined.
    return [];
  }

  // Allowed node sizes in descending order.
  const availableNodeSizes = [60000, 45000, 30000, 15000];

  return providers.map(provider => {
    let distribution: NodeStakeDistributionItem[] = [];
    let disqualificationReasons: string[] = [];

    // Only attempt distribution if provider is enabled.
    if (provider.enabled) {
      // Filter allowed node sizes based on the provider's minimum stake.
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
        disqualificationReasons = [`Remaining Stake amount: ${remaining}`];
        distribution = [];
      }
    }

    return {
      id: provider.id,
      name: provider.name,
      fee: provider.fee,
      rewards: 'N/A',
      disqualificationReasons,
      stakeDistribution: distribution
    };
  });
}
