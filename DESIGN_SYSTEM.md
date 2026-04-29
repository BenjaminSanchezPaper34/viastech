# 🎨 ViasTech — Design System (Web + Print)

Guide complet pour maintenir une identité visuelle cohérente entre le site, les supports print (flyers, affiches, cartes de visite) et les réseaux sociaux (stories Instagram, posts).

Charte établie en avril 2026 par Paper34 Web Studio, à partir de l'identité existante de ViasTech (logo officiel + stories Instagram de référence).

---

## 1 · Couleurs

### Palette principale

| Nom | Hex | RGB | Usage |
|---|---|---|---|
| **Vert ViasTech** | `#6bb534` | rgb(107, 181, 52) | Couleur signature — accents, CTAs, traits, logo |
| **Vert clair** (hover) | `#87CC4F` | rgb(135, 204, 79) | Hover sur éléments verts, gradients |
| **Vert sombre** | `#5A9F25` | rgb(90, 159, 37) | Bordures actives, états pressés |
| **Noir profond** | `#07090A` | rgb(7, 9, 10) | Fond principal du site, texte sur clair |
| **Blanc cassé** | `#EDEFF2` | rgb(237, 239, 242) | Texte principal sur fond sombre |

### Palette secondaire (web — gris)

| Nom | Hex | Usage |
|---|---|---|
| **Surface** | `#11151A` | Cards, panneaux |
| **Surface 2** | `#161B22` | Hover, états élevés |
| **Bordure** | `#1F2630` | Lignes fines |
| **Bordure 2** | `#2A3340` | Lignes accentuées |
| **Texte 2** | `#A8AFB8` | Texte secondaire |
| **Texte 3** | `#6F7782` | Texte tertiaire (légendes, mono) |

### Palette pour print

Pour le print, la palette se simplifie en 3 couleurs :
- **Vert ViasTech** `#6bb534` — équivalent CMJN : `60 / 0 / 90 / 10` (à valider avec votre imprimeur)
- **Noir** `#000000` — pour les textes
- **Blanc** `#FFFFFF` — pour les fonds clairs

Variantes possibles en print :
- Affiche / flyer fond blanc → titres en noir, accents en vert
- Affiche / flyer fond noir → titres en blanc, accents en vert (préféré pour grand format)

---

## 2 · Typographie

### Polices web

| Famille | Source | Usage |
|---|---|---|
| **Bricolage Grotesque** | Google Fonts | Display (titres, sous-titres, brand wordmark, citations) — variable, opsz 12..96 |
| **Inter** | Google Fonts | Corps de texte, paragraphes, boutons — weight 300 → 700 |
| **JetBrains Mono** | Google Fonts | Données chiffrées, kickers, tags techniques, badges |

### Polices print

Pour rester cohérent en print, utiliser les mêmes polices :
- Bricolage Grotesque (titres) — téléchargeable via Google Fonts
- Inter (corps) — téléchargeable via Google Fonts
- JetBrains Mono (data) — téléchargeable via Google Fonts

Si licence/temps limité pour le print, équivalents acceptables :
- Bricolage Grotesque ≈ **Manrope**, **Cabinet Grotesk**, **Inter Display**
- Inter ≈ **Helvetica Neue**, **SF Pro Text**, **Roboto**
- JetBrains Mono ≈ **IBM Plex Mono**, **Space Mono**

### Échelle typographique

| Taille | Web (rem/clamp) | Print (pt) | Usage |
|---|---|---|---|
| **Display XL** | clamp(2.6rem, 8vw, 7rem) | 96-120 pt | Hero principal |
| **Display L** | clamp(2.4rem, 6vw, 5.4rem) | 60-80 pt | Section titles |
| **Display M** | clamp(2rem, 4.5vw, 3.6rem) | 40-50 pt | Sub-section |
| **H1 standard** | 2rem (32px) | 24 pt | Titres d'article |
| **H2** | 1.5rem (24px) | 18 pt | Sous-titres |
| **H3** | 1.2rem (19px) | 14 pt | Cards |
| **Body** | 1rem (16px) | 11 pt | Texte courant |
| **Small** | 0.875rem (14px) | 9 pt | Légendes, footer |
| **Caption** | 0.72rem (11.5px) | 8 pt | Tags, kickers, data |

### Règles typo

- **Jamais en dessous de 11pt** (print) ou 14px (web) pour le corps de texte
- Italique réservé aux **mots accentués** (avec couleur vert) dans les gros titres
- Lettrespacing : kickers et caps en `+0.16em` (web) ou `+160 unités` (print)
- Lettrespacing : titres display en `-0.025em` (resserré, look moderne)
- Line-height : 1.55 pour le body, 1.0–1.1 pour les display, 1.15 pour les H2/H3

---

## 3 · Le « trait vert signature » (Line Mark)

C'est l'élément visuel **identitaire le plus fort** des stories ViasTech. Un trait horizontal vert qui sépare un titre d'un sous-titre, ou qui marque une accentuation.

### Web

```html
<span class="line-mark"></span>
<span class="line-mark line-mark--lg"></span>
<span class="line-mark line-mark--center"></span>
```

```css
.line-mark{
  display:block;
  width:64px;height:3px;
  background:#6bb534;
  margin:1.2rem 0;
  border-radius:1px;
}
.line-mark--lg{width:120px;height:4px}
.line-mark--center{margin-inline:auto}
```

### Print

- **Petit format** (cartes de visite) : trait de 25 mm × 1 mm
- **Format A6/A5** (flyers) : trait de 60 mm × 2 mm
- **Format A4/A3** (affiches) : trait de 100-120 mm × 3-4 mm
- **Format roll-up / 2 m** : trait de 200-250 mm × 5-6 mm

Toujours en **vert ViasTech** pur, sans dégradé, sans halo. Posé en bloc, à gauche, juste avant le sous-titre.

### Quand l'utiliser

✅ Entre un titre et un sous-titre  
✅ Avant un kicker / chapeau de section  
✅ Pour signer un visuel (en bas, à côté du logo)  
✅ Comme séparateur visuel entre deux blocs  

❌ Comme bordure d'image (briserait l'identité)  
❌ En diagonal, pointillé, en gradient  
❌ Multiplié sur la même page (un seul par bloc)  

---

## 4 · Logo

### Variantes officielles

| Fichier | Usage |
|---|---|
| `assets/img/brand/symbole-blanc.svg` | Symbole seul (V stylisé) sur fond sombre |
| `assets/img/brand/symbole-noir.svg` | Symbole seul sur fond clair |
| `assets/img/brand/logo-banner-blanc.svg` | Logo complet bannière sur fond sombre |
| `assets/img/brand/logo-banner-noir.svg` | Logo complet bannière sur fond clair |
| `assets/img/brand/favicon.svg` | Favicon (symbole sur carré arrondi noir) |

### Règles d'utilisation

- **Marge de protection** autour du logo = ½ de la hauteur du symbole
- Taille minimum web : **24px** de hauteur (symbole) / **120px** (logo banner)
- Taille minimum print : **8 mm** de hauteur (symbole) / **30 mm** (logo banner)
- Toujours fond contrasté — pas de logo blanc sur fond très clair, pas de logo noir sur fond sombre
- **Ne jamais déformer**, étirer, recolorier, encadrer, ombrer, ou modifier le symbole

### Construction du symbole

Le V de ViasTech est composé de **trois facettes** stylisées (origami) :
- Deux facettes blanches (négatif) à gauche et au centre
- Deux facettes vertes (positif) à droite formant l'angle inférieur du V
- Une facette blanche en haut à droite formant le haut du V

Le ratio est `62.2 × 51.46` (proche carré, légèrement plus large que haut).

---

## 5 · Espacements

### Système web (rem)

Basé sur une échelle multiplicative de `0.5` :

| Token | Valeur | Usage |
|---|---|---|
| `--space-2xs` | 0.25rem (4px) | Gap minimal |
| `--space-xs` | 0.5rem (8px) | Gap entre tag et contenu |
| `--space-sm` | 0.75rem (12px) | Gap interne cards |
| `--space-md` | 1rem (16px) | Gap standard |
| `--space-lg` | 1.5rem (24px) | Gap entre éléments majeurs |
| `--space-xl` | 2rem (32px) | Gap entre sections internes |
| `--space-2xl` | 3rem (48px) | Gap entre titre et contenu |
| `--space-3xl` | 5rem (80px) | Gap entre sections (mobile) |
| `--space-4xl` | 9rem (144px) | Gap entre sections (desktop) |

Pour les sections, on utilise `--section-y: clamp(5rem, 10vw, 9rem)` qui s'adapte automatiquement.

### Système print (mm)

| Token | Valeur | Usage |
|---|---|---|
| Marge intérieure | 5-10 mm | Selon format |
| Gap entre éléments | 8-12 mm | A4/A5 |
| Gap entre blocs | 20-30 mm | A4/A5 |
| Marge image vs texte | 15 mm | Toujours respecter |

---

## 6 · Composants

### Boutons

```css
/* Primaire — vert plein */
.btn--primary{
  background:#6bb534;color:#0A0E07;
  padding:.95rem 1.5rem;border-radius:14px;
  font-weight:600;font-size:.95rem;
}
.btn--primary:hover{background:#87CC4F;box-shadow:0 8px 24px rgba(107,181,52,.35)}

/* Ghost — transparent border */
.btn--ghost{
  background:transparent;color:#EDEFF2;
  border:1px solid #1F2630;
}
```

### Cards

- Fond : `#11151A` (surface)
- Bordure : `1px solid #1F2630`
- Border-radius : `22px` (cards larges) / `14px` (cards compactes)
- Hover : translateY(-4px) + bordure éclaircie
- Padding : `1.6-2rem`

### Tags / badges

- Fond : `#161B22` (surface 2) ou `rgba(7,9,10,.7)` avec backdrop-blur sur image
- Bordure : `1px solid #1F2630`
- Border-radius : `999px` (pill)
- Police : JetBrains Mono `0.7-0.75rem`
- Letter-spacing : `+0.04em` à `+0.08em`
- Padding : `0.3rem 0.7rem`

### Kicker (chapeau de section)

```html
<span class="section__kicker">02 — Spécialistes allemands</span>
```

- Police : JetBrains Mono uppercase
- Couleur : Vert ViasTech `#6bb534`
- Préfixe : trait vert 32px (via `::before`)
- Suit toujours l'enchaînement : kicker → titre → trait → sous-titre

---

## 7 · Photographie

### Direction

- **Authentique** : photos de l'atelier réel, des mécanos au travail, des véhicules en cours d'intervention
- **Pas de stock photo** générique
- **Lumière naturelle** privilégiée, pas de flash dur
- **Détails métier** : mains qui travaillent, outils, pièces, traces d'usage assumées
- **Cadrages serrés** sur les détails techniques (logos constructeur, pneus, intérieurs)

### Traitement

- **Saturation** légèrement réduite (`.92`) pour un look pro
- **Contraste** légèrement augmenté (`1.05-1.08`)
- **Filtrage RAW** : DxO DeepPRIME XD2s ou équivalent (réduction de bruit haute qualité)
- Pour les **fonds web** : `brightness(.5)` + `saturate(.92)` en plus

### Format & dimensions web

- **Format** : WebP qualité 80-85
- **Largeur max** : 1600-1800px (desktop), 720-1080px (mobile)
- **Aspect ratios** :
  - Cards véhicules : `4/3`
  - Atelier hero : `4/5` (portrait)
  - Article cover vidéo : `9/16`
  - Bandeau OG : `1200x630`

### Format & dimensions print

- **Format** : TIFF ou JPEG haute qualité (qualité 12 minimum dans Photoshop)
- **Résolution** : 300 dpi minimum
- **Couleur** : CMJN (conversion depuis RGB)
- **Profil** : ISO Coated v2 (Europe)

---

## 8 · Vidéo

### Format atelier vertical (Insta Reels / Stories)

- **Résolution** : 1080×1920 (9:16)
- **Codec source** : HEVC ou ProRes 422
- **Audio** : 320 kbps AAC ou supprimé pour fond loop

### Format web optimisé

- **Hero desktop** : MP4 H.264 1080×1920, ~2.5 Mbps, sans audio, autoplay/loop
- **Hero mobile** : MP4 H.264 720×1280, ~1.2 Mbps
- **Versions WebM VP9** en fallback (meilleure compression sur navigateurs récents)
- **Poster frame** : WebP qualité 78, `~50-150 KB`

Voir `assets/video/` pour les fichiers de référence.

---

## 9 · Accessibilité

### Contrastes minimums

- Texte normal : **4.5:1** (WCAG AA) — vérifié pour `#EDEFF2` sur `#07090A`
- Texte large (24px+) : **3:1**
- Vert sur noir : `7.68:1` ✓ (AAA)
- Vert sur blanc : `2.91:1` ⚠ (à éviter — utiliser vert sombre `#5A9F25` qui passe à `4.85:1`)

### Hiérarchie

- Toujours un seul `h1` par page
- Hiérarchie h1 → h2 → h3 sans saut
- Skip link en début de page (`Aller au contenu`)
- Focus visibles sur tous les éléments interactifs (`:focus-visible` outline vert)

### Reduced motion

- Respect de `prefers-reduced-motion` : animations désactivées, vidéos en poster
- Smooth scroll Lenis se désactive automatiquement

---

## 10 · Print — recommandations spécifiques

### Cartes de visite (85×55 mm)

- **Recto** : fond noir `#07090A`, logo banner blanc en haut à gauche, nom + fonction au centre, contact + trait vert en bas
- **Verso** : symbole vert centré sur fond noir, ou liste services + adresse

### Flyer A5 (148×210 mm)

- Fond noir, photo atelier en grand sur ½ supérieure
- Trait vert juste avant le titre principal
- Hiérarchie : kicker (mono vert) → titre Bricolage 60pt → trait vert → sous-titre Inter 20pt
- Footer fixe : adresse + tél + URL + symbole

### Affiche A3 (297×420 mm)

- Photo plein cadre saturée légèrement réduite
- Texte en bas (1/3) sur dégradé noir → transparent
- CTA en bouton vert plein, contrasté
- Logo banner en bas (10% de la largeur de l'affiche)

### Roll-up (2000×850 mm)

- Décomposition en 3 zones :
  - Header (top 20%) : logo banner + slogan
  - Body (60%) : photo dominante + 3 services en bullets verts
  - Footer (bottom 20%) : QR code vers site + URL + contact

### Stories Instagram (1080×1920)

- Voir le fichier `STORIES-1920x1080-VIASTECH.indd` pour le template
- Hiérarchie classique :
  - Photo plein cadre top
  - Bandeau noir en bas (35-40% hauteur)
  - Bouton/badge "PRESTATION" / "À VENDRE" en pill blanc/transparent
  - Titre Bricolage 80-100pt
  - **Trait vert signature**
  - Sous-titre Inter 30-40pt
  - Symbole logo blanc 70-80px

---

## 11 · Tone of voice

### Principes

- **Direct** : on évite la langue de bois, on dit ce qu'on fait
- **Précis** : on cite les références techniques (boîtier FRM, M97, S-tronic 7, ZF 8HP) — ça donne de la crédibilité
- **Honnête** : on dit non quand il faut, on évite la sur-promesse
- **Posé** : pas d'exclamations, pas de superlatifs gratuits
- **Local** : on parle de Vias, de Béziers, de l'Hérault — pas du « monde de l'automobile »

### Exemples

✅ « Le boxer Porsche est un moteur sublime, mais exigeant. »  
❌ « Notre garage est le meilleur du sud de la France ! »

✅ « Sur les BMW E81/E82/E87/E90/E91/X1, le FRM tombe en panne après quelques cycles batterie un peu rudes. »  
❌ « On répare toutes les BMW avec un savoir-faire unique. »

✅ « 420 € — premier plein offert. »  
❌ « Tarifs imbattables ! Économies à gogo ! »

---

## 12 · Référentiel de fichiers

```
site/
├── DESIGN_SYSTEM.md            ← ce fichier
├── BLOG_TEMPLATE.md            ← workflow article blog
├── README.md                   ← guide déploiement
├── assets/
│   ├── img/
│   │   ├── brand/              ← logos officiels SVG
│   │   │   ├── symbole-blanc.svg
│   │   │   ├── symbole-noir.svg
│   │   │   ├── logo-banner-blanc.svg
│   │   │   ├── logo-banner-noir.svg
│   │   │   ├── favicon.svg
│   │   │   └── apple-touch-icon.png
│   │   ├── atelier/            ← photos pro DxO (15 sélectionnées)
│   │   ├── hero/               ← anciennes images (peuvent être archivées)
│   │   ├── vehicules/<slug>/   ← photos véhicules à vendre
│   │   ├── video-posters/      ← posters frames pour vidéos
│   │   └── og-image.jpg        ← partage social 1200×630
│   ├── video/                  ← MP4 + WebM optimisés
│   ├── css/style.css           ← un seul fichier (1900 lignes)
│   └── js/main.js              ← un seul fichier (350 lignes)
└── ...
```

---

## 13 · Checklist avant export print

- [ ] Conversion **RGB → CMJN** sur le fichier
- [ ] Vert ViasTech vérifié à `#6bb534` (60/0/90/10 CMJN env.)
- [ ] Marges de fond perdu (3-5 mm selon format)
- [ ] Polices vectorisées ou embarquées
- [ ] Photos en **300 dpi** minimum à la taille finale
- [ ] Logo en SVG (vectoriel) jamais en JPG
- [ ] Trait vert **signature** présent (sauf si mini format)
- [ ] Tone of voice respecté (titre + sous-titre cohérents)
- [ ] Footer avec coordonnées (URL, tél, adresse)
- [ ] Relecture orthographe + chiffres

---

*ViasTech — Design System v1.0 · Avril 2026 · Paper34 Web Studio*
