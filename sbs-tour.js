/* ===========================================================
   SBS — Tour de 1º acesso (coach-marks)
   No primeiro login de cada pessoa, em cada plataforma, destaca
   item por item do menu explicando o que cada um faz. Guarda
   "visto" por usuário+plataforma (localStorage), então só aparece
   uma vez — e pode ser reaberto pelo botão de ajuda.

   Carregar DEPOIS dos cores (precisa da nav já montada e da sessão).
   API: SBS_TOUR.start(force) · SBS_TOUR.reset()
   =========================================================== */
(function(){
  function plat(){
    var m=document.querySelector('meta[name="sbs-platform"]');
    if(m&&m.content) return m.content.toLowerCase();
    return (document.title||"painel").toLowerCase().replace(/[^a-z]+/g,"-").slice(0,24);
  }
  function email(){
    var cands=[
      window.TI&&TI.session, window.CEO&&CEO.session, window.MKT&&MKT.session,
      window.PD&&PD.session, window.RH&&RH.session, window.MI&&MI.session,
      window.ATEND&&ATEND.session, window.PANEL&&window.PANEL.session,
      window.DATA&&window.DATA.user, window.COL&&COL.session
    ];
    for(var i=0;i<cands.length;i++){ var s=cands[i]; if(s&&(s.email||s.mail)) return (s.email||s.mail).toLowerCase(); }
    return "";
  }
  function appVisible(){
    var a=document.getElementById("app");
    if(a) return !a.classList.contains("hidden") && a.offsetParent!==null;
    // apps de campo (Vendedor/Colaborador) não têm #app
    return !!document.querySelector(".bottomnav, #screen, .home");
  }
  function navItems(){
    var sels=["#nav [data-nav]","#nav .nav-item",".sb-nav [data-nav]",".sb-nav a","#nav a",
              ".bottomnav [data-tab]"];
    for(var i=0;i<sels.length;i++){
      var els=[].slice.call(document.querySelectorAll(sels[i]))
        .filter(function(e){ return e.offsetParent!==null && (e.textContent||"").trim().length; });
      if(els.length>=2) return els;
    }
    return [];
  }
  function key(){ return "sbs_tour_done:"+plat()+":"+(email()||"anon"); }
  function done(){ try{ return localStorage.getItem(key())==="1"; }catch(e){ return false; } }
  function markDone(){ try{ localStorage.setItem(key(),"1"); }catch(e){} }

  /* ---------- UI ---------- */
  var ST=null;
  function ensureCss(){
    if(document.getElementById("sbs-tour-css")) return;
    var s=document.createElement("style"); s.id="sbs-tour-css";
    s.textContent=
    "#sbs-tour-veil{position:fixed;inset:0;z-index:100040;background:rgba(8,16,12,.55);transition:opacity .2s}"+
    "#sbs-tour-hole{position:fixed;z-index:100041;border-radius:12px;box-shadow:0 0 0 4px #6FA331,0 0 0 9999px rgba(8,16,12,.55);transition:all .25s ease;pointer-events:none}"+
    "#sbs-tour-pop{position:fixed;z-index:100042;width:min(320px,86vw);background:#fff;border-radius:16px;padding:18px 18px 16px;box-shadow:0 24px 60px rgba(0,0,0,.34);font-family:'Plus Jakarta Sans',system-ui,sans-serif;transition:all .25s ease}"+
    "#sbs-tour-pop .tt-step{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6FA331;margin-bottom:6px}"+
    "#sbs-tour-pop h4{margin:0 0 6px;font-size:17px;font-weight:800;color:#16201a;line-height:1.2}"+
    "#sbs-tour-pop p{margin:0;font-size:13.5px;line-height:1.5;color:#51605a}"+
    "#sbs-tour-pop .tt-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px}"+
    "#sbs-tour-pop .tt-dots{display:flex;gap:4px;flex-wrap:wrap;max-width:140px}"+
    "#sbs-tour-pop .tt-dot{width:6px;height:6px;border-radius:50%;background:#d7e0da}"+
    "#sbs-tour-pop .tt-dot.on{background:#0B6B61}"+
    "#sbs-tour-pop .tt-btns{display:flex;gap:8px}"+
    "#sbs-tour-pop button{border:0;border-radius:9px;font:800 13px/1 inherit;padding:9px 14px;cursor:pointer}"+
    "#sbs-tour-pop .tt-next{background:#0B6B61;color:#fff}"+
    "#sbs-tour-pop .tt-prev{background:#eef2ef;color:#51605a}"+
    "#sbs-tour-pop .tt-skip{background:none;color:#9aa6a1;font-weight:700;padding:9px 6px}";
    document.head.appendChild(s);
  }

  function intro(items, onStart){
    ensureCss();
    var veil=document.createElement("div"); veil.id="sbs-tour-veil"; document.body.appendChild(veil);
    var pop=document.createElement("div"); pop.id="sbs-tour-pop";
    pop.style.left="50%"; pop.style.top="50%"; pop.style.transform="translate(-50%,-50%)"; pop.style.width="min(380px,90vw)";
    var nome=(email()||"").split("@")[0].split(/[._]/)[0]; nome=nome?nome.charAt(0).toUpperCase()+nome.slice(1):"";
    pop.innerHTML=
      '<div class="tt-step">Bem-vindo(a)'+(nome?", "+nome:"")+'</div>'+
      '<h4>Vamos conhecer este painel?</h4>'+
      '<p>Em 1 minuto eu te mostro, item por item, para que serve cada parte do menu. Você pode pular quando quiser e rever depois no botão de ajuda (?).</p>'+
      '<div class="tt-row" style="justify-content:flex-end">'+
        '<button class="tt-skip" id="tt-skip">Pular</button>'+
        '<button class="tt-next" id="tt-go">Começar tour</button>'+
      '</div>';
    document.body.appendChild(pop);
    pop.querySelector("#tt-go").onclick=function(){ veil.remove(); pop.remove(); onStart(); };
    pop.querySelector("#tt-skip").onclick=function(){ veil.remove(); pop.remove(); markDone(); };
  }

  function run(items){
    ensureCss();
    var i=0;
    var veil=document.createElement("div"); veil.id="sbs-tour-veil";
    var hole=document.createElement("div"); hole.id="sbs-tour-hole";
    var pop=document.createElement("div"); pop.id="sbs-tour-pop";
    document.body.appendChild(veil); document.body.appendChild(hole); document.body.appendChild(pop);
    veil.addEventListener("click", finish);

    function label(el){ return (el.textContent||"").replace(/\s+/g," ").trim().replace(/^\d+\s*/,""); }
    function step(){
      var el=items[i]; if(!el){ finish(); return; }
      try{ el.scrollIntoView&&el.scrollIntoView({block:"nearest"}); }catch(e){}
      var r=el.getBoundingClientRect();
      var pad=6;
      hole.style.left=(r.left-pad)+"px"; hole.style.top=(r.top-pad)+"px";
      hole.style.width=(r.width+pad*2)+"px"; hole.style.height=(r.height+pad*2)+"px";
      // posiciona o pop à direita do item (ou abaixo se não couber)
      var pw=Math.min(320, window.innerWidth*0.86), gap=16;
      var left=r.right+gap, top=Math.max(12, Math.min(r.top, window.innerHeight-200));
      if(left+pw>window.innerWidth-12){ left=Math.max(12, r.left); top=r.bottom+gap; }
      pop.style.left=left+"px"; pop.style.top=top+"px"; pop.style.transform="none";
      var dots=items.map(function(_,k){ return '<span class="tt-dot'+(k===i?" on":"")+'"></span>'; }).join("");
      pop.innerHTML=
        '<div class="tt-step">Passo '+(i+1)+' de '+items.length+'</div>'+
        '<h4>'+esc(label(el))+'</h4>'+
        '<p>'+esc(desc(el))+'</p>'+
        '<div class="tt-row">'+
          '<div class="tt-dots">'+dots+'</div>'+
          '<div class="tt-btns">'+
            (i>0?'<button class="tt-prev" id="tt-prev">Voltar</button>':'')+
            '<button class="tt-next" id="tt-next">'+(i===items.length-1?"Concluir":"Próximo")+'</button>'+
          '</div>'+
        '</div>'+
        '<div style="text-align:right"><button class="tt-skip" id="tt-skip2" style="margin-top:6px">Pular tour</button></div>';
      var n=pop.querySelector("#tt-next"); n&&(n.onclick=function(){ i++; step(); });
      var p=pop.querySelector("#tt-prev"); p&&(p.onclick=function(){ i=Math.max(0,i-1); step(); });
      var sk=pop.querySelector("#tt-skip2"); sk&&(sk.onclick=finish);
    }
    function finish(){ veil.remove(); hole.remove(); pop.remove(); markDone(); }
    step();
  }

  function esc(s){ return (s||"").replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

  // descrição amigável: tenta a Central de Ajuda (SBS_DOCS) pelo id da nav
  function desc(el){
    var id=el.getAttribute&&(el.getAttribute("data-nav")||el.getAttribute("data-tab")||el.getAttribute("data-mod"));
    try{
      var docs=window.SBS_DOCS&&SBS_DOCS.plataformas&&SBS_DOCS.plataformas[plat()];
      if(docs&&id){
        var grupos=docs.grupos||(docs.itens?[{itens:docs.itens}]:[]);
        for(var g=0;g<grupos.length;g++){ var it=(grupos[g].itens||[]).find(function(x){ return x.id===id; }); if(it&&it.resumo) return it.resumo; }
      }
    }catch(e){}
    return "Abra para usar esta área. No botão de ajuda (?) há o passo a passo completo.";
  }

  function maybeStart(force){
    var items=navItems();
    if(!items.length) return false;
    if(force){ run(items); return true; }
    if(done()) return false;
    intro(items, function(){ run(navItems()); });
    return true;
  }

  // auto: espera o app aparecer e a nav montar
  var tries=0;
  function poll(){
    tries++;
    if(appVisible() && navItems().length && !document.getElementById("sbs-pw-ov")){ maybeStart(false); return; }
    if(tries<60) setTimeout(poll, 700);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(poll,900); });
  else setTimeout(poll,900);

  window.SBS_TOUR = { start:function(){ maybeStart(true); }, reset:function(){ try{ localStorage.removeItem(key()); }catch(e){} }, _items:navItems };
})();
