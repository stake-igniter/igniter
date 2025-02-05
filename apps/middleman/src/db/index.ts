import "dotenv/config";
import { drizzle } from "drizzle-orm/vercel-postgres";

const db = drizzle();

export { db };
