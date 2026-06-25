/* ===========================================================
   SBS — Plano de Ação BS × SBS
   Cruza a base da planilha (BS/SBS) e gera prospecção por supervisor.
   - APENAS BS  → cliente compra concorrente, NÃO compra SBS → prospectar
   - vendas 25 = 0 → cliente sem venda → atender
   Status de ação fica na store (col "plano_acao"): {cli, status, supEmail, nota, data}
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;

function norm(s){ return (s||"").toString().toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z\s]/g," ").replace(/\s+/g," ").trim(); }

// casa o nome livre do supervisor (planilha) com um email do organograma
function supEmailFromName(raw){
  if(!window.SBS_ORG) return null;
  const n = norm(raw);
  if(!n) return null;
  let best=null, bestScore=0;
  window.SBS_ORG.PEOPLE.forEach(p=>{
    const toks = norm(p.nome).split(" ");
    let hit=0; toks.forEach(t=>{ if(t.length>2 && n.includes(t)) hit++; });
    const score = hit/Math.max(1,toks.length);
    if(hit>0 && score>bestScore){ bestScore=score; best=p.email; }
  });
  return bestScore>=0.5 ? best : null;
}

// pré-computa o vínculo cliente → supEmail (uma vez)
let CACHE=null;
function base(){
  if(CACHE) return CACHE;
  const raw = window.METAS_CLIENTES||[];
  CACHE = raw.map(d=>({ ...d, supEmail: supEmailFromName(d.s) }));
  return CACHE;
}

// clientes visíveis para o usuário logado, conforme escopo
function clientesDoEscopo(u){
  const all = base();
  if(!window.SBS_ORG) return all;
  if(u.papel==="nacional"||u.papel==="admin") return all;
  const esc = window.SBS_ORG.escopo(u.email).map(e=>e.toLowerCase());
  return all.filter(d=>d.supEmail && esc.includes(d.supEmail.toLowerCase()));
}

function statusMap(){ const m={}; (window.SBSStore?window.SBSStore.getCol("plano_acao"):[]).forEach(a=>{ m[a.cli]=a; }); return m; }
const fmt = n => "R$ "+(Number(n)||0).toLocaleString("pt-BR");
const fmtK = n => { n=Number(n)||0; return n>=1e6?("R$ "+(n/1e6).toFixed(1)+" mi"):n>=1e3?("R$ "+(n/1e3).toFixed(0)+" mil"):("R$ "+n); };

/* ---------------- TELA: PLANO DE AÇÃO ---------------- */
S.plano = {
  title: "Plano de Ação",
  render(){
    const u = D.user;
    const mine = clientesDoEscopo(u);
    const apenasBS = mine.filter(d=>d.t==="APENAS BS");      // compra BS, não SBS
    const apenasSBS = mine.filter(d=>d.t==="APENAS SBS");    // só SBS
    const ambos = mine.filter(d=>d.t==="AMBOS");             // SBS + BS
    const prospect = apenasBS;                                // alvos de prospecção
    const semVenda = mine.filter(d=>!d.v);                    // sem venda 25
    const sm = statusMap();
    const feitos = prospect.filter(d=>sm[d.c] && sm[d.c].status==="ok").length;
    const andamento = prospect.filter(d=>sm[d.c] && sm[d.c].status==="andamento").length;

    return `
    <div class="hero" style="background:linear-gradient(150deg,#0B6B61,#10B0A0)">
      <div class="uname" style="font-size:18px">Plano de Ação · BS × SBS</div>
      <div class="urole" style="opacity:.92">Carteira segmentada por relação com SBS e concorrência (BS)</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${prospect.length}</div><div class="hs-l">a prospectar</div></div>
        <div class="hero-stat"><div class="hs-v">${andamento}</div><div class="hs-l">em andamento</div></div>
        <div class="hero-stat"><div class="hs-v">${feitos}</div><div class="hs-l">atendidos</div></div>
      </div>
    </div>

    <div class="seg seg-wrap" id="pl-seg">
      <button class="seg-b on" data-f="prospect">Prospecção (${prospect.length})</button>
      <button class="seg-b" data-f="sbs">Só SBS (${apenasSBS.length})</button>
      <button class="seg-b" data-f="bs">Só BS (${apenasBS.length})</button>
      <button class="seg-b" data-f="ambos">SBS + BS (${ambos.length})</button>
      <button class="seg-b" data-f="semvenda">Sem venda (${semVenda.length})</button>
    </div>
    <div class="search"><i data-lucide="search"></i><input id="pl-q" placeholder="Buscar cliente..."></div>
    <div class="muted" id="pl-count" style="font-size:12px;font-weight:700;margin:0 4px 10px"></div>
    <div id="pl-list" class="stack"></div>`;
  },
  mount(root){
    const u = D.user;
    const mine = clientesDoEscopo(u);
    let filter = "prospect";
    const groups = {
      prospect: mine.filter(d=>d.t==="APENAS BS"),
      sbs: mine.filter(d=>d.t==="APENAS SBS"),
      bs: mine.filter(d=>d.t==="APENAS BS"),
      ambos: mine.filter(d=>d.t==="AMBOS"),
      semvenda: mine.filter(d=>!d.v),
    };
    const stTone = {ok:["b-good","Atendido"], andamento:["b-warn","Em andamento"], "":["b-muted","A fazer"]};
    function draw(){
      const sm = statusMap();
      const q = (root.querySelector("#pl-q").value||"").toLowerCase();
      let list = groups[filter].filter(d=>!q || (d.c||"").toLowerCase().includes(q));
      list = list.slice(0, 120); // performance
      root.querySelector("#pl-count").textContent = groups[filter].length+" clientes"+(groups[filter].length>120?" · mostrando 120":"");
      root.querySelector("#pl-list").innerHTML = list.map(d=>{
        const a = sm[d.c]||{status:""};
        const tone = stTone[a.status||""];
        return `<div class="pl-card" data-cli="${encodeURIComponent(d.c)}">
          <div class="pl-top">
            <div class="pl-name">${d.c}</div>
            <span class="badge ${tone[0]}">${tone[1]}</span>
          </div>
          <div class="pl-meta">
            <span><i data-lucide="map-pin"></i>${d.r}</span>
            <span><i data-lucide="store"></i>${d.ca||"—"}</span>
            ${d.t==="APENAS BS"?'<span class="pl-bs"><i data-lucide="alert-circle"></i>só concorrente</span>':""}
            ${d.v?`<span><i data-lucide="trending-up"></i>${fmtK(d.v)} em 25</span>`:'<span class="pl-bs">sem venda 25</span>'}
          </div>
          <div class="pl-actions">
            <button class="pl-b ${a.status==='andamento'?'on':''}" data-set="andamento"><i data-lucide="clock"></i> Em ação</button>
            <button class="pl-b ${a.status==='ok'?'on':''}" data-set="ok"><i data-lucide="check"></i> Atendido</button>
          </div>
        </div>`;
      }).join("") || `<div class="card" style="text-align:center;color:var(--muted)">Nenhum cliente neste filtro.</div>`;
      window.lucide&&lucide.createIcons();
    }
    root.querySelector("#pl-seg").addEventListener("click",e=>{
      const b=e.target.closest(".seg-b"); if(!b)return;
      root.querySelectorAll("#pl-seg .seg-b").forEach(x=>x.classList.remove("on"));
      b.classList.add("on"); filter=b.dataset.f; draw();
    });
    root.querySelector("#pl-q").addEventListener("input",draw);
    root.querySelector("#pl-list").addEventListener("click",e=>{
      const btn=e.target.closest("[data-set]"); if(!btn)return;
      const card=btn.closest(".pl-card"); const cli=decodeURIComponent(card.dataset.cli);
      const novo=btn.dataset.set;
      const sm=statusMap(); const cur=sm[cli];
      const status = (cur&&cur.status===novo)?"":novo; // toggle
      if(window.SBSStore){
        if(cur){ window.SBSStore.update("plano_acao", cur.id, {status, data:window.SBSStore.today(), supEmail:u.email}); }
        else { window.SBSStore.add("plano_acao", {cli, status, supEmail:u.email, data:window.SBSStore.today()}); }
      }
      if(status==="ok"){ window.SBS.toast("Cliente marcado como atendido"); window.Gam&&window.Gam.award("prospeccao"); }
      draw();
    });
    draw();
  }
};

window.SBS_PLANO = { base, clientesDoEscopo, supEmailFromName };
})();
