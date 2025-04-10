import {
  createKeyPair,
  addressFromPublicKey,
  insertAddresses,
} from "../dal/addresses";
import { Address, KeyManagementStrategyType } from "@/db/schema";

export interface IKeyManagementStrategy {
  addressGroupAssignmentId: number;

  getAddresses(amount: number): Promise<[string, string][]>;
}

export class DynamicKeyManagementStrategy implements IKeyManagementStrategy {
  addressGroupAssignmentId: number;

  constructor(addressGroupAssignmentId: number) {
    this.addressGroupAssignmentId = addressGroupAssignmentId;
  }

  async getAddresses(amount: number): Promise<[string, string][]> {
    const addresses = [];

    for (let i = 0; i < amount; i++) {
      const { public_key, private_key } = await createKeyPair();
      const address = addressFromPublicKey(Buffer.from(public_key, "hex"));
      addresses.push({
        address,
        publicKey: public_key,
        privateKey: private_key,
        addressGroupId: this.addressGroupAssignmentId,
      });
    }

    await insertAddresses(addresses as Address[]);

    return addresses.map((address) => [address.address, address.publicKey]);
  }
}

export class ManualKeyManagementStrategy implements IKeyManagementStrategy {
  addressGroupAssignmentId: number;

  constructor(addressGroupAssignmentId: number) {
    this.addressGroupAssignmentId = addressGroupAssignmentId;
  }

  async getAddresses(amount: number): Promise<[string, string][]> {
    throw new Error("Method not implemented.");
  }
}

export class KeyManagementStrategyFactory {
  static create(
    type: KeyManagementStrategyType,
    addressGroupAssignmentId: number
  ) {
    switch (type) {
      case KeyManagementStrategyType.Dynamic:
        return new DynamicKeyManagementStrategy(addressGroupAssignmentId);
      case KeyManagementStrategyType.Manual:
        return new ManualKeyManagementStrategy(addressGroupAssignmentId);
      default:
        throw new Error("Invalid Key Management Strategy type");
    }
  }
}
