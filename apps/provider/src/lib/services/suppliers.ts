import {getEndpointInterpolatedUrl, Supplier, SupplierStakeRequest} from "@/lib/models/supplier";
import {list} from "@/lib/dal/addressGroups";
import {list as listServices} from '@/lib/dal/services'
import {createKeys} from "@/lib/services/keys";
import {insertNewKeys, lockAvailableKeys, markAvailable, markKeysDelivered} from "@/lib/dal/keys";
import {getRevShare} from "@/lib/utils/services";
import {db} from "@/db";

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
): Promise<Supplier[]> {
    const allGroups = await list(undefined, stakeDistribution.region);
    const linked = allGroups.filter(g =>
        g.linkedAddresses?.includes(stakeDistribution.ownerAddress)
    );
    const addressGroups = linked.length
        ? linked
        : allGroups.filter(g => !g.private);

    const services = await listServices();

    const totalAmounts = stakeDistribution.items.flatMap(i =>
        Array(i.qty).fill(i.amount)
    );
    const perGroup = calculateDistribution(totalAmounts, addressGroups);
    const slotsByGroup = addressGroups.map((grp, i) => ({
        addressGroup: grp,
        slots: perGroup[i]!.numberOfKeys,
    }));

    let allocation: {
        addressGroup: typeof addressGroups[0];
        slots: number[];
        keys: { address: string }[];
    }[];

    try {
        allocation = await db.transaction(async (tx) => {
            const results  = [];

            for (const { addressGroup, slots } of slotsByGroup) {
                const needed = slots.length;

                const avail = await lockAvailableKeys(tx as any, addressGroup.id, needed);

                const reused = await markKeysDelivered(
                    tx as any,
                    avail.map(k => k.id),
                    requestingDelegator
                );

                const toCreate = needed - reused.length;
                let created: typeof reused = [];
                if (toCreate > 0) {
                    const newRows = await createKeys({
                        addressGroupId: addressGroup.id,
                        willDeliverTo: requestingDelegator,
                        numberOfKeys: toCreate,
                        ownerAddress: stakeDistribution.ownerAddress,
                    });
                    created = await insertNewKeys(tx as any, newRows);
                }

                results.push({
                    addressGroup,
                    slots,
                    keys: [...reused, ...created],
                });
            }

            return results;
        });
    } catch (error) {
        const {message} = error as Error;
        throw new Error(`Failed to allocate keys: ${message}`);
    }

    const suppliers: Supplier[] = [];

    for (const { addressGroup, slots, keys } of allocation) {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]!;
            const stakeAmount = slots[i]!.toString();

            const svcConfigs = addressGroup.addressGroupServices ?? [];
            const supplierServices = svcConfigs.map(cfg => {
                const svc = services.find(s => s.serviceId === cfg.serviceId)!;
                const revShare = getRevShare(cfg, key.address);
                revShare.push({
                    address: stakeDistribution.delegatorAddress,
                    revSharePercentage: stakeDistribution.revSharePercentage,
                });
                const ownerPct =
                    100 - revShare.reduce((sum, r) => sum + r.revSharePercentage, 0);
                revShare.push({
                    address: stakeDistribution.ownerAddress,
                    revSharePercentage: ownerPct,
                });

                return {
                    serviceId: cfg.serviceId,
                    revShare,
                    endpoints: svc.endpoints.map(ep => ({
                        url: getEndpointInterpolatedUrl(ep, {
                            sid: svc.serviceId,
                            rm: addressGroup.relayMiner.identity,
                            region: addressGroup.relayMiner.region.urlValue,
                            domain: addressGroup.relayMiner.domain,
                        }),
                        rpcType: ep.rpcType,
                        configs: [],
                    })),
                };
            });

            suppliers.push({
                operatorAddress: key.address,
                stakeAmount,
                services: supplierServices,
            });
        }
    }

    return suppliers;
}

export async function releaseDeliveredSuppliers(addresses: string[], requestingDelegator: string) {
  return markAvailable(addresses, requestingDelegator);
}
