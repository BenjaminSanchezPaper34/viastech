/**
 * Définition de la prestation « Conversion E85 ».
 * Le parcours lit ce fichier : textes, prix, choix proposés et règles de sortie.
 * Pour une future prestation (vidange, diagnostic…), dupliquer ce fichier et adapter.
 */
export type Choice = { value: string; label: string };

export type CheckQuestion = {
  id: string;
  label: string;
  help?: string;
  choices: Choice[];
  /** Réponse qui mérite l'attention du garagiste (mise en avant dans l'agenda et l'e-mail). */
  attention?: string[];
};

const YES_NO: Choice[] = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
];

export const e85Service = {
  id: "e85",
  title: "Conversion E85",
  priceEuros: 420,
  // Espace insécable : « 420 » et « € » ne se séparent jamais en fin de ligne.
  priceLabel: "420\u00a0€",
  offer: "votre 1er plein offert",
  /** Rien n'est encaissé en ligne : affiché sur l'accueil, le récapitulatif, la confirmation et l'e-mail. */
  paymentNote: "Aucun paiement en ligne : vous réglez au garage, au dépôt du véhicule.",
  arguments: [
    "L'E85 coûte environ deux fois moins cher que l'essence",
    "Compatible avec la majorité des véhicules essence",
    "Pose dans notre atelier à Vias",
  ],

  fuels: [
    { value: "essence", label: "Essence" },
    { value: "diesel", label: "Diesel" },
    { value: "hybride", label: "Hybride" },
    { value: "autre", label: "Autre" },
  ] as Choice[],

  /** Valeurs qui mènent à l'écran de sortie (pas de réservation). */
  exitFuels: ["diesel", "hybride", "autre"],
  /** Phrase affichée sur l'écran de sortie, selon le carburant. */
  exitMessages: {
    diesel: "Un moteur diesel ne peut pas rouler à l'E85.",
    hybride: "Les véhicules hybrides demandent une étude au cas par cas : la réservation en ligne n'est pas possible.",
    autre: "Pour cette motorisation, la réservation en ligne n'est pas possible.",
  } as Record<string, string>,

  /**
   * Les seuls points qui peuvent bloquer ou changer la pose. Le client coche ceux qui le concernent
   * ou répond « Aucun ». Bougies, entretien et ralenti se vérifient à l'atelier. À valider avec le garagiste.
   */
  checks: [
    { id: "voyant", label: "Voyant moteur allumé", choices: YES_NO, attention: ["oui"] },
    { id: "reprog", label: "Moteur reprogrammé", choices: YES_NO, attention: ["oui"] },
    { id: "garantie", label: "Sous garantie constructeur", choices: YES_NO, attention: ["oui"] },
  ] as CheckQuestion[],
};

export function labelOf(choices: Choice[], value: string | undefined) {
  return choices.find((c) => c.value === value)?.label ?? value ?? "";
}
