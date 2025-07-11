import {
  NativeConnection,
  Runtime,
  Worker,
  WorkerOptions,
} from '@temporalio/worker'
import { getTemporalLogger } from '@/logger'
import type { Logger } from '@igniter/logger'
import { checkEnvVariables } from '@igniter/commons/utils'
import { TemporalWorker } from '@/types'

declare global {
  // eslint-disable-next-line no-var
  var temporalWorker: Worker
}

export const getWorker = async (
  logger: Logger,
  options: Partial<WorkerOptions>,
): Promise<TemporalWorker> => {
  if (global.temporalWorker) {
    logger.debug('Using existing global Temporal worker')
    return {
      worker: global.temporalWorker,
      disconnect: async () => {
        logger.info('Shutting down Temporal worker...')
        return global.temporalWorker.shutdown()
      },
    }
  }

  const temporalLogger = getTemporalLogger(logger)
  Runtime.install({ logger: temporalLogger })

  checkEnvVariables(['TEMPORAL_URL', 'TEMPORAL_NAMESPACE', 'TEMPORAL_TASK_QUEUE'])

  const address = process.env.TEMPORAL_URL!
  const namespace = process.env.TEMPORAL_NAMESPACE!
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE!
  const workflowsPath = options.workflowsPath ?? require.resolve('./workflows')

  logger.info({ namespace, taskQueue, workflowsPath }, 'Initializing Temporal worker...')

  if (!options.connection) {
    options.connection = await NativeConnection.connect({ address })
  }

  const worker = await Worker.create({
    ...{
      namespace,
      taskQueue,
      workflowsPath,
      activities: options?.activities ?? {},
      bundlerOptions: {
        webpackConfigHook: (config) => {
          config.mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
          config.stats = process.env.NODE_ENV === 'production' ? 'errors-only' : 'minimal'
          return config
        },
      },
    },
    ...options,
  })

  global.temporalWorker = worker

  logger.info('Temporal worker created')

  return {
    worker,
    disconnect: async () => {
      logger.info('Shutting down Temporal worker...')
      return worker.shutdown()
    },
  }
}
