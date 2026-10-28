import type { Metadata } from "next";
import { LegalPage, ToComplete } from "@/components/site/LegalPage";
import { garage, garageAddressLine } from "@/lib/config/garage";

export const metadata: Metadata = { title: "Mentions légales | Garage Viastech", alternates: { canonical: "/mentions-legales" } };

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales" updated="28 octobre 2026">
      <h2>Éditeur du site</h2>
      <p>
        <strong>{garage.name}</strong>
        <br />
        Raison sociale : <ToComplete>raison sociale</ToComplete>
        <br />
        Forme juridique et capital : <ToComplete>forme juridique, capital social</ToComplete>
        <br />
        SIRET / RCS : <ToComplete>SIRET, ville du RCS</ToComplete>
        <br />
        TVA intracommunautaire : <ToComplete>numéro de TVA</ToComplete>
        <br />
        Adresse : {garageAddressLine}
        <br />
        Téléphone : {garage.phoneDisplay}
        <br />
        WhatsApp : {garage.whatsappDisplay}
        <br />
        E-mail : <a href={`mailto:${garage.email}`}>{garage.email}</a>
      </p>
      <p>
        Directeur de la publication : <ToComplete>nom du dirigeant</ToComplete>
      </p>

      <h2>Hébergement</h2>
      <p>
        Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
        <br />
        <a href="https://vercel.com">vercel.com</a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, logos, visuels et éléments graphiques de ce site appartiennent au {garage.name} ou à leurs auteurs.
        Toute reproduction sans autorisation écrite est interdite.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        En cas de litige, après une réclamation écrite restée sans réponse satisfaisante, vous pouvez recourir
        gratuitement au médiateur de la consommation : <ToComplete>médiateur désigné par le garage (ex. Médiateur du CNPA / Mobilians)</ToComplete>.
      </p>

      <h2>Conception</h2>
      <p>
        Site conçu et réalisé par <a href="https://www.paper34.fr">Paper34</a>, studio design et web à Agde.
      </p>
    </LegalPage>
  );
}
