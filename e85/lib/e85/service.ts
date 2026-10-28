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
const YES_NO_UNKNOWN: Choice[] = [...YES_NO, { value: "nsp", label: "Je ne sais pas" }];

export const e85Service = {
  id: "e85",
  title: "Conversion E85",
  priceEuros: 420,
  priceLabel: "420 €",
  offer: "votre 1er plein offert",
  arguments: [
    "L'E85 coûte environ deux fois moins cher que l'essence",
    "Compatible avec la majorité des véhicules essence",
    "Pose dans notre atelier à Vias",
  ],

  vehicleTypes: [
    { value: "voiture", label: "Voiture" },
    { value: "utilitaire", label: "Utilitaire" },
    { value: "moto", label: "Moto" },
  ] as Choice[],

  fuels: [
    { value: "essence", label: "Essence" },
    { value: "diesel", label: "Diesel" },
    { value: "hybride", label: "Hybride" },
    { value: "autre", label: "Autre" },
  ] as Choice[],

  /** Valeurs qui mènent à l'écran de sortie (pas de réservation). */
  exitVehicleTypes: ["moto"],
  exitFuels: ["diesel", "hybride", "autre"],
  /** Phrase affichée sur l'écran de sortie, selon le carburant. */
  exitMessages: {
    diesel: "Un moteur diesel ne peut pas rouler à l'E85.",
    hybride: "Les véhicules hybrides demandent une étude au cas par cas : la réservation en ligne n'est pas possible.",
    autre: "Pour cette motorisation, la réservation en ligne n'est pas possible.",
  } as Record<string, string>,

  brands: [
    "Audi",
    "BMW",
    "Mercedes-Benz",
    "Volkswagen",
    "Porsche",
    "Mini",
    "Seat",
    "Cupra",
    "Skoda",
    "Peugeot",
    "Renault",
    "Citroën",
    "Dacia",
    "Ford",
    "Opel",
    "Toyota",
    "Fiat",
  ],

  /** Questions de l'étape « État du véhicule ». À valider avec le garagiste. */
  checks: [
    {
      id: "bougies",
      label: "Bougies d'allumage changées depuis moins de 30 000 km ?",
      choices: YES_NO_UNKNOWN,
      attention: ["non", "nsp"],
    },
    {
      id: "voyant",
      label: "Voyant moteur allumé ?",
      choices: YES_NO,
      attention: ["oui"],
    },
    {
      id: "entretien",
      label: "Entretien à jour ?",
      choices: YES_NO_UNKNOWN,
      attention: ["non"],
    },
    {
      id: "garantie",
      label: "Véhicule encore sous garantie constructeur ?",
      choices: YES_NO_UNKNOWN,
      attention: ["oui"],
    },
    {
      id: "reprog",
      label: "Moteur déjà reprogrammé ?",
      choices: YES_NO_UNKNOWN,
      attention: ["oui"],
    },
    {
      id: "ralenti",
      label: "Ralenti instable ou à-coups ?",
      choices: YES_NO,
      attention: ["oui"],
    },
  ] as CheckQuestion[],
};

export function labelOf(choices: Choice[], value: string | undefined) {
  return choices.find((c) => c.value === value)?.label ?? value ?? "";
}
