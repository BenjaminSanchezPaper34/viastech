"use client";
/**
 * Suivi des étapes : Vercel Analytics toujours (sans cookie), Pixel Meta seulement si
 * NEXT_PUBLIC_META_PIXEL_ID est renseigné ET que le visiteur a accepté (voir MetaPixel).
 */
import { track as vercelTrack } from "@vercel/analytics";

type Fbq = (cmd: "track" | "trackCustom", event: string, params?: Record<string, unknown>) => void;

export type TrackEvent = "e85_debut" | "e85_vehicule" | "e85_sortie" | "e85_lead" | "e85_reservation" | "whatsapp" | "tel" | "itineraire";

/** Correspondance avec les événements standard Meta. */
const META: Partial<Record<TrackEvent, string>> = { e85_lead: "Lead", e85_reservation: "Schedule" };

export function track(event: TrackEvent, props?: Record<string, string | number>) {
  try {
    vercelTrack(event, props);
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    const metaEvent = META[event];
    if (fbq && metaEvent) fbq("track", metaEvent, props);
  } catch {
    // Le suivi ne doit jamais bloquer le parcours.
  }
}
