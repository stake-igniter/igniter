import type { PocketBlockchain } from '@igniter/pocket'
import type { InsertKey } from '@igniter/db/provider/schema'
import {
  ApplicationFailure,
  log,
} from '@temporalio/activity'
import DAL from '@/lib/dal/DAL'
import { KeysMinMax } from '@/lib/dal/keys'
import { KeyState } from '@igniter/db/provider/enums'

export type Height = number

export type LoadKeysInRangeParams = {
  minId: number;
  maxId: number;
}

export type LoadKeysInRangeResult = Array<{ id: number; address: string, state: KeyState }>

export type UpsertSupplierStatusParams = {
  address: string;
  state: KeyState;
  height: number;
}

export const delegatorActivities = (dal: DAL, pocketRpcClient: PocketBlockchain) => ({
  /**
   * Mock activity.
   */
  async mockActivity(): Promise<void> {
    // mock activity
    return
  },
  /**
   * Returns the latest block height from the blockchain.
   * @returns GetLatestBlockResult
   */
  async getLatestBlock(): Promise<Height> {
    return pocketRpcClient.getHeight()
  },
  /**
   * Counts the number of keys in the database and return the min and max id.
   * @returns KeysMinMax
   */
  async getKeysMinAndMax(): Promise<KeysMinMax> {
    return dal.keys.getKeysMinAndMax()
  },

  /**
   * Loads a range of keys based on the specified parameters.
   *
   * @param {LoadKeysInRangeParams} params - The parameters containing the start and end identifiers for the key range.
   *                                          `params.afterId` defines the starting key (exclusive).
   *                                          `params.endId` defines the ending key (exclusive).
   * @return {Promise<LoadKeysInRangeResult>} A promise that resolves to the result of the loaded keys within the given range.
   */
  async loadKeysInRange(params: LoadKeysInRangeParams): Promise<LoadKeysInRangeResult> {
    return dal.keys.loadKeysInRange(params.minId, params.maxId)
  },

  /**
   * Upserts the supplier status into the database.
   * @param params UpsertSupplierStatusParams
   */
  async upsertSupplierStatus(params: UpsertSupplierStatusParams): Promise<boolean> {
    log.info('Querying supplier status', { params })
    const [key, balance, supplier] = await Promise.all([
      dal.keys.loadKey(params.address),
      pocketRpcClient.getBalance(params.address),
      pocketRpcClient.getSupplier(params.address),
    ])

    if(!key) {
      throw new ApplicationFailure('key not found', 'not_found', true)
    }

    const update: Partial<InsertKey> = {
      lastUpdatedHeight: params.height, // always set the last updated height.
      balanceUpokt: BigInt(balance), // always set the balance.
    }

    // if !supplier then is available only if the current state is different from available
    // if supplier and unstakeSessionEndHeight = 0 then is staked
    // if supplier and unstakeSessionEndHeight > 0 and unstakeSessionEndHeight < height then is unstaking
    // if supplier and unstakeSessionEndHeight > 0 and unstakeSessionEndHeight >= height then is unstaked

    // Determine the key state
    if (!supplier) {
      // if no supplier then check if the current key state is available, leave as is, if not, then set to unstaked
      update.state = key.state === KeyState.Imported ? KeyState.Available : key.state;
    } else {
      const { unstakeSessionEndHeight } = supplier;

      // Supplier is present, determine state based on unstakeSessionEndHeight
      if (unstakeSessionEndHeight === 0) {
        update.state = KeyState.Staked;
      } else if (unstakeSessionEndHeight >= params.height) {
        update.state = KeyState.Unstaked;
      } else {
        update.state = KeyState.Unstaking;
      }
    }

    if (supplier && (update.state === KeyState.Unstaking || update.state === KeyState.Staked)) {
      update.stakeOwner = supplier.ownerAddress
      update.stakeAmountUpokt = BigInt(supplier.stake ? supplier.stake.amount : '0')
      if(key.state === KeyState.Imported) {
        // means the key is imported and is already staked, let's set it to the owner address
        update.ownerAddress = supplier.ownerAddress
      }
    }

    log.debug('Updating supplier', { params, update }) //NOTE: adding the update could result in an error due to BIGINT
    await dal.keys.updateKey(params.address, update, params.height)
    log.info('Upsert Supplier done!', { params })
    return true
  },
})
