/**
 * Validation des saisies, utilisée à l'identique dans le navigateur et sur le serveur.
 * Renvoie un objet { champ: message } vide si tout est bon.
 */
import { e85Service } from "./service";
import type { Checks, Contact, Vehicle } from "./types";

export type Errors = Record<string, string>;

const CURRENT_YEAR = new Date().getFullYear();

/** Normalise un mobile français en +33XXXXXXXXX, ou renvoie null s'il n'est pas valide. */
export function normalizeMobile(raw: string): string | null {
  const digits = raw.replace(/[\s.\-()]/g, "");
  const m = digits.match(/^(?:\+33|0033|0)([67]\d{8})$/);
  return m ? `+33${m[1]}` : null;
}

export function formatMobile(e164: string) {
  const local = "0" + e164.replace(/^\+33/, "");
  return local.replace(/(\d{2})(?=\d)/g, "$1 ");
}

/** AB-123-CD (SIV) ou ancien format FNI ; on reste tolérant sur les séparateurs. */
export function normalizePlate(raw: string) {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const siv = s.match(/^([A-Z]{2})(\d{3})([A-Z]{2})$/);
  return siv ? `${siv[1]}-${siv[2]}-${siv[3]}` : s;
}

export function isExitVehicle(v: Pick<Vehicle, "type" | "fuel">) {
  return e85Service.exitVehicleTypes.includes(v.type) || e85Service.exitFuels.includes(v.fuel);
}

export function validateVehicle(v: Vehicle): Errors {
  const e: Errors = {};
  if (!v.type) e.type = "Choisissez le type de véhicule.";
  if (!v.fuel) e.fuel = "Choisissez le carburant actuel.";
  if (!v.brand.trim()) e.brand = "Indiquez la marque.";
  if (!v.model.trim()) e.model = "Indiquez le modèle.";
  const year = Number(v.year);
  if (!year || year < 1980 || year > CURRENT_YEAR + 1) e.year = "Choisissez l'année.";
  if (!v.engine.trim()) e.engine = "Indiquez la motorisation, par exemple 1.4 TSI 150 ch.";
  const plate = normalizePlate(v.plate);
  if (plate.length < 5 || plate.length > 10) e.plate = "Immatriculation incomplète.";
  const km = Number(v.mileage.replace(/\s/g, ""));
  if (!Number.isFinite(km) || km <= 0 || km > 1_500_000) e.mileage = "Indiquez le kilométrage.";
  return e;
}

export function validateChecks(c: Checks): Errors {
  const e: Errors = {};
  for (const q of e85Service.checks) {
    if (!q.choices.some((ch) => ch.value === c[q.id])) e[q.id] = "Choisissez une réponse.";
  }
  return e;
}

export function validateContact(c: Contact): Errors {
  const e: Errors = {};
  if (!c.firstName.trim()) e.firstName = "Indiquez votre prénom.";
  if (!c.lastName.trim()) e.lastName = "Indiquez votre nom.";
  if (!normalizeMobile(c.phone)) e.phone = "Indiquez un mobile français, par exemple 06 12 34 56 78.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e.email = "Adresse e-mail invalide.";
  if (!c.consent) e.consent = "Cochez la case pour que nous puissions vous recontacter.";
  return e;
}

export const hasErrors = (e: Errors) => Object.keys(e).length > 0;
