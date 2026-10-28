import type { Metadata } from "next";
import { E85Flow } from "./E85Flow";

const description = "Conversion E85 à 420 €, votre 1er plein offert. Vérifiez votre véhicule et réservez votre pose à Vias en 1 minute.";

export const metadata: Metadata = {
  title: "Conversion E85 à Vias : 420 €, 1er plein offert | Garage Viastech",
  description,
  alternates: { canonical: "/e85" },
  openGraph: {
    title: "Passez à l'E85 avec Viastech",
    description,
    type: "website",
    locale: "fr_FR",
    siteName: "Garage Viastech",
  },
  twitter: { card: "summary_large_image" },
};

export default function E85Page() {
  return <E85Flow />;
}
