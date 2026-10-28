/**
 * Signatures HMAC : liens d'annulation / .ics (sans compte client) et session admin.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s = process.env.APP_SECRET;
  if (!s && process.env.VERCEL) throw new Error("APP_SECRET manquant.");
  return s ?? "dev-secret-local-uniquement";
}

export const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Jeton attaché à une demande : donne accès à l'annulation et au .ics de cette demande seulement. */
export const requestToken = (id: string) => sign(`request:${id}`);
export const checkRequestToken = (id: string, token: string | null) => !!token && safeEqual(requestToken(id), token);

export function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function cancelUrl(id: string) {
  return `${appUrl()}/e85/annuler?id=${id}&t=${requestToken(id)}`;
}

export function icsUrl(id: string) {
  return `${appUrl()}/api/e85/ics?id=${id}&t=${requestToken(id)}`;
}
