import { defineConfig } from "drizzle-kit";
// @ts-ignore
import JSONBigInt from 'json-bigint'

/*
 * Without this "hack" we get a "bigint" error when using JSON.stringify,
 * since drizzle-kit uses JSON.stringify to generate the migration files.
 *
 * The error:
 * TypeError: Do not know how to serialize a BigInt
 *   at JSON.stringify (<anonymous>)
 *   at diffSchemasOrTables (/home/overlordyorch/Development/igniter/node_modules/.pnpm/drizzle-kit@0.31.4/node_modules/drizzle-kit/bin.cjs:23884:27)
 *   at applyPgSnapshotsDiff (/home/overlordyorch/Development/igniter/node_modules/.pnpm/drizzle-kit@0.31.4/node_modules/drizzle-kit/bin.cjs:29898:26)
 *   at async prepareAndMigratePg (/home/overlordyorch/Development/igniter/node_modules/.pnpm/drizzle-kit@0.31.4/node_modules/drizzle-kit/bin.cjs:33887:42)
 *   at async Object.handler (/home/overlordyorch/Development/igniter/node_modules/.pnpm/drizzle-kit@0.31.4/node_modules/drizzle-kit/bin.cjs:93575:7)
 *   at async run (/home/overlordyorch/Development/igniter/node_modules/.pnpm/drizzle-kit@0.31.4/node_modules/drizzle-kit/bin.cjs:93059:7)
 *
 * Ref Issue: https://github.com/drizzle-team/drizzle-orm/issues/1879
 */
JSON.parse = JSONBigInt.parse
JSON.stringify = JSONBigInt.stringify

export default defineConfig({
  out: "apps/provider/drizzle",
  schema: "packages/db/src/provider/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true,
  },
});
