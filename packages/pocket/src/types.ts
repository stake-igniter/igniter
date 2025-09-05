import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { Supplier } from '@pocket/proto/generated/pocket/shared/supplier'

export {
  SupplierServiceConfig,
  RPCType,
} from '@pocket/proto/generated/pocket/shared/service'

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
