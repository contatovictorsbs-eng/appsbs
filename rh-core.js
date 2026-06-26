/* ===========================================================
   SBS Painel de RH — núcleo
   Recrutamento & Seleção + Endomarketing: vagas, candidatos,
   colaboradores, comunicados e eventos internos.
   Verde SBS padrão. T.I. controla a plataforma.
   =========================================================== */
const RH = (function(){
  const S = window.SBSStore;
  const D = window.RH_DATA;

  function seed(){
    if(!S || !D) return;
    if(!(S.getCol("rh_vagas")||[]).length)         S.setCol("rh_vagas",         D.vagas.map(c=>Object.assign({},c)));
    if(!(S.getCol("rh_candidatos")||[]).length)    S.setCol("rh_candidatos",    D.candidatos.map(c=>Object.assign({},c)));
    if(!(S.getCol("rh_colaboradores")||[]).length) S.setCol("rh_colaboradores", D.colaboradores.map(c=>Object.assign({},c)));
    if(!(S.getCol("rh_comunicados")||[]).length)   S.setCol("rh_comunicados",   D.comunicados.map(c=>Object.assign({},c)));
    if(!(S.getCol("rh_eventos")||[]).length)       S.setCol("rh_eventos",       D.eventos.map(c=>Object.assign({},c)));
  }

  function canAccess(email){
    const org = window.SBS_ORG && window.SBS_ORG.get(email);
    if(org && (org.papel==="admin"||org.papel==="ti"||org.papel==="ceo"||org.papel==="nacional")) return true;
    if(/rh|recursos|gente|pessoas/i.test((org&&org.papel)||"")) return true;
    const u = (S.getCol("usuarios")||[]).find(x=>(x.email||"").toLowerCase()===email);
    return !!(u && (u.perfil==="Administrador" || /rh|recursos humanos|gente/i.test(u.perfil||"")));
  }

  const NAV = [
    { sec:"Recrutamento & Seleção" },
    { id:"visao",        label:"Visão Geral",      icon:"gauge" },
    { id:"vagas",        label:"Vagas",            icon:"briefcase" },
    { id:"candidatos",   label:"Candidatos",       icon:"user-search" },
    { id:"canais",       label:"Canais & LinkedIn", icon:"share-2" },
    { sec:"Pessoas" },
    { id:"colaboradores",label:"Colaboradores",    icon:"users" },
    { id:"endomarketing",label:"Endomarketing",    icon:"party-popper" },
    { sec:"Apoio" },
    { id:"ajuda",        label:"Central de Ajuda", icon:"circle-help" },
  ];

  const Modules = {};
  let current = "visao", session = null;

  function buildNav(){
    const navEl = document.getElementById("nav");
    navEl.innerHTML = NAV.map(n=> n.sec
      ? `<div class="sb-sec">${n.sec}</div>`
      : `<div class="nav-item ${n.id===current?'active':''}" data-nav="${n.id}"><i data-lucide="${n.icon}"></i><span>${n.label}</span></div>`
    ).join(""); icons();
  }
  function go(id){
    if(!Modules[id]) id="visao";
    const m=Modules[id]; current=id;
    document.getElementById("pg-title").textContent=m.label;
    document.getElementById("pg-crumb").textContent="RH · "+m.label;
    const c=document.getElementById("content");
    c.innerHTML=m.render(); c.scrollTop=0; icons(); m.mount&&m.mount(c); buildNav();
  }
  function refresh(){ go(current); }

  function icons(){ window.lucide && lucide.createIcons(); }
  let toastT;
  function toast(msg){ const t=document.getElementById("toast"); t.innerHTML=`<i data-lucide="check-circle-2"></i><span>${esc(msg)}</span>`; icons(); t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2400); }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function money(n){ n=Number(n||0); if(n>=1e6) return "R$ "+(n/1e6).toLocaleString("pt-BR",{maximumFractionDigits:1})+" mi"; if(n>=1e3) return "R$ "+(n/1e3).toLocaleString("pt-BR",{maximumFractionDigits:0})+" mil"; return "R$ "+n.toLocaleString("pt-BR"); }
  function num(n){ return Number(n||0).toLocaleString("pt-BR"); }
  function dateBR(s){ if(!s) return "—"; var p=String(s).split("-"); return p.length===3?(p[2]+"/"+p[1]+"/"+p[0]):(p.length===2?(p[1]+"/"+p[0]):s); }

  /* side / modal */
  function side(head,body,foot){ document.getElementById("side-head").innerHTML=head; document.getElementById("side-body").innerHTML=body; document.getElementById("side-foot").innerHTML=foot||""; document.getElementById("side").classList.add("open"); document.getElementById("scrim").classList.add("show"); icons(); }
  function closeSide(){ document.getElementById("side").classList.remove("open"); document.getElementById("scrim").classList.remove("show"); }
  function modal(title,body,foot){ document.getElementById("modal-title").textContent=title; document.getElementById("modal-body").innerHTML=body; document.getElementById("modal-foot").innerHTML=foot||""; document.getElementById("modal-scrim").classList.add("show"); icons(); }
  function closeModal(){ document.getElementById("modal-scrim").classList.remove("show"); }

  /* login */
  function showLogin(){ document.getElementById("login").classList.remove("hidden"); document.getElementById("app").classList.add("hidden"); }
  function startSession(email){
    const org=window.SBS_ORG&&window.SBS_ORG.get(email);
    const u=(S.getCol("usuarios")||[]).find(x=>(x.email||"").toLowerCase()===email);
    const nome=(org&&org.nome)||(u&&u.nome)||email.split("@")[0].split(/[._]/).map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" ");
    session={email,nome};
    document.getElementById("sb-name").textContent=nome;
    document.getElementById("sb-role").textContent="Recursos Humanos";
    document.getElementById("sb-av").textContent=nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    document.getElementById("login").classList.add("hidden"); document.getElementById("app").classList.remove("hidden");
    go("visao"); window.SBS_AVATAR&&SBS_AVATAR.setUser(email); try{ localStorage.setItem("sbs_rh_user",email); }catch(e){}
  }
  function logout(){ try{ localStorage.removeItem("sbs_rh_user"); }catch(e){} session=null; var p=document.getElementById("lg-pass"); if(p)p.value=""; showLogin(); }
  function initLogin(){
    const form=document.getElementById("login-form"), err=document.getElementById("lg-err");
    const showErr=m=>{ err.innerHTML=`<i data-lucide="alert-circle"></i><span>${m}</span>`; err.classList.add("show"); icons(); };
    form.addEventListener("submit",e=>{
      e.preventDefault();
      let email=(document.getElementById("lg-email").value||"").trim().toLowerCase();
      const pass=document.getElementById("lg-pass").value||"";
      if(!email) return showErr("Informe seu usuário.");
      if(window.SBS_ORG){ const r=window.SBS_ORG.resolveLogin(email); if(r.ok) email=r.email; else if(r.ambiguous) return showErr("Há mais de um \""+email+"\". Use nome.sobrenome."); else if(!email.includes("@")) email=email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
      else if(!email.includes("@")) email=email.replace(/\s+/g,".")+"@sbsgreen.com.br";
      if(pass!==window.SBS_PASSWORD) return showErr("Senha incorreta.");
      if(!canAccess(email)) return showErr("Acesso restrito à equipe de RH.");
      startSession(email);
    });
  }

  return { S, D, seed, NAV, Modules, go, refresh, buildNav, icons, toast, esc, money, num, dateBR,
    side, closeSide, modal, closeModal, initLogin, showLogin, startSession, logout, canAccess,
    get session(){ return session; }, get current(){ return current; } };
})();
window.RH = RH;
