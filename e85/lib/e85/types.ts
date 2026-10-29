/** Formes de données partagées entre le parcours (client) et l'API (serveur). */

/** L'immatriculation suffit au garage pour identifier marque, modèle, année et motorisation. */
export type Vehicle = {
  fuel: string;
  plate: string;
  mileage: string;
};

export type Contact = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
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

/** Une demande enregistrée (créée à la confirmation, juste avant la réservation du créneau). */
export type E85Request = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  vehicle: Vehicle;
  checks: Checks;
  remark: string;
  contact: Contact;
  utm: Record<string, string>;
  slotStart: string | null;
  calendarEventId: string | null;
  reminderSentAt: string | null;
  cancelledAt: string | null;
};

export type Slot = { time: string; start: string };
export type SlotDay = { date: string; slots: Slot[] };
