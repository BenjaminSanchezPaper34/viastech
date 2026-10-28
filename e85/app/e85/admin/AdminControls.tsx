"use client";
import { useActionState, useTransition } from "react";
import { STATUS_LABELS, type RequestStatus } from "@/lib/e85/types";
import { loginAction, setStatusAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="pw" className="block text-sm text-muted">
        Mot de passe
      </label>
      <input
        id="pw"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="block min-h-[52px] w-full rounded-[var(--radius-choice)] border border-border bg-surface px-4 text-base focus:border-accent focus:outline-none"
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="min-h-14 w-full rounded-[var(--radius-button)] bg-accent font-semibold text-bg disabled:opacity-50">
        Entrer
      </button>
    </form>
  );
}

const EDITABLE: RequestStatus[] = ["reserve", "venu", "absent", "annule"];

export function StatusSelect({ id, status }: { id: string; status: RequestStatus }) {
  const [pending, start] = useTransition();
  if (status === "incomplet" || status === "annule") {
    return <span className="text-sm text-muted">{STATUS_LABELS[status]}</span>;
  }
  return (
    <select
      aria-label="Statut"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as RequestStatus;
        if (next === "annule" && !confirm("Annuler ce rendez-vous ? Le créneau sera libéré dans l'agenda.")) {
          e.target.value = status;
          return;
        }
        start(() => setStatusAction(id, next));
      }}
      className="min-h-11 rounded-[var(--radius-button)] border border-border bg-bg px-3 text-sm text-text disabled:opacity-50"
    >
      {EDITABLE.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
