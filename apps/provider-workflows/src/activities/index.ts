import { log } from "@temporalio/activity";
import type { drizzle } from 'drizzle-orm/node-postgres'

export const delegatorActivities = (db: ReturnType<typeof drizzle>) => ({
  async mockActivity() {
    log.info('Hello from the mock activity!')
    return
  },
});
