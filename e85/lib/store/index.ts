import "server-only";
import { fileStore } from "./file";
import { postgresStore } from "./postgres";
import type { RequestStore } from "./types";

export * from "./types";

let store: RequestStore | null = null;

/** Postgres si DATABASE_URL est défini (Neon via Vercel), sinon fichier local. */
export function getStore(): RequestStore {
  return (store ??= process.env.DATABASE_URL ? postgresStore(process.env.DATABASE_URL) : fileStore());
}
