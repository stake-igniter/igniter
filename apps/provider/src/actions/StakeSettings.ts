"use server";

import {
  AddressGroup,
  Chain,
  KeyManagementStrategy,
  KeyManagementStrategyType,
} from "@/db/schema";
import { createAddressGroup } from "@/lib/dal/addressGroups";
import { updateApplicationSettings } from "@/lib/dal/applicationSettings";
import { insertChains } from "@/lib/dal/chains";
import { createKeyManagementStrategy } from "@/lib/dal/keyManagementStrategies";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateSettingsSchema = z.object({
  chains: z.array(z.string()).min(1, "Select at least one blockchain"),
  domain: z.string().min(1, "Domain is required"),
  defaultChains: z.array(z.string()).max(8, "Select up to 8 chains"),
  identity: z.string().min(1, "Identity is required"),
  pattern: z.string().min(1, "Pattern is required"),
});

interface StakeSettings {
  chains: string[];
  domain: string;
  defaultChains: string[];
  identity: string;
  pattern: string;
}

export async function upsertStakeSettings(values: StakeSettings) {
  const validatedFields = updateSettingsSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  const chainRecords = values.chains
    .map((chain) => {
      const regex = /^(?<name>.+?) \((?<chainId>.+?)\)$/;
      const chainParts = chain.match(regex);
      if (chainParts && chainParts.groups) {
        const { name, chainId } = chainParts?.groups;
        return { name, chainId };
      }
      return null;
    })
    .filter(Boolean);

  const insertedChains = await insertChains(chainRecords as Chain[]);
  const defaultChains = insertedChains
    .filter(
      (chain) =>
        values.defaultChains.findIndex((id) => id.includes(chain.chainId)) !==
        -1
    )
    .map((chain) => chain.chainId);

  const addressGroup = {
    identity: values.identity,
    domain: values.domain,
    pattern: values.pattern,
    defaultChains,
  } as AddressGroup;

  await createAddressGroup(addressGroup);

  const keyManagementStrategy = {
    weight: 1,
    addressGroupAssignment: addressGroup.identity,
    disabled: false,
    type: KeyManagementStrategyType.Dynamic,
  } as KeyManagementStrategy;
  await createKeyManagementStrategy(keyManagementStrategy);

  await revalidatePath("/admin/setup");
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}
