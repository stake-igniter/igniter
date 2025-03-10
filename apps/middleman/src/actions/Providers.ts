"use server";

interface ProvidersResponse {
  items: Provider[];
}

export interface Provider {
  id: string;
  name: string;
  publicKey: string;
  url: string;
}

export async function loadProvidersFromCdn(): Promise<Provider[]> {
  const url = process.env.PROVIDERS_CDN_URL;

  if (!url) {
    throw new Error("PROVIDERS_CDN_URL is not defined");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch providers from CDN: ${response.statusText}`
      );
    }
    const parsedResponse: ProvidersResponse = await response.json();
    return parsedResponse.items;
  } catch (error) {
    console.error("Error loading providers from CDN:", error);
    return [];
  }
}
