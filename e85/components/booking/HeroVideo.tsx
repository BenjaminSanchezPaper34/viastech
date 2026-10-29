"use client";
/**
 * Vidéo d'atelier en tête de l'accueil : muette, en boucle, lue en ligne sur iPhone.
 * L'affiche (première image) s'affiche tout de suite ; la vidéo n'est pas lancée si le visiteur
 * a demandé moins d'animations ou active l'économiseur de données. Fondu vers le fond en bas
 * pour que le titre se pose dessus.
 */
import { useEffect, useRef } from "react";

const POSTER = "/video/e85-hero-poster.webp";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;
    video.src = video.dataset.src!;
    video.play().catch(() => {});
  }, []);

  return (
    <div
      className="relative -mx-4 -mt-4 h-[58svh] min-h-[380px] max-h-[620px] overflow-hidden sm:mx-0 sm:rounded-[var(--radius-choice)]"
      aria-hidden="true"
    >
      <video
        ref={ref}
        data-src="/video/e85-hero.mp4"
        poster={POSTER}
        muted
        playsInline
        loop
        autoPlay
        preload="none"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Haut assombri pour le symbole, bas fondu dans le fond de page. */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
    </div>
  );
}
