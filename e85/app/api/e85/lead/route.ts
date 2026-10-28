/**
 * Étape « coordonnées » : enregistre la demande avant le choix du créneau.
 * Le garage voit ainsi aussi ceux qui abandonnent au calendrier, et peut les rappeler
 * (ils ont coché la case de recontact).
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
    type: clip(body.vehicle?.type, 20),
    fuel: clip(body.vehicle?.fuel, 20),
    brand: clip(body.vehicle?.brand, 40),
    model: clip(body.vehicle?.model, 60),
    year: clip(body.vehicle?.year, 4),
    engine: clip(body.vehicle?.engine, 60),
    plate: normalizePlate(clip(body.vehicle?.plate, 15)),
    mileage: clip(body.vehicle?.mileage, 10).replace(/\D/g, ""),
  };
  const checks: Checks = Object.fromEntries(Object.entries(body.checks ?? {}).map(([k, v]) => [clip(k, 30), clip(v, 10)]));
  const contact: Contact = {
    firstName: clip(body.contact?.firstName, 60),
    lastName: clip(body.contact?.lastName, 60),
    phone: clip(body.contact?.phone, 25),
    email: clip(body.contact?.email, 120).toLowerCase(),
    consent: body.contact?.consent === true,
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
    contact: { ...contact, phone: normalizeMobile(contact.phone)!, consentAt: new Date().toISOString() },
    utm,
  });
  return Response.json({ id: saved.id });
}
