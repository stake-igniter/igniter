"use server";
import { SiwpMessage } from "@poktscan/vault-siwp";

const getSiwpMessage = async (
  address: string,
  chain: string,
  domain: string,
  uri: string,
  csrfToken: string
) => {
  try {
    const message = new SiwpMessage({
      domain,
      address,
      uri,
      statement: "Sign in with POKT to the app.",
      version: "1",
      chainId: chain.toLowerCase(),
      nonce: csrfToken,
    });

    return message;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export { getSiwpMessage };
