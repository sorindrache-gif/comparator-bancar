#!/usr/bin/env node
/* Generator site static SEO – Comparator bancar România
   Utilizare:  node build.js            -> producție în ./dist (URL-uri curate, indexabil)
               node build.js --preview  -> previzualizare în ./preview (link-uri .html, noindex, machete reclame) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const PREVIEW = process.argv.includes('--preview');
const ROOT = __dirname, SRC = path.join(ROOT, 'src'), OUT = path.join(ROOT, PREVIEW ? 'preview' : 'dist');
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(SRC, 'data.js'), 'utf8'), ctx);
const D = ctx.window.FIN_DATA;
const SITE = C.siteUrl.replace(/\/$/, '');
const YEAR = new Date(D.updatedAt).getFullYear();

// ---------------- helpers ----------------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pc = v => v == null ? '—' : v.toFixed(2).replace('.', ',') + '%';
const lei = v => v == null ? '—' : v.toLocaleString('ro-RO') + ' lei';
const MON = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
const MS = ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sep.', 'oct.', 'nov.', 'dec.'];
const fd = d => { if (!d) return '—'; const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(d); if (!m) return d; return (m[3] ? (+m[3]) + ' ' : '') + (m[2] ? MS[+m[2] - 1] + ' ' : '') + m[1]; };
const upd = new Date(D.updatedAt);
const updTxt = upd.toLocaleString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' });
const monthYear = MON[upd.getMonth()] + ' ' + YEAR;
const pmt = (rate, n, P) => { const r = rate / 100 / 12; return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; };
const fmt = n => Math.round(n).toLocaleString('ro-RO');
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const PAL = [['#b8a4f4', '#1c1530'], ['#d9cefb', '#1c1530'], ['#c9f2df', '#1c1530'], ['#fff1b8', '#1c1530'], ['#ffd9c7', '#1c1530'], ['#1c1530', '#d9cefb'], ['#6d4fd8', '#ffffff']];
const GRAD = [['#b8a4f4', '#e6dcff'], ['#cdbdfb', '#f6f1ff'], ['#a78bfa', '#d9cefb'], ['#9f8cf0', '#c9f2df'], ['#c4b5fd', '#fff1b8'], ['#b8a4f4', '#ffd9c7']];
const initials = b => b.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = b => { const [bg, fg] = PAL[hash(b) % PAL.length]; return `<span class="av" aria-hidden="true" style="background:${bg};color:${fg}">${esc(initials(b))}</span>`; };
const grad = s => { const g = GRAD[hash(s) % GRAD.length]; return `linear-gradient(135deg,${g[0]},${g[1]})`; };
const incomeLei = s => { if (!s) return null; const m = String(s).replace(/\./g, '').match(/(\d{3,6})\s*lei/); if (m) return +m[1]; if (/EUR/i.test(s)) { const e = String(s).match(/(\d{2,5})/); return e ? +e[1] * 5 : null; } return null; };

// URL helpers
const href = slug => PREVIEW ? (slug === '' ? 'index.html' : slug + '.html') : (slug === '' ? '/' : '/' + slug);
const canon = slug => SITE + (slug === '' ? '/' : '/' + slug);
const asset = p => PREVIEW ? 'assets/' + p : '/assets/' + p;

const logoTxt = () => { const m = /^(.*?)(\.[a-z]{2,})$/i.exec(C.siteName); return m ? `${esc(m[1])}<span style="color:var(--lav-deep)">${esc(m[2])}</span>` : esc(C.siteName); };
// ---------------- ads ----------------
const AD = C.adsense || {}; const adsOn = !!AD.client;
function ad(slot, extraClass = '') {
  const id = (AD.slots || {})[slot];
  if (adsOn && id) return `<div class="ad ${extraClass}" role="complementary" aria-label="Publicitate"><span class="adl">Publicitate</span><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(AD.client)}" data-ad-slot="${esc(id)}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
  if (PREVIEW) return `<div class="ad ph ${extraClass}" aria-hidden="true"><span class="adl">Publicitate</span><div class="box">Spațiu Google AdSense · slot „${slot}”<br>Se activează din config.json</div></div>`;
  return '';
}
const adInList = () => { const a = ad('inlist', 'ad-inlist'); return a ? `<li class="ad-inlist" style="list-style:none">${a}</li>` : ''; };

// ---------------- data prep ----------------
const P = D.personal.map(o => ({ ...o, inc: incomeLei(o.minIncome) }));
const fresh = arr => arr.filter(o => !o.stale);
const bestP = fresh(P).filter(o => o.dae != null).sort((a, b) => a.dae - b.dae);
const bestRate = fresh(P).filter(o => o.rateMin != null).sort((a, b) => a.rateMin - b.rateMin);
const bestM = fresh(D.mortgage).sort((a, b) => a.fixedRate - b.fixedRate);
const lounges = [...D.creditCards.map(c => ({ ...c, kind: 'credit' })), ...D.debitCards.map(c => ({ ...c, kind: 'debit' }))].filter(c => c.benefits.includes('lounge'));
const offersJson = JSON.stringify(P.map(o => ({ bank: o.bank, rateMin: o.rateMin, dae: o.dae, maxAmount: o.maxAmount, maxMonths: o.maxMonths, stale: !!o.stale }))).replace(/</g, '\\u003c');
const ctaLink = o => o.affiliateUrl
  ? `<a class="cta" href="${esc(o.affiliateUrl)}" rel="sponsored nofollow noopener" target="_blank">Aplică la ${esc(o.bank)} ↗</a> <span class="flag sp">link partener</span>`
  : `<a href="${esc(o.url)}" rel="nofollow noopener" target="_blank">Site-ul ${esc(o.bank)} ↗</a>`;
const srcLine = o => `${o.sourceUrl ? `<a href="${esc(o.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(o.source)}</a>` : esc(o.source || '—')} · ${esc(fd(o.sourceDate))}`;

// ---------------- components ----------------
function podium(items, val, sub, label, link) {
  return `<div class="podium">${items.slice(0, 3).map((o, i) => `<div class="pod"><span class="n">0${i + 1} — ${label}</span><span class="b">${esc(o.bank)}</span><span class="s">${esc(o.product)}</span><span class="v">${val(o)}</span><span class="s">${sub(o)}</span></div>`).join('')}</div>`;
}
function personalList(rows, { A = 50000, N = 60, sort = 'dae', withIncomeFirst = false } = {}) {
  const sorted = rows.slice().sort((a, b) => (!!a.stale - !!b.stale) || ((a[sort] ?? 1e9) - (b[sort] ?? 1e9)));
  const bestBank = bestP[0] && bestP[0].bank;
  const items = sorted.map((o, i) => {
    const r = o.rateMin != null && (o.maxAmount == null || o.maxAmount >= A) ? pmt(o.rateMin, N, A) : null;
    const text = (o.bank + ' ' + o.product + ' ' + o.conditions).toLowerCase();
    const col4 = withIncomeFirst
      ? `<div class="m"><div class="k">Venit minim</div><div class="v ${o.inc == null ? 'dim' : ''}" style="font-size:17px">${o.inc == null ? '—' : /EUR/i.test(o.minIncome) ? esc(o.minIncome.replace(/ echivalent.*$/, '')) : fmt(o.inc) + ' lei'}</div></div>`
      : `<div class="m"><div class="k">Sumă max.</div><div class="v ${o.maxAmount == null ? 'dim' : ''}">${o.maxAmount ? (o.maxAmount / 1000).toLocaleString('ro-RO') + 'k' : '—'}</div><div class="x">${o.maxMonths ? o.maxMonths + ' luni' : ''}</div></div>`;
    return `<li data-item data-text="${esc(text)}" data-dae="${o.dae ?? ''}" data-rate-min="${o.rateMin ?? ''}" data-max-amount="${o.maxAmount ?? ''}" data-inc="${o.inc ?? ''}" data-bank="${esc(o.bank)}" data-online="${o.online ? 1 : 0}" data-recent="${o.stale ? 0 : 1}" data-stale="${o.stale ? 1 : 0}">
<details class="offer" data-rate="${o.rateMin ?? ''}" data-max="${o.maxAmount ?? ''}">
<summary><div class="who">${avatar(o.bank)}<div><h3 class="nm">${esc(o.bank)}</h3><div class="pr">${esc(o.product)}</div></div></div>
<div class="m"><div class="k">DAE</div><div class="v ${o.dae == null ? 'dim' : ''}">${pc(o.dae)}</div></div>
<div class="m"><div class="k">Dobândă</div><div class="v ${o.rateMin == null ? 'dim' : ''}">${pc(o.rateMin)}</div>${o.rateMax != null && o.rateMax !== o.rateMin ? `<div class="x">până la ${pc(o.rateMax)}</div>` : ''}</div>
<div class="m"><div class="k">Rată estimată</div><div class="v js-pmt ${r ? '' : 'dim'}">${r ? fmt(r) : '—'}</div><div class="x js-pmtx">${r ? 'lei / lună' : ''}</div></div>
${col4}<span class="plus" aria-hidden="true">+</span></summary>
<div class="det">
<div><div class="k">Etichete</div>${o.bank === bestBank ? '<span class="flag best">cel mai mic DAE</span>' : ''}${o.online ? '<span class="flag">aplicare online</span>' : ''}${o.stale ? '<span class="flag old">de reverificat</span>' : ''}</div>
<div><div class="k">Venit minim</div>${esc(o.minIncome)}</div>
<div><div class="k">Sumă / perioadă maximă</div>${lei(o.maxAmount)}${o.maxMonths ? ' · ' + o.maxMonths + ' luni' : ''}</div>
<div><div class="k">Comisioane</div>${esc(o.fees)}</div>
<div><div class="k">Condiții</div>${esc(o.conditions)}</div>
<div><div class="k">Sursă</div>${srcLine(o)}</div>
<div><div class="k">Aplică</div>${ctaLink(o)}</div>
</div></details></li>`;
  });
  const ins = adInList(); if (ins && items.length > 3) items.splice(4, 0, ins); else if (ins) items.push(ins);
  return items.join('\n');
}
function toolbar(sorts, flags, ph = 'Caută o bancă sau un produs…') {
  return `<div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><span class="sr">Caută</span><input class="js-q" type="search" placeholder="${ph}"></label>${flags.map(([k, l]) => `<button type="button" class="chip" data-flag="${k}" aria-pressed="false">${l}</button>`).join('')}</div>
<div class="toolbar"><span class="lbl">Ordonează:</span>${sorts.map(([k, l], i) => `<button type="button" class="chip" data-sort-key="${k}" aria-pressed="${i === 0}">${l}<i>${i === 0 ? ' ↑' : ''}</i></button>`).join('')}</div>`;
}
function mortgageList(rows) {
  const sorted = rows.slice().sort((a, b) => (!!a.stale - !!b.stale) || a.fixedRate - b.fixedRate);
  const items = sorted.map(o => {
    const green = /verde|clasa A|Eco|Natura/i.test(o.product + o.conditions);
    return `<li data-item data-text="${esc((o.bank + ' ' + o.product + ' ' + o.conditions).toLowerCase())}" data-fixed-rate="${o.fixedRate}" data-fixed-years="${o.fixedYears}" data-dae="${o.dae ?? ''}" data-bank="${esc(o.bank)}" data-green="${green ? 1 : 0}" data-recent="${o.stale ? 0 : 1}" data-stale="${o.stale ? 1 : 0}">
<details class="offer"><summary><div class="who">${avatar(o.bank)}<div><h3 class="nm">${esc(o.bank)}</h3><div class="pr">${esc(o.product)}</div></div></div>
<div class="m"><div class="k">Dobândă fixă</div><div class="v">${pc(o.fixedRate)}</div></div>
<div class="m"><div class="k">Perioadă fixă</div><div class="v">${o.fixedYears} ani</div><div class="bar" aria-hidden="true"><i style="width:${Math.min(100, o.fixedYears / 30 * 100)}%"></i><u></u></div></div>
<div class="m"><div class="k">Apoi</div><div class="v" style="font-size:15px">${esc(o.margin)}</div></div>
<div class="m"><div class="k">DAE</div><div class="v ${o.dae == null ? 'dim' : ''}">${pc(o.dae)}</div></div><span class="plus" aria-hidden="true">+</span></summary>
<div class="det"><div><div class="k">Etichete</div>${green ? '<span class="flag best">credit verde</span>' : ''}${o.stale ? '<span class="flag old">de reverificat</span>' : ''}</div>
<div><div class="k">Avans</div>${esc(o.downPayment)}</div><div><div class="k">Condiții</div>${esc(o.conditions)}</div>
<div><div class="k">Sursă</div>${srcLine(o)}</div><div><div class="k">Aplică</div>${ctaLink(o)}</div></div></details></li>`;
  });
  const ins = adInList(); if (ins) items.splice(Math.min(4, items.length), 0, ins);
  return items.join('\n');
}
const BEN = { lounge: '✈ Lounge', cashback: '↺ Cashback', asigurare: '⛨ Asigurare', mile: '⟡ Mile', puncte: '★ Puncte', rate: '▦ Rate 0%', valuta: '€ Valută', virtual: '▢ Virtual', concierge: '◆ Concierge' };
function cardList(list, kind) {
  return list.slice().sort((a, b) => ((a.dae ?? 99) - (b.dae ?? 99)) || b.benefits.length - a.benefits.length).map(c => {
    const k = c.kind || kind;
    return `<li class="cc" data-item data-text="${esc((c.bank + ' ' + c.product + ' ' + c.perks).toLowerCase())}" data-bens="${c.benefits.join(' ')}" data-dae="${c.dae ?? ''}" data-bank="${esc(c.bank)}">
<div class="plastic" style="background:${grad(c.bank + c.product)}"><div class="tp"><span class="pb">${esc(c.bank.replace(/\s*\(.*\)/, ''))}</span><span class="kind">${k}</span></div><span class="chipi" aria-hidden="true"></span><h3>${esc(c.product)}</h3></div>
<div class="bens">${c.benefits.map(b => `<span class="ben ${b}">${BEN[b] || b}</span>`).join('')}</div>
<p>${esc(c.perks)}</p>
<dl class="kv">${k === 'credit' ? `<dt>DAE</dt><dd><b>${pc(c.dae)}</b></dd><dt>Grație</dt><dd>${c.grace ? 'până la ' + c.grace + ' zile' : '—'}</dd><dt>Limită</dt><dd>${lei(c.maxLimit)}</dd><dt>Rate</dt><dd>${esc(c.installments)}</dd><dt>Costuri</dt><dd>${esc(c.fees)}</dd>` : `<dt>Costuri</dt><dd>${esc(c.fee)}</dd><dt>ATM</dt><dd>${esc(c.atm)}</dd>`}</dl>
<div class="cfoot"><span>${esc(c.source)} · ${esc(fd(c.sourceDate))}</span>${c.affiliateUrl ? `<a href="${esc(c.affiliateUrl)}" rel="sponsored nofollow noopener" target="_blank">Aplică ↗</a>` : `<a href="${esc(c.url)}" rel="nofollow noopener" target="_blank">Detalii ↗</a>`}</div></li>`;
  }).join('\n');
}
function benChips(list) { return `<div class="toolbar"><span class="lbl">Vreau:</span>${[...new Set(list.flatMap(c => c.benefits))].map(b => `<button type="button" class="chip" data-ben="${b}" aria-pressed="false">${BEN[b] || b}</button>`).join('')}</div>`; }
function faqBlock(faq) { return `<div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}</div>`; }
const stripTags = s => s.replace(/<[^>]+>/g, '');
function simWidget(A = 50000, N = 60) {
  return `<div class="sim" id="sim"><h2><span>Cât te costă un credit?</span><span class="flag">simulator</span></h2>
<label class="field"><span>Suma de care ai nevoie</span><output id="oAmt">${fmt(A)} lei</output><input type="range" id="sAmt" min="5000" max="250000" step="5000" value="${A}" aria-label="Suma"></label>
<label class="field"><span>Perioada</span><output id="oMon">${N} luni</output><input type="range" id="sMon" min="12" max="120" step="6" value="${N}" aria-label="Perioada"></label>
<div class="res"><div><div class="k">Cea mai mică rată estimată</div><div class="big" id="rBig">${bestRate[0] ? fmt(pmt(bestRate[0].rateMin, N, A)) + ' lei/lună' : '—'}</div></div><span class="pill" id="rDae">${bestRate[0] ? 'DAE ' + pc(bestRate[0].dae) : ''}</span><div class="who" id="rWho">${bestRate[0] ? esc(bestRate[0].bank) + ' · dobândă de la ' + pc(bestRate[0].rateMin) : ''}</div></div>
<small>Estimare cu dobânda minimă publicată de fiecare bancă, fără comisioane și asigurări. Oferta finală depinde de profilul tău.</small></div>`;
}
function related(cur) {
  return `<section class="block wrap" aria-labelledby="rel-h"><h2 id="rel-h">Te mai poate interesa</h2><div class="related">${PAGES.filter(p => p.nav && p.slug !== cur).map(p => `<a href="${href(p.slug)}"><b>${esc(p.navLong || p.navLabel)}</b><span>${esc(p.blurb)}</span></a>`).join('')}</div></section>`;
}

// ---------------- page shell ----------------
function shell(p, body) {
  const url = canon(p.slug);
  const crumbs = p.slug === '' ? [] : [['Acasă', ''], [p.crumb || p.navLabel || p.h1Plain, p.slug]];
  const ld = [];
  ld.push({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': url + '#webpage', url, name: p.title, description: p.desc, inLanguage: 'ro-RO', dateModified: D.updatedAt, isPartOf: { '@id': SITE + '/#website' }, publisher: { '@id': SITE + '/#org' } });
  if (p.slug === '') {
    ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: C.siteName, inLanguage: 'ro-RO', publisher: { '@id': SITE + '/#org' } });
    ld.push({ '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE + '/#org', name: C.siteName, url: SITE + '/', email: C.operator.email, logo: SITE + '/assets/favicon.svg' });
  }
  if (crumbs.length) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([n, s], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: canon(s) })) });
  if (p.faq) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } })) });
  if (p.itemList) ld.push({ '@context': 'https://schema.org', '@type': 'ItemList', name: p.h1Plain, numberOfItems: p.itemList.length, itemListElement: p.itemList.map((o, i) => ({ '@type': 'ListItem', position: i + 1, item: o })) });
  const robots = PREVIEW || p.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large';
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ro-RO" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="ro_RO"><meta property="og:site_name" content="${esc(C.siteName)}">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}${C.ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#b8a4f4">
${C.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(C.googleSiteVerification)}">` : ''}
<link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Serif:ital@1&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${asset('style.css')}">
${adsOn ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(AD.client)}" crossorigin="anonymous"></script>` : ''}
${C.ga4MeasurementId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(C.ga4MeasurementId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(C.ga4MeasurementId)}');</script>` : ''}
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Sari la conținut</a>
<header class="top"><div class="wrap">
<a class="logo" href="${href('')}" aria-label="${esc(C.siteName)} – acasă"><i aria-hidden="true">%</i>${logoTxt()}</a>
<nav class="nav" aria-label="Principal">${PAGES.filter(x => x.top).map(x => `<a href="${href(x.slug)}"${x.slug === p.slug ? ' aria-current="page"' : ''}>${esc(x.navLabel)}</a>`).join('')}</nav>
</div></header>
${crumbs.length ? `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${crumbs.map(([n, s], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${href(s)}">${esc(n)}</a></li>`).join('')}</ol></nav>` : ''}
<main id="main">
${body}
</main>
<footer><div class="wrap">
<div class="fcols">
<div><a class="logo" href="${href('')}"><i aria-hidden="true">%</i>${logoTxt()}</a><p>${esc(C.siteTagline)}. Date actualizate automat de două ori pe zi. Ultima actualizare: ${esc(updTxt)}.</p></div>
<div><h2>Credite</h2><ul>${['comparator-credite-nevoi-personale', 'refinantare-credit-nevoi-personale', 'credit-nevoi-personale-usor-de-obtinut', 'calculator-rata-credit', 'credite-ipotecare'].map(s => PAGES.find(x => x.slug === s)).map(x => `<li><a href="${href(x.slug)}">${esc(x.navLong || x.navLabel)}</a></li>`).join('')}</ul></div>
<div><h2>Carduri</h2><ul>${['carduri-de-credit', 'carduri-de-debit', 'carduri-cu-acces-lounge'].map(s => PAGES.find(x => x.slug === s)).map(x => `<li><a href="${href(x.slug)}">${esc(x.navLong || x.navLabel)}</a></li>`).join('')}</ul></div>
<div><h2>Despre</h2><ul>${['despre-si-metodologie', 'politica-de-confidentialitate', 'termeni-si-conditii'].map(s => PAGES.find(x => x.slug === s)).map(x => `<li><a href="${href(x.slug)}">${esc(x.navLong || x.navLabel)}</a></li>`).join('')}</ul></div>
</div>
<p class="disc">Informațiile au caracter informativ și provin din surse publice (site-urile băncilor și presa financiară). Nu reprezintă o ofertă fermă, consultanță financiară sau intermediere de credite. Dobânda și DAE pe care le primești depind de analiza băncii. Verifică întotdeauna oferta finală și formularul de informații precontractuale înainte să semnezi. Site-ul poate afișa reclame și link-uri de afiliere marcate ca atare.</p>
</div></footer>
<script src="${asset('app.js')}" defer></script>
</body>
</html>`;
}

// ---------------- pages ----------------
const top1 = bestP[0], top2 = bestP[1], top3 = bestP[2];
const PAGES = [
  {
    slug: '', top: false, nav: false, navLabel: 'Acasă',
    title: `Comparator credite de nevoi personale, ipotecare și carduri`,
    desc: `Compară DAE la credite de nevoi personale, dobânzile fixe la ipotecare și beneficiile cardurilor de la toate băncile din România. Actualizat de 2 ori pe zi.`,
    h1Plain: 'Comparator bancar România',
    body: p => `<section class="hero"><div class="wrap grid2"><div>
<span class="tag"><b>RO</b> Toate băncile · actualizat de 2 ori pe zi</span>
<h1>Credite și carduri, comparate.<br><em class="it">Alege mai ieftin.</em></h1>
<p class="lead">Compari creditele de nevoi personale, creditele ipotecare și cardurile băncilor din România după costul total real (DAE), nu după reclamă.</p>
<div class="btns"><a class="btn pri" href="${href('comparator-credite-nevoi-personale')}">Compară creditele →</a><a class="btn ghost" href="${href('refinantare-credit-nevoi-personale')}">Refinanțează mai ieftin</a></div>
<div class="stamp">Ultima actualizare: ${esc(updTxt)}</div></div>
${simWidget()}</div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap"><div class="sec-head"><div><span class="tag"><b>01</b> Credite de nevoi personale</span><h2>Cele mai mici costuri <em class="it">acum</em></h2></div><a class="chip" href="${href('comparator-credite-nevoi-personale')}">Vezi toate cele ${P.length} oferte →</a></div>
${podium(bestP, o => pc(o.dae).replace('%', '<small>% DAE</small>'), o => 'dobândă de la ' + pc(o.rateMin) + ' · max. ' + lei(o.maxAmount), 'DAE')}</section>
<section class="block wrap"><h2>Ce cauți?</h2><div class="related">
<a href="${href('refinantare-credit-nevoi-personale')}"><b>Un credit mai bun decât cel actual</b><span>Calculează cât economisești dacă îți refinanțezi creditul.</span></a>
<a href="${href('credit-nevoi-personale-usor-de-obtinut')}"><b>Un credit ușor de obținut</b><span>Aplicare online, venit minim mic, cele mai bune condiții.</span></a>
<a href="${href('comparator-credite-nevoi-personale')}"><b>Să compar toate creditele</b><span>DAE, dobândă, sumă maximă și rată estimată, la toate băncile.</span></a>
<a href="${href('credite-ipotecare')}"><b>Un credit ipotecar</b><span>Dobânzi fixe pe 3, 5 sau 10 ani, marjă și avans.</span></a>
<a href="${href('carduri-de-credit')}"><b>Un card de credit</b><span>Cashback, rate fără dobândă, perioadă de grație.</span></a>
<a href="${href('carduri-cu-acces-lounge')}"><b>Un card cu acces în lounge</b><span>Credit și debit, cu intrări gratuite în aeroport.</span></a>
</div></section>
<section class="block wrap"><div class="sec-head"><div><span class="tag"><b>02</b> Credite ipotecare</span><h2>Cele mai mici dobânzi <em class="it">fixe</em></h2></div><a class="chip" href="${href('credite-ipotecare')}">Toate ipotecarele →</a></div>
${podium(bestM, o => pc(o.fixedRate).replace('%', '<small>% fix</small>'), o => o.fixedYears + ' ani fix, apoi ' + esc(o.margin), 'Dobândă fixă')}</section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>`,
    faq: [
      ['Care este cel mai ieftin credit de nevoi personale acum?', top1 ? `După DAE, pe primele locuri sunt ${esc(top1.bank)} (${pc(top1.dae)}), ${esc(top2.bank)} (${pc(top2.dae)}) și ${esc(top3.bank)} (${pc(top3.dae)}), în scenariul standard de 50.000 lei pe 60 de luni. Clasamentul se actualizează de două ori pe zi.` : 'Vezi comparatorul de credite.'],
      ['Ce este DAE?', 'DAE (dobânda anuală efectivă) este costul total anual al creditului: dobânda plus comisioanele și asigurările obligatorii. Este singurul indicator corect pentru a compara oferte de la bănci diferite.'],
      ['Cât de des se actualizează datele?', 'Ofertele sunt verificate automat de două ori pe zi, dimineața și seara, din paginile publice ale băncilor și din presa financiară. Fiecare ofertă afișează sursa și data ei.'],
      ['Site-ul acordă credite?', 'Nu. Site-ul compară ofertele publice ale băncilor. Cererea de credit o faci direct la bancă.']
    ]
  },
  {
    slug: 'comparator-credite-nevoi-personale', top: true, nav: true, navLabel: 'Nevoi personale', navLong: 'Comparator credite de nevoi personale', crumb: 'Comparator credite de nevoi personale',
    blurb: 'Toate ofertele, ordonate după DAE.',
    title: `Comparator credite nevoi personale ${YEAR} – DAE la toate băncile`,
    desc: `Compară creditele de nevoi personale de la ${P.length} bănci: DAE, dobândă, sumă maximă, venit minim și rată. Cel mai mic DAE acum: ${top1 ? pc(top1.dae) + ' la ' + top1.bank : '-'}.`,
    h1Plain: 'Comparator credite de nevoi personale',
    itemList: bestP.map(o => ({ '@type': 'LoanOrCredit', name: o.bank + ' – ' + o.product, provider: { '@type': 'BankOrCreditUnion', name: o.bank }, currency: 'RON', annualPercentageRate: o.dae, interestRate: o.rateMin, amount: o.maxAmount ? { '@type': 'MonetaryAmount', maxValue: o.maxAmount, currency: 'RON' } : undefined, url: o.url })),
    body: p => `<section class="hero"><div class="wrap grid2"><div>
<span class="tag"><b>01</b> Credite de nevoi personale · ${monthYear}</span>
<h1>Comparator credite de nevoi personale: <em class="it">cine îți dă banii cel mai ieftin</em></h1>
<p class="lead">Toate ofertele de credite de nevoi personale de la băncile din România, ordonate după DAE. Mută sumele în simulator și vezi rata lunară estimată la fiecare bancă.</p>
<div class="stamp">Actualizat: ${esc(updTxt)} · ${P.length} instituții</div></div>
${simWidget()}</div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap" data-list data-sort="dae"><div class="sec-head"><h2>Top 3 după DAE</h2><span class="note">Scenariu: <span class="js-scen">50.000 lei / 60 luni</span></span></div>
${podium(bestP, o => pc(o.dae).replace('%', '<small>% DAE</small>'), o => 'dobândă de la ' + pc(o.rateMin) + ' · max. ' + lei(o.maxAmount), 'DAE')}
<h2>Toate ofertele</h2>
${toolbar([['dae', 'DAE'], ['rateMin', 'Dobândă'], ['maxAmount', 'Sumă maximă'], ['bank', 'A–Z']], [['online', 'Aplicare online'], ['recent', 'Doar date recente']])}
<ul class="rows">${personalList(P)}</ul><p class="js-empty" hidden>Nicio ofertă nu se potrivește filtrelor.</p></section>
<section class="block wrap prose"><h2>Cum alegi cel mai bun credit de nevoi personale</h2>
<p>Compară ofertele la aceeași sumă și pe aceeași perioadă, apoi uită-te în ordinea asta: <b>DAE</b>, <b>totalul de plată</b>, <b>comisioanele</b> (analiză dosar, administrare lunară) și <b>condițiile</b> pentru dobânda minimă afișată.</p>
<ul><li><b>Dobânda fixă</b> îți păstrează rata neschimbată până la final. Cea variabilă (IRCC + marjă) se poate modifica trimestrial.</li>
<li><b>Dobânda minimă</b> e aproape întotdeauna condiționată: salariul virat la bancă, o asigurare de viață sau un istoric bun la Biroul de Credit.</li>
<li><b>Suma maximă</b> diferă mult: unele bănci dau până la 250.000 lei, altele se opresc la 90.000 lei.</li></ul>
<div class="callout">Cifrele din clasamentele de presă sunt calculate de obicei pentru 50.000 lei pe 60 de luni, cu venitul încasat la banca respectivă. Oferta ta poate fi diferită.</div></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>
${related(p.slug)}`,
    faq: [
      ['Care bancă are cel mai mic DAE la creditul de nevoi personale?', top1 ? `În acest moment, ${esc(top1.bank)} are cel mai mic DAE din comparator (${pc(top1.dae)}), urmată de ${esc(top2.bank)} (${pc(top2.dae)}) și ${esc(top3.bank)} (${pc(top3.dae)}).` : '—'],
      ['Care este suma maximă pentru un credit de nevoi personale?', 'Fără ipotecă, băncile acordă de regulă până la 200.000–250.000 lei, pe maximum 5 ani. Suma reală depinde de venit și de gradul de îndatorare.'],
      ['Pot obține credit de nevoi personale 100% online?', 'Da. Majoritatea băncilor mari permit aplicarea din aplicația mobilă, cu identificare video, iar banii pot ajunge în cont în aceeași zi.'],
      ['Ce diferență este între dobândă și DAE?', 'Dobânda e doar prețul banilor împrumutați. DAE include și comisioanele și asigurările obligatorii, deci arată costul real. Compară întotdeauna după DAE.']
    ]
  },
  {
    slug: 'refinantare-credit-nevoi-personale', top: true, nav: true, navLabel: 'Refinanțare', navLong: 'Refinanțare credit de nevoi personale', crumb: 'Refinanțare credit de nevoi personale',
    blurb: 'Calculează cât economisești cu un credit mai ieftin.',
    title: `Refinanțare credit de nevoi personale – calculator economie`,
    desc: `Ai deja un credit de nevoi personale? Calculează rata nouă și cât economisești dacă refinanțezi la banca cu cea mai mică dobândă acum.`,
    h1Plain: 'Refinanțare credit de nevoi personale',
    body: p => `<section class="hero"><div class="wrap grid2"><div>
<span class="tag"><b>↻</b> Refinanțare · ${monthYear}</span>
<h1>Ai deja un credit? <em class="it">Plătește mai puțin pe el.</em></h1>
<p class="lead">Introdu soldul rămas, dobânda actuală și câte luni mai ai de plătit. Calculatorul compară rata ta cu cea mai mică rată disponibilă acum și scade comisionul de rambursare anticipată.</p>
<div class="stamp">Oferte actualizate: ${esc(updTxt)}</div></div>
<div class="sim" id="refi"><h2><span>Calculator refinanțare</span><span class="flag">gratuit</span></h2>
<div class="two"><label class="field"><span>Sold rămas (lei)</span><input type="number" id="rSold" value="40000" min="1000" step="1000"></label>
<label class="field"><span>Dobânda actuală (%)</span><input type="number" id="rRate" value="12.5" min="0" step="0.1"></label>
<label class="field"><span>Luni rămase</span><input type="number" id="rMon" value="48" min="6" max="120" step="1"></label>
<label class="field"><span>Comision rambursare (%)</span><input type="number" id="rFee" value="1" min="0" max="5" step="0.5"></label></div>
<label class="field"><span>Alte costuri ale noului credit (lei)</span><input type="number" id="rCost" value="200" min="0" step="50"></label>
<div class="res"><div><div class="k">Rata ta acum → rata nouă</div><div class="big"><span id="fNow">—</span> → <span id="fNew">—</span></div></div><div style="text-align:right"><div class="k">Economie totală</div><div class="big" id="fSave" style="font-size:28px">—</div></div><div class="who" id="fWho" style="font-weight:500;font-size:14px"></div></div>
<small>Rata nouă folosește dobânda minimă publicată de bancă. Aceasta se obține de regulă cu salariul virat la bancă și cu un profil bun. Cere oferta personalizată înainte să decizi.</small></div></div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap"><h2>Refinanțarea în 4 pași</h2><ol class="steps">
<li><b>Află soldul exact</b>Cere de la banca actuală soldul de rambursare și comisionul de rambursare anticipată.</li>
<li><b>Compară DAE</b>Folosește calculatorul și tabelul de mai jos. Contează DAE și totalul de plată, nu doar rata.</li>
<li><b>Cere oferta fermă</b>Aplică la banca aleasă. Multe permit aplicare online și îți dau răspunsul în aceeași zi.</li>
<li><b>Închide creditul vechi</b>Noua bancă plătește direct creditul vechi. Cere adeverința de închidere.</li></ol></section>
<section class="block wrap" data-list data-sort="rateMin"><div class="sec-head"><h2>Băncile cu cele mai mici dobânzi pentru refinanțare</h2><span class="note">Rată estimată pentru <span class="js-scen">50.000 lei / 60 luni</span></span></div>
${toolbar([['rateMin', 'Dobândă'], ['dae', 'DAE'], ['maxAmount', 'Sumă maximă'], ['bank', 'A–Z']], [['online', 'Aplicare online'], ['recent', 'Doar date recente']])}
<ul class="rows">${personalList(P, { sort: 'rateMin' })}</ul><p class="js-empty" hidden>Nicio ofertă nu se potrivește filtrelor.</p></section>
<section class="block wrap prose"><h2>Când merită să refinanțezi?</h2>
<p>Refinanțarea merită de obicei când diferența de dobândă e de cel puțin 2–3 puncte procentuale și mai ai cel puțin 2 ani de plătit. Cu cât soldul e mai mare și perioada rămasă mai lungă, cu atât economia e mai mare.</p>
<ul><li><b>Comisionul de rambursare anticipată:</b> la creditele de consum cu dobândă fixă, banca poate percepe cel mult 1% din suma rambursată dacă mai sunt peste 12 luni până la final, respectiv 0,5% dacă sunt mai puțin (OUG 50/2010). La dobânda variabilă nu se percepe.</li>
<li><b>Comasare:</b> poți strânge mai multe credite și carduri de credit într-un singur credit, cu o singură rată.</li>
<li><b>Atenție la perioadă:</b> dacă lungești perioada, rata scade, dar totalul plătit poate crește. Compară totalul de plată.</li></ul></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente despre refinanțare</h2>${faqBlock(p.faq)}</section>
${related(p.slug)}`,
    faq: [
      ['Când merită să refinanțez un credit de nevoi personale?', 'Când noua dobândă e semnificativ mai mică (de regulă cu 2–3 puncte procentuale) și mai ai cel puțin doi ani de plătit. Calculatorul de pe pagină scade comisionul de rambursare anticipată și costurile noului credit, ca să vezi economia reală.'],
      ['Cât costă rambursarea anticipată a creditului vechi?', 'La creditele de consum cu dobândă fixă, comisionul e de cel mult 1% din suma rambursată anticipat, sau 0,5% dacă mai sunt sub 12 luni până la final. La creditele cu dobândă variabilă nu se plătește comision.'],
      ['Pot refinanța un credit de la aceeași bancă?', 'Unele bănci acceptă refinanțarea propriilor credite sau îți pot reduce dobânda la cerere. Merită să ceri întâi o ofertă băncii actuale, având o ofertă concurentă în mână.'],
      ['Pot comasa mai multe credite într-unul singur?', 'Da. Majoritatea băncilor permit refinanțarea mai multor credite și carduri de credit într-un singur credit de nevoi personale, cu o singură rată lunară.'],
      ['Ce bancă are cea mai mică dobândă la refinanțare acum?', bestRate[0] ? `Cea mai mică dobândă publicată acum în comparator este la ${esc(bestRate[0].bank)} (de la ${pc(bestRate[0].rateMin)}). Dobânda minimă e condiționată de profilul tău.` : '—']
    ]
  },
  {
    slug: 'credit-nevoi-personale-usor-de-obtinut', top: true, nav: true, navLabel: 'Credit rapid', navLong: 'Credit de nevoi personale ușor de obținut', crumb: 'Credit ușor de obținut',
    blurb: 'Aplicare online, venit minim mic, aprobare rapidă.',
    title: `Credit de nevoi personale ușor de obținut, online (${YEAR})`,
    desc: `Băncile care dau credit de nevoi personale cel mai ușor: aplicare 100% online, venit minim de la ${fmt(Math.min(...P.filter(o => o.inc).map(o => o.inc)))} lei, răspuns rapid. Comparate după DAE și venit minim.`,
    h1Plain: 'Credit de nevoi personale ușor de obținut',
    body: p => {
      const easy = P.filter(o => o.online);
      return `<section class="hero"><div class="wrap grid2"><div>
<span class="tag"><b>⚡</b> Aprobare rapidă · ${monthYear}</span>
<h1>Credit de nevoi personale <em class="it">ușor de obținut</em>, la cel mai bun cost</h1>
<p class="lead">Băncile care acceptă aplicare 100% online, cu venit minim mic și răspuns rapid. Le-am ordonat după venitul minim cerut, ca să vezi rapid unde te încadrezi, și îți arătăm DAE ca să nu plătești mai mult decât trebuie.</p>
<div class="stamp">Actualizat: ${esc(updTxt)}</div></div>${simWidget(20000, 36)}</div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap" data-list data-sort="inc"><div class="sec-head"><h2>Credite cu aplicare online, după venitul minim</h2><span class="note">Rată estimată pentru <span class="js-scen">20.000 lei / 36 luni</span></span></div>
${toolbar([['inc', 'Venit minim'], ['dae', 'DAE'], ['rateMin', 'Dobândă'], ['bank', 'A–Z']], [['recent', 'Doar date recente']])}
<ul class="rows">${personalList(easy, { A: 20000, N: 36, sort: 'inc', withIncomeFirst: true })}</ul><p class="js-empty" hidden>Nicio ofertă nu se potrivește filtrelor.</p></section>
<section class="block wrap"><h2>Cum îți crești șansele de aprobare</h2><ol class="steps">
<li><b>Verifică Biroul de Credit</b>Poți cere gratuit raportul tău. Întârzierile recente scad mult șansele de aprobare.</li>
<li><b>Calculează gradul de îndatorare</b>Ratele tuturor creditelor nu pot depăși, de regulă, 40% din venitul net.</li>
<li><b>Aplică la banca unde îți vine salariul</b>Acolo ai de obicei dobânda cea mai mică și aprobarea cea mai rapidă, uneori chiar o ofertă pre-aprobată.</li>
<li><b>Cere o sumă realistă</b>O sumă mai mică sau o perioadă mai lungă scad rata și cresc șansele de aprobare.</li></ol></section>
<section class="block wrap prose"><h2>Ce acte îți trebuie</h2>
<p>Pentru aplicarea online ai nevoie, de regulă, doar de buletin și de telefon, pentru identificarea video. Venitul este verificat automat, cu acordul tău, prin ANAF sau prin contul în care îți încasezi salariul. La aplicarea în sucursală, unele bănci cer și adeverință de venit.</p>
<div class="callout">Atenție la creditele „rapide” de la IFN-uri: aprobarea e ușoară, dar DAE poate depăși 100%. Un credit bancar cu aplicare online e aproape întotdeauna mult mai ieftin.</div></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>
${related(p.slug)}`; },
    faq: [
      ['Ce bancă dă cel mai ușor credit de nevoi personale?', 'Cel mai ușor obții credit la banca la care îți încasezi salariul, pentru că îți cunoaște deja veniturile. Dintre ofertele online, pragul de venit cel mai mic din comparator este afișat primul în lista de pe această pagină.'],
      ['Pot lua credit de nevoi personale cu venit mic?', 'Da, dacă rata se încadrează în gradul de îndatorare de aproximativ 40% din venitul net. Unele bănci acceptă venituri apropiate de salariul minim. Pentru venituri mici, alege o sumă mai mică sau o perioadă mai lungă.'],
      ['Cât durează aprobarea unui credit online?', 'La aplicarea 100% online, multe bănci dau răspunsul în câteva minute sau ore, iar banii pot ajunge în cont în aceeași zi lucrătoare.'],
      ['Pot obține credit dacă am întârzieri la Biroul de Credit?', 'Întârzierile recente și mari reduc mult șansele la bănci. Întârzierile vechi și închise contează mai puțin. Verifică întâi raportul tău de la Biroul de Credit.'],
      ['Am nevoie de adeverință de venit?', 'La aplicarea online, de cele mai multe ori nu. Venitul se verifică automat, cu acordul tău, la ANAF sau prin contul în care îți vine salariul.']
    ]
  },
  {
    slug: 'credite-ipotecare', top: true, nav: true, navLabel: 'Ipotecare', navLong: 'Credite ipotecare – dobânzi fixe comparate', crumb: 'Credite ipotecare',
    blurb: 'Dobânzi fixe pe 3, 5 sau 10 ani, marjă și avans.',
    title: `Credite ipotecare ${YEAR} – dobânzi fixe la toate băncile`,
    desc: `Compară creditele ipotecare: dobânda fixă și cât durează, marja după (IRCC + x), DAE și avansul minim. Cea mai mică dobândă fixă acum: ${bestM[0] ? pc(bestM[0].fixedRate) + ' la ' + bestM[0].bank : '-'}.`,
    h1Plain: 'Credite ipotecare',
    itemList: bestM.map(o => ({ '@type': 'MortgageLoan', name: o.bank + ' – ' + o.product, provider: { '@type': 'BankOrCreditUnion', name: o.bank }, currency: 'RON', interestRate: o.fixedRate, annualPercentageRate: o.dae ?? undefined, url: o.url })),
    body: p => `<section class="hero solo"><div class="wrap grid2"><div>
<span class="tag"><b>02</b> Credite ipotecare · ${monthYear}</span>
<h1>Credite ipotecare: <em class="it">casa ta, la dobânda potrivită</em></h1>
<p class="lead">Dobânzile fixe de la băncile din România, cât timp rămân fixe și ce urmează după (IRCC + marja băncii). IRCC de referință: <b>${D.ircc ? pc(D.ircc.value) : '—'}</b>.</p>
<div class="stamp">Actualizat: ${esc(updTxt)} · ${D.mortgage.length} bănci</div></div></div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap" data-list data-sort="fixedRate">
${podium(bestM, o => pc(o.fixedRate).replace('%', '<small>% fix</small>'), o => o.fixedYears + ' ani fix, apoi ' + esc(o.margin), 'Dobândă fixă')}
${toolbar([['fixedRate', 'Dobândă fixă'], ['fixedYears', 'Ani fix'], ['dae', 'DAE'], ['bank', 'A–Z']], [['green', 'Credit verde'], ['recent', 'Doar date recente']])}
<ul class="rows">${mortgageList(D.mortgage)}</ul><p class="js-empty" hidden>Nicio ofertă nu se potrivește filtrelor.</p></section>
<section class="block wrap prose"><h2>Cum citești o ofertă de credit ipotecar</h2>
<ul><li><b>Dobânda fixă</b> durează de obicei 3, 5 sau 10 ani. După aceea creditul trece pe dobândă variabilă: IRCC + marja fixă a băncii.</li>
<li><b>IRCC</b> e calculat trimestrial de BNR. Când crește, crește și rata ta în perioada variabilă.</li>
<li><b>Creditele verzi</b>, pentru locuințe în clasa energetică A, au de regulă dobânzi mai mici.</li>
<li><b>Avansul</b> pornește de la 15% pentru prima locuință. Unele bănci cer 25% dacă deții deja o locuință.</li>
<li><b>Rambursarea anticipată</b> a creditelor ipotecare nu are comision, indiferent de tipul dobânzii.</li></ul></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>
${related(p.slug)}`,
    faq: [
      ['Care bancă are cea mai mică dobândă la creditul ipotecar?', bestM[0] ? `Acum, cea mai mică dobândă fixă din comparator este la ${esc(bestM[0].bank)}: ${pc(bestM[0].fixedRate)} fix pe ${bestM[0].fixedYears} ani, apoi ${esc(bestM[0].margin)}.` : '—'],
      ['Ce avans îmi trebuie pentru un credit ipotecar?', 'De regulă minimum 15% pentru prima locuință. Dacă deții deja o locuință, unele bănci cer 25%.'],
      ['Dobândă fixă sau variabilă?', 'Dobânda fixă îți dă rate predictibile în primii ani. Cea variabilă urmează IRCC. Aproape toate ofertele actuale sunt mixte: fixă câțiva ani, apoi variabilă.'],
      ['Ce este IRCC?', 'IRCC este indicele de referință pentru creditele în lei ale consumatorilor, calculat trimestrial de BNR. Dobânda variabilă = IRCC + marja fixă a băncii.']
    ]
  },
  {
    slug: 'carduri-de-credit', top: true, nav: true, navLabel: 'Carduri', navLong: 'Carduri de credit – cashback și rate', crumb: 'Carduri de credit',
    blurb: 'Cashback, rate fără dobândă, perioadă de grație.',
    title: `Carduri de credit ${YEAR} – cashback, rate fără dobândă și lounge`,
    desc: `Compară ${D.creditCards.length} carduri de credit din România: DAE, perioadă de grație, limită, rate fără dobândă, cashback, puncte, mile și acces în lounge.`,
    h1Plain: 'Carduri de credit',
    body: p => `<section class="hero solo"><div class="wrap grid2"><div>
<span class="tag"><b>03</b> Carduri de credit · ${monthYear}</span>
<h1>Carduri de credit: <em class="it">cardul care îți dă înapoi</em></h1>
<p class="lead">DAE, perioada de grație, limita, ratele fără dobândă și beneficiile fiecărui card: cashback, puncte, mile, asigurare de călătorie și acces în lounge.</p>
<div class="btns"><a class="chip" href="${href('carduri-de-debit')}">Vezi și cardurile de debit →</a><a class="chip" href="${href('carduri-cu-acces-lounge')}">Doar carduri cu lounge →</a></div></div></div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap" data-list><div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><span class="sr">Caută</span><input class="js-q" type="search" placeholder="Caută o bancă, un card sau un beneficiu…"></label></div>
${benChips(D.creditCards)}<ul class="cgrid">${cardList(D.creditCards, 'credit')}</ul><p class="js-empty" hidden>Niciun card nu are toate beneficiile alese.</p></section>
<section class="block wrap prose"><h2>Cum alegi un card de credit</h2><ul>
<li><b>Dacă plătești integral în fiecare lună:</b> contează beneficiile (cashback, puncte, mile, lounge) și perioada de grație, nu DAE.</li>
<li><b>Dacă porți sold de la o lună la alta:</b> DAE devine criteriul principal.</li>
<li><b>Retragerile de numerar</b> nu au perioadă de grație: dobânda curge din prima zi, plus un comision de 2–4%.</li></ul></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>${related(p.slug)}`,
    faq: [
      ['Ce card de credit are cel mai mare cashback?', 'Depinde de unde cumperi: unele bănci dau cashback la orice comerciant, altele dau procente mai mari doar la partenerii lor. Folosește filtrul „Cashback” de pe pagină.'],
      ['Ce este perioada de grație?', 'Este intervalul, de până la 55–59 de zile la unele carduri, în care nu plătești dobândă la cumpărături dacă rambursezi integral suma până la scadență.'],
      ['Care card de credit are cea mai lungă perioadă de grație?', 'În comparator, cea mai lungă perioadă de grație afișată este de ' + Math.max(...D.creditCards.filter(c => c.grace).map(c => c.grace)) + ' de zile.'],
      ['Pot avea acces gratuit în lounge cu un card de credit?', 'Da, cu cardurile premium (Gold, Platinum, Signature, Infinite). Numărul de intrări depinde de obicei de un rulaj minim. Vezi pagina dedicată cardurilor cu acces în lounge.']
    ]
  },
  {
    slug: 'carduri-de-debit', top: false, nav: true, navLabel: 'Carduri de debit', navLong: 'Carduri de debit fără comisioane', crumb: 'Carduri de debit',
    blurb: 'Costuri, retrageri gratuite, cashback și valută.',
    title: `Carduri de debit ${YEAR} – fără comisioane, cu cashback și lounge`,
    desc: `Compară ${D.debitCards.length} carduri de debit: costuri de administrare, retrageri gratuite de la ATM, schimb valutar, cashback și acces în lounge.`,
    h1Plain: 'Carduri de debit',
    body: p => `<section class="hero solo"><div class="wrap grid2"><div>
<span class="tag"><b>04</b> Carduri de debit · ${monthYear}</span>
<h1>Carduri de debit <em class="it">fără costuri ascunse</em></h1>
<p class="lead">Cât costă cardul, unde retragi gratuit numerar, ce curs valutar primești și ce beneficii ai: cashback, carduri virtuale, lounge.</p></div></div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap" data-list><div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><span class="sr">Caută</span><input class="js-q" type="search" placeholder="Caută o bancă, un card sau un beneficiu…"></label></div>
${benChips(D.debitCards)}<ul class="cgrid">${cardList(D.debitCards, 'debit')}</ul><p class="js-empty" hidden>Niciun card nu are toate beneficiile alese.</p></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>${related(p.slug)}`,
    faq: [
      ['Ce card de debit nu are comision de administrare?', 'Mai multe bănci și bănci digitale oferă conturi și carduri fără comision lunar, uneori cu condiția unui venit minim încasat sau a unei plăți pe lună. Vezi coloana „Costuri” a fiecărui card.'],
      ['Pot retrage gratuit de la orice bancomat?', 'Unele pachete includ retrageri gratuite în lei la ATM-urile oricărei bănci din România. Altele au o limită lunară, după care se aplică un comision.'],
      ['Există carduri de debit cu acces în lounge?', 'Da, cardurile premium de debit (Gold, Platinum) sau unele pachete de cont includ intrări în lounge-urile din aeroporturi.']
    ]
  },
  {
    slug: 'carduri-cu-acces-lounge', top: false, nav: true, navLabel: 'Carduri cu lounge', navLong: 'Carduri cu acces în lounge', crumb: 'Carduri cu acces în lounge',
    blurb: 'Intrări gratuite în lounge-urile din aeroport.',
    title: `Carduri cu acces în lounge-urile din aeroport (${YEAR})`,
    desc: `${lounges.length} carduri de credit și debit din România cu acces în lounge-urile din aeroport: câte intrări gratuite primești și în ce condiții.`,
    h1Plain: 'Carduri cu acces în lounge',
    body: p => `<section class="hero solo"><div class="wrap grid2"><div>
<span class="tag"><b>✈</b> Lounge · ${monthYear}</span>
<h1>Carduri cu acces <em class="it">în lounge-urile din aeroport</em></h1>
<p class="lead">Cardurile de credit și debit care includ intrări în lounge: câte intrări primești, în ce rețea (Priority Pass, LoungeKey, Visa sau Mastercard) și ce rulaj minim îți cere banca.</p></div></div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap" data-list><div class="toolbar"><label class="search"><span aria-hidden="true">⌕</span><span class="sr">Caută</span><input class="js-q" type="search" placeholder="Caută o bancă sau un card…"></label></div>
${benChips(lounges)}<ul class="cgrid">${cardList(lounges)}</ul><p class="js-empty" hidden>Niciun card nu are toate beneficiile alese.</p></section>
<section class="block wrap prose"><h2>Ce trebuie să știi despre accesul în lounge</h2><ul>
<li>Numărul de intrări gratuite depinde aproape mereu de un <b>rulaj minim</b> cu cardul în luna anterioară.</li>
<li>Peste numărul de intrări incluse, vizitele se plătesc, de obicei în jur de 25–35 EUR de persoană.</li>
<li>Condițiile se pot schimba de la un an la altul. Verifică regulile înainte de călătorie.</li></ul></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>${related(p.slug)}`,
    faq: [
      ['Ce card îmi dă acces gratuit în lounge?', 'Cardurile premium de credit și debit (Gold, Platinum, Signature, Infinite) de la mai multe bănci din România. Lista completă, cu condiții, e pe această pagină.'],
      ['Ce este Priority Pass?', 'Priority Pass este o rețea de peste 1.800 de lounge-uri din aeroporturi din întreaga lume. Unele carduri includ un număr de intrări gratuite pe an.'],
      ['Pot intra cu un însoțitor?', 'Depinde de card. La unele carduri premium intră gratuit și un însoțitor, la altele vizita lui se plătește.']
    ]
  },
  {
    slug: 'calculator-rata-credit', top: false, nav: true, navLabel: 'Calculator rată', navLong: 'Calculator rată credit', crumb: 'Calculator rată credit',
    blurb: 'Rata lunară, totalul de plată și dobânda totală.',
    title: 'Calculator rată credit – rata lunară și totalul de plată',
    desc: 'Calculează rata lunară, totalul de plată și dobânda totală pentru orice credit, cu rate egale. Compară apoi cu cele mai mici dobânzi de la bănci.',
    h1Plain: 'Calculator rată credit',
    body: p => `<section class="hero"><div class="wrap grid2"><div>
<span class="tag"><b>=</b> Calculator</span>
<h1>Calculator rată credit: <em class="it">cât plătești pe lună</em></h1>
<p class="lead">Introdu suma, dobânda anuală și perioada. Afli rata lunară (rate egale), totalul de plată și cât plătești dobândă în total.</p>
<div class="btns"><a class="btn pri" href="${href('comparator-credite-nevoi-personale')}">Vezi dobânzile băncilor →</a></div></div>
<div class="sim" id="calc"><h2><span>Calculator rată</span><span class="flag">rate egale</span></h2>
<label class="field"><span>Suma (lei)</span><input type="number" id="cAmt" value="50000" min="500" step="500"></label>
<div class="two"><label class="field"><span>Dobândă anuală (%)</span><input type="number" id="cRate" value="${bestRate[0] ? bestRate[0].rateMin : 7}" min="0" step="0.01"></label>
<label class="field"><span>Perioadă (luni)</span><input type="number" id="cMon" value="60" min="1" max="360"></label></div>
<div class="res"><div><div class="k">Rata lunară</div><div class="big" id="cPay">—</div></div><div></div>
<div class="who" style="font-weight:500">Total de plată: <b id="cTot">—</b> · Dobândă totală: <b id="cInt">—</b></div></div>
<small>Calculul nu include comisioanele și asigurările. Pentru costul complet, compară DAE.</small></div></div></section>
<div class="wrap">${ad('top')}</div>
<section class="block wrap prose"><h2>Cum se calculează rata unui credit</h2>
<p>La rate egale (anuități), rata lunară rămâne aceeași pe toată durata creditului. La început, o parte mai mare din rată merge pe dobândă, iar spre final, pe principal. Formula folosită: <b>rată = S × r / (1 − (1 + r)<sup>−n</sup>)</b>, unde S e suma împrumutată, r e dobânda lunară (dobânda anuală / 12) și n e numărul de luni.</p></section>
<div class="wrap">${ad('bottom')}</div>
<section class="block wrap"><h2>Întrebări frecvente</h2>${faqBlock(p.faq)}</section>${related(p.slug)}`,
    faq: [
      ['Rate egale sau rate descrescătoare?', 'La rate egale plătești aceeași sumă în fiecare lună. La rate descrescătoare, prima rată e mai mare, dar totalul plătit e mai mic.'],
      ['De ce rata calculată diferă de oferta băncii?', 'Banca adaugă comisioane (analiză dosar, administrare) și, uneori, asigurarea. De aceea compară întotdeauna DAE.']
    ]
  },
  {
    slug: 'despre-si-metodologie', top: false, nav: false, navLabel: 'Despre și metodologie', crumb: 'Despre și metodologie',
    title: `Despre ${C.siteName} și metodologia comparatorului`,
    desc: 'Cine suntem, de unde provin datele, cât de des se actualizează și cum câștigă bani site-ul.',
    h1Plain: 'Despre și metodologie',
    body: p => `<section class="block wrap prose"><h1>Despre noi și <em class="it">cum lucrăm</em></h1>
<p>${esc(C.siteName)} este un comparator independent de credite și carduri din România, operat de ${esc(C.operator.name)}. Nu suntem bancă, IFN sau intermediar de credite și nu acordăm credite.</p>
<h2>De unde provin datele</h2><p>Colectăm ofertele publice de pe site-urile oficiale ale băncilor și din presa financiară (de exemplu wall-street.ro, bankingnews.ro, economica.net, newsweek.ro). Fiecare ofertă afișează sursa și data ei. Ofertele mai vechi de 4 luni sau incomplete sunt marcate „de reverificat”.</p>
<h2>Cât de des actualizăm</h2><p>Datele sunt verificate automat de două ori pe zi, dimineața și seara. Ultima actualizare: ${esc(updTxt)}.</p>
<h2>Cum ordonăm ofertele</h2><p>Creditele sunt ordonate implicit după DAE, care include dobânda, comisioanele și asigurările obligatorii. DAE din clasamentele de presă e calculat de obicei pentru 50.000 lei pe 60 de luni, cu venitul încasat la banca respectivă. Rata estimată din tabel folosește dobânda minimă publicată, fără comisioane.</p>
<h2>Cum câștigăm bani</h2><p>Site-ul este gratuit pentru utilizatori. Ne finanțăm prin reclame (Google AdSense), marcate „Publicitate”, și, acolo unde există, prin link-uri de afiliere, marcate „link partener”. Ordinea ofertelor nu depinde de reclame sau de comisioane.</p>
<h2>Contact</h2><p>Pentru corecturi sau întrebări: ${esc(C.operator.email)}.</p></section>`
  },
  {
    slug: 'politica-de-confidentialitate', top: false, nav: false, navLabel: 'Confidențialitate și cookie-uri', crumb: 'Politica de confidențialitate',
    title: 'Politica de confidențialitate și cookie-uri', desc: 'Ce date colectăm, cum folosim cookie-urile și reclamele Google și ce drepturi ai conform GDPR.', h1Plain: 'Politica de confidențialitate',
    body: p => `<section class="block wrap prose"><h1>Politica de confidențialitate și cookie-uri</h1>
<p class="callout">Model de pornire: completează datele operatorului și cere verificarea unui jurist înainte de publicare.</p>
<h2>Operatorul datelor</h2><p>${[esc(C.operator.name), C.operator.type ? esc(C.operator.type) : '', C.operator.cui ? 'CUI ' + esc(C.operator.cui) : '', esc(C.operator.address)].filter(Boolean).join(', ')}. Contact: ${esc(C.operator.email)}.</p>
<h2>Ce date colectăm</h2><p>Nu cerem nume, telefon sau alte date personale. Simulatoarele rulează doar în browserul tău și nu trimit valorile introduse nicăieri.</p>
<h2>Cookie-uri și reclame</h2><p>Folosim Google AdSense pentru afișarea reclamelor${C.ga4MeasurementId ? ' și Google Analytics pentru statistici de trafic' : ''}. Google și partenerii săi pot folosi cookie-uri pentru a afișa reclame pe baza vizitelor tale anterioare, pe acest site sau pe alte site-uri. Pentru vizitatorii din SEE, Regatul Unit și Elveția, cerem acordul printr-o platformă de gestionare a consimțământului certificată de Google, înainte de a folosi cookie-uri pentru reclame personalizate. Poți schimba oricând alegerea din linkul „Setări confidențialitate”. Poți afla mai multe la <a href="https://policies.google.com/technologies/ads?hl=ro" rel="noopener">policies.google.com/technologies/ads</a> și poți dezactiva reclamele personalizate din <a href="https://adssettings.google.com" rel="noopener">Setările pentru anunțuri Google</a>.</p>
<h2>Drepturile tale</h2><p>Conform GDPR, ai dreptul de acces, rectificare, ștergere, restricționare, opoziție și portabilitate a datelor, precum și dreptul de a depune plângere la ANSPDCP (dataprotection.ro).</p></section>`
  },
  {
    slug: 'termeni-si-conditii', top: false, nav: false, navLabel: 'Termeni și condiții', crumb: 'Termeni și condiții',
    title: 'Termeni și condiții', desc: 'Condițiile de utilizare a comparatorului de credite și carduri.', h1Plain: 'Termeni și condiții',
    body: p => `<section class="block wrap prose"><h1>Termeni și condiții</h1>
<p class="callout">Model de pornire: cere verificarea unui jurist înainte de publicare.</p>
<p>Informațiile de pe ${esc(C.siteName)} au caracter informativ și provin din surse publice. Facem eforturi să le păstrăm corecte și actuale, dar nu garantăm că sunt complete sau la zi în orice moment. Ofertele finale sunt stabilite exclusiv de bănci.</p>
<p>Site-ul nu oferă consultanță financiară și nu intermediază credite. Înainte de a semna un contract, citește formularul de informații precontractuale primit de la bancă.</p>
<p>Link-urile către site-urile băncilor duc pe pagini pe care nu le controlăm. Reclamele și link-urile de afiliere sunt marcate ca atare.</p></section>`
  },
  {
    slug: '404', top: false, nav: false, noindex: true, navLabel: 'Pagina nu există', crumb: 'Pagina nu există', title: 'Pagina nu există', desc: 'Pagina căutată nu există.', h1Plain: 'Pagina nu există',
    body: p => `<section class="hero solo"><div class="wrap"><h1>Pagina asta <em class="it">nu există.</em></h1><p class="lead">Poate te ajută una dintre paginile de mai jos.</p></div></section>${related('404')}`
  }
];

// ---------------- write ----------------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const f of ['style.css', 'app.js']) fs.copyFileSync(path.join(SRC, 'assets', f), path.join(OUT, 'assets', f));
fs.writeFileSync(path.join(OUT, 'assets', 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="16" fill="#b8a4f4" transform="rotate(-8 32 32)"/><text x="32" y="42" font-family="Arial Black,Arial" font-weight="900" font-size="28" text-anchor="middle" fill="#1c1530">%</text></svg>`);
for (const p of PAGES) {
  let html = shell(p, p.body(p));
  if (/id="(sim|refi)"/.test(html)) html = html.replace('</main>', `<script type="application/json" id="offers-json">${offersJson}</script>\n</main>`);
  const file = p.slug === '' ? 'index.html' : p.slug + '.html';
  fs.writeFileSync(path.join(OUT, file), html.replace(/\n{2,}/g, '\n'));
}
const lastmod = D.updatedAt.slice(0, 10);
const indexable = PAGES.filter(p => !p.noindex);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(p => `  <url><loc>${canon(p.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>${p.slug === '' ? '1.0' : p.nav ? '0.9' : '0.4'}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
if (adsOn) fs.writeFileSync(path.join(OUT, 'ads.txt'), `google.com, ${AD.client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`);
// Cloudflare Pages / Netlify: pagina 404 și redirect .html -> URL curat sunt automate pe ambele platforme
fs.writeFileSync(path.join(OUT, '_headers'), `/assets/*\n  Cache-Control: public, max-age=86400\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
console.log(`OK ${PREVIEW ? 'preview' : 'dist'}: ${PAGES.length} pagini, sitemap cu ${indexable.length} URL-uri, ads ${adsOn ? 'ACTIVE' : 'inactive'}`);
