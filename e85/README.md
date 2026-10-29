# Viastech : réservation E85

Parcours mobile de réservation de la conversion E85 du Garage Viastech (Vias) :
le prospect vérifie son véhicule et choisit lui-même son créneau, au plus tôt 48 h après.
Lien envoyé en réponse d'accueil WhatsApp Business. Première brique de la future refonte de viastech.fr.

- Parcours : `/e85` (la racine `/` y redirige, paramètres UTM conservés)
- Tableau de bord du garage : `/e85/admin`
- DA : [`DESIGN.md`](DESIGN.md)

## Démarrer en local (sans aucune clé)

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000/e85. Sans variables d'environnement, tout est simulé :

| Brique | Mode local | Où regarder |
|---|---|---|
| Agenda | `.data/mock-calendar.json` (une pose et un jour fermé d'exemple) | fichier + console |
| Demandes | `.data/requests.json` | `/e85/admin`, mot de passe `viastech` |
| E-mails | affichés dans le terminal | console |
| Rappel de la veille | `http://localhost:3000/api/cron/reminders?force=1` | console |

Supprimer le dossier `.data` remet tout à zéro.

## Où modifier quoi

| Besoin | Fichier |
|---|---|
| Heures de dépôt, heure de fermeture par jour, poses par jour, durée bloquée, délai, horizon, jours fermés | `lib/config/booking.ts` |
| Adresse, horaires, téléphone, WhatsApp, e-mail du garage (NAP, une seule source) | `lib/config/garage.ts` |
| Prix, arguments, marques, questions techniques, règles de sortie | `lib/e85/service.ts` |
| Textes des e-mails | `lib/email/templates.ts` |
| Couleurs, polices | `app/globals.css` (tokens de la charte `../DESIGN_SYSTEM.md`) |

**Jours de fermeture sans toucher au code** : poser un événement « journée entière » (congés, pont, salon…)
dans l'agenda « Viastech - Poses E85 ». Le jour disparaît des créneaux proposés.

**Poses prises par téléphone** : les créer dans le même agenda avec un titre commençant par `E85`
(ex. « E85 - Golf - Martin »). Elles comptent dans la limite de poses par jour. Tout autre événement
horaire (« Dentiste 14h ») bloque aussi le créneau qu'il chevauche.

## Mise en production

### 1. Google Agenda et compte de service

1. Sur le compte Google **du garagiste** (pour qu'il voie les poses sur son téléphone) :
   Google Agenda → « Autres agendas » → **+** → **Créer un agenda** → nom `Viastech - Poses E85`,
   fuseau **Europe/Paris**.
2. Sur [console.cloud.google.com](https://console.cloud.google.com) (projet Paper34) :
   - **API et services → Bibliothèque** → activer **Google Calendar API** ;
   - **IAM et administration → Comptes de service → Créer** : nom `viastech-e85`, aucun rôle ;
   - ouvrir le compte → **Clés → Ajouter une clé → JSON** : un fichier se télécharge.
3. Retour dans Google Agenda (compte du garagiste) : paramètres de l'agenda `Viastech - Poses E85`
   → **Partager avec des personnes en particulier** → ajouter l'e-mail du compte de service
   (`viastech-e85@….iam.gserviceaccount.com`) avec le droit **Apporter des modifications aux événements**.
4. Même page, section **Intégrer l'agenda** : copier l'**ID de l'agenda** (`…@group.calendar.google.com`).
5. Variables : `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `client_email` du JSON, `GOOGLE_PRIVATE_KEY` =
   `private_key` du JSON (telle quelle, avec ses `\n`), `GOOGLE_CALENDAR_ID` = l'ID copié.

Le compte de service n'a accès qu'à cet agenda, rien d'autre sur le compte du garagiste.

### 2. Base de données

Vercel → projet → **Storage → Create → Neon (Postgres)**, région **Frankfurt (eu-central-1)**,
relier au projet : `DATABASE_URL` est ajoutée seule. La table se crée au premier appel.

### 3. Resend (e-mails)

1. Créer un compte sur [resend.com](https://resend.com) → **Domains → Add domain** → `viastech.fr`
   (région EU).
2. Ajouter dans la zone DNS de viastech.fr les enregistrements affichés (DKIM `resend._domainkey`,
   SPF sur `send`, MX `send`). Ils ne touchent pas aux e-mails existants de `contact@viastech.fr`.
3. **API Keys → Create** (droit « Sending access ») → `RESEND_API_KEY`.
4. `EMAIL_FROM="Garage Viastech <rdv@viastech.fr>"`, `EMAIL_GARAGE=contact@viastech.fr`.

### 4. Vercel

1. Importer le dépôt GitHub `viastech`, **Root Directory : `e85`**, Framework **Next.js**.
   (Le site statique à la racine du dépôt reste un projet à part ; `.vercelignore` l'empêche
   de publier les sources de `e85/`.)
2. Renseigner toutes les variables de `.env.example` (`APP_SECRET` et `CRON_SECRET` :
   `openssl rand -base64 32`).
3. **Domaine** : Settings → Domains → `e85.viastech.fr` ; chez le gestionnaire DNS de viastech.fr,
   CNAME `e85` → `cname.vercel-dns.com`.
4. **Cron** (`vercel.json`) : deux déclenchements, 16 h et 17 h UTC ; seul celui qui tombe à 18 h à Paris
   envoie les rappels (heure d'été comme d'hiver). Le plan Hobby n'autorise qu'un cron par jour :
   sur Hobby, ne garder qu'une ligne (`0 17 * * *` = 18 h en hiver, 19 h en été) et passer
   `reminderHour` à 19 l'été.
5. **Web Analytics** : Settings → Analytics → Enable. Événements suivis : `e85_debut`,
   `e85_vehicule`, `e85_sortie`, `e85_lead`, `e85_reservation`, `whatsapp`, `tel`, `itineraire`.

### 5. Pixel Meta (optionnel)

Renseigner `NEXT_PUBLIC_META_PIXEL_ID`. Un encart demande alors l'accord du visiteur avant tout
chargement (obligation CNIL pour un outil publicitaire) ; `Lead` part à l'étape coordonnées,
`Schedule` à la confirmation. Vide = rien n'est chargé, aucun encart.

## Message d'accueil WhatsApp Business

WhatsApp Business → Outils pro → **Message d'accueil** :

> Bonjour et merci pour votre message 👋 Pour la conversion E85 (420 €, 1er plein offert), vérifiez votre véhicule et choisissez votre créneau en 1 minute ici : https://e85.viastech.fr/e85?utm_source=whatsapp&utm_medium=message&utm_campaign=e85-accueil . On vous confirme tout dans la foulée.

Pour la publicité Meta qui pointerait directement vers le site :
`https://e85.viastech.fr/e85?utm_source=meta&utm_medium=paid&utm_campaign=e85`.

## Place dans la refonte du site

Ce dossier vit dans le dépôt de la refonte (`viastech`), à côté du site statique (racine du
dépôt). Il en reprend la charte : `../DESIGN_SYSTEM.md` fait foi, `DESIGN.md` n'en garde que
ce qui sert le parcours.

Quand la refonte sera vendue : porter les pages du site statique dans cette application
Next.js (une route par page, polices auto-hébergées), puis brancher `viastech.fr` sur ce
projet. Le parcours est déjà sur `/e85` : rien à déplacer. `e85.viastech.fr` passe alors en
redirection 308 vers `viastech.fr/e85` (les liens WhatsApp et leurs UTM restent valables), et le
bouton de la section E85 du site ainsi que l'article « éligibilité E85 » pointent vers `/e85`.

## Architecture

```
lib/config/        règles de créneaux, identité du garage
lib/e85/           prestation (service.ts), validation, calcul des créneaux, réservation/annulation
lib/calendar/      Google Agenda (REST + JWT, sans SDK) ou agenda simulé
lib/store/         Postgres (Neon) ou fichier local, même interface
lib/email/         envoi Resend (REST) ou console, modèles d'e-mails
components/booking Stepper, ChoiceButtons, SlotPicker, BookingSummary, champs : sans rien d'E85
app/e85/           parcours, annulation, admin
app/api/           créneaux, demande, réservation, .ics, export CSV, cron
```

**Ajouter une prestation** (vidange, diagnostic…) : dupliquer `lib/e85/service.ts`, puis un parcours
`app/<prestation>/` qui réutilise les composants de `components/booking`.

**Conflits** : la disponibilité est revérifiée dans l'agenda au moment de « Confirmer », et un index
unique en base empêche deux réservations sur le même créneau, même à la même seconde.
Le perdant voit « Ce créneau vient d'être réservé » et rechoisit.

## À compléter avant la mise en ligne

- `app/mentions-legales` : raison sociale, forme juridique, capital, SIRET, TVA, dirigeant, médiateur
  (surlignés en rouge sur la page).
- Points particuliers (voyant moteur, reprogrammation, garantie) dans `lib/e85/service.ts`, et l'immatriculation seule pour identifier le véhicule : à valider avec le garagiste.
