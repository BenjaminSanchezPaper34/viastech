# DESIGN.md — Garage Viastech · Vias · Parcours de réservation E85

> Première brique de la future refonte viastech.fr. **La charte est celle du site en
> préparation : `site/DESIGN_SYSTEM.md` (avril 2026) fait foi** pour les couleurs, les
> polices, les logos et le ton. Ce fichier n'en reprend que ce qui sert le parcours, et
> ajoute ses règles propres (tunnel mobile, animation, interdits).

**Secteur** : garage automobile, spécialiste véhicules allemands
**Personnalité en 3 mots** : net, mécanique, direct
**Références** : grammaire des tunnels de réservation mobiles (une question par écran, gros
choix tactiles, récap avant validation), pas de site vitrine ici
**Source de vérité marque** : `site/DESIGN_SYSTEM.md` et les logos vectoriels
`site/assets/img/brand/` (vert du SVG officiel : `#6bb534`).

---

## 0. Message — Pain · Person · Promise

- **Person** : l'automobiliste du coin, véhicule essence, qui a cliqué sur la pub Meta E85
  et arrive depuis WhatsApp, téléphone en main
- **Pain** : il veut savoir si sa voiture est compatible et quand passer, sans attendre une
  réponse pendant 12 h ni devoir appeler
- **Promise** : « Passez à l'E85 avec Viastech : 420 €, 1er plein offert, votre créneau en
  1 minute »

→ Titre de l'écran 1, meta description, aperçu du lien WhatsApp (OG).

## 1. Tokens couleurs (charte du site)

| Nom | Hex | Variable | Rôle |
|-----|-----|----------|------|
| Vert ViasTech | `#6bb534` | `--color-accent` | L'unique décision chromatique : bouton principal, choix sélectionné, barre de progression, prix, trait signature. Texte posé dessus : toujours le noir du fond |
| Noir profond | `#07090A` | `--color-bg` | Fond de page |
| Surface | `#11151A` | `--color-surface` | Fond des cartes de choix et des champs |
| Bordure | `#1F2630` | `--color-border` | Bordures des choix et champs au repos |
| Blanc cassé | `#EDEFF2` | `--color-text` | Texte principal |
| Texte 2 | `#A8AFB8` | `--color-muted` | Aides, sous-titres, mentions |
| Rouge | `#FF5447` | `--color-danger` | Erreurs de saisie uniquement, jamais décoratif |

Règle : le vert ne sert qu'à ce qui fait avancer ou ce qui est choisi. Jamais en aplat de
fond de section.

## 2. Typographie (charte du site)

- **Display** : Bricolage Grotesque (axe opsz), titres d'écran, prix « 420 € », titre de
  confirmation ; semi-gras, interlettrage `-0.025em`. Jamais en corps de texte.
- **Texte** : Inter. Corps, boutons, champs, récap.
- **Données** : JetBrains Mono, chapeaux en capitales `+0.16em`, vert.
- Les trois via `next/font`, **auto-hébergées** (le site statique les charge encore depuis
  Google Fonts : à corriger lors de son portage).
- Tailles : corps 16 px minimum (aussi dans les champs, sinon iOS zoome), aides 14 px,
  12 px réservé au pied de page légal. Titres en `clamp(1.75rem, 7vw, 2.5rem)`.

## 3. Matière

- **Rayons** : 14 px cartes de choix, champs et boutons, 9999 px pastilles d'heure
- **Ombres** : aucune. Sur fond noir, la hiérarchie se fait par la surface et la bordure
- **Espacements** : gouttière 16 px mobile (+ safe areas), 24 px entre blocs, cibles
  tactiles ≥ 52 px de haut, bouton principal pleine largeur collé en bas d'écran
- **Trait vert signature** (charte) : 64 × 3 px, un seul par écran, entre le titre et le
  texte. Enchaînement : chapeau mono, titre, trait, texte
- **Logos** : SVG officiels (en-tête, pied de page) ; PNG tirés du SVG pour les e-mails et
  l'aperçu de lien, où le SVG n'est pas lu

## 4. Animation

- **Tempo** : vif et sec, 180-240 ms, `ease-out`. CSS seul, aucune librairie
- **Ce qui bouge** : entrée de chaque écran (fondu + 12 px de glissement), remplissage de la
  barre de progression, état sélectionné d'un choix (bordure et fond vert en 150 ms)
- **Ne bouge jamais** : le prix, le récapitulatif, les messages d'erreur
- **Effet signature** : la barre de progression est faite de segments en parallélogramme,
  découpés au même angle que les barres du « V » du logo, qui se remplissent de vert à
  chaque étape
- **Scroll lock** : non. **UI d'état (Motion)** : sans objet
- `prefers-reduced-motion` : toutes les transitions coupées

## 5. Interdits de ce projet

- Pas de tiret cadratin, nulle part (consigne client)
- Pas de dégradé, pas de glassmorphism, pas d'ombre portée
- Pas de photo de banque d'images (pompe, billets, bidon d'éthanol)
- Pas d'emoji dans l'interface (le message WhatsApp en garde un, c'est son canal)
- Pas de saisie libre là où un choix suffit ; seul le champ « Remarque » est libre
- Pas de lien sortant pendant le parcours, sauf WhatsApp et la carte
- Aucune dépendance lourde : pas de GSAP, Lenis, Three.js, librairie de calendrier ou d'UI
- Toujours : esthétique template, deux moteurs sur un même élément

---
*Validé par Benjamin le : 28/10/2026 · aligné sur la charte du site le 28/10/2026 (accord de Benjamin)*
