/**
 * Gabarit d'un écran du parcours : titre, contenu, et action principale collée en bas
 * (le pouce l'atteint sans remonter, safe area comprise).
 */
type Props = {
  /** Chapeau en police mono au-dessus du titre (enchaînement de la charte : chapeau, titre, trait, texte). */
  kicker?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  /** Visuel pleine largeur au-dessus du titre (accueil) ; le titre vient se poser sur son fondu. */
  hero?: React.ReactNode;
  /** Change à chaque étape pour rejouer l'animation d'entrée. */
  stepKey: string;
};

export function StepLayout({ kicker, title, intro, children, action, stepKey, hero }: Props) {
  const heading = (
    <>
      {kicker && <p className="mb-2 font-mono text-sm uppercase tracking-[0.16em] text-accent">{kicker}</p>}
      <h1
        tabIndex={-1}
        className="step-title font-display text-[clamp(1.75rem,7vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] outline-none"
      >
        {title}
      </h1>
      <span className="line-mark mt-4" aria-hidden="true" />
    </>
  );

  return (
    <main className="flex flex-1 flex-col px-4">
      <div key={stepKey} className="mx-auto flex w-full max-w-lg flex-1 animate-step-in flex-col pt-4">
        {hero ? (
          // Le titre est ancré au bas du visuel : quelle que soit sa hauteur (une ou deux lignes),
          // le contenu qui suit commence sous le visuel et ne passe jamais sous son dégradé.
          <div className="relative">
            {hero}
            <div className="absolute inset-x-0 bottom-0 z-10 pb-1">{heading}</div>
          </div>
        ) : (
          heading
        )}
        {intro && <div className="mt-4 text-base text-muted">{intro}</div>}
        <div className="mt-6 flex-1">{children}</div>
      </div>
      {action && (
        <div
          // Fondu au-dessus de la barre : le texte qui défile dessous s'efface au lieu d'être tranché net.
          className="sticky bottom-0 z-10 -mx-4 mt-4 bg-bg px-4 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:-top-8 before:h-8 before:bg-gradient-to-t before:from-bg before:to-transparent"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
        >
          <div className="mx-auto max-w-lg">{action}</div>
        </div>
      )}
    </main>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function PrimaryButton({ children, loading, disabled, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-accent px-5 text-base font-semibold text-bg transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50 ${className}`}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-bg border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function SecondaryLink({ children, className = "", ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...rest}
      className={`flex min-h-13 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-5 text-base font-medium text-text ${className}`}
    >
      {children}
    </a>
  );
}
