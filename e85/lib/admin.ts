/** Session admin : un mot de passe partagé (ADMIN_PASSWORD), un cookie signé valable 30 jours. */
import "server-only";
import { cookies } from "next/headers";
import { safeEqual, sign } from "./security";

const COOKIE = "e85_admin";
const MAX_AGE = 60 * 60 * 24 * 30;

function password() {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  // En local seulement, un mot de passe par défaut pour tester ; en production, pas d'accès sans variable.
  return process.env.VERCEL ? null : "viastech";
}

// Le jeton dépend du mot de passe : le changer déconnecte toutes les sessions.
const sessionToken = (p: string) => sign(`admin:${p}`);

export async function isAdmin() {
  const p = password();
  const c = (await cookies()).get(COOKIE)?.value;
  return !!p && !!c && safeEqual(c, sessionToken(p));
}

export async function login(input: string) {
  const p = password();
  if (!p || !safeEqual(input, p)) {
    // Ralentit les essais de mot de passe en série.
    await new Promise((r) => setTimeout(r, 1000));
    return false;
  }
  (await cookies()).set(COOKIE, sessionToken(p), {
    httpOnly: true,
    secure: !!process.env.VERCEL,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
