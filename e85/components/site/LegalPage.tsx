import Link from "next/link";
import { Footer } from "./Footer";

/** Gabarit des pages légales : lecture confortable, retour au parcours en un geste. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}>
        <Link href="/e85" className="inline-flex min-h-11 items-center text-base text-muted underline underline-offset-4">
          Retour à la réservation
        </Link>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,7vw,2.5rem)] leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">Mise à jour : {updated}</p>
        <div className="legal mt-8 space-y-4 text-base leading-relaxed [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-text">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

/** Donnée société manquante : visible, pour ne jamais publier une information inventée. */
export function ToComplete({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-danger/20 px-1 text-text">[À compléter : {children}]</mark>;
}
