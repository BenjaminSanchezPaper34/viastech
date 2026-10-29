/**
 * Choix du créneau : semaines du lundi au vendredi (jours libres en clair, les autres grisés),
 * puis les heures de dépôt du jour choisi. Ne connaît rien de l'E85 : réutilisable tel quel.
 */
import { useEffect, useRef } from "react";
import type { SlotDay } from "@/lib/e85/types";

type Props = {
  days: SlotDay[];
  /** Instant ISO du créneau choisi. */
  value: string | null;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (start: string) => void;
  /** Précision sous les heures (ex. moment de récupération du véhicule). */
  note?: string;
};

const utc = (ymd: string) => new Date(`${ymd}T12:00:00Z`);
const addDays = (ymd: string, n: number) => new Date(utc(ymd).getTime() + n * 86_400_000).toISOString().slice(0, 10);
const dayNum = new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: "UTC" });
const dayShort = new Intl.DateTimeFormat("fr-FR", { weekday: "short", timeZone: "UTC" });
const dayLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });

/** Semaines (lundi → vendredi) couvrant tous les jours libres. */
function weeks(days: SlotDay[]) {
  if (!days.length) return [];
  const first = days[0].date;
  const monday = addDays(first, -((utc(first).getUTCDay() + 6) % 7));
  const last = days[days.length - 1].date;
  const out: string[][] = [];
  for (let m = monday; m <= last; m = addDays(m, 7)) out.push([0, 1, 2, 3, 4].map((i) => addDays(m, i)));
  return out;
}

export function SlotPicker({ days, value, selectedDate, onSelectDate, onSelectSlot, note }: Props) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const selected = selectedDate ? byDate.get(selectedDate) : undefined;
  const hoursRef = useRef<HTMLDivElement>(null);

  // Les heures apparaissent sous le calendrier, souvent hors de l'écran du téléphone : on les y amène.
  useEffect(() => {
    if (selectedDate) hoursRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedDate]);

  return (
    <div>
      <div className="space-y-5">
        {weeks(days).map((week) => (
          <section key={week[0]} aria-label={`Semaine du ${monthFmt.format(utc(week[0]))}`}>
            <h2 className="mb-2 text-sm text-muted">Semaine du {monthFmt.format(utc(week[0]))}</h2>
            <div className="grid grid-cols-5 gap-1.5">
              {week.map((date) => {
                const available = byDate.has(date);
                const isSel = date === selectedDate;
                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!available}
                    aria-pressed={isSel}
                    aria-label={`${dayLong.format(utc(date))}${available ? "" : ", complet ou fermé"}`}
                    onClick={() => onSelectDate(date)}
                    className={`flex min-h-[60px] flex-col items-center justify-center rounded-[var(--radius-choice)] border text-center transition-colors duration-150 ${
                      isSel
                        ? "border-accent bg-accent text-bg"
                        : available
                          ? "border-border bg-surface text-text"
                          : "border-transparent text-muted/40 line-through"
                    }`}
                  >
                    <span className="text-sm capitalize leading-none">{dayShort.format(utc(date)).replace(".", "")}</span>
                    <span className="mt-1 text-lg font-semibold leading-none">{dayNum.format(utc(date))}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div ref={hoursRef} className="mt-6 scroll-mb-28 animate-step-in" aria-live="polite">
          <h2 className="mb-2 text-base font-medium">
            Heure de dépôt, {dayLong.format(utc(selected.date))}
          </h2>
          <div className="flex flex-wrap gap-2">
            {selected.slots.map((s) => {
              const isSel = s.start === value;
              return (
                <button
                  key={s.start}
                  type="button"
                  aria-pressed={isSel}
                  onClick={() => onSelectSlot(s.start)}
                  className={`min-h-[52px] min-w-28 rounded-full border px-5 text-base font-semibold transition-colors duration-150 ${
                    isSel ? "border-accent bg-accent text-bg" : "border-border bg-surface text-text"
                  }`}
                >
                  {s.time.replace(":", "h").replace(/h00$/, "h").replace(/^0/, "")}
                </button>
              );
            })}
          </div>
          {note && <p className="mt-3 text-sm text-muted">{note}</p>}
        </div>
      )}
    </div>
  );
}
