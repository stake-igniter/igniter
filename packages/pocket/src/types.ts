import { Supplier } from '@pocket/proto/generated/pocket/shared/supplier'
import {MsgStakeSupplier} from "@pocket/proto/generated/pocket/supplier/tx";
import {Coin} from "@pocket/proto/generated/cosmos/base/v1beta1/coin";
import {RPCType} from "@pocket/proto/generated/pocket/shared/service";

export {
  SupplierServiceConfig,
  SupplierEndpoint,
  ServiceRevenueShare,
  ConfigOption,
  RPCType,
} from '@pocket/proto/generated/pocket/shared/service'

export {MsgStakeSupplier} from "@pocket/proto/generated/pocket/supplier/tx";

export { Supplier, ServiceConfigUpdate } from '@pocket/proto/generated/pocket/shared/supplier';

export interface PocketExtension {
  readonly bank: {
    /**
     * Retrieves the balance of a specific address for a given denomination.
     *
     * @param {string} address - The address of the account to query the balance for.
     * @param {string} denom - The denomination of the currency to check the balance of.
     * @returns {Promise<Coin>} A promise that resolves to a `Coin` object containing the amount and denom of the balance.
     */
    readonly balance: (address: string, denom?: string) => Promise<Coin>;
    /**
     * Represents a method to retrieve the spendable balance of a specified denomination for a given address.
     *
     * @readonly
     * @function
     * @param {string} address - The blockchain address for which the spendable balance is to be queried.
     * @param {string} denom - The denomination of the currency to check the spendable balance for.
     * @returns {Promise<Coin>} A promise that resolves to a Coin object containing the spendable balance information.
     */
    readonly spendableBalanceByDenom: (address: string, denom?: string) => Promise<Coin>;
    /**
     * Retrieves all balance information associated with a given address.
     *
     * @param {string} address - The address for which balance information is required.
     * @returns {Promise<Coin[]>} A promise that resolves to an array of Coin objects representing the balances.
     */
    readonly allBalances: (address: string) => Promise<Coin[]>;
  }
  readonly supplier: {
    readonly getSupplier: (address: string) => Promise<Supplier | null>;
  }
}

export interface SendTransactionResult {
  transactionHash: string;
  success: boolean;
  code?: number;
  message?: string;
  codespace?: string;
  isTimeout?: boolean;
}

export interface TransactionResult {
  hash: string;
  height: number;
  index?: number;
  gasUsed?: bigint;
  gasWanted?: bigint;
  success: boolean;
  code: number;
}

/**
 * The StakeSupplierParams interface extends the MsgStakeSupplier interface and represents the
 * parameters required when staking a new supplier. It is extended with the private key of
 * the signer performing the staking transaction.
 *
 *
 * Properties:
 * - `signerPrivateKey`: A string representing the private key of the signer. This key is
 *   used for authorizing the staking operation securely.
 *
 * Inherits:
 * - Extends `MsgStakeSupplier`, which includes additional properties required for staking a supplier.
 */
export type StakeSupplierParams = {
  signerPrivateKey: string;
} & MsgStakeSupplier;

/**
 * Represents a mapping of RPC types to their corresponding integer values.
 *
 * This object is used to define and identify various types of Remote Procedure Call (RPC) protocols
 * by assigning each type a unique integer representation.
 *
 * @constant {Object} RPCTypeMap
 * @property {number} UNKNOWN_RPC - Represents an unknown or unspecified RPC type, default value of 0.
 * @property {number} GRPC - Represents the gRPC protocol, assigned with a value of 1.
 * @property {number} WEBSOCKET - Represents WebSocket-based RPC, assigned with a value of 2.
 * @property {number} JSON_RPC - Represents JSON-RPC protocol, assigned with a value of 3.
 * @property {number} REST - Represents REST-based RPC, assigned with a value of 4.
 * @property {number} COMET_BFT - Represents the CometBFT protocol, assigned with a value of 5.
 * @property {number} UNRECOGNIZED - Represents an unrecognized or unsupported RPC type, assigned with a value of -1.
 */
export const RPCTypeMap: Record<keyof typeof RPCType, RPCType> = {
  "UNKNOWN_RPC": 0,
  "GRPC": 1,
  "WEBSOCKET": 2,
  "JSON_RPC": 3,
  "REST": 4,
  "COMET_BFT": 5,
  "UNRECOGNIZED": -1,
}
