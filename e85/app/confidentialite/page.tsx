import type { Metadata } from "next";
import { LegalPage, ToComplete } from "@/components/site/LegalPage";
import { garage, garageAddressLine } from "@/lib/config/garage";

export const metadata: Metadata = {
  title: "Confidentialité | Garage Viastech",
  alternates: { canonical: "/confidentialite" },
};

const pixelActive = !!process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité" updated="28 octobre 2026">
      <h2>Responsable du traitement</h2>
      <p>
        {garage.name} (<ToComplete>raison sociale</ToComplete>), {garageAddressLine}. Contact :{" "}
        <a href={`mailto:${garage.email}`}>{garage.email}</a>.
      </p>

      <h2>Données collectées</h2>
      <p>Lors d&apos;une demande de rendez-vous E85 :</p>
      <ul>
        <li>votre véhicule : carburant, immatriculation, kilométrage ;</li>
        <li>les points particuliers que vous signalez (voyant moteur, reprogrammation, garantie) et votre précision éventuelle ;</li>
        <li>vos coordonnées : prénom, nom, téléphone mobile, e-mail ;</li>
        <li>le créneau choisi, et la provenance de votre visite (par exemple « publicité Facebook »).</li>
      </ul>
      <p>
        Vos informations sont enregistrées quand vous confirmez le rendez-vous. Si la réservation n&apos;aboutit pas (créneau
        pris entre-temps), elles restent enregistrées pour que le garage puisse vous proposer une autre date.
      </p>

      <h2>Finalités et base légale</h2>
      <ul>
        <li>Organiser la pose, vous confirmer et vous rappeler le rendez-vous : mesures précontractuelles prises à votre demande.</li>
        <li>Vous recontacter au sujet de votre demande, par exemple pour proposer une autre date : mesures précontractuelles prises à votre demande.</li>
        <li>Mesurer l&apos;efficacité de nos annonces (nombre de demandes et de rendez-vous par provenance) : intérêt légitime.</li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>Vos données sont lues uniquement par l&apos;équipe du garage. Elles transitent par :</p>
      <ul>
        <li>Vercel (hébergement du site, États-Unis, clauses contractuelles types) ;</li>
        <li>Neon (base de données, hébergée dans l&apos;Union européenne) ;</li>
        <li>Google (agenda de l&apos;atelier) ;</li>
        <li>Resend (envoi des e-mails de confirmation et de rappel, États-Unis, clauses contractuelles types).</li>
      </ul>
      <p>Elles ne sont jamais vendues ni cédées.</p>

      <h2>Durée de conservation</h2>
      <p>
        3 ans à compter de notre dernier échange, puis suppression. Les données liées à une prestation réalisée suivent
        ensuite les durées légales de conservation des factures.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez accéder à vos données, les rectifier, les effacer, vous opposer à leur traitement ou en limiter
        l&apos;usage en écrivant à <a href={`mailto:${garage.email}`}>{garage.email}</a>. Si vous estimez que vos droits ne
        sont pas respectés, vous pouvez saisir la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).
      </p>

      <h2>Cookies et mesure d&apos;audience</h2>
      <p>
        Ce site mesure sa fréquentation avec Vercel Web Analytics, sans cookie et sans suivi d&apos;une visite à l&apos;autre :
        aucun accord n&apos;est nécessaire. Votre saisie est gardée dans votre navigateur le temps de la visite
        (stockage de session), pour ne rien perdre si la page se recharge.
      </p>
      {pixelActive ? (
        <p>
          Le pixel Meta (Facebook, Instagram) mesure l&apos;efficacité de nos publicités. Il n&apos;est chargé qu&apos;après
          votre accord, demandé à votre arrivée. Vous pouvez changer d&apos;avis en effaçant les données du site dans votre
          navigateur.
        </p>
      ) : (
        <p>Aucun outil publicitaire (pixel Meta ou autre) n&apos;est chargé sur ce site.</p>
      )}
    </LegalPage>
  );
}
