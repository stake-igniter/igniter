import { TemporalConfig } from '@/types'

export const getConfig = (): TemporalConfig => {
  return {
    address: process.env.TEMPORAL_URL || 'localhost:7233',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'default',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    workflowExecutionRetentionPeriod: process.env.TEMPORAL_WORKFLOW_RETENTION || '3d',
  }
}
