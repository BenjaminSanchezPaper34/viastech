/**
 * Agenda simulé pour travailler en local sans clés Google : .data/mock-calendar.json.
 * Au premier lancement, il contient une pose déjà prise et un jour de fermeture,
 * pour voir les règles de créneaux à l'œuvre.
 */
import { randomUUID } from "node:crypto";
import { assertLocalStorageAllowed, readJson, updateJson } from "@/lib/jsonfile";
import { bookingRules } from "@/lib/config/booking";
import { addDays, parisParts, parisToUtc, weekdayOf } from "@/lib/time";
import type { CalendarEvent, CalendarProvider } from "./types";

type Stored = { id: string; summary: string; start: string; end: string; allDay: boolean; days: string[] };

function nextWorkDay(from: string, skip: number) {
  let d = from;
  let found = 0;
  while (found <= skip) {
    d = addDays(d, 1);
    if (bookingRules.workDays.includes(weekdayOf(d))) found++;
  }
  return d;
}

function seed(): Stored[] {
  const today = parisParts(new Date()).ymd;
  const busyDay = nextWorkDay(today, 3);
  const closedDay = nextWorkDay(today, 6);
  const start = parisToUtc(busyDay, bookingRules.dropOffTimes[0]);
  return [
    {
      id: "seed-pose",
      summary: "E85 - Audi A3 - Exemple Client",
      start: start.toISOString(),
      end: new Date(start.getTime() + bookingRules.blockHours * 3_600_000).toISOString(),
      allDay: false,
      days: [],
    },
    {
      id: "seed-ferme",
      summary: "Fermé (exemple)",
      start: `${closedDay}T00:00:00Z`,
      end: `${addDays(closedDay, 1)}T00:00:00Z`,
      allDay: true,
      days: [closedDay],
    },
  ];
}

const revive = (s: Stored): CalendarEvent => ({ ...s, start: new Date(s.start), end: new Date(s.end) });

export function mockCalendar(): CalendarProvider {
  assertLocalStorageAllowed("Agenda");
  return {
    name: "mock",

    async listEvents(from, to) {
      const all = await readJson<Stored[]>("mock-calendar", seed);
      return all.map(revive).filter((e) => e.end > from && e.start < to);
    },

    async createEvent(e) {
      const id = `mock-${randomUUID()}`;
      await updateJson<Stored[], void>("mock-calendar", seed, (all) => {
        all.push({
          id,
          summary: e.summary,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          allDay: false,
          days: [],
        });
      });
      console.info(`[agenda simulé] ${e.summary}\n${e.description}`);
      return id;
    },

    async deleteEvent(id) {
      await updateJson<Stored[], void>("mock-calendar", seed, (all) => {
        const i = all.findIndex((s) => s.id === id);
        if (i >= 0) all.splice(i, 1);
      });
    },
  };
}
