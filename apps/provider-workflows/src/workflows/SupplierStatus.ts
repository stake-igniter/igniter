import * as wf from '@temporalio/workflow'
import {
  log,
  proxyActivities,
  WorkflowError,
} from '@temporalio/workflow'
import {
  providerActivities,
} from '@/activities'
import { SupplierStatusByRange } from '@/workflows/SupplierStatusRange'
import {makeRangesBySize} from "@/lib/utils";

// we built to commonjs and p-limit for esm support
// @ts-ignore
import pLimit from 'p-limit'
import {KeyState} from "@igniter/db/provider/enums";

/**
 * Represents the total number of shards used by the workflow.
 * A shard is a logical partition of data or workload that allows for
 * distributed processing and scalability.
 *
 * This value defines the total count of such partitions that are expected
 * or configured for the system to function.
 */
const shardCount = 200


/**
 * Executes the SupplierStatus workflow, which orchestrates multiple concurrent child workflows
 * to process supplier status within specified ranges.
 * This method divides the workload into shards of ranges and schedules child workflows with controlled concurrency.
 *
 * The method performs the following steps:
 * - Retrieves the latest block height and the minimum and maximum key IDs.
 * - Divides the range between minimum and maximum key IDs into evenly distributed shards.
 * - Schedules child workflows with bounded concurrency using the pLimit library.
 * - Monitors the completion of all child workflows.
 *
 * @return {Promise<void>} A promise that resolves when all child workflows are scheduled
 *                         and processed.
 *                         This method is a fire-and-forget operation for
 *                         orchestrating workflows.
 */
export async function SupplierStatus(): Promise<{ height: number, minId: number, maxId: number }> {
  const { getLatestBlock, getKeysMinAndMax } =
    proxyActivities<ReturnType<typeof providerActivities>>({
      startToCloseTimeout: '120s',
      retry: {
        maximumAttempts: 3,
      },
    })

  log.debug('Starting SupplierStatus')
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
      log.debug('Triggering Child Workflow: SupplierStatusByRange', { minId, maxId })
      // Await this child's completion to enforce the concurrency cap
      await wf.startChild<typeof SupplierStatusByRange>('SupplierStatusByRange', {
        args: [{
          states,
          height,
          minId,
          maxId,
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

  log.debug('Completed SupplierStatus', { height, minId, maxId })
  return { height, minId, maxId }
}
