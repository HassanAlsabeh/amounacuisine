import "server-only";

import { sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { seedIfEmpty, syncCatalog } from "./seed";

/*
 * Production (Vercel): DATABASE_URL points at a Postgres database (Neon) and
 * we talk to it over HTTP. Local development without DATABASE_URL: an embedded
 * Postgres (PGlite) stored in .data/pglite, so the project runs with no
 * accounts. Both speak the same SQL, so the rest of the code doesn't care.
 */

// Both drivers expose the same query builder; one type keeps call sites simple.
export type Db = NeonHttpDatabase<typeof schema>;

const g = globalThis as unknown as { __mbDb?: Promise<Db> };

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  let db: Db;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    db = drizzle({ client: neon(url), schema });
  } else {
    if (process.env.VERCEL) throw new Error("DATABASE_URL is not set. Connect a Postgres database (e.g. Neon) in Vercel.");
    const { mkdirSync } = await import("node:fs");
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const dir = process.env.PGLITE_DIR ?? ".data/pglite";
    mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir);
    db = drizzle({ client, schema }) as unknown as Db;
  }

  // the HTTP driver runs one statement per request
  for (const statement of schema.CREATE_TABLES_SQL.split(";")) {
    if (statement.trim()) await db.execute(sql.raw(statement));
  }
  await seedIfEmpty(db);
  await syncCatalog(db);
  return db;
}

/** Shared connection; tables are created and seeded on first use. */
export function getDb(): Promise<Db> {
  // keep one instance across dev hot reloads (PGlite holds a lock on its folder)
  if (!g.__mbDb) {
    g.__mbDb = connect().catch((err) => {
      g.__mbDb = undefined;
      throw err;
    });
  }
  return g.__mbDb;
}

export { schema };
