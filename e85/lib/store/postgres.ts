/**
 * Stockage Postgres (Neon). La table est créée au premier appel.
 * L'index unique partiel sur slot_start garantit qu'un créneau ne peut être réservé
 * qu'une fois, même si deux clients confirment à la même seconde.
 */
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type { E85Request } from "@/lib/e85/types";
import { SlotTakenError, type RequestStore } from "./types";

type Row = {
  id: string;
  created_at: Date;
  updated_at: Date;
  status: E85Request["status"];
  vehicle: E85Request["vehicle"];
  checks: E85Request["checks"];
  remark: string;
  contact: E85Request["contact"];
  utm: E85Request["utm"];
  slot_start: Date | null;
  calendar_event_id: string | null;
  reminder_sent_at: Date | null;
  cancelled_at: Date | null;
};

const iso = (d: Date | null) => (d ? new Date(d).toISOString() : null);

const fromRow = (r: Row): E85Request => ({
  id: r.id,
  createdAt: iso(r.created_at)!,
  updatedAt: iso(r.updated_at)!,
  status: r.status,
  vehicle: r.vehicle,
  checks: r.checks,
  remark: r.remark,
  contact: r.contact,
  utm: r.utm,
  slotStart: iso(r.slot_start),
  calendarEventId: r.calendar_event_id,
  reminderSentAt: iso(r.reminder_sent_at),
  cancelledAt: iso(r.cancelled_at),
});

export function postgresStore(url: string): RequestStore {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;

  const init = () =>
    (ready ??= (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS e85_requests (
          id text PRIMARY KEY,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          status text NOT NULL DEFAULT 'incomplet',
          vehicle jsonb NOT NULL,
          checks jsonb NOT NULL,
          remark text NOT NULL DEFAULT '',
          contact jsonb NOT NULL,
          utm jsonb NOT NULL DEFAULT '{}'::jsonb,
          slot_start timestamptz,
          calendar_event_id text,
          reminder_sent_at timestamptz,
          cancelled_at timestamptz
        )`;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS e85_requests_slot_active
        ON e85_requests (slot_start) WHERE status = 'reserve'`;
    })());

  const one = async (rows: unknown) => {
    const r = (rows as Row[])[0];
    return r ? fromRow(r) : null;
  };

  return {
    async upsertLead(id, d) {
      await init();
      if (id) {
        const updated = await one(await sql`
          UPDATE e85_requests SET vehicle = ${JSON.stringify(d.vehicle)}::jsonb,
            checks = ${JSON.stringify(d.checks)}::jsonb, remark = ${d.remark},
            contact = ${JSON.stringify(d.contact)}::jsonb, updated_at = now()
          WHERE id = ${id} AND status = 'incomplet' RETURNING *`);
        if (updated) return updated;
      }
      return (await one(await sql`
        INSERT INTO e85_requests (id, vehicle, checks, remark, contact, utm)
        VALUES (${randomUUID()}, ${JSON.stringify(d.vehicle)}::jsonb, ${JSON.stringify(d.checks)}::jsonb,
          ${d.remark}, ${JSON.stringify(d.contact)}::jsonb, ${JSON.stringify(d.utm)}::jsonb)
        RETURNING *`))!;
    },

    async get(id) {
      await init();
      return one(await sql`SELECT * FROM e85_requests WHERE id = ${id}`);
    },

    async list() {
      await init();
      return ((await sql`SELECT * FROM e85_requests ORDER BY created_at DESC`) as Row[]).map(fromRow);
    },

    async reserve(id, slotStart) {
      await init();
      try {
        const r = await one(await sql`
          UPDATE e85_requests SET status = 'reserve', slot_start = ${slotStart}, updated_at = now()
          WHERE id = ${id} AND status = 'incomplet' RETURNING *`);
        if (!r) throw new Error("Demande introuvable ou déjà réservée.");
        return r;
      } catch (e) {
        if ((e as { code?: string }).code === "23505") throw new SlotTakenError();
        throw e;
      }
    },

    async patch(id, f) {
      await init();
      const current = await one(await sql`SELECT * FROM e85_requests WHERE id = ${id}`);
      if (!current) return null;
      const n = { ...current, ...f };
      return one(await sql`
        UPDATE e85_requests SET status = ${n.status}, calendar_event_id = ${n.calendarEventId},
          reminder_sent_at = ${n.reminderSentAt}, cancelled_at = ${n.cancelledAt},
          slot_start = ${n.slotStart}, updated_at = now()
        WHERE id = ${id} RETURNING *`);
    },

    async dueForReminder(from, to) {
      await init();
      return (
        (await sql`
          SELECT * FROM e85_requests WHERE status = 'reserve' AND reminder_sent_at IS NULL
          AND slot_start >= ${from.toISOString()} AND slot_start < ${to.toISOString()}`) as Row[]
      ).map(fromRow);
    },
  };
}
