import type { E85Request, RequestStatus } from "@/lib/e85/types";

export type NewRequest = Pick<E85Request, "vehicle" | "checks" | "remark" | "contact" | "utm">;

/** Erreur levée quand un autre client vient de prendre le même créneau. */
export class SlotTakenError extends Error {
  constructor() {
    super("slot_taken");
  }
}

export interface RequestStore {
  /** Crée la demande, ou met à jour celle d'id donné tant qu'elle n'a pas de créneau. */
  upsertLead(id: string | null, data: NewRequest): Promise<E85Request>;
  get(id: string): Promise<E85Request | null>;
  list(): Promise<E85Request[]>;
  /** Pose le créneau ; lève SlotTakenError si une réservation active l'occupe déjà. */
  reserve(id: string, slotStart: string): Promise<E85Request>;
  /** Champs modifiables après coup. */
  patch(
    id: string,
    fields: Partial<Pick<E85Request, "status" | "calendarEventId" | "reminderSentAt" | "cancelledAt" | "slotStart">>,
  ): Promise<E85Request | null>;
  /** Réservations actives dont le dépôt tombe dans [from, to[ et sans rappel envoyé. */
  dueForReminder(from: Date, to: Date): Promise<E85Request[]>;
}

export type { RequestStatus };
