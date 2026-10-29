/**
 * Règles de prise de rendez-vous des poses E85.
 * C'est le seul fichier à modifier pour changer les horaires, la capacité ou les fermetures.
 * Les heures s'entendent en heure de Paris.
 */
export const bookingRules = {
  /** Délai minimum entre la demande et le dépôt, en heures (calendaires). */
  minLeadHours: 48,
  /** Jusqu'où on propose des créneaux, en jours à partir d'aujourd'hui. */
  horizonDays: 28,
  /** Jours ouvrés : 1 = lundi … 5 = vendredi (0 = dimanche, 6 = samedi). */
  workDays: [1, 2, 3, 4, 5],
  /** Heures de dépôt du véhicule proposées au client : un seul dépôt, le matin. */
  dropOffTimes: ["08:30"],
  /** Moment où le client récupère son véhicule, affiché dans le parcours et les e-mails. */
  pickUp: "l'après-midi",
  /**
   * Heure de fermeture de l'atelier par jour (horaires du site viastech.fr).
   * Un dépôt n'est proposé que si la pose se termine avant la fermeture.
   */
  closingTimes: { 1: "17:00", 2: "17:00", 3: "17:00", 4: "17:00", 5: "16:00" } as Record<number, string>,
  /** Nombre maximum de poses par jour (événements « E85 » déjà dans l'agenda compris). */
  maxPerDay: 1,
  /** Durée bloquée dans l'agenda pour une pose, en heures. */
  blockHours: 3,
  /** Le client peut annuler en ligne jusqu'à ce nombre d'heures avant le dépôt. */
  cancelUntilHours: 12,
  /** Heure (Paris) d'envoi du rappel la veille. */
  reminderHour: 18,
  /**
   * Jours fermés exceptionnels (AAAA-MM-JJ).
   * Plus simple pour le garage : poser un événement « journée entière » dans l'agenda,
   * le jour est alors fermé automatiquement.
   */
  closedDates: ["2026-11-11", "2026-12-25", "2027-01-01"] as string[],
};
