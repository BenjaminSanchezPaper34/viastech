/**
 * Groupe de choix tactiles (boutons radio natifs, stylés en cartes).
 * Accessible au clavier et au lecteur d'écran sans ARIA supplémentaire.
 */
import { useId } from "react";

export type Option = { value: string; label: string };

type Props = {
  label: string;
  help?: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  /** Nombre de colonnes sur mobile (2 ou 3 pour des réponses courtes). */
  columns?: 1 | 2 | 3;
};

const COLS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

export function ChoiceButtons({ label, help, options, value, onChange, error, columns = 2 }: Props) {
  const id = useId();
  return (
    <fieldset className="mb-6" aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-2 text-base font-medium leading-snug">{label}</legend>
      {help && <p className="-mt-1 mb-2 text-sm text-muted">{help}</p>}
      <div className={`grid gap-2 ${COLS[columns]}`}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex min-h-[52px] cursor-pointer items-center justify-center rounded-[var(--radius-choice)] border px-3 text-center text-base transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                checked ? "border-accent bg-accent font-semibold text-bg" : "border-border bg-surface text-text active:border-muted"
              }`}
            >
              <input
                type="radio"
                name={id}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
