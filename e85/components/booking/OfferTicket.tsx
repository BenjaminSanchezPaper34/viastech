/**
 * Carte d'offre de l'accueil, en forme de ticket : le prix en haut, puis la ligne prédécoupée
 * et le « bon » du 1er plein offert en souche. C'est l'objet que l'œil doit trouver juste sous la vidéo.
 */
import { PumpIcon, TicketCard, TicketIcon, TicketPerforation } from "./Ticket";

type Props = {
  /** Petite ligne au-dessus du prix. */
  label: string;
  price: string;
  /** Texte du bon, par exemple « Votre 1er plein offert ». */
  bonus: string;
  bonusNote?: string;
};

export function OfferTicket({ label, price, bonus, bonusNote }: Props) {
  return (
    <TicketCard className="text-center">
      <div className="px-5 pb-6 pt-5">
        <p className="font-mono text-sm uppercase tracking-[0.16em] text-muted">{label}</p>
        <p className="mt-2 font-display text-7xl font-bold leading-none tracking-[-0.03em] text-accent">{price}</p>
      </div>
      <TicketPerforation />
      <div className="flex items-center justify-center gap-3 px-4 py-5">
        <TicketIcon>
          <PumpIcon />
        </TicketIcon>
        <div className="min-w-0 text-left">
          {/* Taille fluide + pas de retour à la ligne : « offert » ne part jamais seul sur un petit écran. */}
          <p className="whitespace-nowrap text-[clamp(1rem,4.6vw,1.125rem)] font-semibold leading-tight text-text">{bonus}</p>
          {bonusNote && <p className="text-sm text-muted">{bonusNote}</p>}
        </div>
      </div>
    </TicketCard>
  );
}
