/* ===========================================================
   SBS Painel T.I. — núcleo: login, navegação, helpers
   -----------------------------------------------------------
   Painel restrito ao setor de Tecnologia. Compartilha a mesma
   store/nuvem (Supabase) do app e do painel gerencial, então
   liberar features e publicar GMuds reflete em tempo real em
   todos os aparelhos.
   =========================================================== */
const TI = (function(){
  const S = window.SBSStore;

  // quem pode entrar no painel de T.I.: perfil Administrador ou allowlist de T.I.
  const TI_EMAILS = ["comercial@sbsgreen.com.br","green.mobile@sbsgreen.com.br"];
  function canAccess(email){
    if(TI_EMAILS.includes(email)) return true;
    const u = (S.getCol("usuarios")||[]).find(x=>(x.email||"").toLowerCase()===email);
    if(!u) return false;
    return u.perfil==="Administrador" || /t\.?i\.?|tecnolog/i.test(u.perfil||"");
  }

  const NAV = [
    { sec:"Tecnologia" },
    { id:"overview", label:"Visão Geral",        icon:"layout-dashboard" },
    { id:"features", label:"Liberação de Features", icon:"toggle-right" },
    { id:"gmud",     label:"GMud · Mudanças",    icon:"git-pull-request-arrow", count:()=>gmudAbertas() },
    { id:"changelog",label:"Versões / Changelog",icon:"history" },
  ];
  function gmudAbertas(){ return (S.getCol("gmuds")||[]).filter(g=>g.status!=="concluida"&&g.status!=="cancelada").length; }

  const Modules = {};
  let current = "overview";
  let session = null;

  function buildNav(){
    const navEl = document.getElementById("nav");
    let html = "";
    NAV.forEach(n=>{
      if(n.sec){ html += `<div class="sb-sec">${n.sec}</div>`; return; }
      const c = n.count ? n.count() : 0;
      html += `<div class="nav-item ${n.id===current?'active':''}" data-nav="${n.id}">
        <i data-lucide="${n.icon}"></i><span>${n.label}</span>${c?`<span class="badge-n">${c}</span>`:""}</div>`;
    });
    navEl.innerHTML = html;
    icons();
  }

  function go(id){
    if(!Modules[id]) id = "overview";
    const m = Modules[id];
    current = id;
    document.getElementById("pg-title").textContent = m.label;
    document.getElementById("pg-crumb").textContent = "T.I. · "+m.label;
    const c = document.getElementById("content");
    c.innerHTML = m.render();
    c.scrollTop = 0;
    icons();
    m.mount && m.mount(c);
    buildNav();
  }

  /* ---------- helpers UI ---------- */
  function icons(){ window.lucide && lucide.createIcons(); }
  let toastT;
  function toast(msg){
    const t = document.getElementById("toast");
    t.innerHTML = `<i data-lucide="check-circle-2"></i><span>${msg}</span>`; icons();
    t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2600);
  }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function side(head, body, foot){
    document.getElementById("side-head").innerHTML = head;
    document.getElementById("side-body").innerHTML = body;
    document.getElementById("side-foot").innerHTML = foot||"";
    document.getElementById("side").classList.add("open");
    document.getElementById("scrim").classList.add("show");
    icons();
  }
  function closeSide(){ document.getElementById("side").classList.remove("open"); document.getElementById("scrim").classList.remove("show"); }
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
    const u = (S.getCol("usuarios")||[]).find(x=>(x.email||"").toLowerCase()===email);
    const nome = (window.SBS_NAME_OVERRIDES&&window.SBS_NAME_OVERRIDES[email]) || (u&&u.nome) ||
      email.split("@")[0].split(/[._]/).map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" ");
    session = { email, nome, perfil:"Tecnologia / T.I." };
    document.getElementById("sb-name").textContent = nome;
    document.getElementById("sb-role").textContent = session.perfil;
    document.getElementById("sb-av").textContent = nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    go("overview");
    try{ localStorage.setItem("sbs_ti_user", email); }catch(e){}
  }
  function logout(){ try{ localStorage.removeItem("sbs_ti_user"); }catch(e){} session=null; const p=document.getElementById("lg-pass"); if(p)p.value=""; showLogin(); }

  function initLogin(){
    const form = document.getElementById("login-form");
    const err = document.getElementById("lg-err");
    const showErr = m => { err.innerHTML = `<i data-lucide="alert-circle"></i><span>${m}</span>`; err.classList.add("show"); icons(); };
    form.addEventListener("submit", e=>{
      e.preventDefault();
      let email = (document.getElementById("lg-email").value||"").trim().toLowerCase();
      const pass = document.getElementById("lg-pass").value||"";
      if(!email){ return showErr("Informe seu usuário."); }
      if(window.SBS_ORG){
        const r = window.SBS_ORG.resolveLogin(email);
        if(r.ok){ email = r.email; }
        else if(r.ambiguous){ return showErr("Há mais de um \""+email+"\". Use nome.sobrenome."); }
        else if(!email.includes("@")){ email = email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
      } else if(!email.includes("@")){ email = email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
      if(pass!==window.SBS_PASSWORD){ return showErr("Senha incorreta."); }
      if(!canAccess(email)){ return showErr("Acesso restrito ao setor de T.I."); }
      startSession(email);
    });
  }

  return { S, NAV, Modules, go, buildNav, icons, toast, esc, side, closeSide, modal, closeModal,
    initLogin, showLogin, startSession, logout, canAccess,
    get session(){ return session; }, get current(){ return current; } };
})();
