# 📝 ViasTech — Workflow "post Instagram → article blog"

L'objectif : à chaque post Instagram/Facebook, générer un article blog optimisé SEO, avec contenu enrichi qui apporte de la valeur au-delà du post.

## Pourquoi ?

Un post Insta vit 24-48 h dans le feed, puis disparaît. Un article blog est **indexé par Google pendant des années**. Et chaque article :
- ramène du trafic organique sur des recherches longue traîne (« E85 BMW 320i Vias », « FRM BMW 318d réparation EEPROM »)
- nourrit la confiance (le visiteur voit qu'on sait de quoi on parle)
- alimente la newsletter / les réseaux (réutilisable comme matière)

## Le brief en 5 points

Quand un post sort sur Insta, copie ces 5 infos dans un message à Claude :

```
1. POST URL (ou texte du post)
2. PHOTOS / VIDÉOS (chemins ou URL)
3. CAS / MODÈLE (ex: "Porsche Cayman S 3.4 - kit accessoire + pompe à eau")
4. ANGLE (ex: "entretien préventif", "diagnostic complexe", "témoignage", "guide")
5. CTA (ex: "diagnostic à l'atelier", "demande devis E85", "essai véhicule")
```

Claude s'occupe du reste :
- Trouve l'angle qui maximise le SEO (mots-clés Google, intent search)
- Rédige 800-1500 mots structurés avec H2/H3
- Optimise les images (WebP, posters vidéo)
- Ajoute schema.org BlogPosting
- Met à jour `/blog/index.html` et `sitemap.xml`
- Commit + push sur Git → déploiement auto Vercel

## Structure type d'un article

```
1. TL;DR — résumé en 2 phrases
2. Le contexte (1 paragraphe court — symptôme/situation/besoin)
3. Pourquoi c'est arrivé / ce qui se cache derrière (technique vulgarisé)
4. La méthode (étapes numérotées 1, 2, 3, 4)
5. Le résultat / les chiffres (ce qui s'est passé concrètement)
6. À retenir / pour vous (conseils + CTA)
```

## Catégories possibles

| Tag | Quand l'utiliser | Exemple |
|---|---|---|
| **Étude de cas** | Intervention spécifique racontée | "Conversion E85 Ford Ranger Raptor" |
| **Diagnostic** | Méthode de diagnostic complexe | "BMW 318d — boîtier FRM" |
| **Entretien** | Préconisation / préventif | "Porsche Cayman S — kit accessoire" |
| **Guide** | Vue d'ensemble pédagogique | "E85 — qui est éligible ?" |
| **Témoignage** | Retour client mis en valeur | "BMW X5 — 825 km" |
| **Méthode / Édito** | Manifesto / approche atelier | "Pourquoi chaque détail compte" |
| **Occasion** | Présentation détaillée d'un véhicule à vendre | "Audi A4 Allroad 3.0 TDI" |
| **Atelier / Vidéo** | Showcase / coulisses | "Coulisses du garage" |

## Mots-clés à viser (SEO local Hérault)

Toujours intégrer naturellement :
- Le **modèle exact** (avec motorisation : "BMW 318d Touring", "Porsche Cayman S 3.4 295 ch")
- La **localisation** : "Vias", "Hérault", "Béziers", "Agde", "Sète" (selon contexte)
- Le **service métier** : "diagnostic", "boîte DSG", "conversion E85", "reprogrammation"
- Le **codename technique** quand pertinent : "FRM", "M97", "DKG", "S-tronic", "ZF 8HP"

## Structure des fichiers

```
site/
├── blog/
│   ├── index.html                    # Liste des articles
│   └── <slug>/
│       └── index.html                # Article
├── assets/
│   ├── img/
│   │   └── video-posters/<slug>-poster.webp
│   └── video/<slug>.mp4 + .webm
└── sitemap.xml                       # ← à mettre à jour
```

## Tâches automatisées par Claude

À chaque nouvel article :
1. ✅ Génère le HTML article complet (avec nav, footer, OG tags, schema.org)
2. ✅ Convertit la vidéo en MP4 (H.264) + WebM (VP9) en 720x1280
3. ✅ Génère le poster WebP
4. ✅ Ajoute la card sur `/blog/index.html` (en première position)
5. ✅ Met à jour `sitemap.xml` avec `<lastmod>`
6. ✅ Crée un commit Git avec message descriptif
7. ✅ Push → déploiement Vercel automatique

## Cadence recommandée

- **1 article toutes les 1-2 semaines** suffit pour faire bouger le SEO
- Idéal : 1 post Insta par semaine = 1 article blog par semaine
- Privilégier la qualité (1 article = 800-1500 mots avec valeur réelle) à la quantité

## Articles d'archive à éviter

❌ Annonce de vente "véhicule X disponible" (préférer la fiche véhicule sur `/vehicules/<slug>/`)
❌ Promo flash "offre du mois" (rapidement périmée)
❌ "Bonne fête nationale" / posts génériques (zéro valeur SEO)

✅ Cas client raconté avec méthode
✅ Guide pédagogique sur un sujet métier
✅ Retour technique sur intervention complexe
✅ Comparaison / décision d'achat (ex: "BMW 320i ou 330i pour rouler à l'E85 ?")

---

**En pratique** : envoie-moi un message du type :

> "Nouveau post Insta : conversion E85 sur Audi RS3, photo + vidéo dans /tmp/audi-rs3.mp4, angle = 'cas RS sportif, performance préservée'"

Et je m'occupe de tout, du fichier HTML à la mise en ligne.
