import { db } from "@/db";
import { Address, addressesTable } from "@/db/schema";
import { sha256 } from "js-sha256";
import Sodium from "libsodium-wrappers";
import { getApplicationSettings } from "./applicationSettings";
import { getActiveKeyManagementStrategy } from "./keyManagementStrategies";
import { getAddressGroupsByIdentity } from "./addressGroups";
import { eq } from "drizzle-orm";

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

export interface IKeyManagementStrategy {
  addressGroupAssignmentId: number;

  getAddresses(amount: number): Promise<any>;
}

export class DynamicKeyManagementStrategy implements IKeyManagementStrategy {
  addressGroupAssignmentId: number;

  constructor(addressGroupAssignmentId: number) {
    this.addressGroupAssignmentId = addressGroupAssignmentId;
  }

  async getAddresses(amount: number) {
    const addresses = [];

    for (let i = 0; i < amount; i++) {
      const { public_key, private_key } = await createKeyPair();
      const address = addressFromPublicKey(Buffer.from(public_key, "hex"));
      addresses.push({
        address,
        privateKey: private_key,
        addressGroupId: this.addressGroupAssignmentId,
      });
    }

    await insertAddresses(addresses as Address[]);

    return addresses.map((address) => ({
      address: address.address,
    }));
  }
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
  const keyManagementStrategy = await getActiveKeyManagementStrategy();
  const addressGroup = await getAddressGroupsByIdentity(
    keyManagementStrategy.addressGroupAssignment
  );

  const strategy = new DynamicKeyManagementStrategy(addressGroup.id);

  const neededAddresses = stakeDistribution.reduce(
    (acc, { qty }) => acc + qty,
    0
  );
  const addresses = await strategy.getAddresses(neededAddresses);

  const finalStakeAddresses = stakeDistribution.flatMap(({ amount, qty }) =>
    Array.from({ length: qty }, (_, i) => ({
      address: addresses[i]?.address ?? "",
      bin: amount,
    }))
  );

  const stakes = finalStakeAddresses.map((address) => {
    const serviceUrl = addressGroup.pattern
      .replace("{{domain}}", addressGroup.domain)
      .replace("{{identity}}", addressGroup.identity)
      .replace("{{address}}", address.address);

    return {
      address: address.address,
      amount: address.bin,
      chains: addressGroup.chainsToAddressGroups.map((chain) => chain.chainId),
      serviceUrl,
    };
  });

  return stakes;
}
