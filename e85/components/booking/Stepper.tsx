/**
 * En-tête du parcours : bouton retour, logo, et barre de progression signature
 * (segments en parallélogramme, coupés au même angle que les barres du « V » Viastech).
 */
type Props = {
  /** Étape courante, à partir de 1 ; 0 sur l'accueil : symbole seul, sans bouton retour ni jauge. */
  current: number;
  total: number;
  /** Nom de l'étape affiché au centre (« Créneau », « Coordonnées »…). */
  label?: string;
  /** Parcours terminé : jauge pleine, libellé seul sans numéro d'étape. */
  done?: boolean;
  onBack?: () => void;
};

export function Stepper({ current, total, label, done, onBack }: Props) {
  const headerClass = "sticky top-0 z-20 bg-bg/95 px-4 pb-3 backdrop-blur-sm";
  const headerStyle = { paddingTop: "calc(env(safe-area-inset-top) + 10px)" };

  // Accueil : symbole seul, posé en transparence sur la vidéo.
  if (current === 0) {
    return (
      <header className="absolute inset-x-0 top-0 z-20 px-4 pb-3" style={headerStyle}>
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/viastech-symbole-blanc.svg" alt="Viastech" width={53} height={44} className="h-11 w-auto" />
        </div>
      </header>
    );
  }

  // La jauge ne se remplit qu'à la confirmation : à la dernière étape elle n'est pas encore pleine.
  const fill = done ? 100 : (current / (total + 1)) * 100;

  return (
    <header className={headerClass} style={headerStyle}>
      <div className="mx-auto max-w-lg">
        <div className="flex h-11 items-center">
          {/* Emplacements fixes à gauche et à droite : le libellé reste centré, avec ou sans retour. */}
          <div className="-ml-2 size-11 shrink-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Étape précédente"
                className="flex size-11 items-center justify-center rounded-full text-text"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
          </div>

          <p className="min-w-0 flex-1 truncate text-center text-sm" aria-live="polite">
            {!done && (
              <span className="font-mono tracking-[0.08em] text-accent">
                {current}/{total}
                <span className="px-2 text-muted" aria-hidden="true">·</span>
              </span>
            )}
            <span className="font-medium text-text">{label}</span>
          </p>

          <div className="flex size-11 shrink-0 items-center justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/viastech-symbole-blanc.svg" alt="Viastech" width={31} height={26} className="h-[26px] w-auto" />
          </div>
        </div>

        {/* Jauge continue : une seule barre qui avance, plus lisible que des segments. */}
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(fill)}
          aria-label={done ? "Parcours terminé" : `Étape ${current} sur ${total}`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>
    </header>
  );
}
