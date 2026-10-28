/**
 * Champs de formulaire : libellé toujours visible, 16 px minimum (sinon iOS zoome), erreur sous le champ.
 */
import { useId, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

const FIELD =
  "block w-full min-h-[52px] rounded-[var(--radius-choice)] border bg-surface px-4 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none";

type Common = { label: string; error?: string; help?: string };

function Wrap({ id, label, error, help, children }: Common & { id: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      {children}
      {help && !error && <p className="mt-1.5 text-sm text-muted">{help}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, error, help, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} help={help}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${FIELD} ${error ? "border-danger" : "border-border"}`}
        {...input}
      />
    </Wrap>
  );
}

export function SelectField({
  label,
  error,
  help,
  options,
  placeholder,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder: string }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} help={help}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${FIELD} appearance-none pr-10 ${error ? "border-danger" : "border-border"} ${select.value ? "" : "text-muted"}`}
          {...select}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </Wrap>
  );
}

export function TextArea({ label, error, help, ...input }: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} help={help}>
      <textarea id={id} rows={3} className={`${FIELD} min-h-[96px] resize-none py-3 border-border`} {...input} />
    </Wrap>
  );
}
