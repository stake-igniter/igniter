import {DirectSecp256k1Wallet} from "@cosmjs/proto-signing";
import { fromHex, toUtf8 } from '@cosmjs/encoding';
import { Secp256k1, sha256 } from '@cosmjs/crypto';

/**
 * Signs the given payload string using secp256k1 and the APP_IDENTITY private key from the environment.
 * The APP_IDENTITY must be a 64-character hex string (32 bytes).
 * @param payload
 */
export async function signPayload(payload: string) {
  const appIdentity = process.env.APP_IDENTITY;

  if (!appIdentity) {
    throw new Error("APP_IDENTITY environment variable is not defined.");
  }

  const privateKeyBytes = fromHex(appIdentity);
  const messageHash = sha256(toUtf8(payload));
  const signature = await Secp256k1.createSignature(messageHash, privateKeyBytes);
  return Buffer.from(signature.toFixedLength());
}

export async function getCompressedPublicKeyFromAppIdentity() : Promise<Buffer> {
  const appIdentity = process.env.APP_IDENTITY!;
  const privateKeyBytes = Buffer.from(appIdentity, 'hex');
  const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes);
  const [account] = await wallet.getAccounts();

  if (!account) {
    throw new Error("Failed while trying to get the public key");
  }

  return Buffer.from(account.pubkey);
}

