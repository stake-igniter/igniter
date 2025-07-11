import type { DBClient } from './types'

declare global {
  // eslint-disable-next-line no-var
  var dbClient: DBClient
}

export {}
