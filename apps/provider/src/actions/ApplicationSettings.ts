"use server";

import {ApplicationSettings, ChainId} from "@/db/schema";
import {
  getApplicationSettings as fetchApplicationSettings,
  insertApplicationSettings,
  updateApplicationSettings,
} from "@/lib/dal/applicationSettings";
import { redirect } from "next/navigation";
import { z } from "zod";
import {getCurrentUserIdentity} from "@/lib/utils/actions";
import urlJoin from "url-join";

const UpdateSettingsSchema = z.object({
  name: z.string().optional(),
  appIdentity: z.string().min(1, "App identity is required").optional(),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email().optional(),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required").optional(),
  minimumStake: z.number().optional(),
  updatedAtHeight: z.string().optional(),
});

const CreateSettingsSchema = z.object({
  minimumStake: z.number().min(1),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  appIdentity: z.string().min(1, "App identity is required"),
  chainId: z.nativeEnum(ChainId),
  updatedAtHeight: z.string(),
})

export async function GetApplicationSettings() {
  return await fetchApplicationSettings();
}

function ValidateWithSchema(schema: z.ZodSchema<any>, data: Partial<ApplicationSettings>) {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.message);
  }

  return validation;
}

export async function UpsertApplicationSettings(
  values: Partial<ApplicationSettings>,
  isUpdate: boolean
) {
  const userIdentity = await getCurrentUserIdentity();
  const validatedFields = ValidateWithSchema(isUpdate ? UpdateSettingsSchema : CreateSettingsSchema, values);
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

export interface ValidateBlockchainRPCResponse {
  success: boolean;
  errors?: string[];
}

export async function ValidateBlockchainRPC(url: string) {
  const currentSettings = await GetApplicationSettings();
  const {success, network, errors} = await RetrieveBlockchainSettings(url, currentSettings.updatedAtHeight);
  if (!success) {
    return {
      success: false,
      errors,
    };
  }

  if (network !== currentSettings.chainId) {
    return {
      success: false,
      errors: ["Chain does not match the current configured chain"],
    };
  }

  return {
    success: true,
  };
}
