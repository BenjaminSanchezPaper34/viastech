/**
 * Calculs de dates en heure de Paris sans librairie.
 * Le serveur Vercel tourne en UTC : on ne se fie jamais au fuseau de la machine.
 */
const TZ = "Europe/Paris";

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Composantes d'un instant, lues en heure de Paris. */
export function parisParts(date: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    weekday: WEEKDAYS[p.weekday as string],
    /** AAAA-MM-JJ */
    ymd: `${p.year}-${p.month}-${p.day}`,
  };
}

/** Instant UTC correspondant à une date + heure murale de Paris (gère l'heure d'été). */
export function parisToUtc(ymd: string, hhmm: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, min);
  // Deux passes suffisent : la seconde corrige le cas où le décalage change entre les deux.
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    const p = parisParts(new Date(guess));
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    guess += wall - asUtc;
  }
  return new Date(guess);
}

/** Ajoute n jours à une date AAAA-MM-JJ (calcul calendaire, sans fuseau). */
export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Jour de la semaine (0 = dimanche) d'une date AAAA-MM-JJ. */
export function weekdayOf(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const longDate = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const hourFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** « mardi 4 novembre » */
export function formatLongDate(date: Date) {
  return longDate.format(date);
}

/** « 8h30 » */
export function formatHour(date: Date) {
  return hourFmt.format(date).replace(":", "h").replace(/h00$/, "h").replace(/^0/, "");
}

/** « mardi 4 novembre à 8h30 » */
export function formatSlot(date: Date) {
  return `${formatLongDate(date)} à ${formatHour(date)}`;
}
