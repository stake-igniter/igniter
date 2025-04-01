import { defineConfig } from "drizzle-kit";
import "dotenv/config";

console.log('process.env.POSTGRES_URL', process.env.POSTGRES_URL);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true
  },
});
