import crypto from "crypto";

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
 * Verifies an Ed25519 signature using the provided public key and payload.
 * @param payload - The original message (string)
 * @param publicKeyStr - The public key in hex or base64 (32-byte raw key)
 * @param signatureStr - The signature in base64 or hex (64-byte raw signature)
 * @param encoding - Optional: 'hex' or 'base64' (default: 'base64')
 * @returns true if the signature is valid, false otherwise
 */
export function verifySignature(
  payload: string,
  publicKeyStr: string,
  signatureStr: string,
  encoding: BufferEncoding = 'base64'
) {
  try {
    const publicKeyBytes = Buffer.from(publicKeyStr, encoding);
    const signature = Buffer.from(signatureStr, encoding);

    if (publicKeyBytes.length !== 32) {
      throw new Error('Public key must be 32 bytes');
    }

    if (signature.length !== 64) {
      throw new Error('Signature must be 64 bytes');
    }

    const spkiDer = Buffer.concat([
      Buffer.from([
        0x30, 0x2a,
        0x30, 0x05,
        0x06, 0x03, 0x2b, 0x65, 0x70,
        0x03, 0x21, 0x00
      ]),
      publicKeyBytes
    ]);

    const publicKey = crypto.createPublicKey({
      key: spkiDer,
      format: 'der',
      type: 'spki',
    });

    return crypto.verify(null, Buffer.from(payload), publicKey, signature);
  } catch (e: unknown) {
    console.error('Signature verification failed:', (e as Error).message);
    return false;
  }
}
