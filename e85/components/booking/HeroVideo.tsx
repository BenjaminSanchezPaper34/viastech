"use client";
/**
 * Vidéo d'atelier en tête de l'accueil : muette, en boucle, lue en ligne sur iPhone.
 * Pensée pour le téléphone (95 % des visites) :
 * - l'affiche est une vraie image prioritaire : elle s'affiche tout de suite (LCP) ;
 * - la vidéo ne se charge qu'une fois la page prête, puis apparaît en fondu quand elle tourne ;
 * - elle se met en pause hors de l'écran (batterie) ;
 * - rien n'est lancé si le visiteur demande moins d'animations ou économise ses données.
 * Le bas est fondu dans le fond de page pour que le titre se pose dessus.
 */
import { useEffect, useRef, useState } from "react";

const POSTER = "/video/e85-hero-poster.webp";
const VIDEO = "/video/e85-hero.mp4";

export function HeroVideo() {
  const box = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    const el = box.current;
    if (!video || !el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;

    let observer: IntersectionObserver | undefined;
    const start = () => {
      video.src = VIDEO;
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
      observer.observe(el);
    };
    // Après le chargement de la page, quand le téléphone a la main libre.
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    return () => {
      window.removeEventListener("load", idle);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      ref={box}
      className="relative -mx-4 -mt-4 h-[48svh] min-h-[340px] max-h-[560px] overflow-hidden sm:mx-0 sm:rounded-[var(--radius-choice)]"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSTER} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <video
        ref={ref}
        muted
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      />
      {/* Haut assombri pour le symbole, bas fondu dans le fond de page. */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
    </div>
  );
}
