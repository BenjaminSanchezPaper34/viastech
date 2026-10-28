import { isAdmin } from "@/lib/admin";
import { e85Service } from "@/lib/e85/service";
import { checkLines } from "@/lib/e85/summary";
import { STATUS_LABELS } from "@/lib/e85/types";
import { getStore } from "@/lib/store";

/** Export CSV (séparateur « ; » et BOM UTF-8 : s'ouvre proprement dans Excel en français). */
export async function GET() {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });

  const rows = await getStore().list();
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const paris = (iso: string | null) => (iso ? new Date(iso).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) : "");

  const header = [
    "Date demande", "Statut", "Créneau", "Prénom", "Nom", "Téléphone", "E-mail",
    "Type", "Carburant", "Marque", "Modèle", "Année", "Motorisation", "Immatriculation", "Kilométrage",
    ...e85Service.checks.map((q) => q.label), "Remarque",
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "Annulé le", "Rappel envoyé le",
  ];
  const lines = rows.map((r) =>
    [
      paris(r.createdAt), STATUS_LABELS[r.status], paris(r.slotStart), r.contact.firstName, r.contact.lastName, r.contact.phone, r.contact.email,
      r.vehicle.type, r.vehicle.fuel, r.vehicle.brand, r.vehicle.model, r.vehicle.year, r.vehicle.engine, r.vehicle.plate, r.vehicle.mileage,
      ...checkLines(r).map((c) => c.answer), r.remark,
      r.utm.utm_source, r.utm.utm_medium, r.utm.utm_campaign, r.utm.utm_content, r.utm.fbclid, paris(r.cancelledAt), paris(r.reminderSentAt),
    ].map(cell).join(";"),
  );

  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-e85-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
