/**
 * En-tête du parcours : bouton retour, logo, et barre de progression signature
 * (segments en parallélogramme, coupés au même angle que les barres du « V » Viastech).
 */
type Props = {
  /** Étape courante, à partir de 1 ; 0 sur l'accueil : logo seul, sans bouton retour ni barre. */
  current: number;
  total: number;
  onBack?: () => void;
};

export function Stepper({ current, total, onBack }: Props) {
  const headerClass = "sticky top-0 z-20 bg-bg/95 px-4 pb-3 backdrop-blur-sm";
  const headerStyle = { paddingTop: "calc(env(safe-area-inset-top) + 10px)" };

  if (current === 0) {
    return (
      <header className={headerClass} style={headerStyle}>
        <div className="mx-auto flex h-11 max-w-lg items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/viastech-logo-blanc.svg" alt="Viastech" width={134} height={32} className="h-8 w-auto" />
        </div>
      </header>
    );
  }

  return (
    <header className={headerClass} style={headerStyle}>
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Étape précédente"
          className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-text transition-opacity disabled:pointer-events-none disabled:opacity-0"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current}
          aria-label={`Étape ${current} sur ${total}`}
        >
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className="h-2 flex-1 -skew-x-[28deg] overflow-hidden rounded-[2px] bg-border">
              <span
                className="block h-full origin-left bg-accent transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${i < current ? 1 : 0})` }}
              />
            </span>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/viastech-symbole-blanc.svg" alt="Viastech" width={31} height={26} className="h-[26px] w-auto shrink-0" />
      </div>
    </header>
  );
}
