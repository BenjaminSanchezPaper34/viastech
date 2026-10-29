/**
 * Récapitulatif du dernier écran (coordonnées), dans le même gabarit ticket que l'offre de l'accueil :
 * en haut le rendez-vous (pavé de date façon calendrier), sous la ligne prédécoupée le véhicule
 * (plaque à la française), l'adresse et le prix. Le client relit tout d'un coup d'œil avant de confirmer.
 */
import { PinIcon, TicketCard, TicketPerforation } from "./Ticket";

type Props = {
  slotStart: string;
  /** Durée de pose en heures, affichée sous l'heure de dépôt. */
  blockHours: number;
  plate: string;
  address: string;
  price: string;
  offer: string;
};

const TZ = "Europe/Paris";
const weekday = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "short" });
const dayNum = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric" });
const month = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, month: "short" });
const longDate = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const hour = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const fmtHour = (d: Date) => hour.format(d).replace(":", "h").replace(/h00$/, "h").replace(/^0/, "");

export function RecapTicket({ slotStart, blockHours, plate, address, price, offer }: Props) {
  const d = new Date(slotStart);
  const [street, ...others] = address.split(", ");
  const rest = others.join(", ");
  return (
    <TicketCard>
      <div className="px-4 pb-5 pt-4">
        <p className="font-mono text-sm uppercase tracking-[0.16em] text-muted">Votre rendez-vous</p>
        <div className="mt-3 flex items-center gap-4">
          {/* Pavé de date façon page de calendrier. */}
          <div className="flex w-16 shrink-0 flex-col items-center rounded-[10px] border border-accent/40 bg-bg py-2 leading-none">
            <span className="font-mono text-sm uppercase tracking-[0.08em] text-accent">{weekday.format(d).replace(".", "")}</span>
            <span className="mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-text">{dayNum.format(d)}</span>
            <span className="mt-1 text-sm text-muted">{month.format(d).replace(".", "")}</span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-text">{cap(longDate.format(d))}</p>
            <p className="mt-1 text-base text-text">
              Dépôt à <strong className="text-accent">{fmtHour(d)}</strong>
            </p>
            <p className="text-sm text-muted">Environ {blockHours} h de pose</p>
          </div>
        </div>
      </div>

      <TicketPerforation />

      <dl className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-muted">Véhicule</dt>
          <dd>
            {/* Plaque à la française : bande bleue, caractères noirs sur fond blanc. */}
            <span className="inline-flex items-stretch overflow-hidden rounded-[5px] border border-plate-band/60 bg-plate font-mono text-base font-semibold tracking-[0.08em] text-bg">
              <span className="flex w-3.5 items-end justify-center bg-plate-band pb-0.5 text-[8px] font-bold text-plate" aria-hidden="true">
                F
              </span>
              <span className="px-2.5 py-1">{plate}</span>
            </span>
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="pt-0.5 text-sm text-muted">Adresse</dt>
          {/* Rue sur une ligne (épingle collée devant), zone et ville sur la suivante : jamais de coupure au milieu d'un nom. */}
          <dd className="text-right text-sm text-text">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-accent">
                <PinIcon size={16} />
              </span>
              {street}
            </span>
            <br />
            {rest}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
          <dt className="text-sm text-muted">Conversion E85</dt>
          <dd className="text-right">
            <span className="whitespace-nowrap font-display text-2xl font-bold tracking-[-0.025em] text-accent">{price}</span>
            <span className="block text-sm text-text">{cap(offer)}</span>
          </dd>
        </div>
      </dl>
    </TicketCard>
  );
}
