import { getDb } from '@/db'
import {sql} from "drizzle-orm";

// health check api
export async function GET(_: Request) {
  const db = getDb()
  try {
    await db.execute(sql`SELECT 1`);
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Database connection failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  })
}
