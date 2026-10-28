/**
 * Identité du garage : la seule source du NAP (nom, adresse, téléphone).
 * Tout affichage, e-mail, .ics ou événement d'agenda lit ces valeurs, jamais une copie.
 */
export const garage = {
  name: "Garage Viastech",
  tagline: "Spécialiste véhicules allemands",
  street: "4 Rue de la Source",
  zone: "Z.A.E La Source",
  postalCode: "34450",
  city: "Vias",
  openingDays: "Du lundi au jeudi 8h-17h, le vendredi 8h-16h",
  phoneDisplay: "09 50 73 63 22",
  phoneNumber: "+33950736322",
  whatsappDisplay: "+33 7 56 85 96 78",
  whatsappNumber: "33756859678",
  email: "contact@viastech.fr",
  timezone: "Europe/Paris",
} as const;

export const garageAddressLine = `${garage.street}, ${garage.zone}, ${garage.postalCode} ${garage.city}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${garage.name}, ${garageAddressLine}`,
)}`;

export const telUrl = `tel:${garage.phoneNumber}`;

/** Lien WhatsApp avec message prérempli (optionnel). */
export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${garage.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
