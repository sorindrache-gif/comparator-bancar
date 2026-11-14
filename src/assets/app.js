(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var fmt=function(n){return Math.round(n).toLocaleString('ro-RO')};
  var pc=function(v){return v==null?'—':v.toFixed(2).replace('.',',')+'%'};
  function pmt(rate,n,P){var r=rate/100/12;return r?P*r/(1-Math.pow(1+r,-n)):P/n}
  var offers=[];try{offers=JSON.parse(($('#offers-json')||{}).textContent||'[]')}catch(e){}

  // ---- loan simulator + per-row estimated payment ----
  var sim=$('#sim');
  function updateRows(A,N){
    $$('.offer[data-rate]').forEach(function(o){
      var r=parseFloat(o.dataset.rate), max=parseFloat(o.dataset.max)||Infinity, el=$('.js-pmt',o), x=$('.js-pmtx',o);
      if(!el) return;
      if(isNaN(r)){el.textContent='—';return}
      if(A>max){el.textContent='—';el.classList.add('dim');if(x)x.textContent='peste suma maximă';return}
      el.classList.remove('dim');el.textContent=fmt(pmt(r,N,A));if(x)x.textContent='lei / lună';
    });
    $$('.js-scen').forEach(function(e){e.textContent=fmt(A)+' lei / '+N+' luni'});
  }
  if(sim){
    var a=$('#sAmt',sim),m=$('#sMon',sim);
    var run=function(){
      var A=+a.value,N=+m.value;
      $('#oAmt',sim).textContent=fmt(A)+' lei';
      $('#oMon',sim).textContent=N+' luni'+(N%12===0?' · '+(N/12)+' ani':'');
      var best=offers.filter(function(o){return o.rateMin!=null&&!o.stale&&(o.maxAmount==null||o.maxAmount>=A)&&(o.maxMonths==null||o.maxMonths>=N)})
        .map(function(o){return {o:o,r:pmt(o.rateMin,N,A)}}).sort(function(x,y){return x.r-y.r})[0];
      $('#rBig',sim).textContent=best?fmt(best.r)+' lei/lună':'—';
      $('#rDae',sim).textContent=best&&best.o.dae!=null?'DAE '+pc(best.o.dae):'—';
      $('#rWho',sim).textContent=best?best.o.bank+' · dobândă de la '+pc(best.o.rateMin):'Nicio ofertă cu date pentru suma aleasă.';
      updateRows(A,N);
    };
    a.addEventListener('input',run);m.addEventListener('input',run);run();
  }

  // ---- refinance calculator ----
  var rf=$('#refi');
  if(rf){
    var go=function(){
      var P=+$('#rSold',rf).value||0, cur=+$('#rRate',rf).value||0, n=+$('#rMon',rf).value||1, fee=+$('#rFee',rf).value||0, extra=+$('#rCost',rf).value||0;
      var now=pmt(cur,n,P);
      var best=offers.filter(function(o){return o.rateMin!=null&&!o.stale&&(o.maxAmount==null||o.maxAmount>=P)&&(o.maxMonths==null||o.maxMonths>=n)})
        .map(function(o){return {o:o,r:pmt(o.rateMin,n,P)}}).sort(function(x,y){return x.r-y.r})[0];
      $('#fNow',rf).textContent=fmt(now)+' lei';
      if(!best){$('#fNew',rf).textContent='—';$('#fSave',rf).textContent='—';$('#fWho',rf).textContent='Nicio ofertă disponibilă pentru suma și perioada introduse.';return}
      var monthly=now-best.r, total=monthly*n-(P*fee/100)-extra;
      $('#fNew',rf).textContent=fmt(best.r)+' lei';
      $('#fSave',rf).textContent=(total>0?'':'−')+fmt(Math.abs(total))+' lei';
      $('#fSave',rf).style.color=total>0?'':'#c2410c';
      $('#fWho',rf).textContent=(total>0?'Merită verificat: ':'Probabil nu merită acum: ')+best.o.bank+' are dobânda de la '+pc(best.o.rateMin)+'. Economie lunară estimată: '+fmt(Math.max(0,monthly))+' lei, după comisionul de rambursare anticipată și costurile introduse.';
    };
    $$('input',rf).forEach(function(i){i.addEventListener('input',go)});go();
  }

  // ---- simple rate calculator ----
  var cl=$('#calc');
  if(cl){
    var cg=function(){
      var P=+$('#cAmt',cl).value||0,r=+$('#cRate',cl).value||0,n=+$('#cMon',cl).value||1,p=pmt(r,n,P);
      $('#cPay',cl).textContent=fmt(p)+' lei/lună';$('#cTot',cl).textContent=fmt(p*n)+' lei';$('#cInt',cl).textContent=fmt(p*n-P)+' lei';
    };
    $$('input',cl).forEach(function(i){i.addEventListener('input',cg)});cg();
  }

  // ---- list sorting / filtering ----
  $$('[data-list]').forEach(function(box){
    var list=$('.rows,.cgrid',box); if(!list) return;
    var items=$$('[data-item]',list), ad=$('.ad-inlist',list);
    var st={sort:box.dataset.sort||'',dir:1,q:'',flags:{},bens:{}};
    function val(el,k){var v=el.dataset[k];if(v===undefined||v==='')return null;var f=parseFloat(v);return isNaN(f)?v:f}
    function apply(){
      var vis=items.filter(function(el){
        if(st.q&&el.dataset.text.indexOf(st.q)<0)return false;
        for(var f in st.flags){if(st.flags[f]&&el.dataset[f]!=='1')return false}
        for(var b in st.bens){if(st.bens[b]&&(' '+el.dataset.bens+' ').indexOf(' '+b+' ')<0)return false}
        return true});
      if(st.sort){vis.sort(function(x,y){
        if(st.sort!=='bank'&&x.dataset.stale!==y.dataset.stale)return x.dataset.stale==='1'?1:-1;
        var a=val(x,st.sort),b=val(y,st.sort);
        if(a==null&&b==null)return 0;if(a==null)return 1;if(b==null)return -1;
        return (typeof a==='string'?a.localeCompare(b,'ro'):a-b)*st.dir})}
      items.forEach(function(el){el.hidden=vis.indexOf(el)<0});
      vis.forEach(function(el,i){list.appendChild(el);if(ad&&i===3)list.appendChild(ad)});
      if(ad&&vis.length<=3)list.appendChild(ad);
      var em=$('.js-empty',box);if(em)em.hidden=vis.length>0;
    }
    $$('[data-sort-key]',box).forEach(function(c){c.addEventListener('click',function(){
      var k=c.dataset.sortKey;if(st.sort===k)st.dir*=-1;else{st.sort=k;st.dir=1}
      $$('[data-sort-key]',box).forEach(function(o){o.setAttribute('aria-pressed',o===c);o.querySelector('i').textContent=o===c?(st.dir>0?' ↑':' ↓'):''});apply()})});
    $$('[data-flag]',box).forEach(function(c){c.addEventListener('click',function(){var f=c.dataset.flag;st.flags[f]=!st.flags[f];c.setAttribute('aria-pressed',!!st.flags[f]);apply()})});
    $$('[data-ben]',box).forEach(function(c){c.addEventListener('click',function(){var b=c.dataset.ben;st.bens[b]=!st.bens[b];c.setAttribute('aria-pressed',!!st.bens[b]);apply()})});
    var q=$('.js-q',box);if(q)q.addEventListener('input',function(){st.q=q.value.toLowerCase().trim();apply()});
  });

  // ---- adsense push ----
  if(window.adsbygoogle!==undefined||$('ins.adsbygoogle')){$$('ins.adsbygoogle').forEach(function(){try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}})}
})();
