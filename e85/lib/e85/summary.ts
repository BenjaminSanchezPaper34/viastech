/**
 * Mise en forme d'une demande, partagée par l'événement d'agenda, les e-mails et l'admin.
 */
import { bookingRules } from "@/lib/config/booking";
import { formatSlot } from "@/lib/time";
import { e85Service, labelOf } from "./service";
import type { E85Request } from "./types";
import { formatMobile } from "./validate";

export const vehicleTitle = (r: E85Request) => `${r.vehicle.brand} ${r.vehicle.model}`.trim();
export const fullName = (r: E85Request) => `${r.contact.firstName} ${r.contact.lastName}`.trim();

export function eventTitle(r: E85Request) {
  return `E85 - ${vehicleTitle(r)} - ${fullName(r)}`;
}

export function slotEnd(start: Date) {
  return new Date(start.getTime() + bookingRules.blockHours * 3_600_000);
}

/** Réponses de l'étape « état du véhicule », avec un repère sur celles qui méritent attention. */
export function checkLines(r: E85Request) {
  return e85Service.checks.map((q) => {
    const value = r.checks[q.id];
    return { label: q.label, answer: labelOf(q.choices, value), attention: !!q.attention?.includes(value) };
  });
}

export function vehicleLines(r: E85Request): [string, string][] {
  const v = r.vehicle;
  return [
    ["Véhicule", `${labelOf(e85Service.vehicleTypes, v.type)} ${vehicleTitle(r)}`],
    ["Année", v.year],
    ["Motorisation", v.engine],
    ["Carburant actuel", labelOf(e85Service.fuels, v.fuel)],
    ["Immatriculation", v.plate],
    ["Kilométrage", `${Number(v.mileage).toLocaleString("fr-FR")} km`],
  ];
}

/** Texte brut de l'événement d'agenda (Google rend les liens tel: cliquables). */
export function eventDescription(r: E85Request) {
  const tel = r.contact.phone;
  const lines = [
    `Client : ${fullName(r)}`,
    `Téléphone : ${formatMobile(tel)} (tel:${tel})`,
    `WhatsApp : https://wa.me/${tel.replace("+", "")}`,
    `E-mail : ${r.contact.email}`,
    "",
    ...vehicleLines(r).map(([k, v]) => `${k} : ${v}`),
    "",
    "État du véhicule :",
    ...checkLines(r).map((c) => `${c.attention ? "⚠ " : "- "}${c.label} ${c.answer}`),
  ];
  if (r.remark) lines.push("", `Remarque : ${r.remark}`);
  if (r.slotStart) lines.push("", `Dépôt : ${formatSlot(new Date(r.slotStart))}`);
  lines.push("", `Prestation : ${e85Service.title}, ${e85Service.priceLabel}, ${e85Service.offer}`);
  const src = Object.entries(r.utm)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  if (src) lines.push(`Provenance : ${src}`);
  return lines.join("\n");
}
