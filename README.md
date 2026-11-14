# Comparator bancar România – site SEO gata de publicat

Site static (HTML pre-randat, fără framework), rapid și indexabil de Google. Datele vin din `src/data.js`, iar `node build.js` generează toate paginile în `dist/`.

## Paginile și căutările pe care le țintesc

| Pagină | Căutări vizate (exemple) |
|---|---|
| `/` | comparator credite, comparator bancar |
| `/comparator-credite-nevoi-personale` | comparator credite nevoi personale, cel mai ieftin credit de nevoi personale, DAE credit nevoi personale |
| `/refinantare-credit-nevoi-personale` | refinanțare credit nevoi personale, credit mai ieftin decât cel actual, calculator refinanțare |
| `/credit-nevoi-personale-usor-de-obtinut` | credit nevoi personale ușor de obținut, credit online, credit cu venit mic, aprobare rapidă |
| `/credite-ipotecare` | credit ipotecar dobândă fixă, comparație credite ipotecare |
| `/carduri-de-credit` | card de credit cashback, cel mai bun card de credit |
| `/carduri-de-debit` | card de debit fără comision |
| `/carduri-cu-acces-lounge` | card acces lounge aeroport |
| `/calculator-rata-credit` | calculator rată credit |
| `/despre-si-metodologie`, `/politica-de-confidentialitate`, `/termeni-si-conditii` | încredere (E-E-A-T) și cerințele AdSense |

Fiecare pagină are: titlu și meta description unice, URL canonic, Open Graph, un singur H1, breadcrumbs, date structurate schema.org (WebPage, BreadcrumbList, FAQPage, ItemList cu LoanOrCredit/MortgageLoan, WebSite, Organization), conținut și tabele vizibile direct în HTML (nu doar prin JavaScript), link-uri interne între pagini, `sitemap.xml` și `robots.txt`.

## 1. Configurare – `config.json`

- `siteUrl`: domeniul tău final, de exemplu `https://www.dobanda.ro`
- `siteName`: numele site-ului
- `operator`: firma sau persoana care operează site-ul (apare în Despre și în Politica de confidențialitate)
- `adsense.client`: ID-ul de editor AdSense, `ca-pub-XXXXXXXXXXXXXXXX`
- `adsense.slots.top | inlist | bottom`: ID-urile unităților de anunțuri create în AdSense
- `ga4MeasurementId` (opțional): `G-XXXXXXX`
- `googleSiteVerification` (opțional): codul din Google Search Console

Cât timp `adsense.client` e gol, reclamele nu apar deloc. Când îl completezi, codul AdSense intră automat pe toate paginile, iar `ads.txt` se generează singur.

## 2. Generare

```
node build.js            # producție → dist/
node build.js --preview  # previzualizare → preview/ (noindex, machete pentru reclame)
```

## 3. Publicare (Netlify)

Setările de build sunt în `netlify.toml` (comanda `node build.js`, folderul `dist`). Netlify servește automat `pagina.html` la adresa `/pagina` și folosește `404.html`. Domeniul principal este `https://alegebanca.ro`; `www` redirecționează spre el.

## 4. Google Search Console

1. Adaugi domeniul în Search Console și pui codul de verificare în `config.json`.
2. Trimiți `https://domeniul-tau/sitemap.xml`.
3. Ceri indexarea pentru paginile principale.

## 5. Google AdSense

1. Aplici la AdSense cu domeniul tău (site-ul trebuie să fie public, pe domeniul tău, cu paginile de confidențialitate și despre).
2. După aprobare, completezi `adsense.client` și creezi 3 unități de anunțuri responsive (top, inlist, bottom).
3. **Obligatoriu în UE:** pentru reclame personalizate, Google cere o platformă de consimțământ certificată (CMP) cu IAB TCF. Cea mai simplă variantă: în AdSense → Confidențialitate și mesaje → Reglementări europene, activezi mesajul GDPR al Google. Nu e nevoie de cod în plus.
4. Opțional, poți porni și „Auto ads” din AdSense, care plasează anunțuri și în alte locuri.

## 6. Alte surse de venit

- **Afiliere:** în `src/data.js`, adaugă `affiliateUrl` la orice ofertă sau card. Butonul devine „Aplică la …”, primește `rel="sponsored nofollow"` și eticheta „link partener”. În România, programele de afiliere bancare apar de obicei în rețele precum 2Performant sau Profitshare.
- **Atenție juridică:** dacă ajungi să colectezi cereri de credit (lead-uri) sau să fii plătit per credit acordat, activitatea poate intra sub regulile de intermediere de credite. Verifică cu un jurist înainte.

## 7. Actualizarea automată a datelor

Task-ul programat de dimineața și de seara actualizează `data.js`. După publicarea pe GitHub, task-ul poate face commit în repository, iar Cloudflare Pages sau Netlify reconstruiesc automat site-ul.
