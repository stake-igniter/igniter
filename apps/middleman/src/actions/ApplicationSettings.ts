"use server";

import {ApplicationSettings, ChainId, UserRole} from "@/db/schema";
import {
  getApplicationSettings as fetchApplicationSettings,
  insertApplicationSettings,
  updateApplicationSettings,
} from "@/lib/dal/applicationSettings";
import { redirect } from "next/navigation";
import { z } from "zod";
import {getCurrentUser} from "@/lib/utils/actions";
import urlJoin from 'url-join'
import { getServerApolloClient } from '@igniter/ui/graphql/server'
import { indexerStatusDocument } from '@igniter/graphql'
import {env} from "@/config/env";
import { revalidateTag, unstable_cache } from 'next/cache'
import { getShortAddress } from '@igniter/ui/lib/utils'

const UrlSchema = z.string().url("Please enter a valid URL").min(1, "URL is required")

const UpdateSettingsSchema = z.object({
  updatedAtHeight: z.string().optional(),
  appIdentity: z.string().min(1, "App identity is required").optional(),
  name: z.string().min(1, "Name is required").optional(),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email().optional(),
  fee: z.number()
    .min(0, "Provider fee must be greater than or equal to 0")
    .max(100).transform((value) => value.toString()).optional(),
  minimumStake: z.number().optional(),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required").optional(),
  indexerApiUrl: UrlSchema.optional(),
  delegatorRewardsAddress: z.string().min(1, "Delegator rewards address is required").optional(),
  privacyPolicy: z.string().optional(),
});

const CreateSettingsSchema = z.object({
  minimumStake: z.number().min(1),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  indexerApiUrl: UrlSchema,
  appIdentity: z.string().min(1, "App identity is required"),
  chainId: z.nativeEnum(ChainId),
  updatedAtHeight: z.string(),
})

const getAppName = unstable_cache(
  async () => {
    const appSettings = await fetchApplicationSettings();

    return appSettings.name;
  },
  undefined,
  {tags: ['appName']}
)

export async function GetAppName() {
  let appName = await getAppName();

  if (!appName) {
    appName = await fetchApplicationSettings().then(appSettings => appSettings.name)
  }

  return appName || 'Stake Igniter';
}

export async function getApplicationSettings() {
  const applicationSettings = await fetchApplicationSettings();

  return  {
    ...applicationSettings,
    appIdentity: getShortAddress(applicationSettings.appIdentity, 10),
  };
}

function ValidateWithSchema(schema: z.ZodSchema, data: Partial<ApplicationSettings>) {
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
  const user = await getCurrentUser();
  const userIdentity= user.identity;

  if (user.role !== UserRole.Owner) {
    // TODO: Allow for more granular changes when actual `Admin` users are allowed.
    throw new Error("Unauthorized");
  }

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

  revalidateTag('appName');
}

export async function completeSetup() {
  const user = await getCurrentUser();
  const userIdentity= user.identity;

  if (user.role !== UserRole.Owner) {
    // TODO: Allow for more granular changes when actual `Admin` users are allowed.
    throw new Error("Unauthorized");
  }

  await updateApplicationSettings({ isBootstrapped: true, updatedBy: userIdentity });
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
  const minStake = (parseFloat(supplierParams.params.min_stake.amount) + env.MINIMUM_STAKE_BUFFER) / 1e6;

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
    if (Number(newHeight) < Number(updatedAtHeight)) {
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

export async function RetrieveIndexerNetwork(url: string) {
  const client = getServerApolloClient(url)

  const {data} = await client.query({
    query: indexerStatusDocument,
  })

  return data?.status?.chain || ''
}

export async function ValidateBlockchainRPC(url: string) {
  const currentSettings = await getApplicationSettings();
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

export async function ValidateIndexerUrl(url: string) {
  const [currentSettings, indexerNetwork] = await Promise.all([
    getApplicationSettings(),
    RetrieveIndexerNetwork(url),
  ]);

  if (currentSettings.chainId !== indexerNetwork) {
    return {
      success: false,
      errors: ["Chain does not match the current configured chain"],
    };
  }

  return {
   success: true,
  }
}
