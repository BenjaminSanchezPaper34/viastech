import { buildIcs } from "@/lib/ics";
import { e85Service } from "@/lib/e85/service";
import { slotEnd, vehicleTitle } from "@/lib/e85/summary";
import { checkRequestToken } from "@/lib/security";
import { getStore } from "@/lib/store";

/** « Ajouter à mon agenda » : .ics du rendez-vous, accessible avec le jeton de la demande. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  if (!checkRequestToken(id, url.searchParams.get("t"))) return new Response("Lien invalide", { status: 403 });

  const r = await getStore().get(id);
  if (!r?.slotStart || r.status !== "reserve") return new Response("Rendez-vous introuvable", { status: 404 });

  const start = new Date(r.slotStart);
  const ics = buildIcs({
    uid: r.id,
    start,
    end: slotEnd(start),
    title: `Pose E85 chez Viastech (${vehicleTitle(r)})`,
    details: `Dépôt du véhicule pour la conversion E85. ${e85Service.priceLabel}, ${e85Service.offer}.`,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rdv-viastech-e85.ics"',
      "Cache-Control": "no-store",
    },
  });
}
