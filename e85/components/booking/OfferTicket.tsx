/**
 * Carte d'offre de l'accueil, en forme de ticket : le prix en haut, puis une ligne prédécoupée
 * (encoches rondes de chaque côté) et le « bon » du 1er plein offert en souche.
 * Lueur verte en haut et bordure teintée d'accent : c'est l'objet que l'œil doit trouver
 * juste sous la vidéo. Tout vient des tokens de la charte.
 */
type Props = {
  /** Petite ligne au-dessus du prix. */
  label: string;
  price: string;
  /** Texte du bon, par exemple « Votre 1er plein offert ». */
  bonus: string;
  bonusNote?: string;
};

const GLOW = {
  backgroundImage:
    "radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 65%)",
};

export function OfferTicket({ label, price, bonus, bonusNote }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-choice)] border border-accent/40 bg-surface text-center" style={GLOW}>
      <div className="px-5 pb-6 pt-5">
        <p className="font-mono text-sm uppercase tracking-[0.16em] text-muted">{label}</p>
        <p className="mt-2 font-display text-7xl font-bold leading-none tracking-[-0.03em] text-accent">{price}</p>
      </div>

      {/* Ligne prédécoupée : pointillés entre deux encoches couleur fond de page. */}
      <div className="relative h-0" aria-hidden="true">
        <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-accent/30" />
        <span className="absolute -left-3 -top-3 size-6 rounded-full border border-accent/40 bg-bg" />
        <span className="absolute -right-3 -top-3 size-6 rounded-full border border-accent/40 bg-bg" />
      </div>

      <div className="flex items-center justify-center gap-3 px-5 py-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg" aria-hidden="true">
          {/* Pompe à carburant */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
            <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5" />
          </svg>
        </span>
        <div className="text-left">
          <p className="text-lg font-semibold leading-tight text-text">{bonus}</p>
          {bonusNote && <p className="text-sm text-muted">{bonusNote}</p>}
        </div>
      </div>
    </div>
  );
}
