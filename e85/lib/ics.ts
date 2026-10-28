/** Fichier .ics (RFC 5545) d'un rendez-vous, pour « Ajouter à mon agenda ». */
import { garage, garageAddressLine, mapsUrl, whatsappUrl } from "@/lib/config/garage";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** Les lignes de plus de 75 octets (accents compris) doivent être repliées. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 60) {
    out.push(rest.slice(0, 60));
    rest = " " + rest.slice(60);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function buildIcs(opts: { uid: string; start: Date; end: Date; title: string; details: string }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Garage Viastech//Reservation E85//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@viastech.fr`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(opts.end)}`,
    `SUMMARY:${escape(opts.title)}`,
    `LOCATION:${escape(`${garage.name}, ${garageAddressLine}`)}`,
    `DESCRIPTION:${escape(`${opts.details}\n\nItinéraire : ${mapsUrl}\nUne question : ${whatsappUrl()}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(opts.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
