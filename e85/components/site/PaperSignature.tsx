"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Moteur WebGL chargé seulement au premier survol : rien à télécharger pour le visiteur qui ne survole pas.
const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

/**
 * Signature Paper34 avec sa folie : au survol du logo, le footer
 * s'embrase d'une fumée fluide aux couleurs MegaKart (simulation
 * WebGL du lab Paper34 — splash-cinema). Éruption au moment du
 * survol, puis la fumée suit le curseur ; tout se dissipe et le
 * canvas est démonté 3 s après la sortie (zéro coût GPU au repos).
 */

// Les bleus Paper34 — la DA du studio, pas celle du client
const SMOKE = [
  { r: 0, g: 0.45, b: 0.9 },
  { r: 0.1, g: 0.6, b: 1.0 },
  { r: 0.6, g: 0.4, b: 1.0 },
  { r: 0.0, g: 0.3, b: 0.7 },
];

export default function PaperSignature() {
  const [active, setActive] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const emitRef = useRef(true);
  const api = useRef<{
    splashAt: (x: number, y: number, intensity?: number) => void;
  } | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const offTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches;
  }, []);

  // Éruption : une seule onde circulaire (splash radial simultané)
  // au centre du logo — ensuite le mousemove naturel prend le relais.
  const burst = useCallback((retry = 3) => {
    const el = logoRef.current;
    if (!el) return;
    if (!api.current) {
      // Le moteur n'a pas encore fini de monter : on repasse un peu après
      if (retry > 0) setTimeout(() => burst(retry - 1), 120);
      return;
    }
    const rect = el.getBoundingClientRect();
    // Onde d'accueil adoucie — la pleine puissance reste dispo via intensity
    api.current.splashAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.45);
  }, []);

  const onEnter = useCallback(() => {
    if (reduced.current) return;
    clearTimeout(offTimer.current);
    clearTimeout(stopTimer.current);
    emitRef.current = true;
    setActive(true);
    // Le canvas doit être monté avant l'éruption
    requestAnimationFrame(() => setTimeout(burst, 60));
  }, [burst]);

  const onLeave = useCallback(() => {
    clearTimeout(stopTimer.current);
    clearTimeout(offTimer.current);
    // On coupe le robinet peu après la sortie : plus aucune nouvelle
    // vague, la dernière se désagrège tranquillement à l'écran…
    stopTimer.current = setTimeout(() => (emitRef.current = false), 500);
    // …et le canvas n'est démonté qu'une fois la fumée entièrement
    // dissipée (silencieux, aucun fondu d'opacité).
    offTimer.current = setTimeout(() => setActive(false), 10000);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(offTimer.current);
      clearTimeout(stopTimer.current);
    },
    []
  );

  return (
    <>
      {/* Voile fluide sur tout le footer (ancêtre positionné = <footer>) */}
      {active && (
        <div className="absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
          <SplashCursor
            colors={SMOKE}
            emitRef={emitRef}
            apiRef={api}
            densityDissipation={1.6}
            velocityDissipation={1.6}
            curl={8}
            splatRadius={0.28}
            splatForce={7000}
          />
        </div>
      )}

      <a
        ref={logoRef}
        href="https://www.paper34.fr"
        target="_blank"
        rel="noopener noreferrer"
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        className="group relative z-20 inline-flex items-baseline gap-2"
        aria-label="Site réalisé par Paper34 — studio design & web"
      >
        <span className="whitespace-nowrap transition-colors group-hover:text-white">
          Réalisé par
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-paper34.svg"
          alt="Paper34"
          width={78}
          height={14}
          className="h-3 w-auto opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        />
      </a>
    </>
  );
}
