import { drizzle } from 'drizzle-orm/node-postgres'

export type DBClient = {
  db: ReturnType<typeof drizzle>;
  disconnect: () => Promise<void>;
}
