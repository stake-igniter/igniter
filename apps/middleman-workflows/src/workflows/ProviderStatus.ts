import { proxyActivities } from "@temporalio/workflow";
import { createActivities } from "../activities";

export interface ProviderStatusArgs {}

export async function ProviderStatus(args: ProviderStatusArgs) {
  const { listProviders, fetchProviderStatus, updateProviders } =
    proxyActivities<ReturnType<typeof createActivities>>({
      startToCloseTimeout: "30s",
      retry: {
        maximumAttempts: 3,
      },
    });

  const providers = await listProviders();
  const providerStatus = await fetchProviderStatus(providers);

  await updateProviders(providerStatus);

  return providerStatus;
}
