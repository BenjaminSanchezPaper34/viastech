/** Stockage local (.data/requests.json) quand DATABASE_URL est absent. Mêmes règles que Postgres. */
import { randomUUID } from "node:crypto";
import { assertLocalStorageAllowed, readJson, updateJson } from "@/lib/jsonfile";
import { bookingRules } from "@/lib/config/booking";
import type { E85Request } from "@/lib/e85/types";
import { parisParts } from "@/lib/time";
import { SlotTakenError, type RequestStore } from "./types";

const FILE = "requests";
const empty = (): E85Request[] => [];

export function fileStore(): RequestStore {
  assertLocalStorageAllowed("Base de données");
  const now = () => new Date().toISOString();

  return {
    upsertLead(id, d) {
      return updateJson(FILE, empty, (all) => {
        const existing = id ? all.find((r) => r.id === id && r.status === "incomplet") : undefined;
        if (existing) {
          Object.assign(existing, { vehicle: d.vehicle, checks: d.checks, remark: d.remark, contact: d.contact });
          existing.updatedAt = now();
          return existing;
        }
        const r: E85Request = {
          id: randomUUID(),
          createdAt: now(),
          updatedAt: now(),
          status: "incomplet",
          ...d,
          slotStart: null,
          calendarEventId: null,
          reminderSentAt: null,
          cancelledAt: null,
        };
        all.push(r);
        return r;
      });
    },

    async get(id) {
      return (await readJson(FILE, empty)).find((r) => r.id === id) ?? null;
    },

    async list() {
      return (await readJson(FILE, empty)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    reserve(id, slotStart) {
      return updateJson(FILE, empty, (all) => {
        const day = parisParts(new Date(slotStart)).ymd;
        const taken = all.filter((r) => r.status === "reserve" && r.slotStart && parisParts(new Date(r.slotStart)).ymd === day);
        if (taken.length >= bookingRules.maxPerDay) throw new SlotTakenError();
        const r = all.find((x) => x.id === id && x.status === "incomplet");
        if (!r) throw new Error("Demande introuvable ou déjà réservée.");
        Object.assign(r, { status: "reserve", slotStart, updatedAt: now() });
        return r;
      });
    },

    patch(id, fields) {
      return updateJson(FILE, empty, (all) => {
        const r = all.find((x) => x.id === id);
        if (!r) return null;
        Object.assign(r, fields, { updatedAt: now() });
        return r;
      });
    },

    async dueForReminder(from, to) {
      return (await readJson(FILE, empty)).filter(
        (r) =>
          r.status === "reserve" &&
          !r.reminderSentAt &&
          r.slotStart &&
          new Date(r.slotStart) >= from &&
          new Date(r.slotStart) < to,
      );
    },
  };
}
