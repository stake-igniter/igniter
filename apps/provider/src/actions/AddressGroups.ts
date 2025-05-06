"use server";

import type {AddressGroup, CreateAddressGroup, CreateService, Service} from "@/db/schema";
import {insert, list, remove, update} from "@/lib/dal/addressGroups";

export async function CreateAddressGroup(addressGroup: CreateAddressGroup) {
  return insert(addressGroup);
}

export async function UpdateAddressGroup(id: number, addressGroup: Pick<AddressGroup, 'name' | 'clients' | 'region'>) {
  return update(id, addressGroup);
}

export async function ListAddressGroups() {
  return list();
}

export async function DeleteAddressGroup(id: number) {
  return remove(id);
}
