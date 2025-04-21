import { createPrivateKey, sign } from 'crypto';

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

  const privateKeyBytes = Buffer.from(appIdentity.slice(0, 64), 'hex');
  if (privateKeyBytes.length !== 32) {
    throw new Error("APP_IDENTITY must be a 32-byte secp256k1 private key in hex format.");
  }

  const secp256k1PrivateKeyDER = Buffer.concat([
    Buffer.from([
      0x30, 0x2e,
      0x02, 0x01, 0x01,
      0x04, 0x20,
    ]),
    privateKeyBytes,
    Buffer.from([
      0xa0, 0x07,
      0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a,
    ]),
  ]);

  const privateKey = createPrivateKey({
    key: secp256k1PrivateKeyDER,
    format: 'der',
    type: 'sec1',
  });

  return sign('sha256', Buffer.from(payload), privateKey);
}
