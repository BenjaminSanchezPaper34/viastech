import { bookSlot } from "@/lib/e85/booking";
import { icsUrl } from "@/lib/security";

const STATUS = { not_found: 404, already_booked: 409, slot_taken: 409, calendar_error: 502 } as const;

/** Confirmation du rendez-vous : { id, slotStart } → 200 ou 409 si le créneau vient d'être pris. */
export async function POST(req: Request) {
  const { id, slotStart } = (await req.json().catch(() => ({}))) as { id?: string; slotStart?: string };
  if (!id || !slotStart || Number.isNaN(Date.parse(slotStart))) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const result = await bookSlot(id, new Date(slotStart).toISOString());
  if (!result.ok) return Response.json({ error: result.reason }, { status: STATUS[result.reason] });

  return Response.json({ slotStart: result.request.slotStart, icsUrl: icsUrl(id) });
}
