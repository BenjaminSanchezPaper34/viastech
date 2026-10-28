"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, login, logout } from "@/lib/admin";
import { cancelBooking } from "@/lib/e85/booking";
import type { RequestStatus } from "@/lib/e85/types";
import { getStore } from "@/lib/store";

export async function loginAction(_: unknown, formData: FormData) {
  const ok = await login(String(formData.get("password") ?? ""));
  if (!ok) return { error: "Mot de passe incorrect." };
  redirect("/e85/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/e85/admin");
}

/** Statuts que le garage peut poser après le rendez-vous. « Annulé » libère aussi l'agenda. */
const ALLOWED: RequestStatus[] = ["reserve", "venu", "absent", "annule"];

export async function setStatusAction(id: string, status: RequestStatus) {
  if (!(await isAdmin()) || !ALLOWED.includes(status)) return;
  const r = await getStore().get(id);
  if (!r || r.status === "incomplet" || r.status === "annule") return;
  if (status === "annule") await cancelBooking(r, "garage");
  else await getStore().patch(id, { status });
  revalidatePath("/e85/admin");
}
