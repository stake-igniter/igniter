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
  name: z.string().min(1, "Name is required"),
  appIdentity: z.string().uuid().min(1, "App identity is required"),
  supportEmail: z.string().email().optional(),
  domain: z.string()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)+.*)$/,
      "Invalid domain format. Ensure it's a valid domain name."
    ).min(1, "Domain is required"),
  fee: z.number()
    .min(1, "Provider fee must be greater than 0")
    .max(100).transform((value) => value.toString()),
  delegatorRewardsAddress: z.string().refine(
    (value) => value.toLowerCase().startsWith('pokt') && value.length === 43,
    (val) => ({ message: `${val} is not a valid address` })
  ),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  minimumStake: z.number().min(15000, "Minimum stake is required").default(15000),
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
    console.error(validatedFields.error);
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

  await revalidatePath("/admin/setup");
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}
