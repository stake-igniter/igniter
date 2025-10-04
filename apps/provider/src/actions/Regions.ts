"use server";

import type { Region, InsertRegion } from "@igniter/db/provider/schema";
import { list, remove, insert, update } from "@/lib/dal/regions";
import { getCurrentUserIdentity } from "@/lib/utils/actions";

export async function ListRegions() {
    return list();
}

export async function DeleteRegion(id: number) {
    return remove(id);
}

export async function CreateRegion(region: Omit<InsertRegion, 'createdBy' | 'updatedBy'>) {
    const identity = await getCurrentUserIdentity();
    return insert({
        ...region,
        createdBy: identity,
        updatedBy: identity,
    });
}

export async function UpdateRegion(id: number, region: Pick<Region, 'displayName' | 'urlValue'>) {
    const identity = await getCurrentUserIdentity();
    return update(id, {
        ...region,
        updatedBy: identity,
    });
}
