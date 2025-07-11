"use server";

import type { RelayMiner, CreateRelayMiner as CreateRelayMinerType } from "@/db/schema";
import { list, remove, insert, update } from "@/lib/dal/relayMiners";
import { getCurrentUserIdentity } from "@/lib/utils/actions";

export async function ListRelayMiners() {
  return list();
}

export async function DeleteRelayMiner(id: number) {
  return remove(id);
}

export async function CreateRelayMiner(relayMiner: Omit<CreateRelayMinerType, 'createdBy' | 'updatedBy'>) {
  const identity = await getCurrentUserIdentity();
  return insert({
    ...relayMiner,
    createdBy: identity,
    updatedBy: identity,
  });
}

export async function UpdateRelayMiner(id: number, relayMiner: Pick<RelayMiner, 'name' | 'identity' | 'regionId' | 'domain'>) {
  const identity = await getCurrentUserIdentity();
  return update(id, {
    ...relayMiner,
    updatedBy: identity,
  });
}
