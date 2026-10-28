/**
 * Petit stockage fichier pour le mode local (sans clés) : .data/<nom>.json.
 * Les écritures sont sérialisées pour éviter que deux requêtes simultanées s'écrasent.
 * Ne fonctionne pas sur Vercel (disque en lecture seule) : la prod exige les vraies clés.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), ".data");
let queue: Promise<unknown> = Promise.resolve();

export function assertLocalStorageAllowed(what: string) {
  if (process.env.VERCEL) {
    throw new Error(`${what} : clés manquantes en production (voir README, variables d'environnement).`);
  }
}

export async function readJson<T>(name: string, fallback: () => T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${name}.json`), "utf8")) as T;
  } catch {
    return fallback();
  }
}

/** Lit, transforme et réécrit le fichier dans une seule opération sérialisée. */
export function updateJson<T, R>(name: string, fallback: () => T, fn: (data: T) => R): Promise<R> {
  const run = queue.then(async () => {
    const data = await readJson(name, fallback);
    const result = fn(data);
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(path.join(DIR, `${name}.json`), JSON.stringify(data, null, 2));
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
