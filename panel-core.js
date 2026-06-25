/* ===========================================================
   SBS Painel — core: login, perfis, navegação, router, helpers
   =========================================================== */
const PANEL = (function(){
  const S = window.SBSStore;

  /* ---------- perfis e permissões ---------- */
  // módulos que cada perfil enxerga (admin vê tudo)
  const PERMS = {
    "Administrador":          ["overview","indicadores","usabilidade","acompanhamento","rotas","projecoes","perdas","aprovacoes","precos","campanhas","materiais","marketing","treinamentos","notificacoes","gamificacao","vendedores","novos","usuarios","reclamacoes","chamados","visitas","pedidos"],
    "Comercial / Coordenador":["overview","indicadores","usabilidade","acompanhamento","rotas","projecoes","perdas","aprovacoes","precos","campanhas","materiais","marketing","treinamentos","notificacoes","gamificacao","vendedores","novos","reclamacoes","visitas","pedidos"],
    "Crédito e Cobrança":     ["overview","indicadores","pedidos","chamados","reclamacoes"],
    "Marketing":              ["overview","indicadores","campanhas","materiais","marketing","treinamentos","notificacoes"],
  };
  // quem pode entrar no painel (perfil administrativo)
  function userProfile(email){
    const u = (S.getCol("usuarios")||[]).find(x=>x.email===email);
    return u ? u.perfil : null;
  }

  /* ---------- definição dos módulos ---------- */
  const NAV = [
    { sec:"Geral" },
    { id:"overview",    label:"Visão Geral",      icon:"layout-dashboard" },
    { id:"indicadores", label:"Indicadores / KPIs", icon:"bar-chart-3" },
    { id:"usabilidade", label:"Usabilidade do App", icon:"activity" },
    { id:"acompanhamento", label:"Acompanhamento", icon:"line-chart" },
    { id:"rotas",       label:"Rotas da Equipe",   icon:"map" },
    { id:"projecoes",   label:"Projeções da Equipe", icon:"calendar-check" },
    { id:"perdas",      label:"Perdas de Pedidos", icon:"trending-down" },
    { id:"aprovacoes",  label:"Aprovações de Desconto", icon:"badge-check" },
    { sec:"Conteúdo do app" },
    { id:"precos",      label:"Tabela de Preços", icon:"tags" },
    { id:"campanhas",   label:"Campanhas",        icon:"megaphone" },
    { id:"materiais",   label:"Materiais Técnicos", icon:"folder-open" },
    { id:"marketing",   label:"Marketing",        icon:"image" },
    { id:"treinamentos",label:"Treinamentos",     icon:"graduation-cap" },
    { id:"notificacoes",label:"Notificações",     icon:"bell-ring" },
    { id:"gamificacao", label:"Gamificação",       icon:"gamepad-2" },
    { sec:"Recebido do app" },
    { id:"reclamacoes", label:"Reclamações",      icon:"message-square-warning", count:()=>openCount("reclamacoes") },
    { id:"chamados",    label:"Chamados Internos",icon:"life-buoy", count:()=>openCount("chamados") },
    { id:"visitas",     label:"Relatórios de Visitas", icon:"map-pin" },
    { id:"pedidos",     label:"Pedidos / Comissões", icon:"clipboard-list" },
    { sec:"Administração" },
    { id:"vendedores",  label:"Vendedores",        icon:"contact" },
    { id:"novos",       label:"Novos Clientes",    icon:"user-plus" },
    { id:"usuarios",    label:"Usuários e Acessos", icon:"users" },
  ];
  function openCount(col){ return (S.getCol(col)||[]).filter(x=>x.status!=="resolvido").length; }

  const Modules = {}; // preenchido por panel-modules*.js  → {label, render(), mount?()}
  let current = "overview";
  let session = null; // {email, nome, perfil}

  /* ---------- navegação ---------- */
  function allowed(id){ const p = session && PERMS[session.perfil]; return p ? p.includes(id) : false; }

  function buildNav(){
    const navEl = document.getElementById("nav");
    let html = "";
    NAV.forEach(n=>{
      if(n.sec){ html += `<div class="sb-sec">${n.sec}</div>`; return; }
      if(!allowed(n.id)) return;
      const c = n.count ? n.count() : 0;
      html += `<div class="nav-item ${n.id===current?'active':''}" data-nav="${n.id}">
        <i data-lucide="${n.icon}"></i><span>${n.label}</span>${c?`<span class="badge-n">${c}</span>`:""}</div>`;
    });
    navEl.innerHTML = html;
    icons();
  }

  function go(id){
    if(!allowed(id)) id = "overview";
    const m = Modules[id];
    current = id;
    document.getElementById("pg-title").textContent = m.label;
    document.getElementById("pg-crumb").textContent = "Painel · "+m.label;
    const c = document.getElementById("content");
    c.innerHTML = m.render();
    c.scrollTop = 0;
    icons();
    m.mount && m.mount(c);
    buildNav();
    document.getElementById("top-search").value = "";
  }

  /* ---------- helpers UI ---------- */
  function icons(){ window.lucide && lucide.createIcons(); }
  let toastT;
  function toast(msg){
    const t = document.getElementById("toast");
    t.innerHTML = `<i data-lucide="check-circle-2"></i><span>${msg}</span>`; icons();
    t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2600);
  }
  function fmtMoney(n){ return "R$ "+Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function fmtMi(n){ return "R$ "+(n/1e6).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" mi"; }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  /* side drawer */
  function side(head, body, foot){
    document.getElementById("side-head").innerHTML = head;
    document.getElementById("side-body").innerHTML = body;
    document.getElementById("side-foot").innerHTML = foot||"";
    document.getElementById("side").classList.add("open");
    document.getElementById("scrim").classList.add("show");
    icons();
  }
  function closeSide(){ document.getElementById("side").classList.remove("open"); document.getElementById("scrim").classList.remove("show"); }

  /* modal */
  function modal(title, body, foot){
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = body;
    document.getElementById("modal-foot").innerHTML = foot||"";
    document.getElementById("modal-scrim").classList.add("show");
    icons();
  }
  function closeModal(){ document.getElementById("modal-scrim").classList.remove("show"); }

  /* ---------- login ---------- */
  function showLogin(){ document.getElementById("login").classList.remove("hidden"); document.getElementById("app").classList.add("hidden"); }
  function startSession(email){
    const perfil = userProfile(email);
    const u = (S.getCol("usuarios")||[]).find(x=>x.email===email);
    session = { email, perfil, nome: u?u.nome:email };
    document.getElementById("sb-name").textContent = session.nome;
    document.getElementById("sb-role").textContent = perfil;
    const av = document.getElementById("sb-av");
    av.textContent = session.nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    const ph = (window.SBS_AVATARS||{})[email];
    if(ph){ av.style.backgroundImage="url("+ph+")"; av.textContent=""; }
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    // primeiro módulo permitido
    const first = PERMS[perfil][0];
    go(first);
    try{ localStorage.setItem("sbs_panel_user", email); }catch(e){}
  }
  function logout(){ try{ localStorage.removeItem("sbs_panel_user"); }catch(e){} session=null; document.getElementById("lg-pass").value=""; showLogin(); }

  function initLogin(){
    const form = document.getElementById("login-form");
    const err = document.getElementById("lg-err");
    const showErr = m => { err.innerHTML = `<i data-lucide="alert-circle"></i><span>${m}</span>`; err.classList.add("show"); icons(); };
    form.addEventListener("submit", e=>{
      e.preventDefault();
      let email = (document.getElementById("lg-email").value||"").trim().toLowerCase();
      const pass = document.getElementById("lg-pass").value||"";
      if(!email){ return showErr("Informe seu usuário."); }
      // resolve por primeiro nome (ou nome.sobrenome) via organograma — igual ao app
      if(window.SBS_ORG){
        const r = window.SBS_ORG.resolveLogin(email);
        if(r.ok){ email = r.email; }
        else if(r.ambiguous){ return showErr("Há mais de um \""+email+"\". Use nome.sobrenome (ex.: "+r.options[0].split("@")[0]+")."); }
        else if(!email.includes("@")){ email = email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
      } else if(!email.includes("@")){ email = email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
      const users = (window.SBS_USERS||[]).map(x=>x.toLowerCase());
      const inDb = window.SBSStore && window.SBSStore.getCol("usuarios").some(u=>(u.email||"").toLowerCase()===email && u.ativo!==false);
      if(!users.includes(email) && !inDb){ return showErr("Usuário não autorizado."); }
      if(pass!==window.SBS_PASSWORD){ return showErr("Senha incorreta."); }
      const perfil = userProfile(email);
      if(!perfil || !PERMS[perfil]){ return showErr("Seu usuário não tem perfil de acesso ao painel."); }
      startSession(email);
    });
  }

  return { S, NAV, Modules, PERMS, go, buildNav, icons, toast, fmtMoney, fmtMi, esc,
    side, closeSide, modal, closeModal, initLogin, showLogin, startSession, logout,
    get session(){ return session; }, openCount,
    get current(){ return current; } };
})();
