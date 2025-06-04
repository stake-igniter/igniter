import { fromHex, toHex, } from '@cosmjs/encoding'

export function isValidPrivateKey(privateKey: string): boolean {
  const privateKeyAsUint = fromHex(privateKey)

  if (privateKeyAsUint.length !== 32) {
    console.error('Invalid private key length. Must be 32 bytes.')
    return false
  }

  const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141') // Order of the Secp256k1 curve
  const privateKeyValue = BigInt(`0x${toHex(privateKeyAsUint)}`)
  if (privateKeyValue <= 0 || privateKeyValue >= n) {
    console.error('Invalid private key value. Must be between 1 and n - 1.')
    return false
  }

  return true
}


export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fr = new FileReader();

      fr.onload = (event) => {
        resolve(event.target!.result.toString());
      };

      fr.readAsText(file);
    } catch (e) {
      reject(e);
    }
  });
};
