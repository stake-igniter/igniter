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
import urlJoin from 'url-join'

const updateSettingsSchema = z.object({
  updatedAtHeight: z.string().optional(),
  appIdentity: z.string().min(1, "App identity is required").optional(),
  name: z.string().min(1, "Name is required").optional(),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email().optional(),
  fee: z.number()
    .min(1, "Provider fee must be greater than 0")
    .max(100).transform((value) => value.toString()).optional(),
  minimumStake: z.number().optional(),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required").optional(),
  delegatorRewardsAddress: z.string().min(1, "Delegator rewards address is required").optional(),
  privacyPolicy: z.string().optional(),
});

const CreateSettingsSchema = z.object({
  minimumStake: z.number().min(1),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  appIdentity: z.string().min(1, "App identity is required"),
  chainId: z.nativeEnum(ChainId),
  updatedAtHeight: z.string(),
})

export async function getApplicationSettings() {
  return await fetchApplicationSettings();
}

export async function upsertSettings(
  values: Partial<ApplicationSettings>,
  isUpdate: boolean
) {
  const userIdentity = await getCurrentUserIdentity();

  const schema = isUpdate ? updateSettingsSchema : CreateSettingsSchema;
  const validatedFields = schema.safeParse(values);

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
      delegatorRewardsAddress: '',
    });
  }

  revalidatePath("/admin/setup");
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}

export interface BlockchainSettingsResponse {
  success: boolean;
  errors?: string[];
  network?: string;
  height?: string;
  minStake?: number;
}

export async function RetrieveBlockchainSettings(url: string, updatedAtHeight: string | null) : Promise<BlockchainSettingsResponse> {
  const errors: string[] = [];
  const supplierParamsUrl = urlJoin(url, "pokt-network/poktroll/supplier/params");
  const supplierParamsResponse = await fetch(supplierParamsUrl);

  if (!supplierParamsResponse.ok) {
    throw new Error("Failed to fetch supplier params");
  }

  const supplierParams = await supplierParamsResponse.json();
  const minStake = parseFloat(supplierParams.params.min_stake.amount) / 1e6;

  const nodeInfoUrl = urlJoin(url, "cosmos/base/tendermint/v1beta1/node_info");
  const nodeInfoResponse = await fetch(nodeInfoUrl);

  if (!nodeInfoResponse.ok) {
    throw new Error("Failed to fetch node info");
  }

  const nodeInfo = await nodeInfoResponse.json();
  const network = nodeInfo.default_node_info.network;

  const statusUrl = urlJoin(url, "cosmos/base/node/v1beta1/status");
  const statusResponse = await fetch(statusUrl);

  if (!statusResponse.ok) {
    throw new Error("Failed to fetch chain status (height)");
  }

  const statusResult = await statusResponse.json();
  const newHeightStr: string = statusResult.height;
  const newHeight = parseInt(newHeightStr, 10);

  if (updatedAtHeight) {
    if (newHeight.toString() < updatedAtHeight) {
      errors.push(`Retrieved height (${newHeight}) is lower than the current stored height (${updatedAtHeight}).`);
      return {
        success: false,
        errors,
      };
    }
  }

  return {
    success: true,
    errors,
    network,
    height: newHeightStr,
    minStake,
  }
}
