/**
 * Les deux opérations métier : réserver un créneau et annuler un rendez-vous.
 * Ordre de la réservation : revérifier l'agenda, verrouiller la place en base
 * (plafond de poses par jour), créer l'événement, puis envoyer les e-mails après la réponse.
 */
import "server-only";
import { after } from "next/server";
import { bookingRules } from "@/lib/config/booking";
import { garage, garageAddressLine } from "@/lib/config/garage";
import { getCalendar } from "@/lib/calendar";
import { sendMail } from "@/lib/email/send";
import { clientConfirmation, garageCancellation, garageNotification } from "@/lib/email/templates";
import { getStore, SlotTakenError } from "@/lib/store";
import { isSlotStillFree } from "./slots";
import { eventDescription, eventTitle, slotEnd } from "./summary";
import type { E85Request } from "./types";

export type BookResult =
  | { ok: true; request: E85Request }
  | { ok: false; reason: "not_found" | "already_booked" | "slot_taken" | "calendar_error" };

const garageEmail = () => process.env.EMAIL_GARAGE ?? garage.email;

export async function bookSlot(id: string, slotStart: string): Promise<BookResult> {
  const store = getStore();
  const current = await store.get(id);
  if (!current) return { ok: false, reason: "not_found" };
  if (current.status !== "incomplet") return { ok: false, reason: "already_booked" };

  if (!(await isSlotStillFree(slotStart))) return { ok: false, reason: "slot_taken" };

  let reserved: E85Request;
  try {
    reserved = await store.reserve(id, slotStart);
  } catch (e) {
    if (e instanceof SlotTakenError) return { ok: false, reason: "slot_taken" };
    throw e;
  }

  const start = new Date(slotStart);
  let eventId: string;
  try {
    eventId = await getCalendar().createEvent({
      summary: eventTitle(reserved),
      description: eventDescription(reserved),
      location: `${garage.name}, ${garageAddressLine}`,
      start,
      end: slotEnd(start),
      bookingId: id,
    });
  } catch (e) {
    // Sans événement dans l'agenda, le garage ne verrait pas le rendez-vous : on rend le créneau.
    console.error("Création de l'événement impossible", e);
    await store.patch(id, { status: "incomplet", slotStart: null });
    return { ok: false, reason: "calendar_error" };
  }

  const booked = (await store.patch(id, { calendarEventId: eventId }))!;

  after(async () => {
    const results = await Promise.allSettled([
      sendMail({ to: booked.contact.email, ...clientConfirmation(booked) }),
      sendMail({ to: garageEmail(), ...garageNotification(booked) }),
    ]);
    results.forEach((r) => r.status === "rejected" && console.error("E-mail non envoyé", r.reason));
  });

  return { ok: true, request: booked };
}

/** Le client peut-il encore annuler en ligne ? */
export function canCancelOnline(r: E85Request, now = new Date()) {
  if (r.status !== "reserve" || !r.slotStart) return false;
  return new Date(r.slotStart).getTime() - now.getTime() >= bookingRules.cancelUntilHours * 3_600_000;
}

/** Annulation : libère l'agenda, marque la demande, prévient le garage. */
export async function cancelBooking(r: E85Request, by: "client" | "garage") {
  if (r.calendarEventId) {
    try {
      await getCalendar().deleteEvent(r.calendarEventId);
    } catch (e) {
      console.error("Suppression de l'événement impossible", e);
    }
  }
  const updated = await getStore().patch(r.id, {
    status: "annule",
    cancelledAt: new Date().toISOString(),
    calendarEventId: null,
  });
  if (by === "client") {
    after(() => sendMail({ to: garageEmail(), ...garageCancellation(r) }).catch((e) => console.error(e)));
  }
  return updated;
}
