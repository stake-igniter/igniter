import {getEndpointInterpolatedUrl, Supplier, SupplierStakeRequest} from "@/lib/models/supplier";
import {list} from "@/lib/dal/addressGroups";
import {list as listServices} from '@/lib/dal/services'
import {createKeys} from "@/lib/services/keys";
import {ApplicationSettings, CreateKey} from "@/db/schema";
import {insertMany} from "@/lib/dal/keys";

type KeyDistributionItem = { numberOfKeys: number[] };

/**
 * Distributes a specified number of new items across groups with existing workloads.
 * Each new item is assigned to the group with the lowest current total workload.
 *
 * @param newItems A list of stake amounts, its length represents the total number of new keys to be created
 * @param groups Array of groups, each with an existing workload count
 * @returns Array of new item counts per group after distribution
 */
function calculateDistribution(
  newItems: number[],
  groups: { keysCount: number }[]
): KeyDistributionItem[] {
  const totalNewItems = newItems.length;
  const groupCount = groups.length;
  const newItemsPerGroup: KeyDistributionItem[] = Array.from(
    {length: groupCount},
    () => ({numberOfKeys: []})
  );


  if (groupCount === 0) {
    return newItemsPerGroup;
  }

  if (groupCount === 1) {
    newItemsPerGroup[0] = {numberOfKeys: newItems};
    return newItemsPerGroup;
  }

  if (!groups[0]) {
    return newItemsPerGroup;
  }

  for (let itemIndex = 0; itemIndex < totalNewItems; itemIndex++) {
    let lowestLoadGroupIndex = 0;
    let lowestTotalLoad = groups[0].keysCount + (newItemsPerGroup[0]?.numberOfKeys.length || 0);

    for (let groupIndex = 1; groupIndex < groupCount; groupIndex++) {
      const currentGroup = groups[groupIndex];
      if (!currentGroup) continue;

      const currentTotalLoad = currentGroup.keysCount + (newItemsPerGroup[groupIndex]?.numberOfKeys.length || 0);

      if (currentTotalLoad < lowestTotalLoad) {
        lowestTotalLoad = currentTotalLoad;
        lowestLoadGroupIndex = groupIndex;
      }
    }

    newItemsPerGroup[lowestLoadGroupIndex]?.numberOfKeys.push(newItems[itemIndex]!);
  }

  return newItemsPerGroup;
}

export async function getSupplierStakeConfigurations(
  stakeDistribution: SupplierStakeRequest,
  requestingDelegator: string,
  settings: ApplicationSettings,
): Promise<Supplier[]> {
  const addressGroups = await list(stakeDistribution.region);
  const services = await listServices();

  const totalNewSuppliers = stakeDistribution.items
    .reduce((allSuppliers, item) => {
      const newSuppliers = Array.from({length: item.qty}, () => item.amount);
      return allSuppliers.concat(newSuppliers);
    }, [] as number[]);

  const newSuppliersPerGroup = calculateDistribution(
    totalNewSuppliers,
    addressGroups,
  );

  const newSuppliersDistribution = addressGroups.map((addressGroup, index) => ({
    addressGroup,
    keys: newSuppliersPerGroup[index]!,
  }));

  const newSuppliersDistributionWithKeys = await Promise.all(newSuppliersDistribution.map(async (distribution) => ({
    addressGroup: distribution.addressGroup,
    amounts: distribution.keys.numberOfKeys,
    keys: await createKeys({
      addressGroupId: distribution.addressGroup.id,
      numberOfKeys: distribution.keys.numberOfKeys.length,
      willDeliverTo: requestingDelegator,
    }),
  })));

  const newCompleteSuppliersDistribution = newSuppliersDistributionWithKeys.map(item => ({
    ...item,
    suppliers: item.keys.map((key, index) => ({
      operatorAddress: key.address,
      stakeAmount: item.amounts[index]!.toString(),
      services: item.addressGroup.services?.map(serviceId => {
        const serviceItem = services.find(s => s.serviceId === serviceId);
        return {
          serviceId,
          revShare: [
            // Provider's fee for this service or the default
            {
              address: settings.delegatorRewardsAddress,
              revSharePercentage: serviceItem?.revSharePercentage ?? Number(settings.fee),
            },
            // Delegator Fee
            {
              address: stakeDistribution.delegatorAddress,
              revSharePercentage: stakeDistribution.revSharePercentage,
            },
            // Owner's share - Takes the rest
            {
              address: stakeDistribution.ownerAddress,
              revSharePercentage: 100 - stakeDistribution.revSharePercentage - (serviceItem?.revSharePercentage ?? Number(settings.fee)),
            }
          ],
          endpoints: serviceItem?.endpoints.map(endpoint => ({
            url: getEndpointInterpolatedUrl(endpoint, {
              sid: serviceId,
              ag: item.addressGroup.name,
              region: item.addressGroup.region,
              domain: item.addressGroup.domain!,
            }),
            rpcType: endpoint.rpcType,
            configs: [],
          })) || [],
        }
      }) || [],
    })),
  }))

  const newKeys = newSuppliersDistributionWithKeys.reduce((keys, item) => keys.concat(item.keys), [] as CreateKey[]);

  await insertMany(newKeys);

  return newCompleteSuppliersDistribution.reduce((suppliers, distribution) => {
    return suppliers.concat(distribution.suppliers);
  }, [] as Supplier[]);
}
