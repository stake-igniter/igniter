import { proxyActivities } from "@temporalio/workflow";
import { createActivities } from "../activities";

export interface ProviderStatusArgs {}

export async function ProviderStatus(args: ProviderStatusArgs) {
  const { getProviders, fetchProviderStatus, updateProvidersStatus } =
    proxyActivities<ReturnType<typeof createActivities>>({
      startToCloseTimeout: "30s",
      retry: {
        maximumAttempts: 3,
      },
    });

  const providers = await getProviders();
  const providerStatus = await fetchProviderStatus(providers);

  await updateProvidersStatus(providerStatus);

  return providerStatus;
}
