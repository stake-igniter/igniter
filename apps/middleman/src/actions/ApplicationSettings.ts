"use server";

import {ApplicationSettings, ChainId} from "@/db/schema";
import {
  getApplicationSettings as fetchApplicationSettings,
  insertApplicationSettings,
  updateApplicationSettings,
} from "@/lib/dal/applicationSettings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {getCurrentUserIdentity} from "@/lib/utils/actions";

const updateSettingsSchema = z.object({
  chainId: z.nativeEnum(ChainId),
  appIdentity: z.string().min(1, "App identity is required"),
  name: z.string().min(1, "Name is required"),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email(),
  fee: z.number()
    .min(1, "Provider fee must be greater than 0")
    .max(100).transform((value) => value.toString()),
  minimumStake: z.number(),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  delegatorRewardsAddress: z.string().min(1, "Delegator rewards address is required"),
  privacyPolicy: z.string().optional(),
});

export async function getApplicationSettings() {
  return await fetchApplicationSettings();
}

export async function upsertSettings(
  values: Partial<ApplicationSettings>,
  isUpdate: boolean
) {
  const userIdentity = await getCurrentUserIdentity();

  const validatedFields = updateSettingsSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  if (isUpdate) {
    await updateApplicationSettings({
      ...validatedFields.data,
      updatedBy: userIdentity,
    });
  } else {
    await insertApplicationSettings({
      ...validatedFields.data,
      createdBy: userIdentity,
      updatedBy: userIdentity,
    });
  }

  revalidatePath("/admin/setup");
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}
