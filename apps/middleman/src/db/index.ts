import "dotenv/config";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/vercel-postgres";

const db = drizzle({ schema });

export { db };
