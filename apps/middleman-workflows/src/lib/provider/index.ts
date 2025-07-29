import { signPayload } from "@/lib/crypto";
import {Provider, ProviderStatus} from "@/lib/db/schema";
import {getApplicationSettingsFromDatabase} from "@/lib/dal/applicationSettings";
import {REQUEST_IDENTITY_HEADER, REQUEST_SIGNATURE_HEADER} from "@/lib/constants";
import urlJoin from "url-join";

export class ProviderService {
    /**
     * Fetches the status of a single provider
     * @param provider The provider to check status for
     * @param signature
     * @param identity
     * @returns The provider status information
     */
    async status(provider: Provider, signature: string, identity: string) {
        try {
            const STATUS_URL = urlJoin(provider.url, `/api/status`);
            const status = await fetch(STATUS_URL, {
                method: "POST",
                body: JSON.stringify({}),
                headers: {
                    "Content-Type": "application/json",
                    [REQUEST_IDENTITY_HEADER]: identity,
                    [REQUEST_SIGNATURE_HEADER]: signature,
                },
            });

            const { healthy, ...statusProps } = await status.json();

            if (healthy) {
                return {
                    ...statusProps,
                    id: provider.id,
                    status: ProviderStatus.Healthy,
                };
            } else {
                return {
                    id: provider.id,
                    status: ProviderStatus.Unhealthy,
                };
            }
        } catch (error) {
            console.error("Error fetching provider status:", error);
            return {
                id: provider.id,
                status: ProviderStatus.Unreachable,
            };
        }
    }

    /**
     * Marks a list of addresses as staked with the provider
     * @param addresses List of addresses to mark as staked
     * @param provider
     * @returns Result of the staking operation
     */
    async markStaked(addresses: string[], provider: Provider) {
        const { identity, signature } = await this.signPayload(JSON.stringify({ addresses }));

        try {
            const STAKE_URL = `${provider.url}/api/suppliers/stake`;
            const operationResponse = await fetch(STAKE_URL, {
                method: "POST",
                body: JSON.stringify({ addresses }),
                headers: {
                    "Content-Type": "application/json",
                    [REQUEST_IDENTITY_HEADER]: identity,
                    [REQUEST_SIGNATURE_HEADER]: signature,
                },
            });

            if (!operationResponse.ok) {
                throw new Error(`Error marking the suppliers as staked: ${operationResponse.statusText}`);
            }
        } catch (error) {
            console.error("An error occurred while marking the suppliers as staked.", error);
        }
    }

    async signPayload(payload: string) {
        let identity: string;
        let signature: string;

        try {
            const applicationSettings = await getApplicationSettingsFromDatabase();
            identity = applicationSettings?.appIdentity ?? '';
        } catch (error) {
            throw new Error("Unable to load the application settings and determine the identity of the app");
        }

        try {
            const signatureBuffer = await signPayload(payload);
            signature = signatureBuffer.toString('base64');
            return { identity, signature };
        } catch (error) {
            console.error(error);
            throw new Error('Unable to sign the payload.');
        }
    }
}

export const providerServiceInstance = new ProviderService();
