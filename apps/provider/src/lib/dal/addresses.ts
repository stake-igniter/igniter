import { db } from "@/db";
import { Address, addressesTable, AddressGroup } from "@/db/schema";
import { sha256 } from "js-sha256";
import Sodium from "libsodium-wrappers";
import { eq } from "drizzle-orm";
import { getActiveKeyManagementStrategy } from "./keyManagementStrategies";
import { getAddressGroupsByIdentity } from "./addressGroups";
import { KeyManagementStrategyFactory } from "../keyStrategies";

export interface KeyPair {
  public_key: string;
  private_key: string;
}

export interface NodeStakeDistributionItem {
  amount: number;
  qty: number;
}

export async function createKeyPair(): Promise<KeyPair> {
  await Sodium.ready;
  const keypair = Sodium.crypto_sign_keypair();
  const private_key = Buffer.from(keypair.privateKey).toString("hex");
  const public_key = Buffer.from(keypair.publicKey).toString("hex");

  return { public_key, private_key };
}

export function addressFromPublicKey(publicKey: Buffer): string {
  const hash = sha256.create();
  hash.update(publicKey);
  return Buffer.from(hash.hex(), "hex").slice(0, 20).toString("hex");
}

export async function insertAddresses(addresses: Address[]) {
  return await db.insert(addressesTable).values(addresses).returning();
}

export async function getAddress(address: string) {
  const result = await db.query.addressesTable.findFirst({
    where: eq(addressesTable.address, address),
  });

  if (!result) {
    throw new Error("Address not found");
  }

  return result;
}

export async function getFinalStakeAddresses(
  stakeDistribution: NodeStakeDistributionItem[]
) {
  const keyManagementStrategies = await getActiveKeyManagementStrategy();

  const neededAddresses = stakeDistribution.reduce(
    (acc, { qty }) => acc + qty,
    0
  );

  let addresses: { address: string; addressGroup: AddressGroup }[] = [];
  for (const keyManagementStrategy of keyManagementStrategies) {
    if (addresses.length >= neededAddresses) break;

    const addressGroup = await getAddressGroupsByIdentity(
      keyManagementStrategy.addressGroupAssignment
    );

    const strategy = KeyManagementStrategyFactory.create(
      keyManagementStrategy.type,
      addressGroup.id
    );

    const newAddresses = await strategy.getAddresses(
      neededAddresses - addresses.length
    );

    addresses = addresses.concat(
      newAddresses.map((address) => ({
        address: address,
        addressGroup,
      }))
    );
  }

  const nodes = stakeDistribution.flatMap(({ amount, qty }) =>
    Array.from({ length: qty }, (_, i) => ({
      address: addresses[i]?.address ?? "",
      bin: amount,
      addressGroup: addresses[i]?.addressGroup,
    }))
  );

  const stakes = nodes.map((node) => {
    const serviceUrl = node?.addressGroup?.pattern
      .replace("{{domain}}", node?.addressGroup?.domain)
      .replace("{{identity}}", node?.addressGroup?.identity)
      .replace("{{address}}", node.address);

    return {
      address: node.address,
      amount: node.bin,
      chains: node?.addressGroup?.defaultChains,
      serviceUrl,
    };
  });

  return stakes;
}
