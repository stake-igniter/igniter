"use server";
import { SiwpMessage } from "@poktscan/vault-siwp";
import { createUser } from "@/lib/dal";

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

const createUserAndSignIn = async (prevState: any, formData: any) => {
  const address = formData.get("address");
  await createUser(address);
  return true;
};

export { getSiwpMessage, createUserAndSignIn };
