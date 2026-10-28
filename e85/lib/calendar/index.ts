import "server-only";
import { googleCalendar } from "./google";
import { mockCalendar } from "./mock";
import type { CalendarProvider } from "./types";

export * from "./types";

/** Google Agenda si les trois variables sont présentes, sinon l'agenda simulé local. */
export function getCalendar(): CalendarProvider {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = process.env;
  return GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_CALENDAR_ID ? googleCalendar() : mockCalendar();
}
