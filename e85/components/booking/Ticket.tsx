/**
 * Gabarit « ticket » partagé par la carte d'offre (accueil) et le récapitulatif (coordonnées) :
 * bordure teintée d'accent, lueur verte en haut, ligne prédécoupée avec encoches.
 */
const GLOW = {
  backgroundImage:
    "radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 65%)",
};

export function TicketCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-choice)] border border-accent/40 bg-surface ${className}`}
      style={GLOW}
    >
      {children}
    </div>
  );
}

/** Ligne prédécoupée : pointillés entre deux encoches couleur fond de page. */
export function TicketPerforation() {
  return (
    <div className="relative h-0" aria-hidden="true">
      <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-accent/30" />
      <span className="absolute -left-3 -top-3 size-6 rounded-full border border-accent/40 bg-bg" />
      <span className="absolute -right-3 -top-3 size-6 rounded-full border border-accent/40 bg-bg" />
    </div>
  );
}

/** Pastille ronde verte portant une icône (pompe, calendrier…). */
export function TicketIcon({ children, size = "md" }: { children: React.ReactNode; size?: "sm" | "md" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent text-bg ${size === "md" ? "size-11" : "size-9"}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const PumpIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ICON}>
    <path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5" />
  </svg>
);

export const PinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ICON}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
