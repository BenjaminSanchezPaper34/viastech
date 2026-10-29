/**
 * Dernier écran : enregistre la demande (véhicule, points, coordonnées) juste avant de réserver
 * le créneau. Si la réservation échoue, la demande reste visible dans l'admin « Sans créneau ».
 */
import { getStore } from "@/lib/store";
import { isExitVehicle, hasErrors, normalizeMobile, normalizePlate, validateChecks, validateContact, validateVehicle } from "@/lib/e85/validate";
import type { Checks, Contact, Vehicle } from "@/lib/e85/types";

type Body = { id?: string | null; vehicle: Vehicle; checks: Checks; remark?: string; contact: Contact; utm?: Record<string, string> };

const clip = (s: unknown, max = 120) => String(s ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const vehicle: Vehicle = {
    fuel: clip(body.vehicle?.fuel, 20),
    plate: normalizePlate(clip(body.vehicle?.plate, 15)),
    mileage: clip(body.vehicle?.mileage, 10).replace(/\D/g, ""),
  };
  const checks: Checks = Object.fromEntries(Object.entries(body.checks ?? {}).map(([k, v]) => [clip(k, 30), clip(v, 10)]));
  const contact: Contact = {
    firstName: clip(body.contact?.firstName, 60),
    lastName: clip(body.contact?.lastName, 60),
    phone: clip(body.contact?.phone, 25),
    email: clip(body.contact?.email, 120).toLowerCase(),
  };

  const errors = { ...validateVehicle(vehicle), ...validateChecks(checks), ...validateContact(contact) };
  if (hasErrors(errors) || isExitVehicle(vehicle)) return Response.json({ error: "invalid", errors }, { status: 422 });

  const utm = Object.fromEntries(
    Object.entries(body.utm ?? {})
      .filter(([k]) => /^(utm_[a-z]+|fbclid|source)$/.test(k))
      .map(([k, v]) => [k, clip(v, 100)]),
  );

  const saved = await getStore().upsertLead(body.id ?? null, {
    vehicle,
    checks,
    remark: clip(body.remark, 500),
    contact: { ...contact, phone: normalizeMobile(contact.phone)! },
    utm,
  });
  return Response.json({ id: saved.id });
}
