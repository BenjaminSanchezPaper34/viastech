import Link from "next/link";
import { garage, garageAddressLine, telUrl, whatsappUrl } from "@/lib/config/garage";
import PaperSignature from "./PaperSignature";
import { TrackedLink } from "./TrackedLink";

/** Pied de page : identité du garage (NAP identique partout), liens légaux, signature Paper34. */
export function Footer() {
  return (
    <footer
      className="relative mt-10 border-t border-border px-4 pt-6 text-sm text-muted"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="mx-auto max-w-lg space-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/viastech-logo-blanc.svg" alt={garage.name} width={168} height={40} className="mb-3 h-10 w-auto" />
        {/* Le logo porte déjà la mention « Spécialiste véhicules allemands ». */}
        <p>{garageAddressLine}</p>
        <p>{garage.openingDays}</p>
        <p>
          Tél. :{" "}
          <TrackedLink href={telUrl} event="tel" from="pied" className="text-text underline underline-offset-2">
            {garage.phoneDisplay}
          </TrackedLink>
        </p>
        <p>
          WhatsApp :{" "}
          <TrackedLink href={whatsappUrl()} event="whatsapp" from="pied" className="text-text underline underline-offset-2">
            {garage.whatsappDisplay}
          </TrackedLink>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5 text-xs">
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="py-2 underline underline-offset-2">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="py-2 underline underline-offset-2">
              Confidentialité
            </Link>
          </div>
          <PaperSignature />
        </div>
      </div>
    </footer>
  );
}
