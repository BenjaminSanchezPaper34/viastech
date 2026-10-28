"use client";
/** Lien qui envoie un événement de suivi au clic (téléphone, WhatsApp) depuis un composant serveur. */
import { track, type TrackEvent } from "@/lib/track";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { event: TrackEvent; from: string };

export function TrackedLink({ event, from, ...rest }: Props) {
  return <a {...rest} onClick={() => track(event, { depuis: from })} />;
}
