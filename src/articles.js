/* Ghiduri financiare – conținut editorial pentru SEO.
   Fiecare articol primește helperii din build.js (h) și poate folosi datele actuale (h.D),
   astfel încât tabelele și exemplele se actualizează singure la fiecare rulare.
   Câmpuri: slug, title (<60 car.), desc (<160 car.), h1 (HTML), date, updated, minutes, tag, blurb, body(h), faq. */

module.exports = function articles(h) {
  const { D, P, bestP, bestRate, bestM, pc, lei, fmt, pmt, esc, href, ad, daeOf, YEAR } = h;
  const fresh = P.filter(o => !o.stale);
  const cta = (slug, txt) => `<p><a class="btn pri" href="${href(slug)}">${txt} →</a></p>`;
  const tbl = (head, rows) => `<div class="dwrap"><table class="dtable"><thead><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const ircc = D.ircc ? pc(D.ircc.value) : '—';

  // ---------- 1. Cât costă un credit de 50.000 lei ----------
  const A = 50000, N = 60;
  const costRows = fresh.filter(o => o.rateMin != null && (o.maxAmount == null || o.maxAmount >= A))
    .map(o => ({ o, r: pmt(o.rateMin, N, A) })).sort((x, y) => (x.o.dae ?? 99) - (y.o.dae ?? 99));
  const cheapest = costRows.slice().sort((x, y) => x.r - y.r)[0];
  const priciest = costRows.slice().sort((x, y) => y.r - x.r)[0];

  // ---------- 3. DAE: exemplu calculat ----------
  const exA = { rate: 6.49, upfront: 0, monthly: 0 };
  const exB = { rate: 5.99, upfront: 1000, monthly: 20 };
  const daeA = daeOf(A, N, exA.rate, exA.upfront, exA.monthly), daeB = daeOf(A, N, exB.rate, exB.upfront, exB.monthly);
  const totA = pmt(exA.rate, N, A) * N + exA.upfront + exA.monthly * N, totB = pmt(exB.rate, N, A) * N + exB.upfront + exB.monthly * N;

  // ---------- 4. Grad de îndatorare ----------
  const refRate = bestRate[0] ? bestRate[0].rateMin : 6.5;
  const maxLoan = (rata, rate, n) => { const r = rate / 100 / 12; return rata * (1 - Math.pow(1 + r, -n)) / r; };

  // ---------- 2. Refinanțare: exemplu ----------
  const rfP = 40000, rfOld = 12.5, rfN = 48, rfNew = bestRate[0] ? bestRate[0].rateMin : 6.5;
  const rfNow = pmt(rfOld, rfN, rfP), rfNewP = pmt(rfNew, rfN, rfP), rfSave = (rfNow - rfNewP) * rfN - rfP * 0.01 - 200;

  return [
    {
      slug: 'cat-costa-un-credit-de-50000-lei', tag: 'Credite', minutes: 5, date: '2026-11-19',
      title: `Cât costă un credit de 50.000 lei în ${YEAR}? Rate la fiecare bancă`,
      desc: `Rata lunară și totalul de plată pentru un credit de nevoi personale de 50.000 lei pe 5 ani, la fiecare bancă din România. Calcul actualizat zilnic.`,
      h1: `Cât costă un credit de 50.000 lei: <em class="it">rata la fiecare bancă</em>`,
      blurb: 'Rata lunară și dobânda totală pe 5 ani, calculate pentru fiecare bancă.',
      body: () => `
<p class="lead">50.000 lei pe 60 de luni este scenariul pe care băncile și presa îl folosesc cel mai des pentru a compara creditele de nevoi personale. Mai jos ai rata lunară și totalul de plată la fiecare bancă, calculate cu dobânda minimă publicată de fiecare. Tabelul se actualizează automat odată cu ofertele.</p>
${tbl(['Bancă', 'Dobândă de la', 'DAE', 'Rată lunară', 'Dobândă totală'], costRows.map(({ o, r }) => [`<b>${esc(o.bank)}</b>`, pc(o.rateMin), pc(o.dae), fmt(r) + ' lei', fmt(r * N - A) + ' lei']))}
<p class="note">Calcul cu rate egale, fără comisioane și asigurări. Dobânda minimă se obține de obicei cu salariul virat la bancă și un istoric bun la Biroul de Credit.</p>
${ad('top')}
<h2>Ce înseamnă cifrele</h2>
<p>Diferența dintre cea mai ieftină și cea mai scumpă ofertă din tabel este de ${cheapest && priciest ? `<b>${fmt(priciest.r - cheapest.r)} lei pe lună</b>, adică aproximativ <b>${fmt((priciest.r - cheapest.r) * N)} lei</b> în 5 ani` : 'câteva sute de lei pe lună'}. De aceea merită să compari înainte să semnezi, chiar dacă banca la care ai deja cont pare mai comodă.</p>
<p>Totuși, dobânda singură nu spune tot. <b>DAE</b> (dobânda anuală efectivă) include și comisioanele și asigurările obligatorii, deci arată costul real. Două oferte cu aceeași dobândă pot avea DAE diferit cu 1–2 puncte procentuale. Despre asta ai mai multe detalii în <a href="${href('ghiduri/ce-este-dae')}">ghidul despre DAE</a>.</p>
<h2>Ce venit îți trebuie pentru 50.000 lei</h2>
<p>Băncile nu pot aproba o rată mai mare de 40% din venitul tău net (regula BNR pentru creditele în lei). La o rată de ${cheapest ? fmt(cheapest.r) : '~970'} lei, ai nevoie de un venit net de cel puțin <b>${cheapest ? fmt(cheapest.r / 0.4) : '2.430'} lei</b>, dacă nu mai ai alte credite. Calculul complet e în ghidul despre <a href="${href('ghiduri/grad-de-indatorare')}">gradul de îndatorare</a>.</p>
<h2>Cum obții dobânda minimă</h2>
<ul><li><b>Virează-ți salariul la bancă.</b> Aproape toate băncile dau dobânda cea mai mică doar clienților care își încasează venitul la ele.</li>
<li><b>Verifică-ți istoricul de credit</b> înainte să aplici. Întârzierile recente cresc dobânda sau duc la refuz.</li>
<li><b>Cere oferte de la 2–3 bănci</b> și negociază. O ofertă scrisă de la concurență te ajută la banca ta.</li></ul>
${cta('comparator-credite-nevoi-personale', 'Compară toate ofertele cu simulatorul')}`,
      faq: [
        ['Cât este rata la un credit de 50.000 lei pe 5 ani?', cheapest ? `La dobânda minimă publicată acum, rata pornește de la aproximativ ${fmt(cheapest.r)} lei pe lună (${esc(cheapest.o.bank)}, ${pc(cheapest.o.rateMin)}). La o dobândă de 10%, rata ar fi de aproximativ ${fmt(pmt(10, N, A))} lei.` : 'Depinde de dobândă; vezi tabelul de pe pagină.'],
        ['Ce salariu trebuie să am pentru un credit de 50.000 lei?', cheapest ? `Pentru o rată de aproximativ ${fmt(cheapest.r)} lei, ai nevoie de un venit net de cel puțin ${fmt(cheapest.r / 0.4)} lei pe lună, dacă nu ai alte credite, deoarece rata nu poate depăși 40% din venit.` : 'Rata nu poate depăși 40% din venitul net.'],
        ['Cât plătesc în total pentru 50.000 lei?', cheapest ? `La ${pc(cheapest.o.rateMin)} pe 5 ani plătești în total aproximativ ${fmt(cheapest.r * N)} lei, adică ${fmt(cheapest.r * N - A)} lei dobândă, plus eventualele comisioane.` : 'Vezi tabelul de pe pagină.']
      ]
    },
    {
      slug: 'cand-merita-refinantarea', tag: 'Refinanțare', minutes: 6, date: '2026-11-19',
      title: 'Când merită refinanțarea unui credit? Calcul și exemple',
      desc: 'Cum îți dai seama dacă merită să-ți refinanțezi creditul de nevoi personale: exemplu de calcul, comisionul de rambursare anticipată și greșelile de evitat.',
      h1: `Când merită <em class="it">refinanțarea</em> unui credit de nevoi personale`,
      blurb: 'Exemplu de calcul, comisionul de rambursare și când nu merită.',
      body: () => `
<p class="lead">Refinanțarea înseamnă să iei un credit nou, mai ieftin, cu care plătești creditul vechi. Merită atunci când economia la dobândă e mai mare decât costurile schimbării. Iată cum faci calculul.</p>
<h2>Un exemplu concret</h2>
<p>Ai un sold de <b>${fmt(rfP)} lei</b>, cu dobândă de <b>${pc(rfOld)}</b> și <b>${rfN} de luni</b> rămase. Rata ta e de aproximativ <b>${fmt(rfNow)} lei</b>. Dacă refinanțezi la ${pc(rfNew)} (cea mai mică dobândă publicată acum), pe aceeași perioadă, rata scade la aproximativ <b>${fmt(rfNewP)} lei</b>.</p>
${tbl(['', 'Creditul actual', 'După refinanțare'], [['Dobândă', pc(rfOld), pc(rfNew)], ['Rată lunară', fmt(rfNow) + ' lei', fmt(rfNewP) + ' lei'], ['Total rămas de plată', fmt(rfNow * rfN) + ' lei', fmt(rfNewP * rfN) + ' lei']])}
<p>După ce scazi comisionul de rambursare anticipată (1%, adică ${fmt(rfP * 0.01)} lei) și circa 200 lei costuri ale noului credit, economia netă e de aproximativ <b>${fmt(rfSave)} lei</b>.</p>
${ad('top')}
<h2>Regula simplă: când merită</h2>
<ul><li><b>Diferența de dobândă</b> e de cel puțin 2–3 puncte procentuale.</li>
<li><b>Mai ai cel puțin 2 ani</b> de plătit. Spre finalul creditului, dobânda rămasă e mică și economia scade.</li>
<li><b>Soldul e mare.</b> La 5.000 lei rămași, costurile schimbării pot mânca toată economia.</li></ul>
<h2>Cât costă să închizi creditul vechi</h2>
<p>La creditele de consum, legea (OUG 50/2010) limitează comisionul de rambursare anticipată: la <b>dobânda fixă</b>, cel mult <b>1%</b> din suma rambursată dacă mai sunt peste 12 luni până la final, respectiv <b>0,5%</b> dacă sunt mai puțin. La <b>dobânda variabilă</b> nu se plătește comision. Cere băncii actuale soldul exact și comisionul, în scris.</p>
<h2>Greșeli de evitat</h2>
<ul><li><b>Să lungești perioada fără să calculezi.</b> Rata scade, dar poți plăti mai mult în total. Compară totalul de plată, nu doar rata.</li>
<li><b>Să compari dobânzi, nu DAE.</b> Un credit cu dobândă mică și comision de analiză mare poate ieși mai scump.</li>
<li><b>Să uiți de banca ta.</b> Cu o ofertă concurentă în mână, multe bănci îți reduc dobânda fără să mai schimbi creditul.</li></ul>
${cta('refinantare-credit-nevoi-personale', 'Calculează-ți economia cu calculatorul de refinanțare')}`,
      faq: [
        ['Când merită să refinanțez un credit?', 'De regulă când noua dobândă e mai mică cu cel puțin 2–3 puncte procentuale, mai ai cel puțin doi ani de plătit și soldul e suficient de mare încât economia să acopere comisionul de rambursare și costurile noului credit.'],
        ['Cât costă rambursarea anticipată la un credit de nevoi personale?', 'La dobânda fixă, cel mult 1% din suma rambursată dacă mai sunt peste 12 luni până la final, sau 0,5% dacă sunt mai puțin. La dobânda variabilă nu se plătește comision.'],
        ['Pot refinanța mai multe credite într-unul singur?', 'Da. Majoritatea băncilor acceptă comasarea mai multor credite și carduri de credit într-un singur credit de nevoi personale, cu o singură rată.']
      ]
    },
    {
      slug: 'ce-este-dae', tag: 'Educație financiară', minutes: 4, date: '2026-11-19',
      title: 'Ce este DAE și de ce contează mai mult decât dobânda',
      desc: 'DAE (dobânda anuală efectivă) explicată simplu, cu un exemplu calculat: de ce un credit cu dobândă mai mică poate ieși mai scump.',
      h1: `Ce este DAE și de ce contează <em class="it">mai mult decât dobânda</em>`,
      blurb: 'De ce un credit cu dobândă mai mică poate ieși mai scump.',
      body: () => `
<p class="lead">DAE, adică dobânda anuală efectivă, este costul total al unui credit exprimat ca procent pe an. Include dobânda, dar și comisioanele și asigurările obligatorii. Este singurul indicator care îți permite să compari corect oferte de la bănci diferite.</p>
<h2>Exemplu: dobândă mai mică, credit mai scump</h2>
<p>Două oferte pentru același credit de ${fmt(A)} lei pe ${N} de luni:</p>
${tbl(['', 'Oferta A', 'Oferta B'], [['Dobândă', pc(exA.rate), pc(exB.rate)], ['Comision de analiză', '0 lei', fmt(exB.upfront) + ' lei'], ['Comision lunar', '0 lei', exB.monthly + ' lei'], ['<b>DAE</b>', '<b>' + pc(daeA) + '</b>', '<b>' + pc(daeB) + '</b>'], ['Total de plată', fmt(totA) + ' lei', fmt(totB) + ' lei']])}
<p>Oferta B are dobânda mai mică, dar comisioanele o fac mai scumpă: plătești cu <b>${fmt(totB - totA)} lei mai mult</b> în total. DAE arată asta imediat; dobânda nu.</p>
${ad('top')}
<h2>Ce intră în DAE</h2>
<ul><li>dobânda (fixă sau variabilă);</li><li>comisionul de analiză a dosarului și comisionul lunar de administrare;</li><li>asigurarea de viață sau de șomaj, dacă banca o cere obligatoriu;</li><li>alte costuri pe care banca le impune ca să acorde creditul.</li></ul>
<p>Nu intră în DAE costurile pe care le poți evita, de exemplu penalitățile pentru întârziere.</p>
<h2>De ce DAE diferă de la un client la altul</h2>
<p>DAE afișat în reclame e calculat pentru un exemplu standard (de obicei 50.000 lei pe 5 ani, cu venitul încasat la bancă). DAE-ul tău real apare în <b>formularul de informații precontractuale</b>, pe care banca e obligată să ți-l dea înainte de semnare. Compară ofertele folosind acest formular.</p>
${cta('comparator-credite-nevoi-personale', 'Vezi creditele ordonate după DAE')}`,
      faq: [
        ['Ce înseamnă DAE?', 'DAE înseamnă dobânda anuală efectivă: costul total anual al creditului, care include dobânda, comisioanele și asigurările obligatorii.'],
        ['Care e diferența dintre dobândă și DAE?', 'Dobânda e doar prețul banilor împrumutați. DAE adaugă comisioanele și asigurările obligatorii, deci arată costul real al creditului.'],
        ['Unde găsesc DAE-ul exact pentru creditul meu?', 'În formularul de informații precontractuale pe care banca e obligată să ți-l dea înainte de semnarea contractului.']
      ]
    },
    {
      slug: 'grad-de-indatorare', tag: 'Credite', minutes: 5, date: '2026-11-19',
      title: `Grad de îndatorare ${YEAR}: cât poți împrumuta după salariu`,
      desc: 'Gradul maxim de îndatorare BNR (40% sau 45%), cum se calculează și ce sumă poți împrumuta în funcție de venitul tău net. Tabel calculat.',
      h1: `Grad de îndatorare: <em class="it">cât poți împrumuta</em> după salariu`,
      blurb: 'Limitele BNR și un tabel cu suma maximă pentru fiecare venit.',
      body: () => `
<p class="lead">Gradul de îndatorare este partea din venitul tău net care merge pe rate. BNR îl limitează ca să nu te împrumuți peste puterile tale, iar băncile sunt obligate să respecte limita.</p>
<h2>Limitele în vigoare</h2>
${tbl(['Tip credit', 'Grad maxim de îndatorare'], [['Credite în lei (nevoi personale, ipotecare)', '<b>40%</b> din venitul net'], ['Credit ipotecar pentru prima locuință, în lei', '<b>45%</b> din venitul net'], ['Credite în valută', '20% (25% pentru prima locuință)']])}
<p>Limitele sunt stabilite prin Regulamentul BNR nr. 17/2012 și se aplică din 2019. Gradul se calculează pentru <b>toate</b> creditele tale la un loc, inclusiv cardurile de credit și descoperitul de cont.</p>
<h2>Formula</h2>
<p><b>Grad de îndatorare = (toate ratele lunare / venitul net lunar) × 100</b></p>
<p>Exemplu: ai venit net de 6.000 lei și deja plătești 600 lei pe lună la un leasing. Limita de 40% înseamnă 2.400 lei. Pentru un credit nou îți mai rămân <b>1.800 lei</b> pe lună.</p>
${ad('top')}
<h2>Cât poți împrumuta, în funcție de venit</h2>
<p>Tabelul arată suma maximă pentru un credit de nevoi personale pe 5 ani, dacă nu ai alte credite, la dobânda de ${pc(refRate)} (cea mai mică publicată acum) și la o dobândă de 10%.</p>
${tbl(['Venit net', 'Rată maximă (40%)', `Credit maxim la ${pc(refRate)}`, 'Credit maxim la 10%'], [3000, 4000, 5000, 6000, 8000, 10000].map(v => [fmt(v) + ' lei', fmt(v * 0.4) + ' lei', fmt(Math.min(250000, maxLoan(v * 0.4, refRate, 60))) + ' lei', fmt(Math.min(250000, maxLoan(v * 0.4, 10, 60))) + ' lei']))}
<p class="note">Suma e plafonată la 250.000 lei, maximul uzual pentru creditele de nevoi personale fără ipotecă. Banca poate aproba mai puțin, după propria analiză.</p>
<h2>Cum îți crești capacitatea de împrumut</h2>
<ul><li><b>Închide cardurile de credit nefolosite.</b> Unele bănci iau în calcul un procent din limita cardului, chiar dacă nu îl folosești.</li>
<li><b>Aplică împreună cu partenerul.</b> Veniturile codebitorilor se adună.</li>
<li><b>Alege o perioadă mai lungă.</b> Rata scade, deci încape în limita de 40%, dar plătești mai multă dobândă în total.</li></ul>
${cta('credit-nevoi-personale-usor-de-obtinut', 'Vezi creditele cu venit minim mic')}`,
      faq: [
        ['Care este gradul maxim de îndatorare?', 'Pentru creditele în lei, 40% din venitul net lunar. Pentru creditul ipotecar destinat primei locuințe, limita este 45%. Pentru creditele în valută, 20% (25% pentru prima locuință).'],
        ['Cum se calculează gradul de îndatorare?', 'Aduni toate ratele lunare (inclusiv cele noi) și le împarți la venitul net lunar, apoi înmulțești cu 100.'],
        ['Cât pot împrumuta cu un salariu de 5.000 lei?', `Fără alte credite, rata maximă e de 2.000 lei. Pe 5 ani, la ${pc(refRate)}, asta înseamnă un credit de aproximativ ${fmt(Math.min(250000, maxLoan(2000, refRate, 60)))} lei.`]
      ]
    },
    {
      slug: 'biroul-de-credit', tag: 'Educație financiară', minutes: 4, date: '2026-11-19',
      title: 'Biroul de Credit: cum îți verifici gratuit raportul',
      desc: 'Ce este Biroul de Credit, cum îți ceri gratuit raportul o dată pe an, cât timp rămân restanțele și cum corectezi o informație greșită.',
      h1: `Biroul de Credit: cum îți verifici <em class="it">gratuit</em> istoricul`,
      blurb: 'Raportul gratuit, cât rămân restanțele și cum corectezi o eroare.',
      body: () => `
<p class="lead">Biroul de Credit este baza de date în care băncile și IFN-urile raportează creditele tale și felul în care le plătești. Înainte să-ți aprobe un credit, banca se uită aici. De aceea e bine să vezi tu primul ce scrie despre tine.</p>
<h2>Cum ceri raportul gratuit</h2>
<ol><li>Intră pe <b>birouldecredit.ro</b> și creează-ți un cont de persoană fizică.</li>
<li>Confirmă-ți identitatea, după instrucțiunile de pe site.</li>
<li>Solicită raportul. <b>Primul raport din an este gratuit</b>; pentru solicitările suplimentare în același an se plătește o taxă mică.</li></ol>
<p>Poți cere raportul și prin poștă sau printr-o cerere depusă la banca la care ai cont.</p>
${ad('top')}
<h2>Ce conține raportul</h2>
<ul><li>creditele și cardurile de credit active, cu sumele și ratele;</li><li>istoricul de plată și eventualele întârzieri;</li><li>interogările făcute de bănci când ai cerut credite;</li><li>scorul FICO, un număr care rezumă riscul tău de neplată.</li></ul>
<h2>Cât timp rămân restanțele</h2>
<p>Informațiile negative se păstrează <b>4 ani</b> de la data la care ai achitat restanța. Asta nu înseamnă că nu poți lua credit în acest timp, dar dobânda poate fi mai mare sau banca poate refuza dacă întârzierile sunt recente și mari.</p>
<h2>Ai găsit o eroare?</h2>
<p>Corectarea nu se cere Biroului de Credit, ci <b>băncii sau IFN-ului care a raportat informația</b>. Trimite-le o cerere scrisă, cu dovezi (de exemplu, chitanța plății). Dacă nu primești răspuns, te poți adresa ANPC sau ANSPDCP.</p>
<div class="callout">Atenție la ofertele „credit fără verificare la Biroul de Credit”: de regulă vin de la IFN-uri, cu DAE mult mai mare decât la bănci.</div>
${cta('credit-nevoi-personale-usor-de-obtinut', 'Vezi creditele cu aprobare rapidă')}`,
      faq: [
        ['Cum îmi verific gratuit raportul de la Biroul de Credit?', 'Îți creezi cont pe birouldecredit.ro, îți confirmi identitatea și soliciți raportul. Primul raport din fiecare an este gratuit.'],
        ['Cât timp rămân restanțele la Biroul de Credit?', 'Informațiile negative se păstrează 4 ani de la data la care ai achitat restanța.'],
        ['Cum corectez o informație greșită din Biroul de Credit?', 'Trimiți o cerere scrisă, cu dovezi, băncii sau IFN-ului care a raportat informația. Biroul de Credit doar stochează datele.']
      ]
    },
    {
      slug: 'dobanda-fixa-sau-variabila', tag: 'Credite', minutes: 5, date: '2026-11-19',
      title: 'Dobândă fixă sau variabilă? Ce alegi și ce este IRCC',
      desc: `Diferența dintre dobânda fixă și variabilă, ce este IRCC (acum ${ircc}) și cum se schimbă rata ta. Ghid pentru credite de nevoi personale și ipotecare.`,
      h1: `Dobândă fixă sau variabilă: <em class="it">ce alegi</em> și ce este IRCC`,
      blurb: 'Cum funcționează IRCC și când e mai bună fiecare variantă.',
      body: () => `
<p class="lead">La dobânda fixă, rata rămâne aceeași o perioadă stabilită în contract. La dobânda variabilă, rata se poate schimba la fiecare trimestru, în funcție de IRCC. Alegerea contează mult la creditele lungi, cum sunt cele ipotecare.</p>
<h2>Ce este IRCC</h2>
<p>IRCC (indicele de referință pentru creditele consumatorilor) este calculat de BNR pe baza dobânzilor din piața interbancară și se actualizează <b>trimestrial</b>. Dobânda variabilă se calculează așa:</p>
<p><b>Dobândă variabilă = IRCC + marja fixă a băncii</b></p>
<p>Valoarea IRCC aplicată acum este <b>${ircc}</b>. Dacă marja băncii e 2,1%, dobânda ta variabilă este ${D.ircc ? pc(D.ircc.value + 2.1) : '—'}.</p>
${ad('top')}
<h2>Cum se schimbă rata</h2>
${tbl(['IRCC', 'Dobândă (IRCC + 2,1%)', 'Rată pentru 300.000 lei pe 25 de ani'], [-1, 0, 1, 2].map(d => { const ir = (D.ircc ? D.ircc.value : 5.6) + d; return [pc(ir) + (d === 0 ? ' (acum)' : ''), pc(ir + 2.1), fmt(pmt(ir + 2.1, 300, 300000)) + ' lei']; }))}
<p>O creștere de un punct procentual a IRCC înseamnă, pentru un credit ipotecar de 300.000 lei, o rată mai mare cu aproximativ <b>${D.ircc ? fmt(pmt(D.ircc.value + 3.1, 300, 300000) - pmt(D.ircc.value + 2.1, 300, 300000)) : '180'} lei pe lună</b>.</p>
<h2>Ce alegi</h2>
<ul><li><b>Dobânda fixă</b> e potrivită dacă vrei rate predictibile și bugetul tău nu suportă creșteri. De obicei pornește puțin mai sus decât varianta variabilă.</li>
<li><b>Dobânda variabilă</b> poate fi avantajoasă când dobânzile din piață scad, dar te expune riscului de creștere.</li>
<li><b>Varianta mixtă</b> (fixă 3, 5 sau 10 ani, apoi variabilă) e cea mai răspândită la ipotecare. Cu cât perioada fixă e mai lungă, cu atât ești protejat mai mult timp.</li></ul>
<div class="callout">La creditele de nevoi personale, majoritatea ofertelor actuale au dobândă fixă pe toată perioada, ceea ce simplifică alegerea.</div>
${cta('credite-ipotecare', 'Compară dobânzile fixe la ipotecare')}`,
      faq: [
        ['Ce este IRCC?', 'IRCC este indicele de referință pentru creditele consumatorilor în lei, calculat trimestrial de BNR. Dobânda variabilă este IRCC plus marja fixă a băncii.'],
        ['Cât este IRCC acum?', `Valoarea IRCC aplicată în prezent este ${ircc}. Se actualizează la începutul fiecărui trimestru.`],
        ['Este mai bună dobânda fixă sau cea variabilă?', 'Dobânda fixă îți dă rate predictibile; cea variabilă poate scădea sau crește odată cu IRCC. La creditele lungi, varianta fixă pe mai mulți ani te protejează de creșteri.']
      ]
    },
    {
      slug: 'rambursare-anticipata', tag: 'Credite', minutes: 4, date: '2026-11-19',
      title: 'Rambursare anticipată: comision, reguli și cât economisești',
      desc: 'Cât costă rambursarea anticipată a unui credit de nevoi personale sau ipotecar, ce spune legea și când merită să reduci perioada sau rata.',
      h1: `Rambursarea anticipată: <em class="it">cât costă și când merită</em>`,
      blurb: 'Comisioanele permise de lege și cum alegi între rată și perioadă.',
      body: () => `
<p class="lead">Ai dreptul să plătești oricând creditul mai devreme, integral sau parțial. Ce plătești pentru asta depinde de tipul creditului și al dobânzii.</p>
<h2>Credite de nevoi personale</h2>
${tbl(['Tip dobândă', 'Comision maxim de rambursare anticipată'], [['Variabilă', '<b>0</b>'], ['Fixă, cu peste 12 luni rămase', '<b>1%</b> din suma rambursată'], ['Fixă, cu cel mult 12 luni rămase', '<b>0,5%</b> din suma rambursată']])}
<p>Limitele sunt stabilite de OUG 50/2010. Multe bănci nu percep deloc comision; verifică în contract.</p>
<h2>Credite ipotecare</h2>
<p>La creditele ipotecare cu <b>dobândă variabilă</b>, rambursarea anticipată este gratuită. În perioada cu <b>dobândă fixă</b>, banca poate cere o compensație, prevăzută în contract. Multe oferte actuale nu au acest comision, așa că merită verificat înainte de semnare.</p>
${ad('top')}
<h2>Reduci rata sau perioada?</h2>
<p>La o rambursare parțială, banca te întreabă ce vrei să scadă:</p>
<ul><li><b>Perioada</b> (rata rămâne aceeași): economisești cea mai multă dobândă.</li>
<li><b>Rata</b> (perioada rămâne aceeași): bugetul lunar devine mai lejer, dar economia totală e mai mică.</li></ul>
${(() => { const P0 = 40000, r = 9, n = 60, k = 12, X = 10000, i = r / 1200; const R = pmt(r, n, P0); let bal = P0; for (let m = 0; m < k; m++) bal = bal * (1 + i) - R; const intBase = R * n - P0; const b2 = bal - X; const nLeft = Math.ceil(-Math.log(1 - b2 * i / R) / Math.log(1 + i)); let bb = b2, paid = 0; for (let m = 0; m < nLeft; m++) { const pay = Math.min(R, bb * (1 + i)); paid += pay; bb = bb * (1 + i) - pay; } const intPeriod = R * k + paid + X - P0; const R2 = pmt(r, n - k, b2); const intRate = R * k + R2 * (n - k) + X - P0; return `<p><b>Exemplu:</b> credit de 40.000 lei la 9% pe 5 ani; după 12 luni rambursezi anticipat 10.000 lei.</p>${tbl(['Variantă', 'Rată', 'Dobândă totală', 'Economie'], [['Fără rambursare', fmt(R) + ' lei', fmt(intBase) + ' lei', '—'], ['Reduci perioada (' + nLeft + ' luni în loc de ' + (n - k) + ')', fmt(R) + ' lei', fmt(intPeriod) + ' lei', '<b>' + fmt(intBase - intPeriod) + ' lei</b>'], ['Reduci rata', fmt(R2) + ' lei', fmt(intRate) + ' lei', '<b>' + fmt(intBase - intRate) + ' lei</b>']])}`; })()}
<h2>Când nu merită</h2>
<ul><li>Dacă rămâi fără fond de urgență. Păstrează cel puțin 3 luni de cheltuieli deoparte.</li>
<li>Dacă dobânda creditului e mai mică decât randamentul sigur pe care l-ai obține din banii respectivi, de exemplu din titluri de stat.</li></ul>
${cta('refinantare-credit-nevoi-personale', 'Sau calculează dacă merită refinanțarea')}`,
      faq: [
        ['Cât costă rambursarea anticipată la un credit de nevoi personale?', 'La dobânda variabilă nu se plătește comision. La dobânda fixă, cel mult 1% din suma rambursată dacă mai sunt peste 12 luni până la final, sau 0,5% dacă sunt mai puțin.'],
        ['Se plătește comision la rambursarea anticipată a creditului ipotecar?', 'La dobânda variabilă, nu. În perioada cu dobândă fixă, banca poate cere o compensație prevăzută în contract; multe oferte actuale nu o percep.'],
        ['E mai bine să reduc rata sau perioada?', 'Reducerea perioadei economisește cea mai multă dobândă. Reducerea ratei îți ușurează bugetul lunar, dar economia totală e mai mică.']
      ]
    },
    {
      slug: 'card-de-credit-perioada-de-gratie', tag: 'Carduri', minutes: 4, date: '2026-11-19',
      title: 'Cardul de credit fără dobândă: cum folosești perioada de grație',
      desc: 'Cum funcționează perioada de grație la cardul de credit, cum eviți dobânda, capcana plății minime și de ce să nu scoți numerar de la ATM.',
      h1: `Cardul de credit fără dobândă: <em class="it">perioada de grație</em>`,
      blurb: 'Cum eviți dobânda și capcana plății minime.',
      body: () => `
<p class="lead">Un card de credit poate fi complet gratuit dacă îl folosești corect. Secretul e perioada de grație: intervalul în care nu plătești dobândă la cumpărături, dacă achiți integral suma până la scadență.</p>
<h2>Cum funcționează</h2>
<p>Cumperi în luna curentă, banca îți trimite extrasul la o dată fixă, iar tu ai timp până la data scadentă să plătești. În total, perioada de grație poate ajunge la <b>${Math.max(...D.creditCards.filter(c => c.grace).map(c => c.grace))} de zile</b> la unele carduri din România. Dacă plătești <b>tot</b> soldul până la scadență, nu plătești dobândă.</p>
${ad('top')}
<h2>Capcana plății minime</h2>
<p>Banca îți cere doar o plată minimă (de obicei câteva procente din sold). Dacă plătești doar atât, pentru restul se aplică dobânda cardului, care e mult mai mare decât la un credit de nevoi personale. DAE la cardurile de credit din comparator este între <b>${pc(Math.min(...D.creditCards.filter(c => c.dae).map(c => c.dae)))}</b> și <b>${pc(Math.max(...D.creditCards.filter(c => c.dae).map(c => c.dae)))}</b>.</p>
<h2>Nu scoate numerar de la ATM</h2>
<p>La retragerile de numerar nu există perioadă de grație: dobânda curge din prima zi, iar banca percepe și un comision, de obicei între 2% și 4%.</p>
<h2>Rate fără dobândă și cashback</h2>
<ul><li><b>Ratele fără dobândă</b> la parteneri sau „oriunde” îți împart o cumpărătură mare în 3–24 de rate egale, fără cost, dacă plătești fiecare rată la timp.</li>
<li><b>Cashback-ul și punctele</b> îți dau înapoi o parte din bani. Merită doar dacă plătești integral soldul; altfel dobânda anulează câștigul.</li></ul>
<h2>Regulile de aur</h2>
<ol><li>Setează plata automată a <b>întregului sold</b> din contul curent.</li><li>Nu cheltui mai mult decât poți plăti până la scadență.</li><li>Folosește cardul pentru rate fără dobândă și beneficii, nu ca împrumut pe termen lung.</li></ol>
${cta('carduri-de-credit', 'Compară cardurile de credit')}`,
      faq: [
        ['Ce este perioada de grație la cardul de credit?', 'Este intervalul în care nu plătești dobândă la cumpărături, dacă achiți integral suma până la data scadentă.'],
        ['Ce se întâmplă dacă plătesc doar suma minimă?', 'Pentru restul soldului se aplică dobânda cardului, care e mult mai mare decât la un credit de nevoi personale.'],
        ['Pot scoate bani de la ATM cu cardul de credit?', 'Poți, dar nu e recomandat: la numerar nu există perioadă de grație, dobânda curge din prima zi și se percepe un comision de 2–4%.']
      ]
    }
  ];
};
