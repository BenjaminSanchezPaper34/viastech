"use client";
/**
 * Parcours de réservation E85, un écran par étape, réduit au strict nécessaire :
 * carburant + plaque + kilométrage, points particuliers (un tap si « Aucun »), créneau,
 * puis coordonnées et confirmation sur le même écran.
 * Les saisies sont gardées dans sessionStorage : un rechargement ou un retour arrière
 * du téléphone ne fait rien perdre. Le bouton retour du navigateur suit les étapes.
 */
import { useCallback, useEffect, useState } from "react";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ChoiceButtons } from "@/components/booking/ChoiceButtons";
import { HeroVideo } from "@/components/booking/HeroVideo";
import { OfferTicket } from "@/components/booking/OfferTicket";
import { RecapTicket } from "@/components/booking/RecapTicket";
import { TextArea, TextField } from "@/components/booking/Field";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { PrimaryButton, SecondaryLink, StepLayout } from "@/components/booking/StepLayout";
import { Stepper } from "@/components/booking/Stepper";
import { Footer } from "@/components/site/Footer";
import { bookingRules } from "@/lib/config/booking";
import { garageAddressLine, mapsUrl, whatsappUrl } from "@/lib/config/garage";
import { e85Service } from "@/lib/e85/service";
import type { Checks, Contact, SlotDay, Vehicle } from "@/lib/e85/types";
import { hasErrors, isExitVehicle, normalizePlate, validateContact, validateVehicle, type Errors } from "@/lib/e85/validate";
import { track } from "@/lib/track";

type Step = "accueil" | "vehicule" | "sortie" | "points" | "creneau" | "contact" | "confirme";

/** L'accueil n'est pas une étape (0 : en-tête sans jauge). La confirmation remplit la jauge. */
const PROGRESS: Record<Step, number> = {
  accueil: 0,
  vehicule: 1,
  sortie: 1,
  points: 2,
  creneau: 3,
  contact: 4,
  confirme: 4,
};
const STEP_LABEL: Record<Step, string> = {
  accueil: "",
  vehicule: "Véhicule",
  sortie: "Véhicule",
  points: "Points particuliers",
  creneau: "Créneau",
  contact: "Coordonnées",
  confirme: "Rendez-vous confirmé",
};
const PREVIOUS: Partial<Record<Step, Step>> = {
  vehicule: "accueil",
  sortie: "vehicule",
  points: "vehicule",
  creneau: "points",
  contact: "creneau",
};

type State = {
  step: Step;
  vehicle: Vehicle;
  /** Points cochés ; null tant que le client n'a pas répondu (« Aucun » = tableau vide). */
  points: string[] | null;
  showRemark: boolean;
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
  vehicle: { fuel: "", plate: "", mileage: "" },
  points: null,
  showRemark: false,
  remark: "",
  contact: { firstName: "", lastName: "", phone: "", email: "" },
  utm: {},
  requestId: null,
  selectedDate: null,
  slotStart: null,
  icsUrl: null,
};

// Version dans la clé : une saisie gardée par l'ancien parcours (autres champs) n'est pas reprise.
const STORAGE = "viastech-e85-v2";

/** Les points cochés deviennent des réponses oui / non, la forme lue par l'agenda, les e-mails et l'admin. */
const toChecks = (points: string[]): Checks =>
  Object.fromEntries(e85Service.checks.map((q) => [q.id, points.includes(q.id) ? "oui" : "non"]));

const slotDate = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });
const slotHour = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const fmtDate = (iso: string) => slotDate.format(new Date(iso));
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
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

  // Créneaux chargés dès l'écran des points particuliers : le calendrier s'affiche sans attente sur mobile
  // (les setState n'ont lieu qu'après la réponse réseau).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated && (s.step === "points" || s.step === "creneau") && days === null) loadSlots();
  }, [hydrated, s.step, days, loadSlots]);

  const setVehicle = (p: Partial<Vehicle>) => {
    const vehicle = { ...s.vehicle, ...p };
    patch({ vehicle });
    if ("fuel" in p && isExitVehicle(vehicle)) {
      track("e85_sortie", { carburant: vehicle.fuel });
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

  /** Touche « OK » du clavier du téléphone sur le dernier champ : valide l'écran. */
  const onEnter = (action: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
      action();
    }
  };

  const submitVehicle = () => {
    const e = validateVehicle(s.vehicle);
    setErrors(e);
    if (hasErrors(e)) return;
    track("e85_vehicule");
    goTo("points");
  };

  const openSlots = () => {
    if (s.points === null) {
      setErrors({ checks: "Cochez les points qui vous concernent, ou « Aucun »." });
      return;
    }
    goTo("creneau");
  };

  const togglePoint = (id: string) => {
    const current = s.points ?? [];
    patch({ points: current.includes(id) ? current.filter((p) => p !== id) : [...current, id] });
    setErrors({});
  };

  /** Dernier écran : enregistre la demande puis réserve le créneau, en un seul geste pour le client. */
  const confirm = async () => {
    const e = validateContact(s.contact);
    setErrors(e);
    if (hasErrors(e) || !s.slotStart) return;
    setLoading(true);
    setNotice(null);
    try {
      const lead = await fetch("/api/e85/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: s.requestId,
          vehicle: s.vehicle,
          checks: toChecks(s.points ?? []),
          remark: s.remark,
          contact: s.contact,
          utm: s.utm,
        }),
      });
      const leadData = await lead.json();
      if (!lead.ok) {
        setErrors(leadData.errors ?? {});
        setNotice("Vérifiez les informations saisies.");
        return;
      }
      const requestId: string = leadData.id;
      patch({ requestId });
      track("e85_lead");

      const res = await fetch("/api/e85/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, slotStart: s.slotStart }),
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
        patch({ slotStart: null, selectedDate: null });
        setDays(null);
        goTo("creneau");
        setNotice("Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez-en un autre, vos informations sont gardées.");
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
          hero={<HeroVideo />}
          kicker="Bioéthanol E85"
          title="Passez à l'E85"
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
          <OfferTicket
            label="La conversion"
            price={e85Service.priceLabel}
            bonus={capitalize(e85Service.offer)}
            bonusNote="avec votre conversion"
          />
          <ul className="mt-6 space-y-4">
            {e85Service.arguments.map((a) => (
              <li key={a} className="flex items-start gap-3 text-base">
                <span className="mt-1.5 h-3 w-4 shrink-0 -skew-x-[28deg] rounded-[2px] bg-accent" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">
            1 minute pour vérifier votre véhicule et choisir votre créneau, à partir de {bookingRules.minLeadHours} h.{" "}
            {e85Service.paymentNote}
          </p>
        </StepLayout>
      );
      break;

    case "vehicule":
      screen = (
        <StepLayout
          stepKey="vehicule"
          title="Votre véhicule"
          intro="Votre immatriculation nous suffit pour vérifier la compatibilité."
          action={<PrimaryButton onClick={submitVehicle}>Continuer</PrimaryButton>}
        >
          <ChoiceButtons
            label="Il roule à quel carburant ?"
            options={e85Service.fuels}
            value={s.vehicle.fuel}
            onChange={(fuel) => setVehicle({ fuel })}
            error={errors.fuel}
          />
          <TextField
            label="Immatriculation"
            placeholder="AB-123-CD"
            value={s.vehicle.plate}
            onChange={(e) => setVehicle({ plate: e.target.value.toUpperCase() })}
            error={errors.plate}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoCapitalize="characters"
            enterKeyHint="next"
          />
          <TextField
            label="Kilométrage"
            placeholder="85 000"
            inputMode="numeric"
            value={s.vehicle.mileage}
            onChange={(e) => setVehicle({ mileage: e.target.value.replace(/[^\d\s]/g, "") })}
            error={errors.mileage}
            enterKeyHint="go"
            onKeyDown={onEnter(submitVehicle)}
          />
        </StepLayout>
      );
      break;

    case "sortie":
      screen = (
        <StepLayout
          stepKey="sortie"
          title="La conversion E85 concerne les voitures essence"
          intro={e85Service.exitMessages[s.vehicle.fuel] ?? "La réservation en ligne n'est pas possible pour ce véhicule."}
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
                  patch({ vehicle: { ...s.vehicle, fuel: "" } });
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

    case "points": {
      const chosen = s.points ?? [];
      const tile = (on: boolean) =>
        `flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-choice)] border px-3 text-center text-base transition-colors duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          on ? "border-accent bg-accent font-semibold text-bg" : "border-border bg-surface text-text active:border-muted"
        }`;
      screen = (
        <StepLayout
          stepKey="points"
          title="Un de ces points vous concerne ?"
          intro="Cochez ceux qui s'appliquent à votre véhicule. Le reste, nous le vérifions à l'atelier."
          action={
            chosen.length > 0 ? (
              <PrimaryButton onClick={openSlots}>Voir les créneaux</PrimaryButton>
            ) : (
              // « Aucun » est le cas le plus courant : il est sous le pouce et mène droit au calendrier.
              <PrimaryButton
                onClick={() => {
                  patch({ points: [] });
                  goTo("creneau");
                }}
              >
                Aucun, voir les créneaux
              </PrimaryButton>
            )
          }
        >
          <fieldset className="mb-6" aria-describedby={errors.checks ? "points-err" : undefined}>
            <legend className="sr-only">Points particuliers</legend>
            <div className="grid gap-2">
              {e85Service.checks.map((q) => {
                const on = chosen.includes(q.id);
                return (
                  <button key={q.id} type="button" aria-pressed={on} onClick={() => togglePoint(q.id)} className={tile(on)}>
                    {q.label}
                  </button>
                );
              })}
            </div>
            {errors.checks && (
              <p id="points-err" className="mt-2 text-sm text-danger">
                {errors.checks}
              </p>
            )}
          </fieldset>
          {s.showRemark || s.remark ? (
            <TextArea
              label="Une précision (facultatif)"
              placeholder="Un bruit, une question…"
              value={s.remark}
              maxLength={500}
              onChange={(e) => patch({ remark: e.target.value })}
            />
          ) : (
            <button
              type="button"
              onClick={() => patch({ showRemark: true })}
              className="min-h-11 text-base text-muted underline underline-offset-4"
            >
              Ajouter une précision
            </button>
          )}
        </StepLayout>
      );
      break;
    }

    case "creneau":
      screen = (
        <StepLayout
          stepKey="creneau"
          title="Choisissez votre créneau"
          intro={`Vous déposez votre véhicule à l'heure choisie. Comptez environ ${bookingRules.blockHours} h de pose.`}
          action={
            <PrimaryButton disabled={!s.slotStart} onClick={() => goTo("contact")}>
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

    case "contact":
      screen = (
        <StepLayout
          stepKey="contact"
          title="Vos coordonnées"
          intro="Dernière étape : nous vous envoyons la confirmation."
          action={
            <PrimaryButton onClick={confirm} loading={loading}>
              Confirmer mon rendez-vous
            </PrimaryButton>
          }
        >
          {Notice}
          {s.slotStart && (
            <div className="mb-6">
              <RecapTicket
                slotStart={s.slotStart}
                blockHours={bookingRules.blockHours}
                plate={normalizePlate(s.vehicle.plate)}
                address={garageAddressLine}
                price={e85Service.priceLabel}
                offer={e85Service.offer}
                paymentNote={e85Service.paymentNote}
              />
            </div>
          )}
          <TextField
            label="Prénom"
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={s.contact.firstName}
            onChange={(e) => patch({ contact: { ...s.contact, firstName: e.target.value } })}
            error={errors.firstName}
          />
          <TextField
            label="Nom"
            autoComplete="family-name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={s.contact.lastName}
            onChange={(e) => patch({ contact: { ...s.contact, lastName: e.target.value } })}
            error={errors.lastName}
          />
          <TextField
            label="Téléphone mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
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
            autoCapitalize="none"
            enterKeyHint="send"
            onKeyDown={onEnter(confirm)}
          />
          <p className="mt-1 text-sm text-muted">
            Vous recevez la confirmation par e-mail, puis un rappel la veille. Vos coordonnées servent uniquement à ce
            rendez-vous.{" "}
            <a href="/confidentialite" className="underline underline-offset-2">
              En savoir plus
            </a>
          </p>
        </StepLayout>
      );
      break;

    case "confirme":
      screen = (
        <StepLayout stepKey="confirme" title="Votre rendez-vous est confirmé">
          <BookingSummary
            rows={[
              ["Date", <strong key="d">{capitalize(fmtDate(s.slotStart!))}</strong>],
              ["Heure de dépôt", <strong key="h">{fmtHour(s.slotStart!)}</strong>],
              [
                "Adresse",
                <a key="a" href={mapsUrl} onClick={() => track("itineraire")} className="underline underline-offset-2">
                  {garageAddressLine}
                </a>,
              ],
              ["Prestation", `${e85Service.title}, ${e85Service.priceLabel}, ${e85Service.offer}`],
            ]}
            footer={`${e85Service.paymentNote} Une confirmation part sur ${s.contact.email}. Un empêchement : le lien d'annulation est dans l'e-mail.`}
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
    <div className="relative flex flex-1 flex-col" data-animate={navigated ? "" : undefined}>
      <Stepper current={PROGRESS[s.step]} total={4} label={STEP_LABEL[s.step]} done={s.step === "confirme"} onBack={back} />
      {screen}
      {showFooter && <Footer />}
    </div>
  );
}
