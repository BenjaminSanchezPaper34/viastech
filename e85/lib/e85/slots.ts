/**
 * Calcul des créneaux libres à partir des règles (lib/config/booking.ts) et de l'agenda.
 * Un créneau est libre si : jour ouvré, non fermé, au moins 48 h après maintenant,
 * pose terminée avant la fermeture de l'atelier, aucun événement ne chevauche la plage
 * bloquée, et la capacité du jour n'est pas atteinte.
 */
import "server-only";
import { bookingRules } from "@/lib/config/booking";
import { getCalendar, isPose, type CalendarEvent } from "@/lib/calendar";
import { addDays, parisParts, parisToUtc, weekdayOf } from "@/lib/time";
import type { SlotDay } from "./types";

const HOUR = 3_600_000;

export function computeSlots(events: CalendarEvent[], now = new Date()): SlotDay[] {
  const r = bookingRules;
  const earliest = now.getTime() + r.minLeadHours * HOUR;
  const today = parisParts(now).ymd;

  const closed = new Set(r.closedDates);
  for (const e of events) if (e.allDay) e.days.forEach((d) => closed.add(d));

  const timed = events.filter((e) => !e.allDay);
  const days: SlotDay[] = [];

  for (let i = 0; i <= r.horizonDays; i++) {
    const date = addDays(today, i);
    if (!r.workDays.includes(weekdayOf(date)) || closed.has(date)) continue;

    const posesThatDay = timed.filter((e) => isPose(e) && parisParts(e.start).ymd === date).length;
    if (posesThatDay >= r.maxPerDay) continue;

    const closing = r.closingTimes[weekdayOf(date)];
    const closingAt = closing ? parisToUtc(date, closing).getTime() : Infinity;

    const slots = r.dropOffTimes
      .map((time) => {
        const start = parisToUtc(date, time);
        const end = start.getTime() + r.blockHours * HOUR;
        const free =
          start.getTime() >= earliest &&
          end <= closingAt &&
          !timed.some((e) => e.start.getTime() < end && e.end.getTime() > start.getTime());
        return free ? { time, start: start.toISOString() } : null;
      })
      .filter((s) => s !== null);

    if (slots.length) days.push({ date, slots });
  }
  return days;
}

export async function getAvailableSlots(now = new Date()) {
  const from = new Date(now.getTime() - 24 * HOUR);
  const to = new Date(now.getTime() + (bookingRules.horizonDays + 2) * 24 * HOUR);
  const events = await getCalendar().listEvents(from, to);
  return computeSlots(events, now);
}

/** Revérifie au moment de la confirmation qu'un créneau est toujours libre. */
export async function isSlotStillFree(startIso: string) {
  const days = await getAvailableSlots();
  return days.some((d) => d.slots.some((s) => s.start === startIso));
}
