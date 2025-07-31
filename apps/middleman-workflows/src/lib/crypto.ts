import { fromHex, toUtf8 } from '@cosmjs/encoding';
import { Secp256k1, sha256 } from '@cosmjs/crypto';
import { env } from '@/config/env';

/**
 * Signs the given payload string using secp256k1 and the APP_IDENTITY private key from the environment.
 * The APP_IDENTITY must be a 64-character hex string (32 bytes).
 * @param payload
 */
export async function signPayload(payload: string) {
  const privateKeyBytes = fromHex(env.APP_IDENTITY);
  const messageHash = sha256(toUtf8(payload));
  const signature = await Secp256k1.createSignature(messageHash, privateKeyBytes);
  return Buffer.from(signature.toFixedLength());
}
