import {
  log,
  proxyActivities,
} from '@temporalio/workflow'
import { delegatorActivities } from '@/activities'

export interface SupplierRemediationArgs {
}

export async function SupplierRemediation(args: SupplierRemediationArgs) {
  const { mockActivity } =
    proxyActivities<ReturnType<typeof delegatorActivities>>({
      startToCloseTimeout: '30s',
      retry: {
        maximumAttempts: 3,
      },
    })

  log.info('Hello from the remediation workflow!', { args })
  await mockActivity()
  log.info('Goodbye from the remediation workflow!')
  return
}
