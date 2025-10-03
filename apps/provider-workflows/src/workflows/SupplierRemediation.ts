import * as wf from '@temporalio/workflow'
import {
  log,
  proxyActivities,
  WorkflowError,
} from '@temporalio/workflow'
import {
  providerActivities,
} from '@/activities'
import { SupplierRemediationByRange } from '@/workflows/SupplierRemediationRange'
import {makeRangesBySize} from "@/lib/utils";

// we built to commonjs and p-limit for esm support
// @ts-ignore
import pLimit from 'p-limit'
import {KeyState, RemediationHistoryEntryReason} from "@igniter/db/provider/enums";

/**
 * Represents the total number of shards used by the workflow.
 * A shard is a logical partition of data or workload that allows for
 * distributed processing and scalability.
 *
 * This value defines the total count of such partitions that are expected
 * or configured for the system to function.
 */
const shardCount = 200

export interface SupplierRemediationInput {
  reasons: RemediationHistoryEntryReason[]
}


/**
 * Executes the SupplierRemediation process which retrieves the latest block, determines the range of keys,
 * and orchestrates child workflows for remediation tasks within calculated ranges.
 * The method ensures bounded concurrency for child workflows and handles failures appropriately.
 *
 * @return {Promise<{ height: number, minId: number, maxId: number }>} A promise resolving to an object containing
 *         the latest block height, the minimum ID, and the maximum ID processed during the remediation.
 */
export async function SupplierRemediation(input: SupplierRemediationInput): Promise<{ height: number, minId: number, maxId: number }> {
  const { getLatestBlock, getKeysMinAndMax } =
    proxyActivities<ReturnType<typeof providerActivities>>({
      startToCloseTimeout: '120s',
      retry: {
        maximumAttempts: 3,
      },
    })

  log.debug('Starting SupplierRemediation')
  const [height, { minId, maxId }] = await Promise.all([
    getLatestBlock(),
    getKeysMinAndMax(),
  ])

  log.debug('Preparing to trigger child workflows', { height, minId, maxId })
  const notInStates = [
    KeyState.Available,
    KeyState.Unstaked,
    KeyState.RemediationFailed,
    KeyState.AttentionNeeded,
  ]
  const ranges = makeRangesBySize(minId, maxId, shardCount, notInStates)

  const limitChildren = pLimit(10)

  // Schedule ALL children, but only `maxChildConcurrency` run at once.
  const childPromises = ranges.map(({ minId, maxId, states }) =>
    limitChildren(async () => {
      log.debug('Triggering Child Workflow: SupplierRemediationByRange', { minId, maxId })
      // Await this child's completion to enforce the concurrency cap
      await wf.startChild<typeof SupplierRemediationByRange>('SupplierRemediationByRange', {
        args: [{
          states,
          height,
          minId,
          maxId,
          reasons: input.reasons,
          pageSize: 200,
          concurrency: 10,
        }],
        parentClosePolicy: 'ABANDON', // they will keep running if the father timeout
        workflowId: `SSR-${height}-${minId}-${maxId}`,
      })
    }),
  )

  // Drain all children with bounded concurrency
  const r = await Promise.allSettled(childPromises)
  const allFailed = r.every(r => r.status === 'rejected')
  if (allFailed) {
    throw new WorkflowError('All activities failed')
  }

  log.debug('Completed SupplierRemediation', { height, minId, maxId })
  return { height, minId, maxId }
}
