/* ===========================================================
   SBS — Controle de Plataformas (gerido pela T.I.)
   -----------------------------------------------------------
   Permite ao Painel de T.I. ligar/desligar cada plataforma do
   sistema. Quando uma plataforma é desligada, ela exibe uma tela
   de "em manutenção" para os usuários, em tempo real (via nuvem).

   • Estado na nuvem: coleção "plataformas" = [{id,nome,enabled}].
   • Cada página declara a sua via <meta name="sbs-platform" ...>.
   • O Painel de T.I. NUNCA se bloqueia (precisa religar as outras).
   =========================================================== */
window.SBS_PLAT = (function(){
  var DEFAULTS = [
    { id:"vendedor",  nome:"Portal do Vendedor", enabled:true },
    { id:"gerencial", nome:"Painel Gerencial",   enabled:true },
    { id:"ti",        nome:"Painel de T.I.",      enabled:true },
    { id:"ceo",       nome:"Painel do CEO",       enabled:true },
    { id:"atendimento", nome:"Central de Atendimento", enabled:true },
    { id:"marketing", nome:"Painel de Marketing",  enabled:true },
    { id:"pd",        nome:"Painel de P&D / Inovação", enabled:true },
    { id:"rh",        nome:"Painel de RH",          enabled:true },
    { id:"colaborador", nome:"Portal do Colaborador", enabled:true },
  ];
  function S(){ return window.SBSStore; }

  function ensureSeed(){
    if(!S()) return;
    var cur = S().getCol("plataformas");
    if(!cur || !cur.length){ S().setCol("plataformas", DEFAULTS.map(function(p){ return Object.assign({}, p); })); return; }
    var have = {}; cur.forEach(function(p){ have[p.id]=true; });
    var add = DEFAULTS.filter(function(p){ return !have[p.id]; });
    if(add.length) S().setCol("plataformas", cur.concat(add.map(function(p){ return Object.assign({}, p); })));
  }
  function list(){ var c = S() && S().getCol("plataformas"); return (c && c.length) ? c : DEFAULTS; }
  function isEnabled(id){ var p = list().find(function(x){ return x.id===id; }); return p ? p.enabled!==false : true; }
  function setEnabled(id, on){
    var arr = list().map(function(p){ return Object.assign({}, p); });
    var i = arr.findIndex(function(p){ return p.id===id; });
    if(i<0) return;
    arr[i].enabled = !!on;
    S().setCol("plataformas", arr);
  }

  function injectCss(){
    if(document.getElementById("sbs-plat-css")) return;
    var st = document.createElement("style"); st.id="sbs-plat-css";
    st.textContent = '#sbs-plat-lock{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;'+
      'background:linear-gradient(160deg,#0e1f1b,#13241f);color:#fff;font-family:"Plus Jakarta Sans",system-ui,sans-serif;padding:30px;text-align:center}'+
      '#sbs-plat-lock .box{max-width:420px}'+
      '#sbs-plat-lock .ic{width:74px;height:74px;border-radius:22px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 22px}'+
      '#sbs-plat-lock .ic svg{width:34px;height:34px;stroke:#C7A24A}'+
      '#sbs-plat-lock h1{font-size:23px;font-weight:800;margin:0 0 10px}'+
      '#sbs-plat-lock p{font-size:14.5px;line-height:1.55;color:#9ab3a9;margin:0}'+
      '#sbs-plat-lock .tag{display:inline-block;margin-top:20px;font-size:12px;font-weight:700;color:#C7A24A;background:rgba(199,162,74,.12);padding:7px 14px;border-radius:30px}';
    document.head.appendChild(st);
  }
  function showLock(nome){
    injectCss();
    var el = document.getElementById("sbs-plat-lock");
    if(!el){
      el = document.createElement("div"); el.id="sbs-plat-lock";
      el.innerHTML = '<div class="box">'+
        '<div class="ic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>'+
        '<h1>'+(nome||"Plataforma")+' em manutenção</h1>'+
        '<p>Esta plataforma está temporariamente indisponível. A equipe de Tecnologia está trabalhando e ela volta em instantes.</p>'+
        '<div class="tag">SBS Green Seeds · T.I.</div>'+
      '</div>';
      document.body.appendChild(el);
    }
  }
  function hideLock(){ var el=document.getElementById("sbs-plat-lock"); if(el) el.remove(); }

  function gate(id, nome){
    if(id==="ti") { hideLock(); return true; }   // T.I. nunca se bloqueia
    var ok = isEnabled(id);
    if(ok) hideLock(); else showLock(nome);
    return ok;
  }

  function guard(id, nome){
    ensureSeed();
    gate(id, nome);
    if(S()) S().onChange(function(d){ if(d && (d.hydrate || d.key==="plataformas")) gate(id, nome); });
  }

  // auto-init pela meta tag <meta name="sbs-platform" content="vendedor">
  function autoInit(){
    var m = document.querySelector('meta[name="sbs-platform"]');
    if(!m) return;
    var id = m.getAttribute("content");
    var nome = (DEFAULTS.find(function(p){return p.id===id;})||{}).nome || "Plataforma";
    guard(id, nome);
  }
  if(document.readyState!=="loading") setTimeout(autoInit, 0);
  else document.addEventListener("DOMContentLoaded", autoInit);

  return { DEFAULTS, ensureSeed, list, isEnabled, setEnabled, guard, gate, autoInit };
})();
