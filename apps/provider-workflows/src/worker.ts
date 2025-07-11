import { delegatorActivities } from './activities'
import {
  getLogger,
  Logger,
} from '@igniter/logger'
import { getWorker } from '@igniter/temporal'
import { getDb } from '@igniter/db/provider'
import bootstrap from '@/bootstrap'

const logger = getLogger()

export const registerGracefulShutdown = (
  disconnect: () => Promise<void>,
  logger: Logger,
  graceTimeoutMs = 10_000,
) => {
  let shuttingDown = false

  const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGUSR2'] as const

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      logger.warn('Shutdown already in progress...')
      return
    }

    shuttingDown = true
    logger.info({ signal }, 'Received shutdown signal, attempting graceful shutdown...')

    const timeout = setTimeout(() => {
      logger.error({ timeout: graceTimeoutMs }, 'Grace period exceeded. Forcing exit.')
      process.exit(1)
    }, graceTimeoutMs)

    try {
      await disconnect()
      clearTimeout(timeout)
      logger.info('Graceful shutdown complete. Exiting.')
      process.exit(0)
    } catch (err) {
      logger.error({ err }, 'Error during shutdown. Forcing exit.')
      process.exit(1)
    }
  }

  for (const signal of signals) {
    process.on(signal, () => shutdown(signal))
  }
}

export async function setupTemporalWorker() {
  const POCKET_RPC = process.env.POKT_RPC_URL || ''

  if (!POCKET_RPC) {
    throw new Error('POKT_RPC_URL environment variable is not defined.')
  }

  const dbClient = await getDb(logger)

  const shutdownGraceTime = 2500

  const { worker, disconnect } = await getWorker(logger, {
    workflowsPath: require.resolve('./workflows'),
    activities: delegatorActivities(dbClient.db),
    shutdownGraceTime,
  })

  await bootstrap(logger)

  registerGracefulShutdown(disconnect, logger, shutdownGraceTime)

  await worker.run()
}

setupTemporalWorker().then(() => {
  logger.info('Worker stopped')
  process.exit(0)
}).catch((err) => {
  logger.error('failed setting up the worker', { err })
  process.exit(1)
})
