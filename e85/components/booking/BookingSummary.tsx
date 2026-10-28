/**
 * Récapitulatif avant validation (et sur l'écran de confirmation).
 * Générique : lignes libellé / valeur, prix mis en avant, mentions en pied.
 */
type Props = {
  rows: [string, React.ReactNode][];
  price?: string;
  priceNote?: string;
  footer?: React.ReactNode;
};

export function BookingSummary({ rows, price, priceNote, footer }: Props) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-choice)] border border-border bg-surface">
      {price && (
        <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-4">
          <span className="font-display text-3xl font-bold tracking-[-0.025em] text-accent">{price}</span>
          {priceNote && <span className="text-right text-sm text-text">{priceNote}</span>}
        </div>
      )}
      <dl className="divide-y divide-border">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-base">{value}</dd>
          </div>
        ))}
      </dl>
      {footer && <div className="border-t border-border px-4 py-3 text-sm text-muted">{footer}</div>}
    </div>
  );
}
