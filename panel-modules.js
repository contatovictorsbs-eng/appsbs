/* ===========================================================
   SBS Painel — módulos (parte 1)
   Visão Geral · Preços · Campanhas · Materiais · Usuários
   =========================================================== */
(function(){
const P = PANEL, S = P.S, M = P.Modules, esc = P.esc;

/* =================== VISÃO GERAL =================== */
M.overview = {
  label: "Visão Geral",
  render(){
    const recl = S.getCol("reclamacoes"), cham = S.getCol("chamados"), ped = S.getCol("pedidos"), usr = S.getCol("usuarios");
    const reclAbertas = recl.filter(r=>r.status!=="resolvido").length;
    const chamAbertos = cham.filter(c=>c.status!=="resolvido").length;
    const faturado = ped.filter(p=>p.status==="faturado").reduce((s,p)=>s+p.valor,0);
    const carteira = ped.reduce((s,p)=>s+p.valor,0);
    const ativos = usr.filter(u=>u.ativo).length;
    const D = window.DATA;

    const kpis = [
      { ic:"target", tone:"brand", v:P.fmtMi(4.8e6), l:"Meta da safra" },
      { ic:"circle-check", v:P.fmtMi(carteira), l:"Pedidos em carteira", delta:"+8,4%", up:true },
      { ic:"badge-dollar-sign", v:P.fmtMi(faturado), l:"Faturado (jun)" },
      { ic:"users", v:ativos, l:"Vendedores ativos" },
      { ic:"message-square-warning", tone: reclAbertas?"warn":"", v:reclAbertas, l:"Reclamações abertas" },
      { ic:"life-buoy", tone: chamAbertos?"warn":"", v:chamAbertos, l:"Chamados pendentes" },
      { ic:"map-pin", v: S.getCol("visitas").length, l:"Visitas registradas" },
      { ic:"megaphone", v: S.getCol("campanhas").filter(c=>c.ativo).length, l:"Campanhas ativas" },
    ];

    // atividade recente (mistura reclamações + chamados + visitas)
    const feed = [];
    recl.slice(0,3).forEach(r=>feed.push({ic:"message-square-warning",tone:"danger",t:`Reclamação ${r.protocolo} · ${r.cliente}`,x:r.produto+" — "+r.vendedor,time:r.data,nav:"reclamacoes"}));
    cham.slice(0,3).forEach(c=>feed.push({ic:"life-buoy",tone:"info",t:`Chamado ${c.protocolo} · ${c.area}`,x:c.assunto+" — "+c.solicitante,time:c.data,nav:"chamados"}));
    S.getCol("visitas").slice(0,2).forEach(v=>feed.push({ic:"map-pin",tone:"good",t:`Visita · ${v.cliente}`,x:v.objetivo+" — "+(v.vendedor||""),time:v.data,nav:"visitas"}));

    const toneBg = {danger:"var(--danger-bg)",info:"var(--info-bg)",good:"var(--good-bg)",warn:"var(--warn-bg)"};
    const toneFg = {danger:"var(--danger)",info:"oklch(0.45 0.1 230)",good:"var(--good)",warn:"oklch(0.5 0.12 70)"};

    return `
    <div class="grid cols-4">
      ${kpis.map(k=>`
        <div class="kpi ${k.tone==='brand'?'brand':''}">
          <div class="top"><span class="ic" ${k.tone&&k.tone!=='brand'?`style="background:${toneBg[k.tone]};color:${toneFg[k.tone]}"`:''}><i data-lucide="${k.ic}"></i></span>
            ${k.delta?`<span class="delta ${k.up?'up':'down'}"><i data-lucide="${k.up?'arrow-up-right':'arrow-down-right'}"></i>${k.delta}</span>`:""}</div>
          <div class="v">${k.v}</div><div class="l">${k.l}</div>
        </div>`).join("")}
    </div>

    <div class="grid cols-2" style="margin-top:18px;align-items:start">
      <div class="card">
        <div class="between"><div class="sec-title" style="margin:0">Atingimento da meta</div><span class="badge b-brand">Safra 25/26</span></div>
        <div class="row" style="gap:22px;margin-top:18px">
          <div style="width:120px;height:120px;border-radius:50%;flex:0 0 auto;background:conic-gradient(var(--accent) 65%, var(--green-100) 0);display:grid;place-items:center">
            <div style="width:88px;height:88px;border-radius:50%;background:#fff;display:grid;place-items:center;flex-direction:column;text-align:center">
              <b style="font-size:26px">65%</b><span style="font-size:10px;color:var(--muted);font-weight:700">da meta</span></div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:14px">
            <div><div class="muted" style="font-size:12px;font-weight:700">Faturado</div><div style="font-size:20px;font-weight:800">${P.fmtMi(faturado)}</div></div>
            <div><div class="muted" style="font-size:12px;font-weight:700">Gap para meta</div><div style="font-size:20px;font-weight:800;color:var(--danger)">R$ 0,94 mi</div></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="between" style="margin-bottom:6px"><div class="sec-title" style="margin:0">Atividade recente</div></div>
        <div class="feed">
          ${feed.slice(0,7).map(f=>`
            <div class="feed-item" data-nav="${f.nav}" style="cursor:pointer">
              <span class="feed-ic" style="background:${toneBg[f.tone]};color:${toneFg[f.tone]}"><i data-lucide="${f.ic}"></i></span>
              <div style="min-width:0"><div class="t">${esc(f.t)}</div><div class="x">${esc(f.x)}</div></div>
              <span class="time">${f.time}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
  },
  mount(c){
    c.querySelectorAll("[data-nav]").forEach(el=>el.addEventListener("click",()=>P.go(el.dataset.nav)));
  }
};

/* =================== TABELA DE PREÇOS =================== */
M.precos = {
  label: "Tabela de Preços",
  _cat: null,
  render(){
    const P0 = S.get("precos") || window.PRECOS;
    if(!this._cat) this._cat = P0.catalogos[0].id;
    const cat = P0.catalogos.find(c=>c.id===this._cat);
    return `
    <div class="between" style="margin-bottom:4px">
      <div class="muted" style="font-size:13px">${esc(P0.meta.versao)} · ${esc(P0.meta.safra)} · atualizado ${esc(P0.meta.data)}</div>
      <button class="btn ghost sm" id="px-date"><i data-lucide="calendar"></i> Alterar data/versão</button>
    </div>
    <div class="ptabs" id="px-tabs">
      ${P0.catalogos.map(c=>`<button class="ptab ${c.id===this._cat?'on':''}" data-cat="${c.id}"><i data-lucide="${c.icon}"></i>${esc(c.nome)}</button>`).join("")}
    </div>
    <div class="table-wrap">
      <table class="tbl" id="px-table">
        <thead><tr>
          <th>Produto</th>${cat.hasSaco?'<th>Saca</th>':''}
          ${cat.condicoes.map(cc=>`<th class="right">${esc(cc.s)}</th>`).join("")}
          <th></th>
        </tr></thead>
        <tbody>${this._rows(cat)}</tbody>
      </table>
    </div>
    <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Os preços editados aqui são refletidos imediatamente no app do vendedor.</div>`;
  },
  _rows(cat){
    let rows = [];
    if(cat.grupos){
      cat.grupos.forEach((g,gi)=>{
        rows.push(`<tr><td colspan="20" style="background:var(--green-50);font-weight:800;color:var(--green-800);font-size:12px">${esc(g.nome)}</td></tr>`);
        g.itens.forEach((it,ii)=> rows.push(this._row(cat, it, `${gi}.${ii}`, (it.cultivar||g.nome), it.padrao)));
      });
    } else {
      cat.itens.forEach((it,ii)=> rows.push(this._row(cat, it, ii+"", it.nome, it.comp)));
    }
    return rows.join("");
  },
  _row(cat, it, ref, nome, sub){
    const saco = cat.hasSaco ? (it.saco?it.saco+" kg":(cat.sacoFixo||"—")) : "";
    return `<tr data-ref="${ref}">
      <td><div class="strong">${esc(nome)}</div>${sub?`<div class="sub">${esc(sub)}</div>`:""}</td>
      ${cat.hasSaco?`<td class="sub">${esc(saco)}</td>`:''}
      ${it.precos.map((p,pi)=>`<td class="right" data-p="${pi}"><span class="px-val">R$ ${esc(p)}</span></td>`).join("")}
      <td class="right"><button class="btn-ic px-edit" title="Editar"><i data-lucide="pencil"></i></button></td>
    </tr>`;
  },
  mount(c){
    const self = this;
    c.querySelector("#px-tabs").addEventListener("click", e=>{
      const b = e.target.closest("[data-cat]"); if(!b) return;
      self._cat = b.dataset.cat; P.go("precos");
    });
    c.querySelector("#px-date").addEventListener("click", ()=>{
      const P0 = S.get("precos") || window.PRECOS;
      P.modal("Data / versão da tabela", `
        <div class="fld"><label>Versão</label><input id="m-versao" value="${esc(P0.meta.versao)}"></div>
        <div class="fld"><label>Safra</label><input id="m-safra" value="${esc(P0.meta.safra)}"></div>
        <div class="fld"><label>Data de atualização</label><input id="m-data" value="${esc(P0.meta.data)}"></div>`,
        `<button class="btn outline" onclick="PANEL.closeModal()">Cancelar</button><button class="btn" id="m-save">Salvar</button>`);
      document.getElementById("m-save").onclick = ()=>{
        P0.meta.versao = document.getElementById("m-versao").value;
        P0.meta.safra = document.getElementById("m-safra").value;
        P0.meta.data = document.getElementById("m-data").value;
        S.set("precos", P0); P.closeModal(); P.toast("Tabela atualizada"); P.go("precos");
      };
    });
    // editar linha
    c.querySelector("#px-table").addEventListener("click", e=>{
      const btn = e.target.closest(".px-edit"); if(!btn) return;
      const tr = btn.closest("tr"); const ref = tr.dataset.ref;
      const P0 = S.get("precos") || window.PRECOS;
      const cat = P0.catalogos.find(x=>x.id===self._cat);
      let it, nome;
      if(cat.grupos){ const [gi,ii]=ref.split("."); it=cat.grupos[gi].itens[ii]; nome=(it.cultivar||cat.grupos[gi].nome)+" · "+(it.padrao||""); }
      else { it=cat.itens[ref]; nome=it.nome; }
      P.modal("Editar preços — "+nome,
        `<div class="fld"><label>Foto do produto</label>
           <div id="pf-prev" style="margin-bottom:8px">${it.foto?`<img src="${it.foto}" style="width:90px;height:90px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow)">`:'<span class="muted" style="font-size:12px">Sem foto</span>'}</div>
           <input id="pf-file" type="file" accept="image/*">
           ${it.foto?'<button type="button" class="btn outline sm" id="pf-rm" style="margin-top:8px">Remover foto</button>':''}</div>
         <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:var(--muted);margin:6px 0 10px">Preços por condição</div>`+
        cat.condicoes.map((cc,i)=>`<div class="fld"><label>${esc(cc.s)} <span class="muted" style="font-weight:600">— ${esc(cc.f)}</span></label><input class="m-price" data-i="${i}" value="${esc(it.precos[i])}" inputmode="decimal"></div>`).join(""),
        `<button class="btn outline" onclick="PANEL.closeModal()">Cancelar</button><button class="btn" id="m-save">Salvar</button>`);
      let novaFoto = it.foto || null, removeu = false;
      const pfFile = document.getElementById("pf-file");
      pfFile.onchange = e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
        r.onload=()=>{ const img=new Image(); img.onload=()=>{ const max=600,sc=Math.min(1,max/Math.max(img.width,img.height));
          const cv=document.createElement('canvas'); cv.width=img.width*sc; cv.height=img.height*sc; cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
          novaFoto=cv.toDataURL('image/jpeg',0.8); removeu=false;
          document.getElementById("pf-prev").innerHTML=`<img src="${novaFoto}" style="width:90px;height:90px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow)">`;
        }; img.src=r.result; }; r.readAsDataURL(f); };
      const rm=document.getElementById("pf-rm"); if(rm) rm.onclick=()=>{ novaFoto=null; removeu=true; document.getElementById("pf-prev").innerHTML='<span class="muted" style="font-size:12px">Sem foto</span>'; };
      document.getElementById("m-save").onclick = ()=>{
        document.querySelectorAll(".m-price").forEach(inp=>{ it.precos[+inp.dataset.i] = inp.value.trim().replace(/^R\$\s*/,""); });
        if(removeu) delete it.foto; else if(novaFoto) it.foto = novaFoto;
        S.set("precos", P0); P.closeModal(); P.toast("Produto salvo — refletido no app"); P.go("precos");
      };
    });
  }
};

/* =================== CAMPANHAS =================== */
M.campanhas = {
  label: "Campanhas",
  render(){
    const camps = S.getCol("campanhas");
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">${camps.length} campanhas · ${camps.filter(c=>c.ativo).length} ativas</div>
      <button class="btn" id="cmp-new"><i data-lucide="plus"></i> Nova campanha</button>
    </div>
    <div class="grid cols-3">
      ${camps.map(c=>`
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:16px;color:#fff;background:linear-gradient(135deg,var(--green-800),var(--green-600))">
            <div class="between"><b style="font-size:16px">${esc(c.nome)}</b>
              <span class="badge" style="background:rgba(255,255,255,.2);color:#fff">${c.ativo?"Ativa":"Inativa"}</span></div>
            <div style="font-size:12px;opacity:.9;margin-top:4px">${esc(c.vigencia)}</div>
          </div>
          <div style="padding:14px 16px;font-size:13px;color:var(--ink-2);display:flex;flex-direction:column;gap:7px">
            <div><b class="muted" style="font-size:11px;text-transform:uppercase">Produtos</b><div>${esc(c.produtos)}</div></div>
            <div><b class="muted" style="font-size:11px;text-transform:uppercase">Benefício</b><div>${esc(c.beneficio)}</div></div>
          </div>
          <div style="padding:0 16px 14px;display:flex;gap:8px">
            <button class="btn outline sm cmp-edit" data-id="${c.id}"><i data-lucide="pencil"></i> Editar</button>
            <button class="btn ghost sm cmp-toggle" data-id="${c.id}">${c.ativo?"Desativar":"Ativar"}</button>
            <button class="btn-ic cmp-del" data-id="${c.id}" title="Excluir" style="margin-left:auto"><i data-lucide="trash-2"></i></button>
          </div>
        </div>`).join("")}
    </div>`;
  },
  _form(c){
    c = c||{};
    return `
      <div class="fld"><label>Nome da campanha</label><input id="f-nome" value="${esc(c.nome||"")}"></div>
      <div class="fld"><label>Vigência</label><input id="f-vig" value="${esc(c.vigencia||"")}" placeholder="01/06 a 31/08/2026"></div>
      <div class="fld"><label>Produtos participantes</label><input id="f-prod" value="${esc(c.produtos||"")}"></div>
      <div class="fld"><label>Benefício</label><input id="f-benef" value="${esc(c.beneficio||"")}"></div>
      <div class="fld"><label>Bonificação</label><input id="f-bonus" value="${esc(c.bonus||"")}"></div>
      <div class="fld-row">
        <div class="fld"><label>Tipo de premiação</label><select id="f-tprem">
          ${["Dinheiro","Prêmio","Dinheiro + Prêmio"].map(x=>`<option ${c.tipoPremio===x?"selected":""}>${x}</option>`).join("")}</select></div>
        <div class="fld"><label>Cor do card</label><select id="f-cor">
          ${["brand","green","amber","muted"].map(x=>`<option value="${x}" ${c.cor===x?"selected":""}>${x}</option>`).join("")}</select></div>
      </div>
      <div class="fld"><label>Prêmios (além de dinheiro)</label><input id="f-premio" value="${esc(c.premio||"")}" placeholder="Ex.: Smart TV, viagem, kit técnico..."></div>

      <div class="card" style="background:var(--card-2);box-shadow:none;margin-top:6px">
        <label class="row" style="gap:9px;cursor:pointer;justify-content:space-between">
          <span style="font-weight:800;font-size:13.5px"><i data-lucide="rocket" style="width:15px;height:15px;vertical-align:-2px"></i> Impulsionar campanha</span>
          <span class="sw ${c.boost?'on':''}" id="f-boost"></span></label>
        <div class="fld-row" style="margin-top:12px">
          <div class="fld"><label>Multiplicador da premiação</label><input id="f-bmult" inputmode="numeric" value="${c.boostMult||5}" placeholder="5"></div>
          <div class="fld"><label>Período do impulso</label><input id="f-bper" value="${esc(c.boostPeriodo||"")}" placeholder="Última semana"></div>
        </div>
        <div class="fld" style="margin-bottom:0"><label>Mensagem do impulso</label><input id="f-bmsg" value="${esc(c.boostMsg||"")}" placeholder="Premiação multiplicada nas vendas desta semana!"></div>
      </div>`;
  },
  _save(id){
    const data = { nome:val("f-nome"), vigencia:val("f-vig"), produtos:val("f-prod"), beneficio:val("f-benef"), bonus:val("f-bonus"), cor:val("f-cor"),
      tipoPremio:val("f-tprem"), premio:val("f-premio"),
      boost: document.getElementById("f-boost").classList.contains("on"),
      boostMult: parseInt((val("f-bmult")||"0").replace(/\D/g,""),10)||0, boostPeriodo:val("f-bper"), boostMsg:val("f-bmsg") };
    if(!data.nome){ P.toast("Informe o nome"); return; }
    if(id){ S.update("campanhas", id, data); P.toast("Campanha atualizada"); }
    else { S.add("campanhas", {...data, ativo:true, status:"Ativa"}); P.toast("Campanha criada — visível no app"); }
    P.closeModal(); P.go("campanhas");
  },
  mount(c){
    const self=this;
    const wireBoost = ()=>{ const t=document.getElementById("f-boost"); if(t) t.onclick=()=>t.classList.toggle("on"); };
    c.querySelector("#cmp-new").onclick = ()=>{ P.modal("Nova campanha", self._form(), foot("cmp-save")); wireBoost(); document.getElementById("cmp-save").onclick=()=>self._save(null); };
    c.querySelectorAll(".cmp-edit").forEach(b=>b.onclick=()=>{ const it=S.getCol("campanhas").find(x=>x.id===b.dataset.id); P.modal("Editar campanha", self._form(it), foot("cmp-save")); wireBoost(); document.getElementById("cmp-save").onclick=()=>self._save(b.dataset.id); });
    c.querySelectorAll(".cmp-toggle").forEach(b=>b.onclick=()=>{ const it=S.getCol("campanhas").find(x=>x.id===b.dataset.id); S.update("campanhas",b.dataset.id,{ativo:!it.ativo, status:!it.ativo?"Ativa":"Encerrada"}); P.go("campanhas"); });
    c.querySelectorAll(".cmp-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir esta campanha?")){ S.remove("campanhas",b.dataset.id); P.toast("Campanha excluída"); P.go("campanhas"); } });
  }
};

/* =================== MATERIAIS =================== */
M.materiais = {
  label: "Materiais Técnicos",
  render(){
    const mats = S.getCol("materiais");
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">${mats.length} materiais publicados no app</div>
      <button class="btn" id="mat-new"><i data-lucide="upload"></i> Adicionar material</button>
    </div>
    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>Material</th><th>Tipo</th><th>Arquivo</th><th></th></tr></thead>
        <tbody>
          ${mats.map(m=>`<tr>
            <td class="strong">${esc(m.nome)}</td>
            <td><span class="badge b-brand">${esc(m.tipo)}</span></td>
            <td class="sub">${esc(m.meta||"")}${m.dataUrl?' · enviado':''}</td>
            <td class="right"><div class="cell-actions">
              <button class="btn-ic mat-edit" data-id="${m.id}" title="Editar"><i data-lucide="pencil"></i></button>
              <button class="btn-ic mat-del" data-id="${m.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
            </div></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> PDFs enviados ficam disponíveis na biblioteca do app.</div>`;
  },
  _form(m){
    m=m||{};
    return `
      <div class="fld"><label>Nome do material</label><input id="f-nome" value="${esc(m.nome||"")}"></div>
      <div class="fld"><label>Tipo</label><select id="f-tipo">
        ${["Catálogo","Ficha Técnica","Material técnico","Resultados","Portfólio","Apresentação","Material comercial"].map(t=>`<option ${m.tipo===t?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="fld"><label>Arquivo PDF</label>
        <input id="f-file" type="file" accept="application/pdf">
        <div class="hint">${m.file?("Atual: "+esc(m.file)):"Selecione o PDF a publicar"}</div></div>`;
  },
  mount(c){
    const self=this;
    function openForm(m){
      P.modal(m?"Editar material":"Adicionar material", self._form(m), foot("mat-save"));
      document.getElementById("mat-save").onclick = ()=>{
        const nome=val("f-nome"), tipo=val("f-tipo");
        if(!nome){ P.toast("Informe o nome"); return; }
        const file = document.getElementById("f-file").files[0];
        const finish = (extra)=>{
          if(m){ S.update("materiais", m.id, {nome,tipo,...extra}); P.toast("Material atualizado"); }
          else { S.add("materiais", {nome,tipo,icon:"file-text",meta:extra.meta||"PDF",...extra}); P.toast("Material publicado no app"); }
          P.closeModal(); P.go("materiais");
        };
        if(file){
          const r=new FileReader();
          r.onload=()=>finish({ dataUrl:r.result, file:file.name, meta:"PDF · "+(file.size/1048576).toFixed(1)+" MB" });
          r.readAsDataURL(file);
        } else finish({});
      };
    }
    c.querySelector("#mat-new").onclick=()=>openForm(null);
    c.querySelectorAll(".mat-edit").forEach(b=>b.onclick=()=>openForm(S.getCol("materiais").find(x=>x.id===b.dataset.id)));
    c.querySelectorAll(".mat-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir este material?")){ S.remove("materiais",b.dataset.id); P.toast("Material excluído"); P.go("materiais"); } });
  }
};

/* =================== USUÁRIOS E ACESSOS =================== */
M.usuarios = {
  label: "Usuários e Acessos",
  render(){
    const us = S.getCol("usuarios");
    const perfis = Object.keys(PANEL.PERMS);
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">${us.length} usuários · ${us.filter(u=>u.ativo).length} ativos</div>
      <button class="btn" id="usr-new"><i data-lucide="user-plus"></i> Novo acesso</button>
    </div>
    <div class="table-wrap">
      <table class="tbl">
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th></th></tr></thead>
        <tbody id="usr-rows">
          ${us.map(u=>`<tr data-id="${u.id}">
            <td class="strong">${esc(u.nome)}</td>
            <td class="sub">${esc(u.email)}</td>
            <td><span class="badge ${u.perfil==='Administrador'?'b-brand':'b-muted'}">${esc(u.perfil)}</span></td>
            <td>${u.ativo?'<span class="badge b-good">Ativo</span>':'<span class="badge b-muted">Inativo</span>'}</td>
            <td class="right"><div class="cell-actions">
              <button class="btn-ic usr-edit" data-id="${u.id}" title="Editar"><i data-lucide="pencil"></i></button>
              <button class="btn-ic usr-del" data-id="${u.id}" title="Remover acesso"><i data-lucide="trash-2"></i></button>
            </div></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Senha padrão de novos acessos: <b style="color:var(--ink-2)">&nbsp;12345678</b>. O perfil define o que o usuário vê no painel e no app.</div>`;
  },
  _form(u){
    u=u||{};
    const perfis = Object.keys(PANEL.PERMS).concat(["Vendedor (app)"]);
    return `
      <div class="fld"><label>Nome</label><input id="f-nome" value="${esc(u.nome||"")}"></div>
      <div class="fld"><label>E-mail corporativo</label><input id="f-email" value="${esc(u.email||"")}" placeholder="nome@sbsgreen.com.br" ${u.email?"disabled":""}></div>
      <div class="fld"><label>Perfil de acesso</label><select id="f-perfil">
        ${perfis.map(p=>`<option ${u.perfil===p?"selected":""}>${p}</option>`).join("")}</select></div>
      <div class="fld"><label>Status</label><select id="f-ativo"><option value="1" ${u.ativo!==false?"selected":""}>Ativo</option><option value="0" ${u.ativo===false?"selected":""}>Inativo</option></select></div>`;
  },
  mount(c){
    const self=this;
    c.querySelector("#usr-new").onclick=()=>{
      P.modal("Novo acesso", self._form(), foot("usr-save"));
      document.getElementById("usr-save").onclick=()=>{
        const nome=val("f-nome"), email=(val("f-email")||"").trim().toLowerCase(), perfil=val("f-perfil"), ativo=val("f-ativo")==="1";
        if(!nome||!email){ P.toast("Preencha nome e e-mail"); return; }
        if(S.getCol("usuarios").some(x=>x.email===email)){ P.toast("E-mail já cadastrado"); return; }
        S.add("usuarios", {nome,email,perfil,ativo,criado:S.today()});
        // adiciona à lista de login do app também (em memória da sessão)
        if(window.SBS_USERS && !window.SBS_USERS.includes(email)) window.SBS_USERS.push(email);
        P.closeModal(); P.toast("Acesso criado · senha 12345678"); P.go("usuarios");
      };
    };
    c.querySelectorAll(".usr-edit").forEach(b=>b.onclick=()=>{
      const u=S.getCol("usuarios").find(x=>x.id===b.dataset.id);
      P.modal("Editar acesso", self._form(u), foot("usr-save"));
      document.getElementById("usr-save").onclick=()=>{
        S.update("usuarios", u.id, { nome:val("f-nome"), perfil:val("f-perfil"), ativo:val("f-ativo")==="1" });
        P.closeModal(); P.toast("Acesso atualizado"); P.go("usuarios");
      };
    });
    c.querySelectorAll(".usr-del").forEach(b=>b.onclick=()=>{ if(confirm("Remover este acesso?")){ S.remove("usuarios",b.dataset.id); P.toast("Acesso removido"); P.go("usuarios"); } });
  }
};

/* helpers compartilhados */
function val(id){ const e=document.getElementById(id); return e?e.value:""; }
function foot(saveId){ return `<button class="btn outline" onclick="PANEL.closeModal()">Cancelar</button><button class="btn" id="${saveId}">Salvar</button>`; }
window.__panelVal = val;
window.__panelFoot = foot;
})();
