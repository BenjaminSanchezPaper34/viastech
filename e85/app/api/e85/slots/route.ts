import { getAvailableSlots } from "@/lib/e85/slots";

/** Créneaux libres des 4 prochaines semaines. Jamais mis en cache : l'agenda bouge. */
export async function GET() {
  try {
    return Response.json({ days: await getAvailableSlots() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Lecture de l'agenda impossible", e);
    return Response.json({ error: "calendar_unavailable" }, { status: 503 });
  }
}
