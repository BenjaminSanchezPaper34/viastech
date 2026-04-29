# ViasTech — Site web

Site statique HTML/CSS/JS, refonte avril 2026 par Paper34 Web Studio.

## Structure

```
site/
├── index.html                 # Page principale
├── 404.html                   # Page d'erreur
├── sitemap.xml                # Indexation SEO
├── robots.txt                 # Crawlers
├── humans.txt                 # Crédits
├── manifest.webmanifest       # PWA
├── _headers                   # Cloudflare/Netlify : sécurité + cache
├── _redirects                 # Redirections anciennes URLs
├── assets/
│   ├── css/style.css          # Design system complet
│   ├── js/main.js             # GSAP + Lenis + IO + lightbox
│   └── img/                   # WebP optimisés
├── vehicules/<slug>/          # 6 pages détail véhicule
├── mentions-legales/
└── politique-de-confidentialite/
```

## Identité visuelle

- **Couleurs** : noir profond `#07090A` + signature vert ViasTech `#7BC142`
- **Typo** : Bricolage Grotesque (display) + Inter (body) + JetBrains Mono (data)
- **Animations** : GSAP + ScrollTrigger pour parallax + IntersectionObserver pour reveals
- **Smooth scroll** : Lenis (optionnel, fallback natif)

## Test local

```bash
cd site
python3 -m http.server 8765
# → http://localhost:8765/
```

## Déploiement

### En cours : Vercel (recommandé pour ce projet)

Le repo est connecté à Vercel — chaque push sur `main` déclenche un déploiement automatique. La config est dans `vercel.json` (headers de sécurité, cache long sur les assets, redirections 301 depuis les anciennes URLs).

Pour brancher le domaine `viastech.fr` :
1. Vercel → Project → Settings → Domains → Add `viastech.fr` et `www.viastech.fr`
2. Vercel donne 2 enregistrements DNS à créer chez le registrar (généralement un A et un CNAME)
3. Le SSL est généré automatiquement par Vercel sous 1–2 minutes

### Alternatives compatibles

Le repo contient aussi :
- **`_headers` / `_redirects`** : Cloudflare Pages, Netlify (lus automatiquement)
- **`.htaccess`** : hébergeur Apache classique (OVH, o2switch, etc.) — upload FTP à la racine

Vercel ignore `_headers`/`_redirects`/`.htaccess` et utilise uniquement `vercel.json`.

## Checklist post-mise en ligne

- [ ] Soumettre `sitemap.xml` à Google Search Console
- [ ] Vérifier la fiche Google Business Profile (URL à jour)
- [ ] Citations cohérentes : Pages Jaunes, Vivastreet, Yelp France
- [ ] Configurer **Plausible Analytics** (RGPD-friendly, ~9€/mois) ou Umami self-hosted
- [ ] Vérifier les redirections 301 depuis les anciennes URLs WordPress
- [ ] Tester l'envoi du formulaire de contact (FormSubmit.co)
- [ ] Lighthouse audit : objectif > 95 sur tous les critères

## À faire avant la prod (données réelles)

Voir [TODO.md](./TODO.md).

## Stack technique

- Pure HTML5 / CSS3 / Vanilla JS (zéro framework, zéro build)
- GSAP 3.12 + ScrollTrigger (CDN)
- Lenis 1.1 smooth scroll (CDN)
- FormSubmit.co pour le formulaire (gratuit, pas de backend nécessaire)
- Schema.org : LocalBusiness, AutoRepair, AutoDealer, Vehicle, FAQPage

## Performance

- Toutes les images en WebP qualité 80 (max 1600px)
- Total site : ~7 Mo
- Hero image preload + fetchpriority high
- Fonts preconnect + font-display:swap
- Scripts en `defer`
- Lazy loading natif sur les véhicules
- Aspect-ratio CSS pour zéro CLS
- `prefers-reduced-motion` respecté
