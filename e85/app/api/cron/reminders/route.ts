/**
 * Rappel de la veille, appelé par Vercel Cron (voir vercel.json).
 * Les crons Vercel sont en UTC : on en déclenche deux (16 h et 17 h UTC) et on n'envoie
 * qu'à celui qui tombe à 18 h à Paris, été comme hiver.
 */
import { bookingRules } from "@/lib/config/booking";
import { sendMail } from "@/lib/email/send";
import { clientReminder } from "@/lib/email/templates";
import { safeEqual } from "@/lib/security";
import { getStore } from "@/lib/store";
import { addDays, parisParts, parisToUtc } from "@/lib/time";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (process.env.VERCEL && (!secret || !safeEqual(auth, `Bearer ${secret}`))) {
    return new Response("Non autorisé", { status: 401 });
  }

  const now = parisParts(new Date());
  const force = new URL(req.url).searchParams.get("force") === "1" && !process.env.VERCEL;
  if (now.hour !== bookingRules.reminderHour && !force) {
    return Response.json({ skipped: `il est ${now.hour} h à Paris` });
  }

  const tomorrow = addDays(now.ymd, 1);
  const due = await getStore().dueForReminder(parisToUtc(tomorrow, "00:00"), parisToUtc(addDays(tomorrow, 1), "00:00"));

  let sent = 0;
  for (const r of due) {
    try {
      await sendMail({ to: r.contact.email, ...clientReminder(r) });
      await getStore().patch(r.id, { reminderSentAt: new Date().toISOString() });
      sent++;
    } catch (e) {
      console.error(`Rappel non envoyé pour ${r.id}`, e);
    }
  }
  return Response.json({ date: tomorrow, due: due.length, sent });
}
