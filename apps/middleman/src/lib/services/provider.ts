import urlJoin from "url-join";
import { StakeDistributionOffer } from "@/lib/models/StakeDistributionOffer";
import {ServiceProviderKey} from "@/lib/models/Transactions";

export async function requestKeys(stakeOffer: StakeDistributionOffer): Promise<ServiceProviderKey[]> {
    try {
        const response = await fetch(urlJoin(stakeOffer.url, "/api/keys"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(stakeOffer.stakeDistribution),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody?.error || "Failed to request keys");
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to request keys:", error);
        throw error;
    }
}
