# ViasTech — À faire avant prod

## 🚨 Critique (avant mise en ligne)

### Données factuelles à valider avec le gérant

- [ ] **Stats hero** : confirmer les chiffres ou les retirer
  - Actuellement : "Allemands • Toutes marques • 60% éco E85 • 34450 Vias"
  - Si la formation Renault et l'expérience sont vérifiables, on peut remettre des chiffres concrets (années, etc.)

- [ ] **Témoignages** (`#temoignages`) : actuellement 3 témoignages **inventés** pour le placeholder
  - Récupérer 3-5 vrais avis Google Maps (avec accord des clients pour utiliser leur prénom)
  - Ou intégrer un widget live (Trustindex, Elfsight)

- [ ] **Avis Google : 4,8/5** dans les témoignages — à vérifier sur la fiche réelle

- [ ] **Photos atelier** : remplacer l'AdobeStock du hero par une vraie photo de l'atelier
  - Idéalement : photo du gérant en intervention, vue d'ensemble atelier, banc puissance
  - Format souhaité : 2400×1600 minimum, format paysage

### Fiches véhicules

Pour chaque véhicule (`/vehicules/<slug>/`), ajouter les vrais champs :
- [ ] **Prix de vente** (ou "Nous consulter")
- [ ] **Année de mise en circulation**
- [ ] **Kilométrage**
- [ ] **Puissance fiscale** (CV) et **réelle** (ch)
- [ ] **Boîte exacte** (manuelle / automatique / DSG / S-tronic)
- [ ] **Couleur**
- [ ] **Options principales**

## ⚙️ Configuration

- [ ] **FormSubmit.co** : à la première soumission, l'email recevra un lien d'activation à cliquer (sécurité anti-spam). Confirmer avec le gérant qu'il a bien cliqué.
- [x] **Hébergement** : Vercel (déploiement auto sur push `main`)
- [ ] **Domaine** : connecter `viastech.fr` + `www.viastech.fr` dans Vercel → Settings → Domains
- [ ] **DNS** : modifier les enregistrements chez le registrar avec ceux fournis par Vercel
- [ ] **Email contact** : `contact@viastech.fr` est-il bien actif et consulté ?
- [ ] **Réseaux sociaux** : YouTube et Facebook actifs ? Si oui, mettre à jour les liens du footer

## 📈 Marketing & SEO post-prod

- [ ] Soumettre `sitemap.xml` à **Google Search Console**
- [ ] Configurer **Bing Webmaster Tools**
- [ ] Mettre à jour **Google Business Profile** (URL, horaires, photos)
- [ ] Annonces véhicules sur **Le Bon Coin** / **La Centrale** avec lien vers les fiches détail
- [ ] Inscriptions cohérentes : **Pages Jaunes**, **Yelp**, **Vivastreet** (NAP identique partout)
- [ ] Demander à 3-5 clients récents de laisser un avis Google

## 💡 Améliorations futures (3 mois)

- [ ] **Blog/conseils** : 1 article par mois pour SEO longue traîne
  - "Comment savoir si ma voiture peut passer à l'E85 ?"
  - "Symptômes d'une boîte DSG fatiguée"
  - "Reprogrammation moteur : Stage 1 vs Stage 2, ce qui change vraiment"
  - "Diagnostic électronique : pourquoi votre garage ne trouve pas la panne"
- [ ] **Avant/après photos** : reprogrammation (courbes banc), carrosserie
- [ ] **Page "L'équipe"** avec photo et bio du gérant + mécanos
- [ ] **Avis Google live embed** (widget Trustindex / Elfsight)
- [ ] **Newsletter** mensuelle pour les clients existants

## 🎨 Polish design (optionnel)

- [ ] Photo réelle de l'atelier en hero (priorité 1)
- [ ] Vidéo background sur le hero (atelier en activité — boucle 8-12s)
- [ ] Carrousel photo dans la section atelier
- [ ] Animation GSAP plus poussée sur la transition "Spécialiste allemand"
- [ ] Cursor custom (gros tracker vert qui suit la souris) — discutable, ça peut ressembler à un site agence
