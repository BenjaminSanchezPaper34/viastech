"use client";
/**
 * Parcours de réservation E85, un écran par étape.
 * Les saisies sont gardées dans sessionStorage : un rechargement ou un retour arrière
 * du téléphone ne fait rien perdre. Le bouton retour du navigateur suit les étapes.
 */
import { useCallback, useEffect, useState } from "react";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ChoiceButtons } from "@/components/booking/ChoiceButtons";
import { SelectField, TextArea, TextField } from "@/components/booking/Field";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { PrimaryButton, SecondaryLink, StepLayout } from "@/components/booking/StepLayout";
import { Stepper } from "@/components/booking/Stepper";
import { Footer } from "@/components/site/Footer";
import { bookingRules } from "@/lib/config/booking";
import { garageAddressLine, mapsUrl, whatsappUrl } from "@/lib/config/garage";
import { e85Service } from "@/lib/e85/service";
import type { Checks, Contact, SlotDay, Vehicle } from "@/lib/e85/types";
import { hasErrors, isExitVehicle, normalizePlate, validateChecks, validateContact, validateVehicle, type Errors } from "@/lib/e85/validate";
import { track } from "@/lib/track";

type Step = "accueil" | "vehicule" | "sortie" | "etat" | "contact" | "creneau" | "recap" | "confirme";

const PROGRESS: Record<Step, number> = {
  accueil: 1,
  vehicule: 2,
  sortie: 2,
  etat: 3,
  contact: 4,
  creneau: 5,
  recap: 5,
  confirme: 6,
};
const PREVIOUS: Partial<Record<Step, Step>> = {
  vehicule: "accueil",
  sortie: "vehicule",
  etat: "vehicule",
  contact: "etat",
  creneau: "contact",
  recap: "creneau",
};

type State = {
  step: Step;
  vehicle: Vehicle;
  brandChoice: string;
  checks: Checks;
  remark: string;
  contact: Contact;
  utm: Record<string, string>;
  requestId: string | null;
  selectedDate: string | null;
  slotStart: string | null;
  icsUrl: string | null;
};

const INITIAL: State = {
  step: "accueil",
  vehicle: { type: "", fuel: "", brand: "", model: "", year: "", engine: "", plate: "", mileage: "" },
  brandChoice: "",
  checks: {},
  remark: "",
  contact: { firstName: "", lastName: "", phone: "", email: "", consent: false },
  utm: {},
  requestId: null,
  selectedDate: null,
  slotStart: null,
  icsUrl: null,
};

const STORAGE = "viastech-e85";
const OTHER = "Autre";
const YEARS = Array.from({ length: new Date().getFullYear() + 1 - 1990 + 1 }, (_, i) => String(new Date().getFullYear() + 1 - i));

const slotDate = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });
const slotHour = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const fmtDate = (iso: string) => slotDate.format(new Date(iso));
const fmtHour = (iso: string) =>
  slotHour.format(new Date(iso)).replace(":", "h").replace(/h00$/, "h").replace(/^0/, "");

export function E85Flow() {
  const [s, setS] = useState<State>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [days, setDays] = useState<SlotDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Pas d'animation d'entrée au premier affichage : le contenu doit être visible immédiatement (LCP).
  const [navigated, setNavigated] = useState(false);

  const patch = useCallback((p: Partial<State>) => setS((prev) => ({ ...prev, ...p })), []);

  // Reprise de la saisie + paramètres de provenance (premier contact conservé).
  useEffect(() => {
    let saved: State | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORAGE) ?? "null");
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (/^(utm_[a-z]+|fbclid|source)$/.test(k)) utm[k] = v;
    });
    const base = saved && saved.step !== "confirme" ? saved : INITIAL;
    // Lecture du navigateur après le rendu serveur : impossible dans l'état initial sans écart d'hydratation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS({ ...base, utm: Object.keys(base.utm).length ? base.utm : utm });
    history.replaceState({ step: base.step }, "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(s));
    } catch {}
  }, [s, hydrated]);

  // Navigation : chaque étape est une entrée d'historique (bouton retour Android / iOS).
  const goTo = useCallback(
    (step: Step) => {
      setErrors({});
      setNotice(null);
      setNavigated(true);
      patch({ step });
      history.pushState({ step }, "");
      window.scrollTo({ top: 0 });
    },
    [patch],
  );

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const step = (e.state as { step?: Step } | null)?.step;
      if (step && step !== "confirme") {
        setErrors({});
        patch({ step });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [patch]);

  const back = PREVIOUS[s.step] ? () => history.back() : undefined;

  // Le titre de chaque écran reçoit le focus : le lecteur d'écran annonce la nouvelle étape.
  useEffect(() => {
    if (hydrated) document.querySelector<HTMLElement>(".step-title")?.focus({ preventScroll: true });
  }, [s.step, hydrated]);

  const loadSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/e85/slots", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setDays(((await res.json()) as { days: SlotDay[] }).days);
    } catch {
      setDays([]);
      setNotice("Le calendrier ne répond pas pour le moment. Réessayez dans un instant ou écrivez-nous sur WhatsApp.");
    }
  }, []);

  // Chargement des créneaux à l'arrivée sur l'étape (les setState n'ont lieu qu'après la réponse réseau).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated && s.step === "creneau" && days === null) loadSlots();
  }, [hydrated, s.step, days, loadSlots]);

  const setVehicle = (p: Partial<Vehicle>) => {
    const vehicle = { ...s.vehicle, ...p };
    patch({ vehicle });
    if (("type" in p || "fuel" in p) && isExitVehicle(vehicle)) {
      track("e85_sortie", { type: vehicle.type, carburant: vehicle.fuel });
      goTo("sortie");
    }
  };

  // Après une validation ratée, on amène la première erreur à l'écran (le formulaire dépasse l'écran du téléphone).
  useEffect(() => {
    if (!hasErrors(errors)) return;
    const el = document.querySelector<HTMLElement>("[aria-invalid='true'], fieldset[aria-describedby]");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) el.focus({ preventScroll: true });
  }, [errors]);

  /* ---------- Actions ---------- */

  const submitVehicle = () => {
    const e = validateVehicle(s.vehicle);
    setErrors(e);
    if (hasErrors(e)) return;
    track("e85_vehicule", { marque: s.vehicle.brand });
    goTo("etat");
  };

  const submitChecks = () => {
    const e = validateChecks(s.checks);
    setErrors(e);
    if (!hasErrors(e)) goTo("contact");
  };

  const submitContact = async () => {
    const e = validateContact(s.contact);
    setErrors(e);
    if (hasErrors(e)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/e85/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.requestId, vehicle: s.vehicle, checks: s.checks, remark: s.remark, contact: s.contact, utm: s.utm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        setNotice("Vérifiez les informations saisies.");
        return;
      }
      patch({ requestId: data.id });
      track("e85_lead");
      setDays(null);
      goTo("creneau");
    } catch {
      setNotice("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!s.requestId || !s.slotStart) return;
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/e85/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.requestId, slotStart: s.slotStart }),
      });
      const data = await res.json();
      if (res.ok) {
        track("e85_reservation");
        patch({ icsUrl: data.icsUrl });
        goTo("confirme");
        try {
          sessionStorage.removeItem(STORAGE);
        } catch {}
        return;
      }
      if (data.error === "slot_taken") {
        patch({ slotStart: null, selectedDate: null, step: "creneau" });
        setDays(null);
        setNotice("Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez-en un autre, il ne vous faudra que quelques secondes.");
        return;
      }
      setNotice("La réservation n'a pas abouti. Réessayez, ou écrivez-nous sur WhatsApp : nous vous trouvons un créneau.");
    } catch {
      setNotice("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappHelp = whatsappUrl("Bonjour, j'ai une question sur la conversion E85.");
  const Notice = notice ? (
    <p role="alert" className="mb-5 rounded-[var(--radius-choice)] border border-danger/60 px-4 py-3 text-base text-text">
      {notice}
    </p>
  ) : null;

  /* ---------- Écrans ---------- */

  let screen: React.ReactNode;
  switch (s.step) {
    case "accueil":
      screen = (
        <StepLayout
          stepKey="accueil"
          kicker="Bioéthanol E85"
          title="Passez à l'E85 avec Viastech"
          action={
            <PrimaryButton
              onClick={() => {
                track("e85_debut");
                goTo("vehicule");
              }}
            >
              Vérifier mon véhicule et réserver
            </PrimaryButton>
          }
        >
          <div className="rounded-[var(--radius-choice)] border border-border bg-surface px-5 py-5">
            <p className="font-display text-6xl font-bold leading-none tracking-[-0.025em] text-accent">{e85Service.priceLabel}</p>
            <p className="mt-2 text-lg">la conversion, {e85Service.offer}</p>
          </div>
          <ul className="mt-6 space-y-4">
            {e85Service.arguments.map((a) => (
              <li key={a} className="flex items-start gap-3 text-base">
                <span className="mt-1.5 h-3 w-4 shrink-0 -skew-x-[28deg] rounded-[2px] bg-accent" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">
            1 minute pour vérifier votre véhicule et choisir votre créneau, à partir de {bookingRules.minLeadHours} h.
          </p>
        </StepLayout>
      );
      break;

    case "vehicule":
      screen = (
        <StepLayout
          stepKey="vehicule"
          title="Votre véhicule"
          intro="Pour vérifier qu'il est compatible avec l'E85."
          action={<PrimaryButton onClick={submitVehicle}>Continuer</PrimaryButton>}
        >
          <ChoiceButtons
            label="Type de véhicule"
            options={e85Service.vehicleTypes}
            value={s.vehicle.type}
            onChange={(type) => setVehicle({ type })}
            error={errors.type}
            columns={3}
          />
          <ChoiceButtons
            label="Carburant actuel"
            options={e85Service.fuels}
            value={s.vehicle.fuel}
            onChange={(fuel) => setVehicle({ fuel })}
            error={errors.fuel}
          />
          <SelectField
            label="Marque"
            placeholder="Choisir la marque"
            options={[...e85Service.brands, OTHER]}
            value={s.brandChoice}
            onChange={(e) => {
              const v = e.target.value;
              patch({ brandChoice: v, vehicle: { ...s.vehicle, brand: v === OTHER ? "" : v } });
            }}
            error={s.brandChoice === OTHER ? undefined : errors.brand}
          />
          {s.brandChoice === OTHER && (
            <TextField
              label="Quelle marque ?"
              value={s.vehicle.brand}
              onChange={(e) => setVehicle({ brand: e.target.value })}
              error={errors.brand}
              autoComplete="off"
            />
          )}
          <TextField
            label="Modèle"
            placeholder="Golf, Série 1, A3…"
            value={s.vehicle.model}
            onChange={(e) => setVehicle({ model: e.target.value })}
            error={errors.model}
            autoComplete="off"
          />
          <SelectField
            label="Année"
            placeholder="Choisir l'année"
            options={YEARS}
            value={s.vehicle.year}
            onChange={(e) => setVehicle({ year: e.target.value })}
            error={errors.year}
          />
          <TextField
            label="Motorisation"
            placeholder="1.4 TSI 150 ch"
            help="Elle figure sur la carte grise ou le carnet d'entretien."
            value={s.vehicle.engine}
            onChange={(e) => setVehicle({ engine: e.target.value })}
            error={errors.engine}
            autoComplete="off"
          />
          <TextField
            label="Immatriculation"
            placeholder="AB-123-CD"
            value={s.vehicle.plate}
            onChange={(e) => setVehicle({ plate: e.target.value.toUpperCase() })}
            error={errors.plate}
            autoComplete="off"
            autoCapitalize="characters"
          />
          <TextField
            label="Kilométrage"
            placeholder="85 000"
            inputMode="numeric"
            value={s.vehicle.mileage}
            onChange={(e) => setVehicle({ mileage: e.target.value.replace(/[^\d\s]/g, "") })}
            error={errors.mileage}
          />
        </StepLayout>
      );
      break;

    case "sortie":
      screen = (
        <StepLayout
          stepKey="sortie"
          title="La conversion E85 concerne les voitures essence"
          intro={
            s.vehicle.type === "moto"
              ? "Nous ne convertissons pas les motos."
              : (e85Service.exitMessages[s.vehicle.fuel] ?? "La réservation en ligne n'est pas possible pour ce véhicule.")
          }
          action={
            <div className="space-y-2">
              <PrimaryButton
                onClick={() => {
                  track("whatsapp", { depuis: "sortie" });
                  window.location.href = whatsappHelp;
                }}
              >
                Une question ? Écrivez-nous sur WhatsApp
              </PrimaryButton>
              <button
                type="button"
                onClick={() => {
                  patch({ vehicle: { ...s.vehicle, type: s.vehicle.type === "moto" ? "" : s.vehicle.type, fuel: "" } });
                  history.back();
                }}
                className="min-h-12 w-full text-base text-muted underline underline-offset-4"
              >
                Modifier ma réponse
              </button>
            </div>
          }
        >
          <p className="text-base text-muted">
            Notre atelier reste à votre disposition pour l&apos;entretien et la réparation de votre véhicule.
          </p>
        </StepLayout>
      );
      break;

    case "etat":
      screen = (
        <StepLayout
          stepKey="etat"
          title="L'état de votre véhicule"
          intro="Quelques questions pour préparer la pose."
          action={<PrimaryButton onClick={submitChecks}>Continuer</PrimaryButton>}
        >
          {e85Service.checks.map((q) => (
            <ChoiceButtons
              key={q.id}
              label={q.label}
              help={q.help}
              options={q.choices}
              value={s.checks[q.id]}
              onChange={(v) => patch({ checks: { ...s.checks, [q.id]: v } })}
              error={errors[q.id]}
              columns={q.choices.length === 3 ? 3 : 2}
            />
          ))}
          <TextArea
            label="Remarque (facultatif)"
            placeholder="Un bruit, un voyant, une question…"
            value={s.remark}
            maxLength={500}
            onChange={(e) => patch({ remark: e.target.value })}
          />
        </StepLayout>
      );
      break;

    case "contact":
      screen = (
        <StepLayout
          stepKey="contact"
          title="Vos coordonnées"
          intro="Pour vous confirmer le rendez-vous."
          action={
            <PrimaryButton onClick={submitContact} loading={loading}>
              Voir les créneaux disponibles
            </PrimaryButton>
          }
        >
          {Notice}
          <TextField
            label="Prénom"
            autoComplete="given-name"
            value={s.contact.firstName}
            onChange={(e) => patch({ contact: { ...s.contact, firstName: e.target.value } })}
            error={errors.firstName}
          />
          <TextField
            label="Nom"
            autoComplete="family-name"
            value={s.contact.lastName}
            onChange={(e) => patch({ contact: { ...s.contact, lastName: e.target.value } })}
            error={errors.lastName}
          />
          <TextField
            label="Téléphone mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
            value={s.contact.phone}
            onChange={(e) => patch({ contact: { ...s.contact, phone: e.target.value } })}
            error={errors.phone}
          />
          <TextField
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            value={s.contact.email}
            onChange={(e) => patch({ contact: { ...s.contact, email: e.target.value } })}
            error={errors.email}
          />
          <label className="mt-2 flex cursor-pointer items-start gap-3 py-2 text-base">
            <input
              type="checkbox"
              checked={s.contact.consent}
              onChange={(e) => patch({ contact: { ...s.contact, consent: e.target.checked } })}
              className="mt-0.5 size-6 shrink-0 accent-accent"
              aria-invalid={!!errors.consent}
            />
            <span>J&apos;accepte d&apos;être recontacté par Viastech au sujet de ma demande</span>
          </label>
          {errors.consent && <p className="text-sm text-danger">{errors.consent}</p>}
          <p className="mt-3 text-sm text-muted">
            Vos données servent uniquement à traiter votre demande.{" "}
            <a href="/confidentialite" className="underline underline-offset-2">
              En savoir plus
            </a>
          </p>
        </StepLayout>
      );
      break;

    case "creneau":
      screen = (
        <StepLayout
          stepKey="creneau"
          title="Choisissez votre créneau"
          intro={`Vous déposez votre véhicule à l'heure choisie. Comptez environ ${bookingRules.blockHours} h de pose.`}
          action={
            <PrimaryButton disabled={!s.slotStart} onClick={() => goTo("recap")}>
              {s.slotStart ? `Continuer avec le ${fmtDate(s.slotStart)} à ${fmtHour(s.slotStart)}` : "Choisissez un jour et une heure"}
            </PrimaryButton>
          }
        >
          {Notice}
          {days === null ? (
            <div className="space-y-3" aria-busy="true" aria-label="Chargement des créneaux">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[60px] animate-pulse rounded-[var(--radius-choice)] bg-surface" />
              ))}
            </div>
          ) : days.length === 0 ? (
            <div className="space-y-4">
              {!notice && (
                <p className="text-base">
                  Tous les créneaux des {Math.round(bookingRules.horizonDays / 7)} prochaines semaines sont pris. Écrivez-nous :
                  nous vous proposons une date.
                </p>
              )}
              <SecondaryLink href={whatsappHelp} onClick={() => track("whatsapp", { depuis: "complet" })}>
                Écrire sur WhatsApp
              </SecondaryLink>
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setDays(null);
                }}
                className="min-h-12 w-full text-base text-muted underline underline-offset-4">
                Réessayer
              </button>
            </div>
          ) : (
            <SlotPicker
              days={days}
              value={s.slotStart}
              selectedDate={s.selectedDate}
              onSelectDate={(selectedDate) => patch({ selectedDate, slotStart: null })}
              onSelectSlot={(slotStart) => patch({ slotStart })}
            />
          )}
        </StepLayout>
      );
      break;

    case "recap":
      screen = (
        <StepLayout
          stepKey="recap"
          title="Vérifiez et confirmez"
          action={
            <PrimaryButton onClick={confirm} loading={loading}>
              Confirmer mon rendez-vous
            </PrimaryButton>
          }
        >
          {Notice}
          <BookingSummary
            price={e85Service.priceLabel}
            priceNote={`Conversion E85, ${e85Service.offer}`}
            rows={[
              ["Dépôt", <strong key="d">{`${fmtDate(s.slotStart!)} à ${fmtHour(s.slotStart!)}`}</strong>],
              ["Véhicule", `${s.vehicle.brand} ${s.vehicle.model}, ${s.vehicle.year}`],
              ["Motorisation", s.vehicle.engine],
              ["Immatriculation", normalizePlate(s.vehicle.plate)],
              ["Contact", `${s.contact.firstName} ${s.contact.lastName}`],
              ["Adresse", garageAddressLine],
            ]}
            footer="Vous recevez une confirmation par e-mail, puis un rappel la veille."
          />
        </StepLayout>
      );
      break;

    case "confirme":
      screen = (
        <StepLayout stepKey="confirme" title="Votre rendez-vous est confirmé">
          <BookingSummary
            rows={[
              ["Date", <strong key="d" className="first-letter:uppercase">{fmtDate(s.slotStart!)}</strong>],
              ["Heure de dépôt", <strong key="h">{fmtHour(s.slotStart!)}</strong>],
              [
                "Adresse",
                <a key="a" href={mapsUrl} onClick={() => track("itineraire")} className="underline underline-offset-2">
                  {garageAddressLine}
                </a>,
              ],
              ["Prestation", `${e85Service.title}, ${e85Service.priceLabel}, ${e85Service.offer}`],
            ]}
            footer={`Une confirmation part sur ${s.contact.email}. Un empêchement : le lien d'annulation est dans l'e-mail.`}
          />
          <div className="mt-6 space-y-2">
            {s.icsUrl && (
              <PrimaryButton onClick={() => (window.location.href = s.icsUrl!)}>Ajouter à mon agenda</PrimaryButton>
            )}
            <SecondaryLink href={mapsUrl} onClick={() => track("itineraire")}>
              Voir l&apos;itinéraire
            </SecondaryLink>
            <SecondaryLink href={whatsappHelp} onClick={() => track("whatsapp", { depuis: "confirmation" })}>
              Une question ? WhatsApp
            </SecondaryLink>
          </div>
        </StepLayout>
      );
      break;
  }

  const showFooter = s.step === "accueil" || s.step === "sortie" || s.step === "confirme";

  return (
    <div className="flex flex-1 flex-col" data-animate={navigated ? "" : undefined}>
      <Stepper current={PROGRESS[s.step]} total={6} onBack={back} />
      {screen}
      {showFooter && <Footer />}
    </div>
  );
}
