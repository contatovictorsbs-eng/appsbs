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

  // Apps de campo (Vendedor / Colaborador) NÃO mostram nada de ambiente.
  var _p = ""; try{ _p = decodeURIComponent(location.pathname||"").toLowerCase(); }catch(e){ _p=(location.pathname||"").toLowerCase(); }
  var _plat = ""; try{ var mp=document.querySelector('meta[name="sbs-platform"]'); _plat=(mp&&mp.content||"").toLowerCase(); }catch(e){}
  var isApp = /portal do (vendedor|colaborador)/.test(_p) || /vendedor|colaborador/.test(_plat);

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

  // ---- faixa visível de homologação (nunca nos apps de campo) ----
  if(isH && !isApp){
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

  // ---- seletor de ambiente DENTRO de cada painel (fácil de trocar) ----
  // Aparece em todas as plataformas (não no hub). Mostra o ambiente atual
  // e troca com 1 clique. Confirma antes de entrar/sair para evitar engano.
  (function(){
    var path = (location.pathname||"").toLowerCase();
    var isHub = /(^|\/)(index\.html)?$/.test(path);   // "/", "/index.html"
    if(isHub || isApp) return;

    function injetar(){
      if(document.getElementById("sbs-env-switch")) return;
      var narrow = window.innerWidth < 560;
      // sobe o pill acima de bottom-navs em telas estreitas (apps)
      var bottom = narrow ? 84 : 16;

      var st = document.createElement("style");
      st.textContent =
        '#sbs-env-switch{position:fixed;left:14px;bottom:'+bottom+'px;z-index:99990;'+
        'display:flex;align-items:center;gap:9px;background:#fff;border-radius:999px;'+
        'padding:7px 8px 7px 14px;box-shadow:0 8px 26px rgba(0,0,0,.22);'+
        'border:1px solid rgba(0,0,0,.06);font:600 12.5px/1 "Plus Jakarta Sans",system-ui,sans-serif}'+
        '#sbs-env-switch .se-dot{width:9px;height:9px;border-radius:50%;flex:none}'+
        '#sbs-env-switch.prod .se-dot{background:#2fa36b;box-shadow:0 0 0 3px rgba(47,163,107,.18)}'+
        '#sbs-env-switch.hml  .se-dot{background:#e08a1e;box-shadow:0 0 0 3px rgba(224,138,30,.22)}'+
        '#sbs-env-switch .se-lbl{color:#16201a;white-space:nowrap}'+
        '#sbs-env-switch .se-lbl b{font-weight:800}'+
        '#sbs-env-switch.prod .se-lbl b{color:#1f8a5b}'+
        '#sbs-env-switch.hml  .se-lbl b{color:#b9791e}'+
        '#sbs-env-switch .se-go{border:0;cursor:pointer;font:800 11.5px/1 inherit;color:#fff;'+
        'padding:7px 12px;border-radius:999px;white-space:nowrap}'+
        '#sbs-env-switch.prod .se-go{background:#b9791e}'+
        '#sbs-env-switch.hml  .se-go{background:#0B6B61}'+
        '#sbs-env-switch .se-go:hover{filter:brightness(1.06)}'+
        '#sbs-env-switch .se-min{border:0;background:transparent;cursor:pointer;color:#9aa6a1;'+
        'font:800 14px/1 inherit;padding:2px 4px}'+
        '#sbs-env-dot{position:fixed;left:14px;bottom:'+bottom+'px;z-index:99990;width:36px;height:36px;'+
        'border-radius:50%;border:1px solid rgba(0,0,0,.06);box-shadow:0 8px 22px rgba(0,0,0,.22);'+
        'cursor:pointer;display:none;align-items:center;justify-content:center;background:#fff}'+
        '#sbs-env-dot .se-dot{width:11px;height:11px;border-radius:50%}'+
        '#sbs-env-dot.prod .se-dot{background:#2fa36b}'+
        '#sbs-env-dot.hml  .se-dot{background:#e08a1e}';
      document.head.appendChild(st);

      var E = window.SBS_ENV;
      var hml = E.isHomolog;

      // pill recolhido (só uma bolinha) — começa recolhido p/ não cobrir o menu
      var collapsed=true; try{ if(localStorage.getItem("sbs_env_pill2")==="open") collapsed=false; }catch(e){}

      var pill = document.createElement("div");
      pill.id = "sbs-env-switch";
      pill.className = hml ? "hml" : "prod";
      pill.innerHTML =
        '<span class="se-dot"></span>'+
        '<span class="se-lbl">Ambiente: <b>'+(hml?"Homologação":"Produção")+'</b></span>'+
        '<button class="se-go">'+(hml?"Voltar à Produção":"Testar (homologação)")+'</button>'+
        '<button class="se-min" title="Recolher">–</button>';

      var dot = document.createElement("div");
      dot.id = "sbs-env-dot";
      dot.className = hml ? "hml" : "prod";
      dot.title = "Ambiente: "+(hml?"Homologação":"Produção")+" — clique para abrir";
      dot.innerHTML = '<span class="se-dot"></span>';

      document.body.appendChild(pill);
      document.body.appendChild(dot);

      function setCollapsed(v, persist){
        collapsed=v;
        pill.style.display = v ? "none" : "flex";
        dot.style.display  = v ? "flex" : "none";
        if(persist){ try{ localStorage.setItem("sbs_env_pill2", v?"min":"open"); }catch(e){} }
      }
      setCollapsed(collapsed, false);

      pill.querySelector(".se-min").onclick = function(){ setCollapsed(true, true); };
      dot.onclick = function(){ setCollapsed(false, true); };

      pill.querySelector(".se-go").onclick = function(){
        if(hml){
          if(confirm("Sair da Homologação e voltar para a PRODUÇÃO (dados reais)?")) E.sairHomolog();
        } else {
          if(confirm("Entrar na HOMOLOGAÇÃO?\n\nÉ um ambiente de testes — nada do que você fizer aqui afeta a produção. Dá para voltar a qualquer momento."))
            E.entrarHomolog();
        }
      };
    }

    if(document.body) injetar();
    else document.addEventListener("DOMContentLoaded", injetar);
  })();
})();
