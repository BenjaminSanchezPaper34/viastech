/**
 * Annulation par le client, depuis le lien de l'e-mail.
 * Le lien seul n'annule rien (les messageries ouvrent parfois les liens pour les analyser) :
 * il faut appuyer sur le bouton, qui déclenche l'action serveur.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { PrimaryButton, SecondaryLink, StepLayout } from "@/components/booking/StepLayout";
import { Footer } from "@/components/site/Footer";
import { bookingRules } from "@/lib/config/booking";
import { garageAddressLine, whatsappUrl } from "@/lib/config/garage";
import { canCancelOnline, cancelBooking } from "@/lib/e85/booking";
import { vehicleTitle } from "@/lib/e85/summary";
import { checkRequestToken } from "@/lib/security";
import { getStore } from "@/lib/store";
import { formatSlot } from "@/lib/time";

export const metadata: Metadata = { title: "Annuler mon rendez-vous | Garage Viastech", robots: { index: false } };

type Props = { searchParams: Promise<{ id?: string; t?: string; fait?: string }> };

async function cancelAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const t = String(formData.get("t") ?? "");
  if (!checkRequestToken(id, t)) return;
  const r = await getStore().get(id);
  if (r && canCancelOnline(r)) await cancelBooking(r, "client");
  redirect(`/e85/annuler?id=${id}&t=${encodeURIComponent(t)}&fait=1`);
}

export default async function CancelPage({ searchParams }: Props) {
  const { id = "", t = "", fait } = await searchParams;
  const valid = checkRequestToken(id, t);
  const r = valid ? await getStore().get(id) : null;
  const whatsapp = whatsappUrl("Bonjour, je souhaite modifier mon rendez-vous E85.");

  let title: string;
  let body: React.ReactNode;

  if (!r) {
    title = "Lien invalide";
    body = <p className="text-base text-muted">Ce lien d&apos;annulation n&apos;est pas valide. Écrivez-nous sur WhatsApp.</p>;
  } else if (r.status === "annule") {
    title = fait ? "Votre rendez-vous est annulé" : "Rendez-vous déjà annulé";
    body = (
      <p className="text-base text-muted">
        Le créneau est libéré. Merci de nous avoir prévenus. Pour reprendre rendez-vous, <a href="/e85" className="text-text underline underline-offset-2">refaites la demande en ligne</a>.
      </p>
    );
  } else if (!canCancelOnline(r)) {
    title = "Annulation en ligne impossible";
    body = (
      <p className="text-base text-muted">
        {r.status === "reserve"
          ? `Le rendez-vous a lieu dans moins de ${bookingRules.cancelUntilHours} h. Prévenez-nous directement sur WhatsApp.`
          : "Ce rendez-vous ne peut plus être modifié en ligne."}
      </p>
    );
  } else {
    title = "Annuler mon rendez-vous";
    body = (
      <>
        <BookingSummary
          rows={[
            ["Dépôt", formatSlot(new Date(r.slotStart!))],
            ["Véhicule", vehicleTitle(r)],
            ["Adresse", garageAddressLine],
          ]}
        />
        <form action={cancelAction} className="mt-6">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="t" value={t} />
          <PrimaryButton type="submit">Confirmer l&apos;annulation</PrimaryButton>
        </form>
        <p className="mt-4 text-sm text-muted">Envie de changer de date plutôt ? Écrivez-nous, nous vous proposons un autre créneau.</p>
      </>
    );
  }

  return (
    <>
      <StepLayout stepKey="annuler" title={title}>
        {body}
        <SecondaryLink href={whatsapp} className="mt-4">
          Écrire sur WhatsApp
        </SecondaryLink>
      </StepLayout>
      <Footer />
    </>
  );
}
