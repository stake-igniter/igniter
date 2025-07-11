import {
  log,
  proxyActivities,
} from '@temporalio/workflow'
import { delegatorActivities } from '@/activities'

export interface SupplierStatusArgs {
}

export async function SupplierStatusArgs(args: SupplierStatusArgs) {
  const { mockActivity } =
    proxyActivities<ReturnType<typeof delegatorActivities>>({
      startToCloseTimeout: '30s',
      retry: {
        maximumAttempts: 3,
      },
    })

  log.info('Hello from the status workflow!', { args })
  await mockActivity()
  log.info('Goodbye from the status workflow!')
  return
}
