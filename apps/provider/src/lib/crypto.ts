import crypto from "crypto";
import {Secp256k1, Secp256k1Signature, sha256} from '@cosmjs/crypto';
import {toUtf8} from "@cosmjs/encoding";
import {DirectSecp256k1Wallet} from "@cosmjs/proto-signing";
import {env} from "@/config/env";

const algorithm = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = Buffer.from(process.env.ENCRYPTION_IV!, "hex");
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Verifies a secp256k1/ECDSA signature (DER‐encoded) against the given payload.
 *
 * @param payload       The original message (string)
 * @param publicKeyStr  The compressed public key (33‑byte) in base64 or hex
 * @param signatureStr  The DER‑encoded ECDSA signature in base64 or hex
 * @param encoding      'hex' or 'base64' (default: 'base64')
 * @returns             true if the signature is valid, false otherwise
 */
export async function verifySignature(
  payload: string,
  publicKeyStr: string,
  signatureStr: string,
  encoding: BufferEncoding = 'base64'
): Promise<boolean> {
  try {
    const publicKeyBytes = Buffer.from(publicKeyStr, encoding);

    if (
      publicKeyBytes.length !== 33 ||
      (publicKeyBytes[0] !== 0x02 && publicKeyBytes[0] !== 0x03)
    ) {
      throw new Error('Public key must be 33 bytes in compressed secp256k1 format.');
    }

    const signature = Buffer.from(signatureStr, encoding);

    return await Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(signature.subarray(0, 64)), sha256(toUtf8(payload)), publicKeyBytes);
  } catch (e: unknown) {
    console.error('Signature verification failed:', (e as Error).message);
    return false;
  }
}

export async function getCompressedPublicKeyFromAppIdentity() : Promise<Buffer> {
  const privateKeyBytes = Buffer.from(env.APP_IDENTITY, 'hex');
  const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes);
  const [account] = await wallet.getAccounts();

  if (!account) {
    throw new Error("Failed while trying to get the public key");
  }

  return Buffer.from(account.pubkey);
}
