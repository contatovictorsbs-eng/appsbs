/* ===========================================================
   SBS — Ambiente (Produção × Homologação)   ·  custo zero
   -----------------------------------------------------------
   Permite rodar O MESMO sistema em um sandbox de HOMOLOGAÇÃO
   cujos dados ficam ISOLADOS da produção, dentro do mesmo
   Supabase (sem criar projeto/infra novo).

   Como funciona:
     • Produção  → namespace local "sbsdb:"  | chaves de nuvem sem prefixo
     • Homolog.  → namespace local "sbsdbh:" | chaves de nuvem com "hml:"
     Assim os dois conjuntos de dados NUNCA se misturam.

   Como entra em homologação (qualquer um destes):
     • Hostname de teste do Netlify (deploy-preview / branch "homolog")
     • URL com ?env=homolog
     • Botão "Entrar na Homologação" (guarda a escolha no aparelho)

   DEVE ser carregado ANTES de sbs-store.js e sbs-cloud.js.
   =========================================================== */
(function(){
  function detectar(){
    try{
      var qs = new URLSearchParams(location.search);
      if(qs.get("env")==="homolog") { try{ localStorage.setItem("sbs_env","homolog"); }catch(e){} return "homolog"; }
      if(qs.get("env")==="prod")    { try{ localStorage.removeItem("sbs_env"); }catch(e){} return "prod"; }
    }catch(e){}
    var h = (location.hostname||"").toLowerCase();
    // Netlify: previews de PR e branch deploys têm host característico
    if(/homolog|hml|staging|deploy-preview|--/.test(h)) return "homolog";
    try{ if(localStorage.getItem("sbs_env")==="homolog") return "homolog"; }catch(e){}
    return "prod";
  }

  var mode = detectar();
  var isH  = mode==="homolog";

  window.SBS_ENV = {
    mode: mode,
    isHomolog: isH,
    label: isH ? "HOMOLOGAÇÃO" : "PRODUÇÃO",
    ns: isH ? "sbsdbh:" : "sbsdb:",        // namespace do localStorage
    cloudPrefix: isH ? "hml:" : "",         // prefixo das chaves na nuvem
    // está no escopo deste ambiente? (filtra linhas da nuvem)
    inScope: function(cloudKey){
      var p = this.cloudPrefix;
      if(p) return cloudKey.indexOf(p)===0;
      return cloudKey.indexOf("hml:")!==0;   // produção ignora linhas de homolog
    },
    toCloudKey:  function(storeKey){ return this.cloudPrefix + storeKey; },
    toStoreKey:  function(cloudKey){ return this.cloudPrefix ? cloudKey.slice(this.cloudPrefix.length) : cloudKey; },
    entrarHomolog: function(){ try{ localStorage.setItem("sbs_env","homolog"); }catch(e){} location.reload(); },
    sairHomolog:   function(){ try{ localStorage.removeItem("sbs_env"); }catch(e){} var u=location.origin+location.pathname; location.href=u; }
  };

  // ---- faixa visível de homologação ----
  if(isH){
    function barra(){
      if(document.getElementById("sbs-homolog-bar")) return;
      var b = document.createElement("div");
      b.id = "sbs-homolog-bar";
      b.innerHTML =
        '<span class="hb-dot"></span>'+
        '<b>HOMOLOGAÇÃO</b> · ambiente de testes — os dados aqui NÃO afetam a produção'+
        '<button id="sbs-homolog-exit">Sair</button>';
      var s = document.createElement("style");
      s.textContent =
        '#sbs-homolog-bar{position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;gap:10px;'+
        'justify-content:center;background:repeating-linear-gradient(45deg,#7a4a00,#7a4a00 14px,#8a5600 14px,#8a5600 28px);'+
        'color:#fff;font:600 12.5px/1 "Plus Jakarta Sans",system-ui,sans-serif;padding:7px 14px;letter-spacing:.2px;'+
        'box-shadow:0 2px 10px rgba(0,0,0,.25)}'+
        '#sbs-homolog-bar b{letter-spacing:.6px}'+
        '#sbs-homolog-bar .hb-dot{width:9px;height:9px;border-radius:50%;background:#ffd479;box-shadow:0 0 0 3px rgba(255,212,121,.3);animation:hbp 1.4s infinite}'+
        '@keyframes hbp{50%{opacity:.4}}'+
        '#sbs-homolog-exit{margin-left:8px;border:1px solid rgba(255,255,255,.6);background:rgba(0,0,0,.18);color:#fff;'+
        'font:600 11.5px/1 inherit;padding:5px 10px;border-radius:7px;cursor:pointer}'+
        '#sbs-homolog-exit:hover{background:rgba(0,0,0,.35)}'+
        'body{padding-top:30px!important}';
      document.head.appendChild(s);
      (document.body||document.documentElement).appendChild(b);
      var x = document.getElementById("sbs-homolog-exit");
      x && (x.onclick = function(){ window.SBS_ENV.sairHomolog(); });
    }
    if(document.body) barra();
    else document.addEventListener("DOMContentLoaded", barra);
  }
})();
