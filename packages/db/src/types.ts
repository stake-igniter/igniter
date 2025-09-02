import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver'
import type { Pool } from 'pg'

export type DBClient<TSchema extends Record<string, unknown>>  = {
  db: NodePgDatabase<TSchema> & {
    $client: Pool;
  };
  disconnect: () => Promise<void>;
}
