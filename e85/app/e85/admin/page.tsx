/**
 * Tableau de bord du garage : demandes, statuts, taux de conversion, export CSV.
 * « Sans créneau » = la personne a laissé ses coordonnées mais n'a pas réservé : à rappeler.
 */
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { checkLines, fullName, vehicleTitle } from "@/lib/e85/summary";
import { STATUS_LABELS, type E85Request } from "@/lib/e85/types";
import { formatMobile } from "@/lib/e85/validate";
import { getStore } from "@/lib/store";
import { formatSlot } from "@/lib/time";
import { logoutAction } from "./actions";
import { LoginForm, StatusSelect } from "./AdminControls";

export const metadata: Metadata = { title: "Demandes E85 | Viastech", robots: { index: false, follow: false } };

const created = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)} %` : "–");
const source = (r: E85Request) => r.utm.utm_source ?? r.utm.source ?? (r.utm.fbclid ? "meta" : "direct");

function stats(rows: E85Request[]) {
  const count = (s: E85Request["status"]) => rows.filter((r) => r.status === s).length;
  const booked = rows.filter((r) => r.slotStart || r.status === "annule").length;
  const venu = count("venu");
  const absent = count("absent");
  return [
    { label: "Demandes", value: String(rows.length) },
    { label: "Réservations", value: String(booked), note: `${pct(booked, rows.length)} des demandes` },
    { label: "À venir", value: String(count("reserve")) },
    { label: "Venus", value: String(venu), note: `${pct(venu, venu + absent)} de présence` },
    { label: "Annulés", value: String(count("annule")) },
    { label: "Sans créneau", value: String(count("incomplet")), note: "à rappeler" },
  ];
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16">
        <h1 className="mb-6 font-display text-3xl">Demandes E85</h1>
        <LoginForm />
      </main>
    );
  }

  const rows = await getStore().list();
  const sources = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => ((acc[source(r)] = (acc[source(r)] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Demandes E85</h1>
        <div className="flex gap-2">
          <a href="/api/e85/admin/export" className="flex min-h-11 items-center rounded-[var(--radius-button)] bg-accent px-4 text-sm font-semibold text-bg">
            Exporter en CSV
          </a>
          <form action={logoutAction}>
            <button className="min-h-11 rounded-[var(--radius-button)] border border-border px-4 text-sm">Se déconnecter</button>
          </form>
        </div>
      </div>

      <section className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats(rows).map((s) => (
          <div key={s.label} className="rounded-[var(--radius-choice)] border border-border bg-surface p-4">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 font-display text-3xl">{s.value}</p>
            {s.note && <p className="mt-1 text-sm text-muted">{s.note}</p>}
          </div>
        ))}
      </section>
      {sources.length > 0 && (
        <p className="mb-8 text-sm text-muted">
          Provenance : {sources.map(([k, v]) => `${k} ${v}`).join(" · ")}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-base text-muted">Aucune demande pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const flagged = checkLines(r).filter((c) => c.attention);
            return (
              <li key={r.id} className="rounded-[var(--radius-choice)] border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{fullName(r)}</p>
                    <p className="text-base">
                      <a href={`tel:${r.contact.phone}`} className="text-accent underline underline-offset-2">
                        {formatMobile(r.contact.phone)}
                      </a>
                      <span className="text-muted"> · {r.contact.email}</span>
                    </p>
                  </div>
                  <StatusSelect id={r.id} status={r.status} />
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="inline text-muted">Véhicule : </dt>
                    <dd className="inline">
                      {vehicleTitle(r)}, {Number(r.vehicle.mileage).toLocaleString("fr-FR")} km
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted">Créneau : </dt>
                    <dd className="inline">{r.slotStart ? formatSlot(new Date(r.slotStart)) : "aucun"}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted">Demande : </dt>
                    <dd className="inline">
                      {created.format(new Date(r.createdAt))} · {source(r)}
                    </dd>
                  </div>
                  {flagged.length > 0 && (
                    <div>
                      <dt className="inline text-muted">À vérifier : </dt>
                      <dd className="inline text-danger">{flagged.map((c) => c.label).join(" · ")}</dd>
                    </div>
                  )}
                  {r.remark && (
                    <div className="sm:col-span-2">
                      <dt className="inline text-muted">Remarque : </dt>
                      <dd className="inline">{r.remark}</dd>
                    </div>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-8 text-xs text-muted">Statuts : {Object.values(STATUS_LABELS).join(", ")}.</p>
    </main>
  );
}
