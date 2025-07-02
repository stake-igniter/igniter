"use server";

import type {
    AddressGroup,
    CreateAddressGroup,
    AddressGroupService,
} from "@/db/schema";
import { insert, list, remove, simpleList, update } from '@/lib/dal/addressGroups'
import {getCurrentUserIdentity} from "@/lib/utils/actions";

export async function CreateAddressGroup(addressGroup: Omit<CreateAddressGroup, 'createdBy' | 'updatedBy'>, services: Omit<AddressGroupService, 'addressGroupId' | 'service'>[]) {
  const identity = await getCurrentUserIdentity();
  return insert(
    {
      ...addressGroup,
      createdBy: identity,
      updatedBy: identity,
    },
    services,
  );
}

export async function UpdateAddressGroup(id: number, addressGroup: Pick<AddressGroup, 'name' | 'linkedAddresses' | 'private' | 'relayMinerId'>, services: Omit<AddressGroupService, 'addressGroupId' | 'service'>[]) {
  const identity = await getCurrentUserIdentity();
  return update(
    id,
    {
      ...addressGroup,
      updatedBy: identity,
    },
    services,
  );
}

export async function ListAddressGroups() {
  return list();
}

export async function ListBasicAddressGroups() {
  return simpleList()
}

export async function DeleteAddressGroup(id: number) {
  return remove(id);
}
