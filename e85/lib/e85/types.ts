/** Formes de données partagées entre le parcours (client) et l'API (serveur). */

export type Vehicle = {
  type: string;
  fuel: string;
  brand: string;
  model: string;
  year: string;
  engine: string;
  plate: string;
  mileage: string;
};

export type Contact = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  consent: boolean;
};

export type Checks = Record<string, string>;

export type RequestStatus = "incomplet" | "reserve" | "annule" | "venu" | "absent";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  incomplet: "Sans créneau",
  reserve: "Réservé",
  annule: "Annulé",
  venu: "Venu",
  absent: "Pas venu",
};

/** Une demande enregistrée (créée à l'étape coordonnées, complétée à la réservation). */
export type E85Request = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  vehicle: Vehicle;
  checks: Checks;
  remark: string;
  contact: Contact & { consentAt: string };
  utm: Record<string, string>;
  slotStart: string | null;
  calendarEventId: string | null;
  reminderSentAt: string | null;
  cancelledAt: string | null;
};

export type Slot = { time: string; start: string };
export type SlotDay = { date: string; slots: Slot[] };
