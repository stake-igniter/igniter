import type {PocketBlockchain, StakeSupplierParams, Supplier} from '@igniter/pocket'
import type {ApplicationSettings, InsertKey, RemediationHistoryEntry, Service} from '@igniter/db/provider/schema'
import {ApplicationFailure, log,} from '@temporalio/activity'
import DAL from '@/lib/dal/DAL'
import {KeysMinMax, KeyWithGroup} from '@/lib/dal/keys'
import {KeyState, RemediationHistoryEntryReason} from '@igniter/db/provider/enums'
import {BuildSupplierServiceConfigHandler,} from '@igniter/domain/provider/operations';
import {addOrUpdateRemediationHistory} from "@/lib/utils";
import {redactStakeSupplierParams} from "@/lib/redactors";

export type Height = number

export type LoadKeysInRangeParams = {
  minId: number;
  maxId: number;
  states: KeyState[];
}

export type LoadKeysInRangeResult = Array<{ id: number; address: string, state: KeyState }>

export type ProcessSupplierParams = {
  address: string;
  height: number;
}

export type RemediateSupplierParams = ProcessSupplierParams & {
  reasons: RemediationHistoryEntryReason[];
}

export const providerActivities = (dal: DAL, pocketRpcClient: PocketBlockchain) => ({
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
    return dal.keys.loadKeysInRange(params.minId, params.maxId, params.states)
  },

  /**
   * Upserts the supplier status into the database.
   * @param params ProcessSupplierParams
   */
  async upsertSupplierStatus(params: ProcessSupplierParams): Promise<boolean> {
    log.info('Querying supplier status', {params})
    const [key, services, settings, balance, supplier]: [KeyWithGroup, Service[], ApplicationSettings, number, Supplier] = await Promise.all([
      dal.keys.loadKey(params.address),
      dal.services.loadServices(),
      dal.settings.loadSettings(),
      pocketRpcClient.getBalance(params.address),
      pocketRpcClient.getSupplier(params.address),
    ])

    if (!key) {
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
      switch (key.state) {
        case KeyState.Imported:
          update.state = KeyState.Available
          break
        case KeyState.Unstaking:
          update.state = KeyState.Unstaked
          break
        default:
          update.state = key.state
      }
    } else {
      const {ownerAddress, stake, unstakeSessionEndHeight, services} = supplier;

      // Supplier is present, determine state based on unstakeSessionEndHeight
      if (unstakeSessionEndHeight === 0) {
        update.state = KeyState.Staked;
      } else if (params.height >= unstakeSessionEndHeight) {
        update.state = KeyState.Unstaked;
      } else {
        update.state = KeyState.Unstaking;
      }

      if (update.state === KeyState.Unstaking || update.state === KeyState.Staked) {
        update.stakeOwner = ownerAddress
        update.stakeAmountUpokt = BigInt(stake ? stake.amount : '0')
        update.services = services || []

        if (key.state === KeyState.Imported) {
          // means the key is imported and is already staked, let's set it to the owner address
          update.ownerAddress = supplier.ownerAddress
        }
      }

      if (update.state === KeyState.Staked && key.delegatorRewardsAddress && supplier.services.length === 0 && supplier.serviceConfigHistory?.length === 0) {
        update.remediationHistory = addOrUpdateRemediationHistory(
          {
            message: 'The supplier is not configured with any services.',
            reason: RemediationHistoryEntryReason.OwnerInitialStake,
            timestamp: Date.now(),
          },
          key.remediationHistory ?? []
        )
      }

      if (update.state === KeyState.Staked && balance && settings?.minimumOperationalFunds) {
        if (balance < settings?.minimumOperationalFunds) {
          update.remediationHistory = addOrUpdateRemediationHistory(
            {
              message: `The operational funds for this supplier (used to submit claim and proof transactions) are below the providers desired threshold (${settings?.minimumOperationalFunds} uPokt)`,
              reason: RemediationHistoryEntryReason.SupplierFundsTooLow,
              timestamp: Date.now(),
            },
            key.remediationHistory ?? []
          )
        }
      }

      if (update.state === KeyState.Staked && supplier.stake.amount && settings?.minimumStake) {
        const amount = parseInt(supplier.stake.amount, 10)
        if (amount < settings?.minimumStake) {
          update.remediationHistory = addOrUpdateRemediationHistory(
            {
              message: `The operational funds for this supplier (used to submit claim and proof transactions) are below the providers desired threshold (${settings?.minimumStake} uPokt)`,
              reason: RemediationHistoryEntryReason.SupplierStakeTooLow,
              timestamp: Date.now(),
            },
            key.remediationHistory ?? []
          )
        }
      }

      // TODO: Check for the case where there is no DelegatorAddress on the key.

      // TODO: Check for the case where the configurations on the addressGroup does not match the configurations on the supplier

      const remediationReasons = update.remediationHistory?.map((rh) => rh.reason);

      // Only set the state to attention needed if the key is staked and the initial owner stake has been remediated. Otherwise it will remain staked.
      if (remediationReasons?.length && !remediationReasons.includes(RemediationHistoryEntryReason.OwnerInitialStake)) {
        update.state = KeyState.AttentionNeeded
      }
    }

    log.debug('Updating supplier', {params, update}) //NOTE: adding the update could result in an error due to BIGINT
    await dal.keys.updateKey(params.address, update, params.height)
    log.info('Update Supplier done!', {params})
    return true
  },

  /**
   * Remediates a supplier by performing necessary actions based on the provided parameters. This may include
   * tasks like staking the supplier, updating the remediation history, or resetting the state.
   *
   * @param {RemediateSupplierParams} params - The parameters required for remediating the supplier, including the supplier's address, remediation reasons, and block height.
   * @return {Promise<void>} Resolves when the supplier has been successfully remediated or when no remediation actions are needed.
   */
  async remediateSupplier(params: RemediateSupplierParams) {
    log.info('remediateSupplier: Execution started', {params})
    const [key, supportedServices, balance, supplier]: [KeyWithGroup, Service[], number, Supplier] = await Promise.all([
      dal.keys.loadKey(params.address),
      dal.services.loadServices(),
      pocketRpcClient.getBalance(params.address),
      pocketRpcClient.getSupplier(params.address),
    ])

    log.debug('remediateSupplier: Loaded key, supportedServices, balance and supplier', {
      key: {
        address: key.address,
        ownerAddress: key.ownerAddress,
        state: key.state,
        balance: Number(balance),
      },
      supportedServices: supportedServices.map((s) => ({
        id: s.serviceId,
        name: s.name,
      })),
      supportedServicesCount: supportedServices.length,
      supplier: {
        ownerAddress: supplier.ownerAddress,
        operatorAddress: supplier.operatorAddress,
        stake: supplier.stake,
        services: supplier.services.length,
        unstakeSessionEndHeight: supplier.unstakeSessionEndHeight,
      }
    })

    if (!key) {
      throw new ApplicationFailure('key not found', 'not_found', true)
    }

    if (!key.addressGroup) {
      throw new ApplicationFailure('key does not have an address group', 'address_group_not_found', true)
    }

    if (!supplier) {
      throw new ApplicationFailure('supplier not found', 'not_found', true)
    }

    if (key.remediationHistory?.length === 0) {
      log.info('remediateSupplier: No remediation history found. Nothing to do here. Bye!', {params})
      return;
    }

    const stakeParams: StakeSupplierParams = {
      signerPrivateKey: key.privateKey,
      signer: key.address,
      ownerAddress: supplier.ownerAddress,
      operatorAddress: key.address,
    }

    const remediations: RemediationHistoryEntry[] = [];

    const isRemediatingInitialOwnerStake =
      params.reasons.includes(RemediationHistoryEntryReason.OwnerInitialStake)
        ? key.remediationHistory?.find((rh) => rh.reason === RemediationHistoryEntryReason.OwnerInitialStake)
        : null;

    if (isRemediatingInitialOwnerStake) {
      log.debug('remediateSupplier: Preparing initial owner stake remediation', {
        entry: isRemediatingInitialOwnerStake,
      });

      const buildSupplierServiceConfigHandler = new BuildSupplierServiceConfigHandler();

      stakeParams.services = buildSupplierServiceConfigHandler.execute({
        services: supportedServices,
        addressGroup: key.addressGroup,
        ownerAddress: supplier.ownerAddress,
        operatorAddress: key.address,
        requestRevShare: [{
          revSharePercentage: key.delegatorRevSharePercentage ?? 0,
          address: key.delegatorRewardsAddress ?? '',
        }]
      })

      log.debug('remediateSupplier: Registering initial owner stake remediation entry', {
        entry: isRemediatingInitialOwnerStake,
      });
      remediations.push(isRemediatingInitialOwnerStake);
    }

    log.debug('remediateSupplier: Executing stake transaction', {
      stakeParams: redactStakeSupplierParams(stakeParams),
    })

    const txResult = await pocketRpcClient.stakeSupplier(stakeParams)

    log.debug('remediateSupplier: Stake transaction result', {txResult})

    const update: Partial<InsertKey> = {
      lastUpdatedHeight: params.height,
      balanceUpokt: BigInt(balance),
    };

    if (!txResult.success) {
      update.state = KeyState.RemediationFailed;
      update.remediationHistory = remediations.reduce((allRemediationItemsOnSupplier, runRemediationItem) => {
        return addOrUpdateRemediationHistory(
          {
            ...runRemediationItem,
            timestamp: Date.now(),
            txResult: txResult.code,
          },
          allRemediationItemsOnSupplier
        )
      }, (key.remediationHistory ?? []))
    }

    if (txResult.success) {
      update.state = KeyState.Staked;
      update.remediationHistory = [];
    }

    log.debug('Updating supplier', {params, update}) //NOTE: adding the update could result in an error due to BIGINT
    await dal.keys.updateKey(params.address, update, params.height)
    log.info('Update Supplier done!', {params})
  }
})
