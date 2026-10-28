export type CalendarEvent = {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  /** Événement « journée entière » : le garage est fermé ces jours-là. */
  allDay: boolean;
  /** Pour un événement journée entière : jours couverts (AAAA-MM-JJ). */
  days: string[];
};

export type NewEvent = {
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  bookingId: string;
};

export interface CalendarProvider {
  readonly name: "google" | "mock";
  listEvents(from: Date, to: Date): Promise<CalendarEvent[]>;
  createEvent(event: NewEvent): Promise<string>;
  deleteEvent(id: string): Promise<void>;
}

/** Une pose E85 occupe la capacité du jour : réservée en ligne, ou saisie à la main avec un titre « E85 … ». */
export function isPose(e: CalendarEvent) {
  return !e.allDay && /^\s*E85\b/i.test(e.summary);
}
