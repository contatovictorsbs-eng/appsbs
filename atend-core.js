/* ===========================================================
   SBS Painel de Atendimento — núcleo
   Caixa unificada multimarca. Compartilha a nuvem/store do SBS.
   Duas visões: Operacional (atender) e Gerencial (indicadores
   e configuração). Integra reclamações/chamados do app.
   =========================================================== */
const ATEND = (function(){
  const S = window.SBSStore;
  const D = window.ATEND_DATA;

  /* ---------- seed nas coleções da store ---------- */
  function seed(){
    if(!S || !D) return;
    if(!(S.getCol("atend_conversas")||[]).length) S.setCol("atend_conversas", D.conversas.map(c=>Object.assign({},c)));
    if(!(S.getCol("atend_agentes")||[]).length)   S.setCol("atend_agentes",   D.agentes.map(a=>Object.assign({},a)));
    if(!(S.getCol("atend_canais")||[]).length)     S.setCol("atend_canais",    D.canais.map(c=>Object.assign({},c)));
    if(!(S.getCol("atend_regras")||[]).length)     S.setCol("atend_regras",    D.regras.map(r=>Object.assign({},r)));
  }

  /* ---------- acessores ---------- */
  function conversas(){ return S.getCol("atend_conversas")||[]; }
  function agentes(){ return S.getCol("atend_agentes")||[]; }
  function canais(){ return S.getCol("atend_canais")||[]; }
  function regras(){ return S.getCol("atend_regras")||[]; }
  function brand(id){ return D.BRANDS[id] || { id:id, name:id, color:"#888", soft:"#eee" }; }
  function channel(id){ return D.CHANNELS[id] || { name:id, icon:"message-circle" }; }

  /* integração: reclamações e chamados do app viram itens da caixa (marca SBS, canal App) */
  function appTickets(){
    var out = [];
    (S.getCol("reclamacoes")||[]).forEach(function(r){
      out.push({ id:"recl-"+r.id, _app:"reclamacao", _ref:r.id, nome:r.cliente||"Cliente", org:r.municipio||"",
        brand:"sbs", channel:"app", status: r.status==="resolvido"?"resolvido":(r.status==="aberto"?"pendente":"aberto"),
        ts: Date.parse(r._ts)|| (Date.now()-2*3600000), unread: r.status==="aberto"?1:0, agente:"",
        contato:{ fone:"", email:"", local:r.municipio||"", tipo:"Reclamação" },
        tags:[{label:"App · Reclamação",tone:"teal"},{label:r.protocolo||"",tone:"neutral"}],
        mensagens:[{ de:"cliente", texto:(r.produto?("Produto "+r.produto+". "):"")+(r.descricao||""), hora:r.data||"" }] });
    });
    (S.getCol("chamados")||[]).forEach(function(c){
      out.push({ id:"cham-"+c.id, _app:"chamado", _ref:c.id, nome:c.solicitante||"Solicitante", org:c.area||"",
        brand:"sbs", channel:"app", status: c.status==="resolvido"?"resolvido":(c.status==="aberto"?"pendente":"aberto"),
        ts: Date.now()-3*3600000, unread:c.status==="aberto"?1:0, agente:"",
        contato:{ fone:"", email:"", local:"", tipo:"Chamado interno" },
        tags:[{label:"App · Chamado",tone:"gold"},{label:c.area||"",tone:"neutral"}],
        mensagens:[{ de:"cliente", texto:(c.assunto?(c.assunto+". "):"")+(c.descricao||""), hora:c.data||"" }] });
    });
    return out;
  }
  function allConversas(){ return conversas().concat(appTickets()); }

  /* ---------- estado/sessão ---------- */
  let currentAgentId = "ana";
  let view = "operacional";
  let session = null;

  function agent(){ return agentes().find(a=>a.id===currentAgentId) || agentes()[0]; }
  function setAgent(id){ currentAgentId = id; try{ localStorage.setItem("sbs_atend_agent", id); }catch(e){} }
  function scopeBrands(){
    const a = agent(); if(!a) return Object.keys(D.BRANDS);
    if(a.papel==="admin"||a.papel==="supervisor") return Object.keys(D.BRANDS);
    return a.brands||[];
  }
  function canSee(brandId){ return scopeBrands().indexOf(brandId)>=0; }

  /* ---------- navegação ---------- */
  function go(v){
    view = v;
    document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("on", b.dataset.view===v));
    const c = document.getElementById("content");
    const mod = (window.ATEND_VIEWS||{})[v];
    if(!mod){ c.innerHTML = ""; return; }
    c.innerHTML = mod.render();
    icons(); mod.mount && mod.mount(c);
  }
  function refresh(){ go(view); }

  /* ---------- helpers ---------- */
  function icons(){ window.lucide && lucide.createIcons(); }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  let toastT;
  function toast(msg){
    const t = document.getElementById("toast");
    t.innerHTML = `<i data-lucide="check-circle-2"></i><span>${esc(msg)}</span>`; icons();
    t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2400);
  }
  function ago(ts){
    if(!ts) return "";
    var s=Math.floor((Date.now()-ts)/1000);
    if(s<60) return "agora"; var m=Math.floor(s/60); if(m<60) return "há "+m+" min";
    var h=Math.floor(m/60); if(h<24) return "há "+h+" h"; return "há "+Math.floor(h/24)+" d";
  }

  /* ---------- topbar (agente + sair) ---------- */
  function paintTopbar(){
    const a = agent(); if(!a) return;
    const sel = document.getElementById("agent-picker");
    if(sel){
      sel.innerHTML = agentes().map(x=>`<option value="${x.id}" ${x.id===a.id?"selected":""}>${esc(x.nome)}</option>`).join("");
    }
    const PAPEL = { admin:"Administrador", supervisor:"Supervisor", atendente:"Atendente" };
    const av = document.getElementById("agent-av");
    if(av){ var _u=window.SBS_AVATAR&&SBS_AVATAR.url(a.email); if(_u){ av.style.background="#fff"; } else { av.style.background=a.cor; av.textContent=a.nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); } }
    const role = document.getElementById("agent-role");
    if(role){ role.textContent = (PAPEL[a.papel]||"") + " · vê: " + (scopeBrands().length===Object.keys(D.BRANDS).length ? "todas as marcas" : scopeBrands().map(b=>brand(b).name).join(", ")); }
  }

  /* ---------- login ---------- */
  function showLogin(){ document.getElementById("login").classList.remove("hidden"); document.getElementById("app").classList.add("hidden"); }
  function startSession(email, loginView){
    session = { email };
    window.SBS_AVATAR&&SBS_AVATAR.setUser(email);
    // tenta casar o e-mail a um agente
    const a = agentes().find(x=>(x.email||"").toLowerCase()===(email||"").toLowerCase());
    if(a) setAgent(a.id);
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    paintTopbar();
    go(loginView||"operacional");
    try{ localStorage.setItem("sbs_atend_user", email); }catch(e){}
  }
  function logout(){ try{ localStorage.removeItem("sbs_atend_user"); }catch(e){} session=null; const p=document.getElementById("lg-pass"); if(p)p.value=""; showLogin(); }

  return { S, D, seed, conversas, agentes, canais, regras, brand, channel, allConversas, appTickets,
    agent, setAgent, scopeBrands, canSee, go, refresh, icons, esc, toast, ago, paintTopbar,
    showLogin, startSession, logout,
    get view(){ return view; }, get session(){ return session; },
    get currentAgentId(){ return currentAgentId; } };
})();
window.ATEND = ATEND;
