import { sha256 } from "js-sha256";

export function addressFromPublicKey(publicKey: Buffer): string {
  const hash = sha256.create();
  hash.update(publicKey);
  return Buffer.from(hash.hex(), "hex").slice(0, 20).toString("hex");
}
