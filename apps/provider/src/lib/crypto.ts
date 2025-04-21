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
 * Verifies a secp256k1/ECDSA signature (DER‐encoded) against the given payload.
 *
 * @param payload       The original message (string)
 * @param publicKeyStr  The compressed public key (33‑byte) in base64 or hex
 * @param signatureStr  The DER‑encoded ECDSA signature in base64 or hex
 * @param encoding      'hex' or 'base64' (default: 'base64')
 * @returns             true if the signature is valid, false otherwise
 */
export function verifySignature(
  payload: string,
  publicKeyStr: string,
  signatureStr: string,
  encoding: BufferEncoding = 'base64'
): boolean {
  try {
    const publicKeyBytes = Buffer.from(publicKeyStr, encoding);

    if (
      publicKeyBytes.length !== 33 ||
      (publicKeyBytes[0] !== 0x02 && publicKeyBytes[0] !== 0x03)
    ) {
      throw new Error('Public key must be 33 bytes in compressed secp256k1 format.');
    }

    // Decode the DER signature
    const signature = Buffer.from(signatureStr, encoding);

    const spkiDer = Buffer.concat([
      Buffer.from([0x30, 0x36, 0x30, 0x10, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a, 0x03, 0x22, 0x00]),
      publicKeyBytes
    ]);

    const publicKey = crypto.createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });
    return crypto.verify('sha256', Buffer.from(payload), publicKey, signature);
  } catch (e: unknown) {
    console.error('Signature verification failed:', (e as Error).message);
    return false;
  }
}
