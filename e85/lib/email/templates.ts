/**
 * Contenu des e-mails. Chaque modèle renvoie { subject, html, text }.
 * Mise en page en tableaux et styles en ligne : c'est ce que les messageries affichent le mieux.
 */
import "server-only";
import { brand } from "@/lib/brand";
import { bookingRules } from "@/lib/config/booking";
import { garage, garageAddressLine, mapsUrl, whatsappUrl } from "@/lib/config/garage";
import { e85Service } from "@/lib/e85/service";
import { checkLines, fullName, vehicleLines, vehicleTitle } from "@/lib/e85/summary";
import type { E85Request } from "@/lib/e85/types";
import { formatMobile } from "@/lib/e85/validate";
import { appUrl, cancelUrl, icsUrl } from "@/lib/security";
import { formatSlot } from "@/lib/time";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(title: string, body: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:${brand.bg};padding:20px 24px"><img src="${appUrl()}/brand/viastech-logo-blanc.png" alt="Garage Viastech" width="180" style="display:block;height:auto"></td></tr>
<tr><td style="padding:28px 24px 8px"><h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px 24px;font-size:13px;color:#666;border-top:1px solid #eee">${esc(
    garage.name.toUpperCase(),
  )} · ${esc(garage.tagline)}<br>${esc(garageAddressLine)}<br>${esc(garage.openingDays)}<br>Tél. ${esc(garage.phoneDisplay)} · WhatsApp : ${esc(
    garage.whatsappDisplay,
  )}</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.5">${html}</p>`;

const button = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${href}" style="display:inline-block;background:${brand.accent};color:#000;font-weight:bold;font-size:16px;padding:14px 22px;border-radius:12px;text-decoration:none">${esc(
    label,
  )}</a></p>`;

const rows = (pairs: [string, string][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px;margin:0 0 16px">${pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${v}</td></tr>`,
    )
    .join("")}</table>`;

function slotPairs(r: E85Request): [string, string][] {
  return [
    ["Rendez-vous", `<strong>${esc(formatSlot(new Date(r.slotStart!)))}</strong>`],
    ["Immatriculation", esc(vehicleTitle(r))],
    ["Prestation", `${esc(e85Service.title)} : ${esc(e85Service.priceLabel)}, ${esc(e85Service.offer)}`],
    ["Adresse", `<a href="${mapsUrl}" style="color:#111">${esc(garageAddressLine)}</a>`],
  ];
}

const slotText = (r: E85Request) =>
  [
    `Rendez-vous : ${formatSlot(new Date(r.slotStart!))}`,
    `Immatriculation : ${vehicleTitle(r)}`,
    `Prestation : ${e85Service.title}, ${e85Service.priceLabel}, ${e85Service.offer}`,
    `Adresse : ${garageAddressLine}`,
    `Itinéraire : ${mapsUrl}`,
  ].join("\n");

/** Confirmation envoyée au client juste après la réservation. */
export function clientConfirmation(r: E85Request) {
  const subject = `Rendez-vous confirmé : ${formatSlot(new Date(r.slotStart!))}`;
  const html = layout(
    "Votre rendez-vous est confirmé",
    p(`Bonjour ${esc(r.contact.firstName)},`) +
      p("Merci pour votre confiance. Voici le récapitulatif de votre pose E85.") +
      rows(slotPairs(r)) +
      p(`Prévoyez de laisser votre véhicule le temps de la pose, environ ${bookingRules.blockHours} h.`) +
      p(esc(e85Service.paymentNote)) +
      button(icsUrl(r.id), "Ajouter à mon agenda") +
      p(`Une question ? <a href="${whatsappUrl()}" style="color:#111">Écrivez-nous sur WhatsApp</a>.`) +
      p(
        `<span style="font-size:14px;color:#666">Un empêchement ? <a href="${cancelUrl(r.id)}" style="color:#666">Annulez ici</a> jusqu'à ${bookingRules.cancelUntilHours} h avant le rendez-vous, pour libérer le créneau.</span>`,
      ),
  );
  const text = [
    `Bonjour ${r.contact.firstName},`,
    "",
    "Votre rendez-vous est confirmé.",
    "",
    slotText(r),
    "",
    `Prévoyez de laisser votre véhicule le temps de la pose, environ ${bookingRules.blockHours} h.`,
    e85Service.paymentNote,
    `Ajouter à mon agenda : ${icsUrl(r.id)}`,
    `Une question : ${whatsappUrl()}`,
    `Annuler : ${cancelUrl(r.id)}`,
  ].join("\n");
  return { subject, html, text };
}

/** Rappel envoyé la veille à 18 h. */
export function clientReminder(r: E85Request) {
  const subject = `Rappel : votre pose E85 demain`;
  const html = layout(
    "Rendez-vous demain",
    p(`Bonjour ${esc(r.contact.firstName)},`) +
      p("Petit rappel : nous vous attendons demain à l'atelier pour la conversion E85 de votre véhicule.") +
      rows(slotPairs(r)) +
      button(mapsUrl, "Voir l'itinéraire") +
      p(
        `Vous ne pouvez plus venir ? <a href="${cancelUrl(r.id)}" style="color:#111">Annulez votre rendez-vous</a> pour libérer le créneau, ou <a href="${whatsappUrl()}" style="color:#111">écrivez-nous sur WhatsApp</a>.`,
      ),
  );
  const text = [
    `Bonjour ${r.contact.firstName},`,
    "",
    "Rappel : nous vous attendons demain.",
    "",
    slotText(r),
    "",
    `Annuler : ${cancelUrl(r.id)}`,
    `WhatsApp : ${whatsappUrl()}`,
  ].join("\n");
  return { subject, html, text };
}

/** Notification au garage : toutes les réponses, téléphone cliquable. */
export function garageNotification(r: E85Request) {
  const checks = checkLines(r);
  const flagged = checks.filter((c) => c.attention).length;
  const subject = `E85 - ${vehicleTitle(r)} - ${fullName(r)} - ${formatSlot(new Date(r.slotStart!))}`;
  const tel = r.contact.phone;
  const html = layout(
    "Nouvelle pose E85 réservée",
    rows([
      ["Dépôt", `<strong>${esc(formatSlot(new Date(r.slotStart!)))}</strong>`],
      ["Client", esc(fullName(r))],
      ["Téléphone", `<a href="tel:${tel}" style="color:#111;font-weight:bold">${esc(formatMobile(tel))}</a>`],
      ["WhatsApp", `<a href="https://wa.me/${tel.replace("+", "")}" style="color:#111">Ouvrir la conversation</a>`],
      ["E-mail", `<a href="mailto:${esc(r.contact.email)}" style="color:#111">${esc(r.contact.email)}</a>`],
    ]) +
      rows(vehicleLines(r).map(([k, v]) => [k, esc(v)])) +
      `<h2 style="font-size:17px;margin:8px 0 8px">Points particuliers${flagged ? ` (${flagged} point${flagged > 1 ? "s" : ""} à vérifier)` : ""}</h2>` +
      rows(
        checks.map((c) => [
          c.label,
          c.attention ? `<strong style="color:#b42318">${esc(c.answer)}</strong>` : esc(c.answer),
        ]),
      ) +
      (r.remark ? p(`<strong>Remarque :</strong> ${esc(r.remark)}`) : "") +
      (Object.keys(r.utm).length
        ? p(
            `<span style="font-size:13px;color:#666">Provenance : ${esc(
              Object.entries(r.utm)
                .map(([k, v]) => `${k}=${v}`)
                .join(", "),
            )}</span>`,
          )
        : "") +
      button(`${appUrl()}/e85/admin`, "Voir toutes les demandes"),
  );
  const text = [
    `Nouvelle pose E85 : ${formatSlot(new Date(r.slotStart!))}`,
    `Client : ${fullName(r)}, ${formatMobile(tel)}, ${r.contact.email}`,
    ...vehicleLines(r).map(([k, v]) => `${k} : ${v}`),
    "",
    ...checks.map((c) => `${c.attention ? "! " : "- "}${c.label} : ${c.answer}`),
    r.remark ? `\nRemarque : ${r.remark}` : "",
  ].join("\n");
  return { subject, html, text, replyTo: r.contact.email };
}

/** Prévient le garage qu'un client a annulé en ligne. */
export function garageCancellation(r: E85Request) {
  const subject = `Annulation E85 - ${vehicleTitle(r)} - ${fullName(r)}`;
  const tel = r.contact.phone;
  const html = layout(
    "Rendez-vous annulé par le client",
    rows([
      ["Créneau libéré", esc(formatSlot(new Date(r.slotStart!)))],
      ["Client", esc(fullName(r))],
      ["Téléphone", `<a href="tel:${tel}" style="color:#111">${esc(formatMobile(tel))}</a>`],
      ["Immatriculation", esc(vehicleTitle(r))],
    ]) + p("Le créneau est de nouveau proposé en ligne. L'événement a été retiré de l'agenda."),
  );
  const text = `Annulation : ${fullName(r)} (${formatMobile(tel)}), ${vehicleTitle(r)}, ${formatSlot(
    new Date(r.slotStart!),
  )}. Le créneau est libéré.`;
  return { subject, html, text };
}
