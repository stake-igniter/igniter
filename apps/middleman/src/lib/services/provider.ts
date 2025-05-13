import { StakeDistributionOffer } from "@/lib/models/StakeDistributionOffer";
import {SupplierStake} from "@/lib/models/Transactions";
import {ApplicationSettings} from "@/db/schema";

export async function requestSuppliers(stakeOffer: StakeDistributionOffer, settings: ApplicationSettings, ownerAddress: string, region: string = ''): Promise<SupplierStake[]> {
    try {
        const response = await fetch("/api/provider-rpc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider: stakeOffer.publicKey,
                path: "/api/suppliers",
                data: {
                    region,
                    delegatorAddress: settings.delegatorRewardsAddress,
                    revSharePercentage: Number(settings.fee),
                    items: stakeOffer.stakeDistribution,
                    ownerAddress,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody?.error || "Failed to request keys");
        }

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to request keys:", error);
        throw error;
    }
}
