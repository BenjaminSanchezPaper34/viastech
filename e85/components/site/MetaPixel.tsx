"use client";
/**
 * Pixel Meta, désactivé tant que NEXT_PUBLIC_META_PIXEL_ID est vide.
 * Outil publicitaire : la CNIL exige un accord préalable, donc une question au visiteur
 * avant tout chargement. Le choix est mémorisé dans le navigateur.
 */
import { useEffect, useState } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const KEY = "viastech-pixel";

type Choice = "oui" | "non" | null;

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "oui" || v === "non" ? v : null;
  } catch {
    return null;
  }
}

function loadPixel(id: string) {
  const w = window as unknown as { fbq?: unknown; _fbq?: unknown };
  if (w.fbq) return;
  type Q = { (...a: unknown[]): void; queue: unknown[]; loaded: boolean; version: string; push: Q; callMethod?: (...a: unknown[]) => void };
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Q;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  w.fbq = n;
  w._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/fr_FR/fbevents.js";
  document.head.appendChild(s);
  n("init", id);
  n("track", "PageView");
}

export function MetaPixel() {
  const [choice, setChoice] = useState<Choice | "pending">("pending");

  useEffect(() => {
    if (!PIXEL_ID) return;
    const c = readChoice();
    // Choix mémorisé dans le navigateur : lisible seulement après le rendu serveur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(c);
    if (c === "oui") loadPixel(PIXEL_ID);
  }, []);

  if (!PIXEL_ID || choice !== null) return null;

  const decide = (c: "oui" | "non") => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    setChoice(c);
    if (c === "oui") loadPixel(PIXEL_ID);
  };

  return (
    <div
      role="dialog"
      aria-label="Mesure publicitaire"
      className="fixed inset-x-3 z-50 rounded-[var(--radius-choice)] border border-border bg-surface p-4 text-sm text-muted shadow-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <p className="mb-3">
        Acceptez-vous que nous mesurions l&apos;efficacité de nos publicités Facebook et Instagram sur cette page ?{" "}
        <a href="/confidentialite" className="underline">
          En savoir plus
        </a>
      </p>
      <div className="flex gap-2">
        <button onClick={() => decide("non")} className="min-h-11 flex-1 rounded-[var(--radius-button)] border border-border text-text">
          Refuser
        </button>
        <button onClick={() => decide("oui")} className="min-h-11 flex-1 rounded-[var(--radius-button)] border border-border text-text">
          Accepter
        </button>
      </div>
    </div>
  );
}
