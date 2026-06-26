/* ===========================================================
   SBS Painel do CEO — núcleo (somente leitura)
   -----------------------------------------------------------
   Visão executiva consolidada de TUDO: comercial, equipe em
   campo, atendimento, adoção do app e estado do sistema
   (versões/features geridas pela T.I.). Não edita dados.
   Compartilha a mesma nuvem (Supabase) das demais plataformas.
   =========================================================== */
const CEO = (function(){
  const S = window.SBSStore;

  // quem entra: Diretoria (ceo), Gerente Nacional, ou Administrador
  function canAccess(email){
    const org = window.SBS_ORG && window.SBS_ORG.get(email);
    if(org && (org.papel==="ceo" || org.papel==="nacional" || org.papel==="admin")) return true;
    const u = (S.getCol("usuarios")||[]).find(x=>(x.email||"").toLowerCase()===email);
    return !!(u && (u.perfil==="Administrador" || /diretor|ceo|presiden/i.test(u.perfil||"")));
  }

  const NAV = [
    { sec:"Executivo" },
    { id:"panorama",   label:"Panorama Geral",    icon:"gauge" },
    { id:"comercial",  label:"Comercial",          icon:"trending-up" },
    { id:"equipe",     label:"Equipe em Campo",    icon:"map-pinned" },
    { id:"atendimento",label:"Atendimento",        icon:"headset" },
    { id:"adocao",     label:"Adoção do App",      icon:"smartphone" },
    { id:"areas",      label:"Áreas (Mkt · P&D · RH)", icon:"layout-grid" },
    { sec:"Sistema" },
    { id:"sistema",    label:"Estado do Sistema",  icon:"server" },
    { id:"ajuda",      label:"Central de Ajuda",   icon:"circle-help" },
  ];

  const Modules = {};
  let current = "panorama";
  let session = null;

  function buildNav(){
    const navEl = document.getElementById("nav");
    let html = "";
    NAV.forEach(n=>{
      if(n.sec){ html += `<div class="sb-sec">${n.sec}</div>`; return; }
      html += `<div class="nav-item ${n.id===current?'active':''}" data-nav="${n.id}"><i data-lucide="${n.icon}"></i><span>${n.label}</span></div>`;
    });
    navEl.innerHTML = html; icons();
  }

  function go(id){
    if(!Modules[id]) id = "panorama";
    const m = Modules[id]; current = id;
    document.getElementById("pg-title").textContent = m.label;
    document.getElementById("pg-crumb").textContent = "CEO · "+m.label;
    const c = document.getElementById("content");
    c.innerHTML = m.render();
    c.scrollTop = 0; icons();
    m.mount && m.mount(c);
    buildNav();
  }

  function icons(){ window.lucide && lucide.createIcons(); }
  let toastT;
  function toast(msg){
    const t = document.getElementById("toast");
    t.innerHTML = `<i data-lucide="info"></i><span>${msg}</span>`; icons();
    t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2600);
  }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function money(n){ return "R$ "+Number(n||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function mi(n){ n=Number(n||0); if(Math.abs(n)>=1e6) return "R$ "+(n/1e6).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" mi"; if(Math.abs(n)>=1e3) return "R$ "+(n/1e3).toLocaleString("pt-BR",{maximumFractionDigits:0})+" mil"; return money(n); }

  /* ---------- login ---------- */
  function showLogin(){ document.getElementById("login").classList.remove("hidden"); document.getElementById("app").classList.add("hidden"); }
  function startSession(email){
    const org = window.SBS_ORG && window.SBS_ORG.get(email);
    const u = (S.getCol("usuarios")||[]).find(x=>(x.email||"").toLowerCase()===email);
    const nome = (org&&org.nome) || (u&&u.nome) || email.split("@")[0].split(/[._]/).map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" ");
    session = { email, nome };
    document.getElementById("sb-name").textContent = nome;
    document.getElementById("sb-role").textContent = "Diretoria / CEO";
    document.getElementById("sb-av").textContent = nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    go("panorama");
    window.SBS_AVATAR&&SBS_AVATAR.setUser(email);
    try{ localStorage.setItem("sbs_ceo_user", email); }catch(e){}
  }
  function logout(){ try{ localStorage.removeItem("sbs_ceo_user"); }catch(e){} session=null; const p=document.getElementById("lg-pass"); if(p)p.value=""; showLogin(); }

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
      if(!canAccess(email)){ return showErr("Acesso restrito à diretoria."); }
      startSession(email);
    });
  }

  return { S, NAV, Modules, go, buildNav, icons, toast, esc, money, mi,
    initLogin, showLogin, startSession, logout, canAccess,
    get session(){ return session; }, get current(){ return current; } };
})();
