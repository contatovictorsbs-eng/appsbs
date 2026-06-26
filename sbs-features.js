/* ===========================================================
   SBS — Feature Flags & Versão do Sistema
   -----------------------------------------------------------
   Camada de "liberação de funcionalidades" controlada pela T.I.
   pelo Painel de T.I. (SBS Painel T.I.html). As chaves vivem na
   nuvem (Supabase, coleção "features") e sincronizam em tempo
   real com TODOS os aparelhos — ligar/desligar uma feature NÃO
   exige republicar o app.

   Modelo de cada feature:
     { id, label, grupo, icon, enabled, perfis:["todos"]|[papel...],
       desc, atualizadoEm, atualizadoPor }

   • id  → casa com o data-go / id de tela do app (ex.: "frete").
   • Se um id NÃO está na lista → é considerado LIBERADO (default on).
   • Núcleo sempre liberado: home, notificacoes, config, menu.
   =========================================================== */
(function(){
  const CORE = ["home","notificacoes","config","menu","dashboard","precos"];
  const VERSION_FALLBACK = "2.0.0";

  /* ---- catálogo padrão das features controláveis ---- */
  const DEFAULTS = [
    // Vendas & Pedidos
    { id:"aprovacoes",      label:"Aprovações de Desconto",  grupo:"Vendas & Pedidos", icon:"badge-check" },
    { id:"comissao",        label:"Comissão",                grupo:"Vendas & Pedidos", icon:"percent" },
    { id:"projecao",        label:"Projeção de Trabalho",    grupo:"Vendas & Pedidos", icon:"calendar-check" },
    { id:"plano",           label:"Plano de Ação",           grupo:"Vendas & Pedidos", icon:"target" },
    { id:"perdas",          label:"Perdas de Pedidos",       grupo:"Vendas & Pedidos", icon:"trending-down" },
    // Atendimento
    { id:"reclamacao",      label:"Reclamações",             grupo:"Atendimento", icon:"message-square-warning" },
    { id:"protocoloPastagem", label:"Protocolo Renovação de Pastagem", grupo:"Atendimento", icon:"sprout" },
    { id:"chamado",         label:"Chamado Interno",         grupo:"Atendimento", icon:"life-buoy" },
    // Conteúdo
    { id:"campanhas",       label:"Campanhas",               grupo:"Conteúdo", icon:"megaphone" },
    { id:"treinamentos",    label:"Treinamentos",            grupo:"Conteúdo", icon:"graduation-cap" },
    { id:"materiais",       label:"Materiais Técnicos",      grupo:"Conteúdo", icon:"folder-open" },
    { id:"marketing",       label:"Marketing",               grupo:"Conteúdo", icon:"image" },
    { id:"comercial",       label:"Política Comercial",      grupo:"Conteúdo", icon:"scroll-text" },
    { id:"credito",         label:"Política de Crédito",     grupo:"Conteúdo", icon:"landmark" },
    // Ferramentas
    { id:"frete",           label:"Calculadora de Frete",    grupo:"Ferramentas", icon:"truck" },
    { id:"cargas",          label:"Consulta de Carga",       grupo:"Ferramentas", icon:"package-search" },
    { id:"ranking",         label:"Ranking & Gamificação",   grupo:"Ferramentas", icon:"trophy" },
    { id:"clientes",        label:"Clientes & Rotas",        grupo:"Ferramentas", icon:"route" },
    { id:"visitas",         label:"Relatório de Visitas",    grupo:"Ferramentas", icon:"map-pinned" },
    { id:"rastreamento",    label:"Rastreamento de Localização", grupo:"Ferramentas", icon:"navigation" },
  ];

  function store(){ return window.SBSStore; }

  /* ---- seed (só popula se a nuvem/local ainda não tem) ---- */
  function ensureSeed(){
    const S = store(); if(!S) return;
    const cur = S.getCol("features");
    if(!cur || !cur.length){
      const now = S.today();
      S.setCol("features", DEFAULTS.map(f=>({
        enabled:true, perfis:["todos"], desc:"", atualizadoEm:now, atualizadoPor:"sistema", ...f
      })));
    } else {
      // garante que novas features do catálogo apareçam sem apagar o que a T.I. já configurou
      const have = new Set(cur.map(f=>f.id));
      const add = DEFAULTS.filter(f=>!have.has(f.id));
      if(add.length){
        const now = S.today();
        S.setCol("features", cur.concat(add.map(f=>({ enabled:true, perfis:["todos"], desc:"", atualizadoEm:now, atualizadoPor:"sistema", ...f }))));
      }
    }
    if(S.get("sistema_meta")==null){
      S.set("sistema_meta", { versao:VERSION_FALLBACK, atualizadoEm:S.today() });
    }
  }

  function list(){ const S=store(); return S ? (S.getCol("features")||[]) : []; }
  function find(id){ return list().find(f=>f.id===id); }

  /* ---- a feature está liberada para este usuário? ---- */
  function enabled(id, papel){
    if(CORE.includes(id)) return true;
    const f = find(id);
    if(!f) return true;               // não controlada → liberada
    if(!f.enabled) return false;      // desligada pela T.I.
    const perfis = f.perfis||["todos"];
    if(perfis.includes("todos") || !perfis.length) return true;
    const p = papel || (window.DATA && window.DATA.user && window.DATA.user.papel) || "";
    return perfis.includes(p);
  }

  /* ---- esconde do menu/home os itens desligados ---- */
  function gateAll(scope){
    const root = scope || document;
    root.querySelectorAll("[data-go]").forEach(el=>{
      const id = el.getAttribute("data-go");
      el.style.display = enabled(id) ? "" : "none";
    });
    // bottom nav usa data-tab
    root.querySelectorAll(".bottomnav [data-tab]").forEach(el=>{
      const id = el.getAttribute("data-tab");
      if(id==="menu"||id==="home") return;
      el.style.display = enabled(id) ? "" : "none";
    });
  }

  /* ---- versão visível do sistema ---- */
  function versao(){
    const S=store(); const m = S && S.get("sistema_meta");
    return (m && m.versao) || VERSION_FALLBACK;
  }

  window.SBS_FEATURES = { ensureSeed, list, find, enabled, gateAll, versao, DEFAULTS, CORE };

  // semeia assim que a store existir
  if(window.SBSStore) ensureSeed();
})();
