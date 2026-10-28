/**
 * Google Agenda via l'API REST et un compte de service, sans le SDK googleapis
 * (trop lourd pour une fonction serverless). Le jeton JWT est signé avec node:crypto.
 */
import { createSign } from "node:crypto";
import { garage } from "@/lib/config/garage";
import { addDays } from "@/lib/time";
import type { CalendarEvent, CalendarProvider, NewEvent } from "./types";

const API = "https://www.googleapis.com/calendar/v3";
let cachedToken: { value: string; expiresAt: number } | null = null;

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  // Vercel et .env stockent la clé sur une ligne : on restaure les retours à la ligne.
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  )}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google OAuth ${res.status} : ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 410) throw new Error(`Google Agenda ${res.status} : ${await res.text()}`);
  return res;
}

type GEvent = {
  id: string;
  status?: string;
  summary?: string;
  transparency?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
};

function toEvent(g: GEvent): CalendarEvent {
  if (g.start.date && g.end.date) {
    const days: string[] = [];
    for (let d = g.start.date; d < g.end.date; d = addDays(d, 1)) days.push(d);
    return {
      id: g.id,
      summary: g.summary ?? "",
      start: new Date(`${g.start.date}T00:00:00Z`),
      end: new Date(`${g.end.date}T00:00:00Z`),
      allDay: true,
      days,
    };
  }
  return {
    id: g.id,
    summary: g.summary ?? "",
    start: new Date(g.start.dateTime!),
    end: new Date(g.end.dateTime!),
    allDay: false,
    days: [],
  };
}

export function googleCalendar(): CalendarProvider {
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
  return {
    name: "google",

    async listEvents(from, to) {
      const events: CalendarEvent[] = [];
      let pageToken = "";
      do {
        const q = new URLSearchParams({
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          singleEvents: "true",
          maxResults: "250",
          ...(pageToken ? { pageToken } : {}),
        });
        const data = (await (await call(`/calendars/${calendarId}/events?${q}`)).json()) as {
          items: GEvent[];
          nextPageToken?: string;
        };
        for (const g of data.items) {
          // « Disponible » (transparent) ou annulé : n'occupe pas l'atelier.
          if (g.status === "cancelled" || g.transparency === "transparent") continue;
          events.push(toEvent(g));
        }
        pageToken = data.nextPageToken ?? "";
      } while (pageToken);
      return events;
    },

    async createEvent(e: NewEvent) {
      const res = await call(`/calendars/${calendarId}/events`, {
        method: "POST",
        body: JSON.stringify({
          summary: e.summary,
          description: e.description,
          location: e.location,
          start: { dateTime: e.start.toISOString(), timeZone: garage.timezone },
          end: { dateTime: e.end.toISOString(), timeZone: garage.timezone },
          extendedProperties: { private: { source: "e85-web", bookingId: e.bookingId } },
          reminders: { useDefault: true },
        }),
      });
      return ((await res.json()) as { id: string }).id;
    },

    async deleteEvent(id) {
      await call(`/calendars/${calendarId}/events/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  };
}
