"use server";

import type {InsertService, Service} from "@igniter/db/provider/schema";
import {insert, list, remove, update} from "@/lib/dal/services";
import {getCurrentUserIdentity} from "@/lib/utils/actions";
import { validRpcTypes } from '@/lib/constants'

export async function CreateService(service: Omit<InsertService, 'createdBy' | 'updatedBy'>) {
  const userIdentity = await getCurrentUserIdentity();

  for (const endpoint of service.endpoints) {
    if (!validRpcTypes.includes(endpoint.rpcType)) {
      throw new Error(`Invalid RPC type: ${endpoint.rpcType}`);
    }
  }

  return insert({
    ...service,
    createdBy: userIdentity,
    updatedBy: userIdentity,
  });
}

export async function UpdateService(id: string, service: Pick<Service, 'revSharePercentage' | 'endpoints'>) {
  const userIdentity = await getCurrentUserIdentity();

  for (const endpoint of service.endpoints) {
    if (!validRpcTypes.includes(endpoint.rpcType)) {
      throw new Error(`Invalid RPC type: ${endpoint.rpcType}`);
    }
  }

  return update(id, {
    ...service,
    updatedBy: userIdentity,
  });
}

export async function GetByServiceId(id: string) {
  const [service] = await list([id]);
  return service;
}

export async function ListServices() {
  return list();
}

export async function DeleteService(id: string) {
  return remove(id);
}
