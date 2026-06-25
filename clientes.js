/* ===========================================================
   SBS — Clientes & Rotas (supervisor / regional)
   - Carteira de clientes no escopo do usuário
   - Contatos editáveis (telefone, e-mail, endereço) salvos na store
   - Priorização de prospecção (só BS, faturou ano passado, sem venda)
   - Roteirizador: seleciona clientes → abre rota otimizada no Google Maps
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;
const fmtK = n => { n=Number(n)||0; return n>=1e6?("R$ "+(n/1e6).toFixed(1)+" mi"):n>=1e3?("R$ "+(n/1e3).toFixed(0)+" mil"):("R$ "+n); };

function contatos(){ const m={}; (window.SBSStore?window.SBSStore.getCol("contatos"):[]).forEach(c=>m[c.cli]=c); return m; }

// geo do TOTVS: município/UF por cliente (match exato e aproximado por prefixo)
let GEOKEYS=null;
function geoDe(nome){
  const G=window.CLIENTE_GEO; if(!G||!nome) return null;
  if(G[nome]) return G[nome];
  const up=nome.toUpperCase().trim();
  if(G[up]) return G[up];
  if(!GEOKEYS) GEOKEYS=Object.keys(G);
  // match por prefixo (nomes às vezes truncados entre planilhas)
  const hit=GEOKEYS.find(k=>{ const a=k.toUpperCase(); return a===up || a.startsWith(up.slice(0,18)) || up.startsWith(a.slice(0,18)); });
  return hit?G[hit]:null;
}
function enderecoDe(cli, c){
  if(c&&c.endereco) return c.endereco;
  const g=geoDe(cli); if(g&&g.mun) return cli+", "+g.mun+(g.uf?"/"+g.uf:"");
  return null;
}
function saveContato(cli, patch){
  if(!window.SBSStore) return;
  const ex = window.SBSStore.getCol("contatos").find(c=>c.cli===cli);
  if(ex) window.SBSStore.update("contatos", ex.id, patch);
  else window.SBSStore.add("contatos", {cli, ...patch});
}

// prioridade: 0=prospectar(só BS) 1=reativar(faturou antes, sem meta?) 2=sem venda 3=ativo
function prioridade(d){
  if(d.t==="APENAS BS") return {k:0, lb:"Prospectar — só BS", cls:"pr-bs"};
  if(d.v>0) return {k:3, lb:"Cliente ativo", cls:"pr-ok"};
  return {k:2, lb:"Sem venda — reativar", cls:"pr-no"};
}

let ROTA = []; // nomes selecionados p/ rota

S.clientes = {
  title: "Clientes & Rotas",
  render(){
    const u = D.user;
    if(!window.SBS_PLANO) return `<div class="card">Base de clientes indisponível.</div>`;
    const mine = window.SBS_PLANO.clientesDoEscopo(u);
    const ct = contatos();
    const bs = mine.filter(d=>d.t==="APENAS BS").length;
    const semv = mine.filter(d=>!d.v).length;
    return `
    <div class="hero" style="background:linear-gradient(150deg,#0B6B61,#10B0A0)">
      <div class="uname" style="font-size:18px">Clientes & Rotas</div>
      <div class="urole" style="opacity:.92">Sua carteira, contatos e roteiro de prospecção</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${mine.length}</div><div class="hs-l">clientes</div></div>
        <div class="hero-stat"><div class="hs-v">${bs}</div><div class="hs-l">só BS (prospectar)</div></div>
        <div class="hero-stat"><div class="hs-v">${semv}</div><div class="hs-l">sem venda</div></div>
      </div>
    </div>

    <div class="seg" id="cl-seg">
      <button class="seg-b on" data-f="sugeridos">Sugeridos</button>
      <button class="seg-b" data-f="bs">Só BS</button>
      <button class="seg-b" data-f="semv">Sem venda</button>
      <button class="seg-b" data-f="todos">Todos</button>
    </div>
    <div class="search"><i data-lucide="search"></i><input id="cl-q" placeholder="Buscar cliente..."></div>
    <div class="row-between" style="margin:0 4px 10px">
      <span class="muted" id="cl-count" style="font-size:12px;font-weight:700"></span>
      <span class="muted" style="font-size:12px;font-weight:700">Toque para detalhes</span>
    </div>
    <div id="cl-list" class="stack"></div>

    <div id="cl-rota-bar" class="rota-bar" style="display:none">
      <div class="rb-info"><b id="cl-rota-n">0</b> na rota</div>
      <input type="date" id="cl-rota-data" class="rb-date">
      <button class="btn" id="cl-rota-go" style="width:auto;padding:11px 14px"><i data-lucide="save"></i> Salvar</button>
    </div>`;
  },
  mount(root){
    const u = D.user;
    const mine = window.SBS_PLANO.clientesDoEscopo(u);
    let filter="sugeridos";
    ROTA = [];

    function groupList(){
      let list = mine.slice();
      if(filter==="bs") list=list.filter(d=>d.t==="APENAS BS");
      else if(filter==="semv") list=list.filter(d=>!d.v);
      else if(filter==="sugeridos"){ list=list.filter(d=>d.t==="APENAS BS"||!d.v); list.sort((a,b)=>prioridade(a).k-prioridade(b).k || (b.v||0)-(a.v||0)); }
      return list;
    }
    function draw(){
      const ct = contatos();
      const q=(root.querySelector("#cl-q").value||"").toLowerCase();
      let list=groupList().filter(d=>!q||(d.c||"").toLowerCase().includes(q));
      const total=list.length;
      list=list.slice(0,100);
      root.querySelector("#cl-count").textContent = total+" clientes"+(total>100?" · mostrando 100":"");
      root.querySelector("#cl-list").innerHTML = list.map(d=>{
        const pr=prioridade(d); const c=ct[d.c]||{};
        const inRoute=ROTA.includes(d.c);
        return `<div class="cl-card" data-cli="${encodeURIComponent(d.c)}">
          <div class="cl-head">
            <div style="flex:1;min-width:0">
              <div class="cl-name">${d.c}</div>
              <div class="cl-meta"><span><i data-lucide="map-pin"></i>${(geoDe(d.c)&&geoDe(d.c).mun)?geoDe(d.c).mun+(geoDe(d.c).uf?"/"+geoDe(d.c).uf:""):d.r}</span><span><i data-lucide="store"></i>${d.ca||"—"}</span></div>
            </div>
            <button class="cl-route ${inRoute?'on':''}" data-route="${encodeURIComponent(d.c)}" title="Adicionar à rota"><i data-lucide="${inRoute?'check':'plus'}"></i></button>
          </div>
          <div class="cl-tags">
            <span class="pr ${pr.cls}">${pr.lb}</span>
            ${d.v?`<span class="cl-v">${fmtK(d.v)} em 25</span>`:""}
          </div>
          <div class="cl-contact">
            ${c.fone?`<a class="cl-act" href="tel:${c.fone.replace(/\D/g,'')}"><i data-lucide="phone"></i>Ligar</a>`:""}
            ${c.email?`<a class="cl-act" href="mailto:${c.email}"><i data-lucide="mail"></i>E-mail</a>`:""}
            ${enderecoDe(d.c,c)?`<a class="cl-act" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoDe(d.c,c))}" target="_blank" rel="noopener"><i data-lucide="navigation"></i>Mapa</a>`:""}
            <button class="cl-act cl-edit" data-edit="${encodeURIComponent(d.c)}"><i data-lucide="pencil"></i>${(c.fone||c.email||c.endereco)?'Editar':'Add contato'}</button>
          </div>
        </div>`;
      }).join("") || `<div class="card" style="text-align:center;color:var(--muted)">Nenhum cliente neste filtro.</div>`;
      window.lucide&&lucide.createIcons();
      updateRotaBar();
    }
    function updateRotaBar(){
      const bar=root.querySelector("#cl-rota-bar");
      bar.style.display = ROTA.length?"flex":"none";
      root.querySelector("#cl-rota-n").textContent = ROTA.length;
    }
    root.querySelector("#cl-seg").addEventListener("click",e=>{
      const b=e.target.closest(".seg-b"); if(!b)return;
      root.querySelectorAll("#cl-seg .seg-b").forEach(x=>x.classList.remove("on"));
      b.classList.add("on"); filter=b.dataset.f; draw();
    });
    root.querySelector("#cl-q").addEventListener("input",draw);
    root.querySelector("#cl-list").addEventListener("click",e=>{
      const rt=e.target.closest("[data-route]");
      if(rt){ const cli=decodeURIComponent(rt.dataset.route); const i=ROTA.indexOf(cli);
        if(i>=0) ROTA.splice(i,1); else { if(ROTA.length>=10){ window.SBS.toast("Máx. 10 paradas na rota"); return;} ROTA.push(cli);} draw(); return; }
      const ed=e.target.closest("[data-edit]");
      if(ed){ openEdit(decodeURIComponent(ed.dataset.edit)); return; }
    });
    function openEdit(cli){
      const ct=contatos(); const c=ct[cli]||{};
      const box=document.createElement("div"); box.className="cl-modal";
      box.innerHTML=`<div class="cl-sheet">
        <div class="cl-sheet-h"><div style="font-weight:800;font-size:15px">${cli}</div><button class="iconbtn" id="cl-x"><i data-lucide="x"></i></button></div>
        <div class="field"><label>Telefone</label><input id="ct-fone" value="${(c.fone||'').replace(/"/g,'')}" inputmode="tel" placeholder="(00) 00000-0000"></div>
        <div class="field"><label>E-mail</label><input id="ct-email" value="${(c.email||'').replace(/"/g,'')}" inputmode="email" placeholder="cliente@email.com"></div>
        <div class="field"><label>Endereço completo</label><textarea id="ct-end" placeholder="Rua, nº, município/UF — usado na rota">${c.endereco||''}</textarea></div>
        <button class="btn" id="ct-save"><i data-lucide="check"></i> Salvar contato</button>
      </div>`;
      document.getElementById("device").appendChild(box);
      window.lucide&&lucide.createIcons();
      const close=()=>box.remove();
      box.addEventListener("click",e=>{ if(e.target===box) close(); });
      box.querySelector("#cl-x").onclick=close;
      box.querySelector("#ct-save").onclick=()=>{
        saveContato(cli,{ fone:box.querySelector("#ct-fone").value.trim(), email:box.querySelector("#ct-email").value.trim(), endereco:box.querySelector("#ct-end").value.trim() });
        window.SBS.toast("Contato salvo"); window.Gam&&window.Gam.award("contato"); close(); draw();
      };
    }
    root.querySelector("#cl-rota-go").addEventListener("click",()=>{
      const u=D.user;
      const dInput=root.querySelector("#cl-rota-data");
      const dataISO = dInput.value || new Date().toISOString().slice(0,10);
      const ct=contatos();
      const paradas = ROTA.map(cli=>{ const g=geoDe(cli)||{}; return { c:cli, mun:g.mun||"", uf:g.uf||"", end:enderecoDe(cli,ct[cli])||cli, done:false }; });
      const munis = [...new Set(paradas.map(p=>p.mun).filter(Boolean))];
      const outras = (window.SBSStore?window.SBSStore.getCol("rotas"):[]).filter(r=>r.data===dataISO && (r.email||"").toLowerCase()!==(u.email||"").toLowerCase());
      const conflitos=[];
      outras.forEach(r=>{ (r.municipios||[]).forEach(m=>{ if(munis.includes(m)) conflitos.push(r.autor+" ("+m+")"); }); });
      const salvar = ()=>{
        if(window.SBSStore){ window.SBSStore.add("rotas", {
          email:u.email, autor:u.name, papel:u.papel, data:dataISO,
          municipios:munis, paradas, criada:window.SBSStore.today() }); }
        window.SBS.toast("Rota salva para "+dataISO.split("-").reverse().join("/"));
        window.Gam&&window.Gam.award("rota");
        ROTA=[]; window.SBS.go("rotas");
      };
      if(conflitos.length){
        if(!confirm("\u26a0\ufe0f Conflito no mesmo dia:\n"+conflitos.slice(0,4).join(", ")+"\n\nSalvar mesmo assim?")) return;
      }
      salvar();
    });
    draw();
  }
};

})();
