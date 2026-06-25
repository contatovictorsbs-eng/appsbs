/* ===========================================================
   SBS — app shell: router, drawer, bottom nav, toast
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;
const screenEl = document.getElementById("screen");
const titleEl  = document.getElementById("ab-title");
const logoEl   = document.getElementById("ab-logo");
const backBtn  = document.getElementById("ab-back");
const menuBtn  = document.getElementById("ab-menu");
const drawer   = document.getElementById("drawer");
const scrim    = document.getElementById("scrim");
const toastEl  = document.getElementById("toast");
const bottomBtns = document.querySelectorAll(".bottomnav button");

let current = "home";
const noBottom = false;

// telas que abrem link externo DENTRO do app (iframe)
const EXTERNAL = {
  cargas: { url: "https://tracking.azship.com.br/", title: "Consulta de Carga" },
  frete:  { url: "https://fretefracionado.manus.space/fracionado", title: "Calculadora Frete Fracionado" },
};

function showWebview(url, title){
  titleEl.textContent = title;
  titleEl.classList.remove("left");
  logoEl.style.display = "none"; titleEl.style.display = "block";
  backBtn.style.display = "grid";
  menuBtn.style.display = "none";
  screenEl.innerHTML = `<div class="webview-wrap"><div class="webview-load" id="wv-load"><span class="spinner"></span>Carregando…</div>`+
    `<iframe class="webview" src="${url}" allow="geolocation; clipboard-write" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
  screenEl.scrollTop = 0;
  const fr = screenEl.querySelector("iframe");
  const ld = screenEl.querySelector("#wv-load");
  let loaded = false;
  fr.addEventListener("load", ()=>{ loaded = true; ld && ld.remove(); });
  // fallback: se o site bloquear exibição em iframe (X-Frame-Options), mostra botão tela cheia
  setTimeout(()=>{
    if(loaded || !ld || !ld.isConnected) return;
    ld.innerHTML = `<i data-lucide="frame" style="width:30px;height:30px;color:var(--accent)"></i>`+
      `<div style="margin-top:10px;font-weight:700;color:var(--ink-2)">Não foi possível exibir aqui.</div>`+
      `<div style="font-size:11.5px;color:var(--muted);margin-top:2px">O site bloqueia a exibição embutida.</div>`+
      `<a class="btn" style="margin-top:16px;width:auto;padding:13px 20px" href="${url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Abrir em tela cheia</a>`;
    window.lucide && lucide.createIcons();
  }, 4500);
  closeDrawer();
}
window.SBS_doc = (url,title)=>{ current=""; showPdf(url, title||"Documento"); bottomBtns.forEach(b=>b.classList.remove("active")); window.Gam && window.Gam.awardOnce("material", url); };

/* ----- PDF viewer (PDF.js — renderiza páginas em canvas, confiável no mobile) ----- */
let _pdfjs = null;
async function ensurePdfjs(){
  if(_pdfjs) return _pdfjs;
  _pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs");
  _pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs";
  return _pdfjs;
}
async function showPdf(url, title){
  titleEl.textContent = title;
  titleEl.classList.remove("left");
  logoEl.style.display = "none"; titleEl.style.display = "block";
  backBtn.style.display = "grid";
  menuBtn.style.display = "none";
  screenEl.innerHTML =
    `<div class="pdfbar"><span class="pdfbar-t"><i data-lucide="file-text"></i>${title}</span>`+
    `<a class="pdfbar-open" href="${url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i>Abrir</a></div>`+
    `<div class="pdfview"><div class="pdf-load" id="pdf-load"><span class="spinner"></span>Carregando documento…</div>`+
    `<div id="pdf-pages" class="pdf-pages"></div></div>`;
  screenEl.scrollTop = 0;
  window.lucide && lucide.createIcons();
  closeDrawer();
  const token = (showPdf._t = (showPdf._t||0)+1);
  try{
    const lib = await ensurePdfjs();
    const doc = await lib.getDocument(url).promise;
    if(token!==showPdf._t) return;
    const cont = screenEl.querySelector("#pdf-pages");
    const cssW = Math.max(280, screenEl.clientWidth - 24);
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    for(let i=1;i<=doc.numPages;i++){
      const page = await doc.getPage(i);
      if(token!==showPdf._t) return;
      const base = page.getViewport({scale:1});
      const scale = (cssW*dpr)/base.width;
      const vp = page.getViewport({scale});
      const canvas = document.createElement("canvas");
      canvas.className = "pdf-page";
      canvas.width = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      canvas.style.width = cssW+"px";
      canvas.style.height = Math.round(vp.height/dpr)+"px";
      cont.appendChild(canvas);
      await page.render({canvasContext:canvas.getContext("2d"), viewport:vp}).promise;
      if(i===1){ const l=screenEl.querySelector("#pdf-load"); if(l) l.remove(); }
    }
    const ld = screenEl.querySelector("#pdf-load"); if(ld) ld.remove();
  }catch(e){
    const ld = screenEl.querySelector("#pdf-load");
    if(ld) ld.innerHTML = `<i data-lucide="alert-circle" style="width:30px;height:30px;color:var(--danger)"></i>`+
      `<div style="margin-top:8px">Não foi possível exibir o PDF aqui.</div>`+
      `<a class="btn ghost" style="margin-top:14px;width:auto;padding:12px 18px" href="${url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Abrir o documento</a>`;
    window.lucide && lucide.createIcons();
  }
}

function go(id){
  if(EXTERNAL[id]){
    const ext = EXTERNAL[id];
    current = id;
    showWebview(ext.url, ext.title);
    bottomBtns.forEach(b=>b.classList.remove("active"));
    drawer.querySelectorAll(".menu-item").forEach(m=>m.classList.toggle("active", m.dataset.go===id));
    return;
  }
  // feature flags (liberadas/bloqueadas pela T.I.)
  if(window.SBS_FEATURES && !SBS_FEATURES.enabled(id)){
    toast("Recurso temporariamente indisponível");
    id = "home";
  }
  if(!S[id]) id = "home";
  const sc = S[id];
  current = id;
  // appbar
  titleEl.textContent = sc.title;
  titleEl.classList.toggle("left", !!sc.appbarLeft);
  const isHome = id==="home";
  logoEl.style.display = isHome ? "flex" : "none";
  titleEl.style.display = isHome ? "none" : "block";
  backBtn.style.display = isHome ? "none" : "grid";
  menuBtn.style.display = isHome ? "grid" : "none";
  // render
  screenEl.innerHTML = sc.render();
  screenEl.scrollTop = 0;
  window.lucide && lucide.createIcons();
  sc.mount && sc.mount(screenEl);
  // bottom nav active
  const map = {home:"home", dashboard:"dashboard", precos:"precos"};
  bottomBtns.forEach(b=>b.classList.toggle("active", b.dataset.tab===map[id]));
  // feature gate (esconde itens desligados do menu/home)
  window.SBS_FEATURES && SBS_FEATURES.gateAll(document);
  applyVersion();
  // drawer active
  drawer.querySelectorAll(".menu-item").forEach(m=>m.classList.toggle("active", m.dataset.go===id));
  applyAvatar();
  updateBell();
  closeDrawer();
  trackUse(id);
}
window.SBS = { go, toast, logout, updateBell };

/* ----- rastreamento de uso (cada usuário grava só o seu registro) ----- */
let _lastTrack = {id:"", t:0};
function trackUse(id){
  if(!window.SBSStore || !id) return;
  const u = D.user; if(!u || !u.email) return;
  const now = Date.now();
  if(_lastTrack.id===id && now-_lastTrack.t < 1500) return; // evita dupla contagem
  _lastTrack = {id, t:now};
  const col = window.SBSStore.getCol("uso");
  const rec = col.find(r=>(r.email||"").toLowerCase()===u.email.toLowerCase());
  const screens = (rec && rec.screens) ? Object.assign({}, rec.screens) : {};
  screens[id] = (screens[id]||0) + 1;
  const hoje = window.SBSStore.today().slice(0,10);
  const dias = (rec && rec.dias) ? Object.assign({}, rec.dias) : {};
  dias[hoje] = (dias[hoje]||0) + 1;
  // mantém só os últimos 30 dias
  const keys = Object.keys(dias).sort();
  while(keys.length>30){ delete dias[keys.shift()]; }
  const patch = { email:u.email, nome:u.name, papel:u.papel||"", gerente:(window.SBS_ORG&&window.SBS_ORG.gerenteDe(u.email))||"", screens, dias,
    total:(rec&&rec.total||0)+1, ultimo:window.SBSStore.today()+" "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) };
  if(rec) window.SBSStore.update("uso", rec.id, patch);
  else window.SBSStore.add("uso", patch);
}

/* ----- sino de notificações ----- */
const bellBtn = document.getElementById("ab-bell");
if(bellBtn) bellBtn.addEventListener("click", ()=>go("notificacoes"));
function updateBell(){
  const badge = document.getElementById("bell-badge"); if(!badge) return;
  const n = (window.SBS_notifUnread ? window.SBS_notifUnread() : 0);
  if(n>0){ badge.textContent = n>9?"9+":n; badge.style.display="grid"; }
  else { badge.style.display="none"; }
}

/* ----- som de notificação (WebAudio, sem arquivo) ----- */
let _ac=null;
function sound(kind){
  try{
    _ac = _ac || new (window.AudioContext||window.webkitAudioContext)();
    const ctx=_ac, now=ctx.currentTime;
    const notes = kind==="confirm" ? [880,1320] : [660,990];
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sine"; o.frequency.value=f;
      o.connect(g); g.connect(ctx.destination);
      const t=now+i*0.13;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.18,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
      o.start(t); o.stop(t+0.2);
    });
  }catch(e){}
}
window.SBS_sound = sound;
let _lastNotifCount = (window.SBS_notifUnread ? window.SBS_notifUnread() : 0);

/* ----- delegated navigation ----- */
screenEl.addEventListener("click",e=>{
  const shareEl = e.target.closest("[data-share]");
  if(shareEl){ shareDoc(shareEl.dataset.share, shareEl.dataset.title); return; }
  const shDoc = e.target.closest("[data-share-doc]");
  if(shDoc){ sharePolicy(shDoc.dataset.shareDoc); return; }
  const exDoc = e.target.closest("[data-export-doc]");
  if(exDoc){ exportPolicy(exDoc.dataset.exportDoc); return; }
  const docEl = e.target.closest("[data-doc]");
  if(docEl){ window.SBS_doc(docEl.dataset.doc, docEl.dataset.title); return; }
  const actEl = e.target.closest("[data-action]");
  if(actEl){ if(actEl.dataset.action==="logout") logout(); else if(actEl.dataset.action==="tour"){ window.SBS_ONBOARD && window.SBS_ONBOARD.open(true); } return; }
  const goEl = e.target.closest("[data-go]");
  if(goEl){ go(goEl.dataset.go); return; }
  const tEl = e.target.closest("[data-toast]");
  if(tEl){ toast(tEl.dataset.toast); }
});

/* ----- compartilhar (WhatsApp / Web Share) ----- */
function shareDoc(kind, title){
  const msg = `*SBS Green Seeds*\n${title}\n\nEnviado pelo Portal do Vendedor.`;
  const wa = "https://wa.me/?text="+encodeURIComponent(msg);
  const openWa = ()=>{
    const a=document.createElement("a");
    a.href=wa; a.target="_blank"; a.rel="noopener";
    document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(),0);
    toast("Abrindo WhatsApp…"); window.Gam && window.Gam.award("share");
  };
  if(navigator.share){
    navigator.share({ title:"SBS Green Seeds", text: msg }).then(()=>{
      toast("Compartilhado: "+title); window.Gam && window.Gam.award("share");
    }).catch(err=>{
      // cancelado pelo usuário → não reabrir; bloqueado/iframe → cai no WhatsApp
      if(err && err.name==="AbortError") return;
      openWa();
    });
  } else {
    openWa();
  }
}

backBtn.addEventListener("click",()=>go("home"));

/* ----- políticas: compartilhar texto + exportar PDF ----- */
const POLICY_META = {
  comercial: { title:"Política Comercial — PL.12 v01", screen:"comercial" },
  credito:   { title:"Política de Crédito — PL.04 v01", screen:"credito" },
};
function policyPlainText(){
  // extrai texto legível do conteúdo atual da política na tela
  const doc = screenEl.querySelector(".doc"); if(!doc) return "";
  const clone = doc.cloneNode(true);
  clone.querySelectorAll(".doc-actions").forEach(n=>n.remove());
  // abre acordeões para o texto vir completo
  let out = [];
  clone.querySelectorAll("h1,h2,h3,h4,.dh-title,.acc-h,.db-head,li,p").forEach(el=>{
    const t = (el.textContent||"").replace(/\s+/g," ").trim();
    if(t) out.push(t);
  });
  return out.join("\n");
}
function sharePolicy(kind){
  const meta = POLICY_META[kind] || {title:"Política SBS"};
  const body = policyPlainText().slice(0, 1200);
  const msg = `*SBS Green Seeds — ${meta.title}*\n\n${body}\n\n_Enviado pelo Portal do Vendedor._`;
  if(navigator.share){
    navigator.share({ title:meta.title, text:msg }).then(()=>{ window.Gam&&window.Gam.award("share"); })
      .catch(err=>{ if(err&&err.name==="AbortError")return; openWaText(msg); });
  } else openWaText(msg);
}
function openWaText(msg){
  const a=document.createElement("a");
  a.href="https://wa.me/?text="+encodeURIComponent(msg); a.target="_blank"; a.rel="noopener";
  document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(),0);
  toast("Abrindo WhatsApp…"); window.Gam&&window.Gam.award("share");
}
function exportPolicy(kind){
  const meta = POLICY_META[kind] || {title:"Política SBS"};
  const doc = screenEl.querySelector(".doc"); if(!doc){ toast("Abra a política primeiro"); return; }
  const clone = doc.cloneNode(true);
  clone.querySelectorAll(".doc-actions").forEach(n=>n.remove());
  const w = window.open("", "_blank");
  if(!w){ toast("Permita pop-ups para exportar"); return; }
  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${meta.title}</title>
  <style>
    @page{margin:18mm;}
    body{font-family:'Segoe UI',system-ui,sans-serif;color:#16201a;line-height:1.5;max-width:760px;margin:0 auto;padding:24px;}
    .pf-head{display:flex;align-items:center;gap:12px;border-bottom:3px solid #0B6B61;padding-bottom:14px;margin-bottom:20px;}
    .pf-head .b{width:40px;height:40px;border-radius:10px;background:#0B6B61;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;}
    .pf-head h1{font-size:18px;margin:0;color:#0B6B61;}
    .pf-head .s{font-size:12px;color:#666;}
    .doc-hero{background:#e9f8f5;border-radius:12px;padding:16px;margin-bottom:18px;}
    .dh-tag{font-size:11px;font-weight:800;color:#0B6B61;text-transform:uppercase;}
    .dh-title{font-size:17px;font-weight:800;margin:4px 0;}
    .dh-sub{font-size:12.5px;color:#555;}
    h4,.acc-h{font-size:14px;font-weight:800;color:#0B6B61;margin:16px 0 6px;}
    p{font-size:13px;margin:6px 0;}
    ul{margin:6px 0 6px 18px;padding:0;} li{font-size:13px;margin:3px 0;}
    .acc-b{display:block!important;height:auto!important;} .acc-i,svg,.note{display:none!important;}
    .pf-foot{margin-top:26px;border-top:1px solid #ddd;padding-top:10px;font-size:10.5px;color:#999;text-align:center;}
  </style></head><body>
  <div class="pf-head"><div class="b">SBS</div><div><h1>SBS Green Seeds</h1><div class="s">${meta.title} · gerado em ${new Date().toLocaleDateString("pt-BR")}</div></div></div>
  ${clone.innerHTML}
  <div class="pf-foot">SBS Green Seeds · Portal do Vendedor · Documento para consulta interna.</div>
  <script>setTimeout(function(){window.print();},400);<\/script>
  </body></html>`);
  w.document.close();
  toast("Gerando PDF…");
}

/* ----- drawer ----- */
function openDrawer(){ drawer.classList.add("open"); scrim.classList.add("show"); }
function closeDrawer(){ drawer.classList.remove("open"); scrim.classList.remove("show"); }
menuBtn.addEventListener("click",openDrawer);
scrim.addEventListener("click",closeDrawer);
drawer.addEventListener("click",e=>{ const m=e.target.closest(".menu-item"); if(m) go(m.dataset.go); });

/* ----- bottom nav ----- */
bottomBtns.forEach(b=>b.addEventListener("click",()=>{
  if(b.dataset.tab==="menu") openDrawer(); else go(b.dataset.tab);
}));

/* ----- toast ----- */
let toastT;
function toast(msg){
  toastEl.innerHTML = `<i data-lucide="check-circle-2"></i><span>${msg}</span>`;
  window.lucide && lucide.createIcons();
  toastEl.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(()=>toastEl.classList.remove("show"), 2400);
}

/* ----- build drawer menu ----- */
drawer.querySelector(".drawer-list").innerHTML = D.menu.map(m=>
  `<div class="menu-item" data-go="${m.id}"><i data-lucide="${m.icon}"></i><span>${m.label}</span></div>`).join("");
window.SBS_FEATURES && SBS_FEATURES.gateAll(drawer);

/* ----- versão do sistema no rodapé do menu ----- */
function applyVersion(){
  const el = drawer.querySelector(".drawer-foot");
  if(el && window.SBS_FEATURES) el.textContent = "Portal do Vendedor · v"+SBS_FEATURES.versao();
}
applyVersion();

/* ===== AUTENTICAÇÃO (governança de acesso) ===== */
const loginEl = document.getElementById("login");
const USERS = (window.SBS_USERS||[]).map(e=>e.toLowerCase());
// autorizado se está na lista estática OU cadastrado (ativo) na nuvem
function isAuthorized(email){
  if(USERS.includes(email)) return true;
  if(window.SBS_ORG && window.SBS_ORG.get(email)) return true;
  if(window.SBSStore){
    return window.SBSStore.getCol("usuarios").some(u=>(u.email||"").toLowerCase()===email && u.ativo!==false);
  }
  return false;
}
function nameFromEmail(email){
  const ov = window.SBS_NAME_OVERRIDES||{};
  if(ov[email]) return ov[email];
  return email.split("@")[0].split(/[._]/).map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" ");
}
function initialsFrom(name){
  const p=name.trim().split(/\s+/);
  return ((p[0]&&p[0][0]||"")+(p[1]&&p[1][0]||(p[0]&&p[0][1])||"")).toUpperCase();
}
const PAPEL_LABEL = { nacional:"Gerente Nacional", regional:"Gerente Regional", supervisor:"Supervisor", admin:"Administrador" };
function applyUser(email){
  const org = window.SBS_ORG && window.SBS_ORG.get(email);
  const name = (org && org.nome) || nameFromEmail(email);
  D.user.name = name;
  D.user.first = name.split(" ")[0];
  D.user.initials = initialsFrom(name);
  D.user.papel = org ? org.papel : "supervisor";
  D.user.role = PAPEL_LABEL[D.user.papel] || "Força de Vendas";
  D.user.region = "SBS Green Seeds";
  D.user.email = email;
  document.getElementById("device").setAttribute("data-papel", D.user.papel);
  drawer.querySelector(".dh-name").textContent = name;
  drawer.querySelector(".dh-role").textContent = D.user.role;
  drawer.querySelector(".dh-user .avatar").textContent = D.user.initials;
  applyAvatar();
}
/* foto do vendedor — aplica a imagem nos avatares (menu + configurações) */
function avatarKey(){ return "sbs_avatar:"+(D.user.email||""); }
function currentAvatar(){
  let url=""; try{ url=localStorage.getItem(avatarKey())||""; }catch(e){}
  if(!url){ const def=(window.SBS_AVATARS||{})[D.user.email||""]; if(def) url=def; }
  return url;
}
function applyAvatar(){
  const url = currentAvatar();
  document.querySelectorAll(".avatar").forEach(el=>{
    if(url){ el.style.backgroundImage="url("+url+")"; el.classList.add("has-photo"); }
    else { el.style.backgroundImage=""; el.classList.remove("has-photo"); }
  });
}
window.SBS_avatar = applyAvatar;
function showLogin(){ loginEl.classList.remove("hidden"); }
function hideLogin(){ loginEl.classList.add("hidden"); }
function logout(){
  try{ localStorage.removeItem("sbs_user"); }catch(e){}
  const p=document.getElementById("lg-pass"); if(p) p.value="";
  document.getElementById("lg-err").classList.remove("show");
  closeDrawer(); showLogin();
}
function loginErr(m){
  const err=document.getElementById("lg-err");
  err.innerHTML=`<i data-lucide="alert-circle"></i><span>${m}</span>`;
  err.classList.add("show"); window.lucide&&lucide.createIcons();
}
document.getElementById("login-form").addEventListener("submit",e=>{
  e.preventDefault();
  const raw=(document.getElementById("lg-email").value||"").trim();
  const pass=document.getElementById("lg-pass").value||"";
  if(!raw){ loginErr("Informe seu nome de usuário."); return; }
  // resolve por primeiro nome (ou nome.sobrenome) via organograma
  let email = raw.toLowerCase();
  if(window.SBS_ORG){
    const r = window.SBS_ORG.resolveLogin(raw);
    if(r.ok){ email = r.email; }
    else if(r.ambiguous){ loginErr("Há mais de um "+raw+". Use nome.sobrenome (ex.: "+r.options[0].split("@")[0]+")."); return; }
    else if(!email.includes("@")){ email = email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
  } else if(!email.includes("@")){ email = email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
  if(!isAuthorized(email)){ loginErr("Usuário não autorizado. Solicite acesso à governança SBS."); return; }
  if(pass!==window.SBS_PASSWORD){ loginErr("Senha incorreta."); return; }
  try{ localStorage.setItem("sbs_user",email); }catch(e){}
  applyUser(email); hideLogin(); go("home");
  window.Gam && window.Gam.award("login");
  setTimeout(()=>{ window.SBS_ONBOARD && window.SBS_ONBOARD.open(false); }, 500);
});
document.getElementById("lg-eye").addEventListener("click",()=>{
  const p=document.getElementById("lg-pass");
  p.type = p.type==="password" ? "text" : "password";
});

/* ----- live clock in status bar ----- */
function clock(){
  const d=new Date();
  document.getElementById("sb-time").textContent =
    d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
}
clock(); setInterval(clock,30000);

/* ----- init: gate by auth ----- */
const saved = (()=>{ try{ return (localStorage.getItem("sbs_user")||"").toLowerCase(); }catch(e){ return ""; } })();
if(saved && isAuthorized(saved)){ applyUser(saved); hideLogin(); window.Gam && window.Gam.award("login"); setTimeout(()=>{ window.SBS_ONBOARD && window.SBS_ONBOARD.open(false); }, 500); }
else { showLogin(); }

window.lucide && lucide.createIcons();
go("home");

/* re-render ao vivo quando chega dado da nuvem (sem atrapalhar quem digita) */
if(window.SBSStore){
  window.SBSStore.onChange(function(d){
    if(!d || !d.remote) return;
    // som quando chega notificação nova para este usuário
    const nowCount = (window.SBS_notifUnread ? window.SBS_notifUnread() : 0);
    if(nowCount > _lastNotifCount){ sound("notif"); }
    _lastNotifCount = nowCount;
    const ae = document.activeElement;
    const typing = ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT");
    const onLogin = !document.getElementById("login").classList.contains("hidden");
    if(typing || onLogin){ updateBell(); return; }
    updateBell();
    // re-aplica gate de features e versão ao chegar mudança da nuvem
    if(window.SBS_FEATURES){ SBS_FEATURES.gateAll(document); applyVersion(); }
    if(["precos","campanhas","materiais","treinamentos","notificacoes"].indexOf(current)>=0) go(current);
  });
}
})();
