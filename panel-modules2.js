/* ===========================================================
   SBS Painel — módulos (parte 2)
   Reclamações · Chamados · Visitas · Pedidos · Treinamentos
   =========================================================== */
(function(){
const P = PANEL, S = P.S, M = P.Modules, esc = P.esc;
const val = window.__panelVal, foot = window.__panelFoot;

const STATUS = { aberto:["st-aberto","Aberto"], analise:["st-analise","Em análise"], resolvido:["st-resolvido","Resolvido"] };
function stPill(id, cur){
  return `<select class="stsel ${STATUS[cur][0]}" data-st="${id}">
    ${Object.keys(STATUS).map(k=>`<option value="${k}" ${k===cur?"selected":""}>${STATUS[k][1]}</option>`).join("")}
  </select>`;
}
function filterBar(id, counts){
  return `<div class="seg" id="${id}">
    <button data-f="todos" class="on">Todos (${counts.todos})</button>
    <button data-f="aberto">Abertos (${counts.aberto})</button>
    <button data-f="analise">Em análise (${counts.analise})</button>
    <button data-f="resolvido">Resolvidos (${counts.resolvido})</button>
  </div>`;
}
function counts(col){ const a=S.getCol(col); return { todos:a.length, aberto:a.filter(x=>x.status==="aberto").length, analise:a.filter(x=>x.status==="analise").length, resolvido:a.filter(x=>x.status==="resolvido").length }; }

/* =================== RECLAMAÇÕES =================== */
M.reclamacoes = {
  label: "Reclamações",
  _filter:"todos",
  render(){
    return `
    <div class="between" style="margin-bottom:16px">
      ${filterBar("rec-filter", counts("reclamacoes"))}
      <div class="muted" style="font-size:12.5px">Fluxo: Vendedor → Assist. Técnica → Qualidade → Retorno</div>
    </div>
    <div class="table-wrap">
      <table class="tbl"><thead><tr>
        <th>Protocolo</th><th>Cliente</th><th>Produto</th><th>Vendedor</th><th>Responsável</th><th>Status</th><th></th>
      </tr></thead><tbody id="rec-rows">${this._rows()}</tbody></table>
    </div>`;
  },
  _rows(){
    let a = S.getCol("reclamacoes");
    if(this._filter!=="todos") a=a.filter(x=>x.status===this._filter);
    if(!a.length) return `<tr><td colspan="7"><div class="empty"><i data-lucide="inbox"></i><div class="t">Nenhuma reclamação ${this._filter!=="todos"?STATUS[this._filter][1].toLowerCase():""}</div></div></td></tr>`;
    return a.map(r=>`<tr>
      <td class="strong">${esc(r.protocolo)}<div class="sub">${esc(r.data)}</div></td>
      <td>${esc(r.cliente)}<div class="sub">${esc(r.municipio)}</div></td>
      <td>${esc(r.produto)}<div class="sub">Lote ${esc(r.lote||"—")}</div></td>
      <td class="sub">${esc(r.vendedor)}</td>
      <td class="sub">${esc(r.responsavel||"—")}</td>
      <td>${stPill(r.id, r.status)}</td>
      <td class="right"><button class="btn outline sm rec-open" data-id="${r.id}">Ver</button></td>
    </tr>`).join("");
  },
  mount(c){
    const self=this;
    c.querySelector("#rec-filter").addEventListener("click",e=>{ const b=e.target.closest("[data-f]"); if(!b)return; self._filter=b.dataset.f; P.go("reclamacoes"); });
    c.querySelector("#rec-rows").addEventListener("change",e=>{ const s=e.target.closest("[data-st]"); if(!s)return; S.update("reclamacoes", s.dataset.st, {status:s.value}); P.toast("Status atualizado"); P.buildNav(); P.go("reclamacoes"); });
    c.querySelectorAll(".rec-open").forEach(b=>b.onclick=()=>self._detail(b.dataset.id));
  },
  _detail(id){
    const r = S.getCol("reclamacoes").find(x=>x.id===id);
    const head = `<div><div class="muted" style="font-size:12px;font-weight:800">RECLAMAÇÃO</div><h3 style="margin:3px 0 0;font-size:20px">${esc(r.protocolo)}</h3></div><span class="btn-ic" onclick="PANEL.closeSide()"><i data-lucide="x"></i></span>`;
    const body = `
      <div class="kv"><div class="k">Cliente</div><div class="vv">${esc(r.cliente)}<br>${esc(r.doc||"")}</div></div>
      ${r.tipo?`<div class="kv"><div class="k">Tipo</div><div class="vv"><span class="badge b-info">${esc(r.tipo)}</span></div></div>`:""}
      <div class="kv"><div class="k">Produto / Lote</div><div class="vv">${esc(r.produto)} · ${esc(r.lote||"—")}</div></div>
      <div class="kv"><div class="k">Município</div><div class="vv">${esc(r.municipio)}</div></div>
      <div class="kv"><div class="k">Vendedor</div><div class="vv">${esc(r.vendedor)} · ${esc(r.data)}</div></div>
      <div class="kv"><div class="k">Descrição</div><div class="vv">${esc(r.descricao)}</div></div>
      ${r.detalhes&&r.detalhes.length?r.detalhes.map(s=>`<div class="kv" style="display:block"><div class="k" style="margin-bottom:6px">${esc(s.secao)}</div><div class="vv"><table class="dt-mini">${s.itens.map(it=>`<tr><td>${esc(it[0])}</td><td>${esc(it[1])}</td></tr>`).join("")}</table></div></div>`).join(""):""}
      ${r.fotos&&r.fotos.length?`<div class="kv"><div class="k">Fotos (${r.fotos.length})</div><div class="vv"><div class="gallery">${r.fotos.map(f=>`<a href="${f}" target="_blank" rel="noopener"><img src="${f}" alt=""></a>`).join("")}</div></div></div>`:""}
      ${r.anexos&&r.anexos.length?`<div class="kv"><div class="k">Anexos (${r.anexos.length})</div><div class="vv">${r.anexos.map(a=>`<a class="anexo-link" href="${a.data}" download="${esc(a.name)}"><i data-lucide="file-text"></i> ${esc(a.name)}</a>`).join("")}</div></div>`:""}
      <div class="kv"><div class="k">Etapa atual</div><div class="vv">${esc(r.etapa||"Vendedor")}</div></div>
      <div class="fld" style="margin-top:18px"><label>Responsável</label>
        <select id="rec-resp">${["","Assistência Técnica","Qualidade","Comercial","Logística"].map(o=>`<option ${r.responsavel===o?"selected":""}>${o||"— não atribuído —"}</option>`).join("")}</select></div>
      <div class="fld"><label>Status</label>
        <select id="rec-status">${Object.keys(STATUS).map(k=>`<option value="${k}" ${r.status===k?"selected":""}>${STATUS[k][1]}</option>`).join("")}</select></div>
      <div class="fld"><label>Parecer / retorno ao cliente</label><textarea id="rec-parecer" placeholder="Registre o tratamento dado...">${esc(r.parecer||"")}</textarea></div>`;
    const ft = `<button class="btn outline" onclick="PANEL.closeSide()">Fechar</button><button class="btn" id="rec-save">Salvar tratamento</button>`;
    P.side(head, body, ft);
    document.getElementById("rec-save").onclick=()=>{
      const resp=document.getElementById("rec-resp").value;
      S.update("reclamacoes", id, { responsavel: resp==="— não atribuído —"?"":resp, status:document.getElementById("rec-status").value, parecer:document.getElementById("rec-parecer").value });
      P.closeSide(); P.toast("Reclamação atualizada"); P.buildNav(); P.go("reclamacoes");
    };
  }
};

/* =================== CHAMADOS INTERNOS =================== */
M.chamados = {
  label: "Chamados Internos",
  _filter:"todos",
  render(){
    return `
    <div class="between" style="margin-bottom:16px">${filterBar("cha-filter", counts("chamados"))}
      <div class="muted" style="font-size:12.5px">Solicitações abertas pelos consultores no app</div></div>
    <div class="table-wrap"><table class="tbl"><thead><tr>
      <th>Protocolo</th><th>Área</th><th>Assunto</th><th>Prioridade</th><th>Solicitante</th><th>Status</th><th></th>
    </tr></thead><tbody id="cha-rows">${this._rows()}</tbody></table></div>`;
  },
  _rows(){
    let a = S.getCol("chamados");
    if(this._filter!=="todos") a=a.filter(x=>x.status===this._filter);
    if(!a.length) return `<tr><td colspan="7"><div class="empty"><i data-lucide="inbox"></i><div class="t">Nenhum chamado</div></div></td></tr>`;
    const prio = { Urgente:"b-danger", Alta:"b-warn", Normal:"b-info", Baixa:"b-muted" };
    return a.map(ch=>`<tr>
      <td class="strong">${esc(ch.protocolo)}<div class="sub">${esc(ch.data)}</div></td>
      <td>${esc(ch.area)}<div class="sub">${esc(ch.tipo)}</div></td>
      <td>${esc(ch.assunto)}</td>
      <td><span class="badge ${prio[ch.prioridade]||'b-muted'}">${esc(ch.prioridade)}</span></td>
      <td class="sub">${esc(ch.solicitante)}</td>
      <td>${stPill(ch.id, ch.status)}</td>
      <td class="right"><button class="btn outline sm cha-open" data-id="${ch.id}">Ver</button></td>
    </tr>`).join("");
  },
  mount(c){
    const self=this;
    c.querySelector("#cha-filter").addEventListener("click",e=>{ const b=e.target.closest("[data-f]"); if(!b)return; self._filter=b.dataset.f; P.go("chamados"); });
    c.querySelector("#cha-rows").addEventListener("change",e=>{ const s=e.target.closest("[data-st]"); if(!s)return; S.update("chamados", s.dataset.st, {status:s.value}); P.toast("Status atualizado"); P.buildNav(); P.go("chamados"); });
    c.querySelectorAll(".cha-open").forEach(b=>b.onclick=()=>self._detail(b.dataset.id));
  },
  _detail(id){
    const ch = S.getCol("chamados").find(x=>x.id===id);
    const head = `<div><div class="muted" style="font-size:12px;font-weight:800">CHAMADO INTERNO</div><h3 style="margin:3px 0 0;font-size:20px">${esc(ch.protocolo)}</h3></div><span class="btn-ic" onclick="PANEL.closeSide()"><i data-lucide="x"></i></span>`;
    const body = `
      <div class="kv"><div class="k">Área</div><div class="vv">${esc(ch.area)}</div></div>
      <div class="kv"><div class="k">Tipo</div><div class="vv">${esc(ch.tipo)}</div></div>
      <div class="kv"><div class="k">Prioridade</div><div class="vv">${esc(ch.prioridade)}</div></div>
      <div class="kv"><div class="k">Assunto</div><div class="vv">${esc(ch.assunto)}</div></div>
      <div class="kv"><div class="k">Relacionado</div><div class="vv">${esc(ch.cliente||"—")}</div></div>
      <div class="kv"><div class="k">Solicitante</div><div class="vv">${esc(ch.solicitante)} · ${esc(ch.data)}</div></div>
      <div class="kv"><div class="k">Descrição</div><div class="vv">${esc(ch.descricao)}</div></div>
      ${ch.fotos&&ch.fotos.length?`<div class="kv"><div class="k">Fotos (${ch.fotos.length})</div><div class="vv"><div class="gallery">${ch.fotos.map(f=>`<a href="${f}" target="_blank" rel="noopener"><img src="${f}" alt=""></a>`).join("")}</div></div></div>`:""}
      <div class="fld" style="margin-top:18px"><label>Responsável pelo atendimento</label><input id="cha-resp" value="${esc(ch.responsavel||"")}" placeholder="Quem vai tratar"></div>
      <div class="fld"><label>Status</label><select id="cha-status">${Object.keys(STATUS).map(k=>`<option value="${k}" ${ch.status===k?"selected":""}>${STATUS[k][1]}</option>`).join("")}</select></div>
      <div class="fld"><label>Resposta</label><textarea id="cha-resp-txt" placeholder="Retorno ao solicitante...">${esc(ch.resposta||"")}</textarea></div>`;
    P.side(head, body, `<button class="btn outline" onclick="PANEL.closeSide()">Fechar</button><button class="btn" id="cha-save">Salvar</button>`);
    document.getElementById("cha-save").onclick=()=>{
      S.update("chamados", id, { responsavel:document.getElementById("cha-resp").value, status:document.getElementById("cha-status").value, resposta:document.getElementById("cha-resp-txt").value });
      P.closeSide(); P.toast("Chamado atualizado"); P.buildNav(); P.go("chamados");
    };
  }
};

/* =================== VISITAS =================== */
M.visitas = {
  label: "Relatórios de Visitas",
  render(){
    const vs = S.getCol("visitas");
    const stLbl = {ok:["b-good","Concluída"], andamento:["b-info","Em andamento"], proposta:["b-warn","Proposta"]};
    return `
    <div class="between" style="margin-bottom:16px"><div class="muted">${vs.length} visitas registradas pela equipe</div></div>
    <div class="table-wrap"><table class="tbl"><thead><tr>
      <th>Data</th><th>Cliente</th><th>Município</th><th>Objetivo</th><th>Resultado</th><th>Vendedor</th><th>Situação</th>
    </tr></thead><tbody>
      ${vs.length? vs.map(v=>`<tr>
        <td class="strong">${esc(v.data)}</td>
        <td>${esc(v.cliente)}</td>
        <td class="sub">${esc(v.municipio)}</td>
        <td>${esc(v.objetivo)}</td>
        <td class="sub">${esc(v.resultado)}</td>
        <td class="sub">${esc(v.vendedor||"—")}</td>
        <td><span class="badge ${(stLbl[v.status]||['b-muted','—'])[0]}">${(stLbl[v.status]||['','—'])[1]}</span></td>
      </tr>`).join("") : `<tr><td colspan="7"><div class="empty"><i data-lucide="map-pin"></i><div class="t">Nenhuma visita registrada</div></div></td></tr>`}
    </tbody></table></div>`;
  }
};

/* =================== PEDIDOS / COMISSÕES =================== */
M.pedidos = {
  label: "Pedidos / Comissões",
  render(){
    const ps = S.getCol("pedidos");
    const total = ps.reduce((s,p)=>s+p.valor,0);
    const comTotal = ps.reduce((s,p)=>s+(p.comissao||0),0);
    const meta = S.get("pedidos_meta") || {};
    const stLbl = {cotacao:["b-muted","Cotação"], producao:["b-warn","Produção"], faturado:["b-good","Faturado"], transito:["b-info","Em trânsito"]};
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">${meta.origem?("Importado do TOTVS · "+esc(meta.origem)+" · "+esc(meta.data||"")):"Vendas registradas no sistema"}</div>
      <div class="row" style="gap:8px">
        <label class="btn"><i data-lucide="upload"></i> Importar do TOTVS (.xlsx)<input id="ped-file" type="file" accept=".xlsx" hidden></label>
      </div>
    </div>
    <div id="ped-import-status"></div>
    <div class="grid cols-3" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="clipboard-list"></i></span></div><div class="v">${ps.length}</div><div class="l">Pedidos</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="badge-dollar-sign"></i></span></div><div class="v">${P.fmtMi(total)}</div><div class="l">Valor total</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="wallet"></i></span></div><div class="v">${P.fmtMoney(comTotal)}</div><div class="l">Comissões previstas</div></div>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr>
      <th>Pedido</th><th>Cliente</th><th>Vendedor</th><th class="right">Valor</th><th class="right">Desc.</th><th class="right">Comissão</th><th>Status</th>
    </tr></thead><tbody>
      ${ps.slice(0,300).map(p=>`<tr>
        <td class="strong">#${esc(p.num)}<div class="sub">${esc(p.data)}</div></td>
        <td>${esc(p.cliente)}</td>
        <td class="sub">${esc(p.vendedor)}</td>
        <td class="right strong">${P.fmtMoney(p.valor)}</td>
        <td class="right sub">${esc(p.desconto)}%</td>
        <td class="right" style="color:var(--green-800);font-weight:800">${P.fmtMoney(p.comissao||0)}</td>
        <td><span class="badge ${(stLbl[p.status]||['b-muted','—'])[0]}">${(stLbl[p.status]||['','—'])[1]}</span></td>
      </tr>`).join("")}
    </tbody></table></div>
    ${ps.length>300?`<div class="muted" style="font-size:12px;margin-top:10px">Mostrando os 300 pedidos mais recentes de ${ps.length}.</div>`:""}
    <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Importe o arquivo <b>&nbsp;pedcar.xlsx</b>&nbsp; que você recebe do TOTVS — os pedidos, vendas e comissões são atualizados automaticamente (e refletem nos Indicadores).</div>`;
  },
  mount(c){
    const inp = c.querySelector("#ped-file");
    const status = c.querySelector("#ped-import-status");
    function msg(html,tone){ status.innerHTML = `<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:10px;${tone==='err'?'color:var(--danger)':''}">${html}</div>`; P.icons(); }
    function ensureXLSX(){ return new Promise((res,rej)=>{ if(window.XLSX) return res();
      const s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      s.onload=res; s.onerror=()=>rej(new Error("Falha ao carregar o leitor de planilha")); document.head.appendChild(s); }); }
    function serialToDate(v){ if(typeof v==="number"){ const d=new Date(Math.round((v-25569)*86400*1000)); return d.toLocaleDateString("pt-BR"); } return String(v||""); }
    function mapStatus(s){ s=(s||"").toLowerCase(); if(s.includes("fatur"))return"faturado"; if(s.includes("produ")||s.includes("separa"))return"producao"; if(s.includes("trans")||s.includes("entreg"))return"transito"; return"cotacao"; }
    inp && inp.addEventListener("change", async e=>{
      const f = e.target.files[0]; if(!f) return;
      msg(`<span class="spinner" style="width:20px;height:20px;border:3px solid var(--green-100);border-top-color:var(--accent);border-radius:50%;display:inline-block;animation:spin .8s linear infinite"></span> Lendo planilha do TOTVS…`);
      try{
        await ensureXLSX();
        const buf = await f.arrayBuffer();
        const wb = window.XLSX.read(buf, {type:"array"});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, {defval:""});
        // agrupa por pedido
        const byPed = {};
        rows.forEach(r=>{
          const num = String(r.NRO_PEDIDO||r["NRO_PEDIDO"]||"").trim(); if(!num) return;
          const total = parseFloat(String(r.TOTAL).replace(/\./g,"").replace(",","."))|| (typeof r.TOTAL==="number"?r.TOTAL:0) || 0;
          const comis = parseFloat(String(r.C6_COMIS1).replace(",","."))||0;
          if(!byPed[num]) byPed[num] = { num, cliente:r.NOME_CLIENTE||"", vendedor:r.VEND1||r.C5_VEND1||"", data:serialToDate(r.DATA_PEDIDO), status:mapStatus(r._STATUS), valor:0, comissao:0, desconto:0 };
          byPed[num].valor += total;
          byPed[num].comissao += total*(comis/100);
        });
        let peds = Object.values(byPed).map(p=>({ id:S.uid("ped"), ...p, valor:Math.round(p.valor*100)/100, comissao:Math.round(p.comissao*100)/100 }));
        // ordena por data desc (aprox) e limita p/ não estourar o armazenamento
        peds.reverse();
        const capped = peds.slice(0, 800);
        S.setCol("pedidos", capped);
        S.set("pedidos_meta", { origem:f.name, data:S.today(), totalLinhas:rows.length, totalPedidos:peds.length });
        P.toast(`Importados ${capped.length} pedidos do TOTVS`);
        P.go("pedidos");
      }catch(err){ msg(`<i data-lucide="alert-circle"></i> Erro ao importar: ${err.message}`,"err"); }
      inp.value="";
    });
  }
};

/* =================== TREINAMENTOS =================== */
M.treinamentos = {
  label: "Treinamentos",
  render(){
    const ts = S.getCol("treinamentos");
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">${ts.length} categorias · integração com plataforma externa (Green Mobile / LMS)</div>
      <button class="btn" id="tre-new"><i data-lucide="plus"></i> Nova categoria</button>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr>
      <th>Categoria</th><th>Módulos</th><th>Carga horária</th><th>Link</th><th></th>
    </tr></thead><tbody>
      ${ts.map(t=>`<tr>
        <td class="strong">${esc(t.cat)}</td>
        <td class="sub">${esc(t.itens)} módulos</td>
        <td class="sub">${esc(t.hr||"—")}</td>
        <td class="sub">${t.link&&t.link!=="https://"?`<a href="${esc(t.link)}" target="_blank" style="color:var(--accent);font-weight:700">${esc(t.link)}</a>`:'<span class="muted">— sem link —</span>'}</td>
        <td class="right"><div class="cell-actions">
          <button class="btn-ic tre-edit" data-id="${t.id}"><i data-lucide="pencil"></i></button>
          <button class="btn-ic tre-del" data-id="${t.id}"><i data-lucide="trash-2"></i></button>
        </div></td>
      </tr>`).join("")}
    </tbody></table></div>`;
  },
  _form(t){ t=t||{}; return `
    <div class="fld"><label>Categoria</label><input id="f-cat" value="${esc(t.cat||"")}"></div>
    <div class="fld-row"><div class="fld"><label>Nº de módulos</label><input id="f-itens" type="number" value="${esc(t.itens||0)}"></div>
      <div class="fld"><label>Carga horária</label><input id="f-hr" value="${esc(t.hr||"")}" placeholder="4h20"></div></div>
    <div class="fld"><label>Link da plataforma</label><input id="f-link" value="${esc(t.link||"https://")}"></div>`; },
  mount(c){
    const self=this;
    function open(t){
      P.modal(t?"Editar categoria":"Nova categoria", self._form(t), foot("tre-save"));
      document.getElementById("tre-save").onclick=()=>{
        const data={ cat:val("f-cat"), itens:+val("f-itens")||0, hr:val("f-hr"), link:val("f-link"), icon:t?t.icon:"book-open", done:t?t.done:0 };
        if(!data.cat){ P.toast("Informe a categoria"); return; }
        if(t) S.update("treinamentos", t.id, data); else S.add("treinamentos", data);
        P.closeModal(); P.toast(t?"Categoria atualizada":"Categoria criada"); P.go("treinamentos");
      };
    }
    c.querySelector("#tre-new").onclick=()=>open(null);
    c.querySelectorAll(".tre-edit").forEach(b=>b.onclick=()=>open(S.getCol("treinamentos").find(x=>x.id===b.dataset.id)));
    c.querySelectorAll(".tre-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir categoria?")){ S.remove("treinamentos",b.dataset.id); P.go("treinamentos"); } });
  }
};

/* =================== NOTIFICAÇÕES (envio) =================== */
M.notificacoes = {
  label: "Notificações",
  render(){
    const envs = S.getCol("notificacoes");
    const usuarios = S.getCol("usuarios").filter(u=>u.ativo);
    const tipos = [["geral","Comunicado","info"],["campanha","Campanha","megaphone"],["comissao","Comissão","wallet"],["credito","Crédito/Alerta","alert-triangle"],["aviso","Aviso","bell"]];
    return `
    <div class="grid cols-2" style="align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Enviar notificação</div>
        <div class="fld"><label>Destino</label>
          <select id="nt-dest">
            <option value="todos">📣 Todos os vendedores</option>
            <optgroup label="Individual">
              ${usuarios.map(u=>`<option value="${esc(u.email)}">${esc(u.nome)} — ${esc(u.email)}</option>`).join("")}
            </optgroup>
          </select>
        </div>
        <div class="fld"><label>Tipo</label>
          <select id="nt-tipo">${tipos.map(t=>`<option value="${t[0]}" data-icon="${t[2]}">${t[1]}</option>`).join("")}</select></div>
        <div class="fld"><label>Título</label><input id="nt-title" placeholder="Ex.: Nova tabela de preços disponível"></div>
        <div class="fld"><label>Mensagem</label><textarea id="nt-text" placeholder="Texto da notificação..."></textarea></div>
        <div class="fld"><label>Link <span class="muted" style="font-weight:600">(opcional)</span></label><input id="nt-link" placeholder="https://..."></div>
        <div class="fld"><label>Anexo <span class="muted" style="font-weight:600">(opcional)</span></label>
          <input id="nt-file" type="file" accept="application/pdf,image/*">
          <div class="hint">PDF ou imagem até ~5 MB</div></div>
        <button class="btn" id="nt-send"><i data-lucide="send"></i> Enviar notificação</button>
        <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Chega na hora no app do(s) vendedor(es), com aviso no sino.</div>
      </div>

      <div>
        <div class="between" style="margin-bottom:12px"><div class="sec-title" style="margin:0">Enviadas</div><span class="muted" style="font-size:12.5px">${envs.length}</span></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Notificação</th><th>Destino</th><th>Data</th><th></th></tr></thead>
        <tbody>
          ${envs.length? envs.map(n=>`<tr>
            <td><div class="strong">${esc(n.title)}</div><div class="sub">${esc(n.text)}</div>${n.link?`<div class="sub"><i data-lucide="link" style="width:11px;height:11px;vertical-align:-1px"></i> ${esc(n.link)}</div>`:""}${n.anexo?`<div class="sub"><i data-lucide="paperclip" style="width:11px;height:11px;vertical-align:-1px"></i> ${esc(n.anexo.name)}</div>`:""}</td>
            <td>${n.destino==="todos"?'<span class="badge b-brand">Todos</span>':`<span class="badge b-muted">${esc((n.destino||"").split("@")[0])}</span>`}</td>
            <td class="sub">${esc(n.data||"")}</td>
            <td class="right"><button class="btn-ic nt-del" data-id="${n.id}" title="Excluir"><i data-lucide="trash-2"></i></button></td>
          </tr>`).join("") : `<tr><td colspan="4"><div class="empty"><i data-lucide="bell-off"></i><div class="t">Nenhuma notificação enviada</div></div></td></tr>`}
        </tbody></table></div>
      </div>
    </div>`;
  },
  mount(c){
    c.querySelector("#nt-send").onclick = ()=>{
      const dest = c.querySelector("#nt-dest").value;
      const tipoSel = c.querySelector("#nt-tipo");
      const tipo = tipoSel.value;
      const icon = tipoSel.options[tipoSel.selectedIndex].dataset.icon || "bell";
      const title = c.querySelector("#nt-title").value.trim();
      const text = c.querySelector("#nt-text").value.trim();
      const link = c.querySelector("#nt-link").value.trim();
      if(!title || !text){ P.toast("Preencha título e mensagem"); return; }
      const file = c.querySelector("#nt-file").files[0];
      const enviar = (anexo)=>{
        S.add("notificacoes", { title, text, tipo, icon, destino:dest, data:S.today(), link:link||"", anexo:anexo||null });
        const alvo = dest==="todos" ? "todos os vendedores" : dest;
        P.toast("Notificação enviada para "+alvo);
        P.go("notificacoes");
      };
      if(file){
        if(file.size > 5*1048576){ P.toast("Anexo muito grande (máx ~5 MB)"); return; }
        const r=new FileReader();
        r.onload=()=>enviar({ name:file.name, dataUrl:r.result });
        r.readAsDataURL(file);
      } else enviar(null);
    };
    c.querySelectorAll(".nt-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir esta notificação?")){ S.remove("notificacoes", b.dataset.id); P.go("notificacoes"); } });
  }
};

/* =================== INDICADORES / KPIs (sistema todo) =================== */
M.indicadores = {
  label: "Indicadores / KPIs",
  render(){
    const ped = S.getCol("pedidos"), recl = S.getCol("reclamacoes"), cham = S.getCol("chamados");
    const vis = S.getCol("visitas"), usr = S.getCol("usuarios"), camp = S.getCol("campanhas");
    const mat = S.getCol("materiais"), tre = S.getCol("treinamentos");
    const money = n => "R$ "+Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
    const mi = n => "R$ "+(n/1e6).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" mi";

    const carteira = ped.reduce((s,p)=>s+p.valor,0);
    const faturado = ped.filter(p=>p.status==="faturado").reduce((s,p)=>s+p.valor,0);
    const comissao = ped.reduce((s,p)=>s+(p.comissao||0),0);
    const meta = 4.8e6, atg = Math.round(faturado/meta*100);

    // pedidos por status
    const pst = {cotacao:0, producao:0, transito:0, faturado:0};
    ped.forEach(p=>{ if(pst[p.status]!=null) pst[p.status]++; });
    const pstLbl = {cotacao:"Cotação", producao:"Produção", transito:"Em trânsito", faturado:"Faturado"};

    // ranking por vendedor (valor)
    const byV = {};
    ped.forEach(p=>{ byV[p.vendedor]=(byV[p.vendedor]||0)+p.valor; });
    const ranking = Object.entries(byV).map(([nome,v])=>({nome,v})).sort((a,b)=>b.v-a.v).slice(0,6);
    const maxV = Math.max(1,...ranking.map(r=>r.v));

    // reclamações / chamados por status
    const rst = {aberto:0,analise:0,resolvido:0}; recl.forEach(r=>rst[r.status]!=null&&rst[r.status]++);
    const cst = {aberto:0,analise:0,resolvido:0}; cham.forEach(c=>cst[c.status]!=null&&cst[c.status]++);

    // usuários por perfil
    const byP = {}; usr.forEach(u=>{ byP[u.perfil]=(byP[u.perfil]||0)+1; });

    // mix comercial: pecuária vs agricultura, devolução, margem
    const cfg = S.get("kpi_config") || {};
    let pecPct, agriPct;
    const culturaPec = /pasto|pecu|forrage|brachi|capim|sal mineral|nutri/i;
    if(ped.length && ped.some(p=>p.produto||p.cultura)){
      let pec=0, tot=0;
      ped.forEach(p=>{ const v=p.valor||0; tot+=v; if(culturaPec.test((p.produto||"")+" "+(p.cultura||""))) pec+=v; });
      pecPct = tot? Math.round(pec/tot*100):0; agriPct = 100-pecPct;
    } else { pecPct = cfg.pecuaria!=null?cfg.pecuaria:28; agriPct = 100-pecPct; }
    const devPct = cfg.devolucao!=null?cfg.devolucao:2.4;
    const margemPct = cfg.margem!=null?cfg.margem:21.5;

    function bars(obj, lbls, color){
      const max = Math.max(1,...Object.values(obj));
      return `<div class="ind-bars">${Object.keys(obj).map(k=>`
        <div class="ind-bar"><span class="ind-bl">${lbls[k]||k}</span>
          <div class="ind-track"><span style="width:${Math.round(obj[k]/max*100)}%;background:${color||'var(--accent)'}"></span></div>
          <span class="ind-bv">${obj[k]}</span></div>`).join("")}</div>`;
    }

    const kpis = [
      { ic:"target", tone:"brand", v:mi(meta), l:"Meta da safra" },
      { ic:"trending-up", v:mi(carteira), l:"Carteira total", d:atg+"% da meta" },
      { ic:"badge-dollar-sign", v:mi(faturado), l:"Faturado" },
      { ic:"wallet", v:money(comissao), l:"Comissões previstas" },
      { ic:"clipboard-list", v:ped.length, l:"Pedidos" },
      { ic:"users", v:usr.filter(u=>u.ativo).length, l:"Vendedores ativos" },
      { ic:"map-pin", v:vis.length, l:"Visitas" },
      { ic:"message-square-warning", tone:rst.aberto?"warn":"", v:recl.filter(r=>r.status!=="resolvido").length, l:"Reclamações abertas" },
      { ic:"life-buoy", tone:cst.aberto?"warn":"", v:cham.filter(c=>c.status!=="resolvido").length, l:"Chamados pendentes" },
      { ic:"megaphone", v:camp.filter(c=>c.ativo).length, l:"Campanhas ativas" },
      { ic:"folder-open", v:mat.length, l:"Materiais publicados" },
      { ic:"graduation-cap", v:tre.length, l:"Trilhas de treino" },
    ];
    const toneBg={warn:"var(--warn-bg)",brand:""}, toneFg={warn:"oklch(0.5 0.12 70)"};

    return `
    <div class="grid cols-4">
      ${kpis.map(k=>`
        <div class="kpi ${k.tone==='brand'?'brand':''}">
          <div class="top"><span class="ic" ${k.tone&&k.tone!=='brand'?`style="background:${toneBg[k.tone]};color:${toneFg[k.tone]}"`:''}><i data-lucide="${k.ic}"></i></span>
            ${k.d?`<span class="delta up">${k.d}</span>`:""}</div>
          <div class="v">${k.v}</div><div class="l">${k.l}</div>
        </div>`).join("")}
    </div>

    <div class="grid cols-2" style="margin-top:18px;align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 8px">Ranking de vendedores <span class="muted" style="text-transform:none;font-weight:600">· por volume</span></div>
        <div class="ind-rank">
          ${ranking.map((r,i)=>`<div class="ind-rrow">
            <span class="ind-rpos">${i+1}º</span>
            <div style="flex:1;min-width:0"><div class="ind-rname">${esc(r.nome)}</div>
              <div class="ind-track" style="margin-top:5px"><span style="width:${Math.round(r.v/maxV*100)}%"></span></div></div>
            <span class="ind-rval">${mi(r.v)}</span>
          </div>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="sec-title" style="margin:0 0 12px">Pedidos por status</div>
        ${bars(pst, pstLbl, "linear-gradient(90deg,var(--green-600),var(--green-500))")}
        <div class="sec-title" style="margin:22px 0 12px">Usuários por perfil</div>
        ${bars(byP, {}, "var(--green-600)")}
      </div>
    </div>

    <div class="grid cols-2" style="margin-top:16px;align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 12px">Reclamações por status</div>
        ${bars(rst, {aberto:"Aberto",analise:"Em análise",resolvido:"Resolvido"}, "oklch(0.58 0.18 25)")}
      </div>
      <div class="card">
        <div class="sec-title" style="margin:0 0 12px">Chamados por status</div>
        ${bars(cst, {aberto:"Aberto",analise:"Em análise",resolvido:"Resolvido"}, "oklch(0.6 0.11 230)")}
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="between">
        <div class="sec-title" style="margin:0">Atingimento da meta da safra</div>
        <span class="badge b-brand">${atg}%</span>
      </div>
      <div class="bar" style="margin-top:14px;height:14px"><span style="width:${atg}%"></span></div>
      <div class="between" style="margin-top:10px">
        <span class="muted" style="font-size:12.5px">Faturado: <b style="color:var(--ink)">${mi(faturado)}</b></span>
        <span class="muted" style="font-size:12.5px">Meta: <b style="color:var(--ink)">${mi(meta)}</b></span>
        <span class="muted" style="font-size:12.5px">Gap: <b style="color:var(--danger)">${mi(Math.max(0,meta-faturado))}</b></span>
      </div>
    </div>

    <div class="sec-title" style="margin:22px 0 12px">Mix comercial & qualidade</div>
    <div class="grid cols-4">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="sprout"></i></span></div><div class="v">${agriPct}%</div><div class="l">Vendas Agricultura</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="beef"></i></span></div><div class="v">${pecPct}%</div><div class="l">Vendas Pecuária</div></div>
      <div class="kpi"><div class="top"><span class="ic" ${devPct>5?'style="background:var(--danger-bg);color:var(--danger)"':''}><i data-lucide="undo-2"></i></span></div><div class="v">${String(devPct).replace('.',',')}%</div><div class="l">Devolução de produtos</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="percent"></i></span></div><div class="v">${String(margemPct).replace('.',',')}%</div><div class="l">Margem média</div></div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="between"><div class="sec-title" style="margin:0">Agricultura × Pecuária</div><button class="btn outline" id="kpi-edit" style="padding:7px 12px"><i data-lucide="sliders-horizontal"></i> Ajustar valores</button></div>
      <div class="ind-track" style="height:22px;margin-top:14px;display:flex">
        <span style="width:${agriPct}%;background:var(--green-600);display:grid;place-items:center;color:#fff;font-size:11px;font-weight:800">${agriPct>12?agriPct+"% Agri":""}</span>
        <span style="width:${pecPct}%;background:oklch(0.6 0.13 40);display:grid;place-items:center;color:#fff;font-size:11px;font-weight:800;border-radius:0 999px 999px 0">${pecPct>12?pecPct+"% Pec":""}</span>
      </div>
      <div class="muted" style="font-size:12px;margin-top:10px">${ped.length&&ped.some(p=>p.produto)?"Calculado automaticamente a partir dos pedidos do TOTVS.":"Valores de referência — ajuste manualmente ou importe os pedidos do TOTVS para cálculo automático."}</div>
    </div>`;
  },
  mount(c){
    const eb=c.querySelector("#kpi-edit");
    if(eb) eb.onclick=()=>{
      const cfg=S.get("kpi_config")||{};
      P.modal("Ajustar indicadores",
        `<div class="fld"><label>% Pecuária (Agricultura = resto)</label><input id="k-pec" inputmode="decimal" value="${cfg.pecuaria!=null?cfg.pecuaria:28}"></div>
         <div class="fld"><label>% Devolução de produtos</label><input id="k-dev" inputmode="decimal" value="${cfg.devolucao!=null?cfg.devolucao:2.4}"></div>
         <div class="fld"><label>% Margem média</label><input id="k-mar" inputmode="decimal" value="${cfg.margem!=null?cfg.margem:21.5}"></div>
         <div class="muted" style="font-size:12px">Quando os pedidos do TOTVS forem importados, o mix Agri×Pec passa a ser calculado automaticamente.</div>`,
        foot("k-save"));
      document.getElementById("k-save").onclick=()=>{
        const num=id=>parseFloat((val(id)||"0").replace(",","."))||0;
        S.set("kpi_config",{ pecuaria:num("k-pec"), devolucao:num("k-dev"), margem:num("k-mar") });
        P.closeModal(); P.toast("Indicadores atualizados"); P.go("indicadores");
      };
    };
  }
};

/* =================== VENDEDORES (cadastro) =================== */
M.vendedores = {
  label: "Vendedores",
  _seed(){
    if(S.getCol("vendedores").length) return;
    S.setCol("vendedores", [
      { id:S.uid("vnd"), nome:"Ricardo Alves",  email:"ricardo.alves@sbsgreen.com.br", telefone:"(77) 99999-1010", regiao:"Oeste da Bahia", equipe:"Coord. BA/TO", meta:4800000, ativo:true, admissao:"03/2022" },
      { id:S.uid("vnd"), nome:"Marina Souza",   email:"marina.souza@sbsgreen.com.br",  telefone:"(35) 99888-2020", regiao:"Sul de Minas",   equipe:"Coord. MG",    meta:5200000, ativo:true, admissao:"08/2021" },
      { id:S.uid("vnd"), nome:"Carlos Lima",    email:"carlos.lima@sbsgreen.com.br",   telefone:"(66) 99777-3030", regiao:"Norte do MT",    equipe:"Coord. MT",    meta:4500000, ativo:true, admissao:"01/2023" },
      { id:S.uid("vnd"), nome:"Júlia Prado",    email:"julia.prado@sbsgreen.com.br",   telefone:"(62) 99666-4040", regiao:"Centro de GO",   equipe:"Coord. GO",    meta:4000000, ativo:true, admissao:"05/2023" },
      { id:S.uid("vnd"), nome:"André Reis",     email:"andre.reis@sbsgreen.com.br",    telefone:"(44) 99555-5050", regiao:"Oeste do PR",    equipe:"Coord. Sul",   meta:3800000, ativo:false, admissao:"02/2024" },
    ]);
  },
  render(){
    this._seed();
    const vs = S.getCol("vendedores");
    const ativos = vs.filter(v=>v.ativo).length;
    const metaTot = vs.reduce((s,v)=>s+(v.meta||0),0);
    return `
    <div class="grid cols-3" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="contact"></i></span></div><div class="v">${vs.length}</div><div class="l">Vendedores cadastrados</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="user-check"></i></span></div><div class="v">${ativos}</div><div class="l">Ativos</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="target"></i></span></div><div class="v">${P.fmtMi(metaTot)}</div><div class="l">Meta somada da equipe</div></div>
    </div>
    <div class="between" style="margin-bottom:14px">
      <div class="muted">Cadastro da força de vendas</div>
      <button class="btn" id="vnd-new"><i data-lucide="user-plus"></i> Novo vendedor</button>
    </div>
    <div class="table-wrap"><table class="tbl"><thead><tr>
      <th>Vendedor</th><th>Região</th><th>Equipe</th><th class="right">Meta safra</th><th>Status</th><th></th>
    </tr></thead><tbody>
      ${vs.map(v=>`<tr>
        <td><div class="strong">${esc(v.nome)}</div><div class="sub">${esc(v.email)}</div><div class="sub">${esc(v.telefone||"")}</div></td>
        <td>${esc(v.regiao||"—")}</td>
        <td class="sub">${esc(v.equipe||"—")}</td>
        <td class="right strong">${P.fmtMi(v.meta||0)}</td>
        <td>${v.ativo?'<span class="badge b-good">Ativo</span>':'<span class="badge b-muted">Inativo</span>'}</td>
        <td class="right"><div class="cell-actions">
          <button class="btn-ic vnd-edit" data-id="${v.id}" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="btn-ic vnd-del" data-id="${v.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div></td>
      </tr>`).join("")}
    </tbody></table></div>
    <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Cadastro comercial dos vendedores. Para liberar o acesso ao app/painel, use também <b>&nbsp;Usuários e Acessos</b>.</div>`;
  },
  _form(v){
    v=v||{};
    return `
      <div class="fld"><label>Nome completo</label><input id="f-nome" value="${esc(v.nome||"")}"></div>
      <div class="fld-row"><div class="fld"><label>E-mail</label><input id="f-email" value="${esc(v.email||"")}" placeholder="nome@sbsgreen.com.br"></div>
        <div class="fld"><label>Telefone</label><input id="f-tel" value="${esc(v.telefone||"")}" placeholder="(00) 00000-0000"></div></div>
      <div class="fld-row"><div class="fld"><label>Região</label><input id="f-reg" value="${esc(v.regiao||"")}"></div>
        <div class="fld"><label>Equipe / Coordenador</label><input id="f-eq" value="${esc(v.equipe||"")}"></div></div>
      <div class="fld-row"><div class="fld"><label>Meta da safra (R$)</label><input id="f-meta" inputmode="numeric" value="${v.meta||""}" placeholder="4800000"></div>
        <div class="fld"><label>Status</label><select id="f-ativo"><option value="1" ${v.ativo!==false?"selected":""}>Ativo</option><option value="0" ${v.ativo===false?"selected":""}>Inativo</option></select></div></div>`;
  },
  mount(c){
    const self=this;
    function open(v){
      P.modal(v?"Editar vendedor":"Novo vendedor", self._form(v), foot("vnd-save"));
      document.getElementById("vnd-save").onclick=()=>{
        const data={ nome:val("f-nome"), email:(val("f-email")||"").trim().toLowerCase(), telefone:val("f-tel"),
          regiao:val("f-reg"), equipe:val("f-eq"), meta:parseInt((val("f-meta")||"0").replace(/\D/g,""),10)||0, ativo:val("f-ativo")==="1" };
        if(!data.nome){ P.toast("Informe o nome"); return; }
        if(v) S.update("vendedores", v.id, data);
        else {
          S.add("vendedores", data);
          // cria automaticamente o acesso no app
          if(data.email && !S.getCol("usuarios").some(u=>u.email===data.email)){
            S.add("usuarios", { nome:data.nome, email:data.email, perfil:"Vendedor (app)", ativo:true, criado:S.today() });
          }
        }
        P.closeModal(); P.toast(v?"Vendedor atualizado":"Vendedor cadastrado · acesso ao app criado"); P.go("vendedores");
      };
    }
    c.querySelector("#vnd-new").onclick=()=>open(null);
    c.querySelectorAll(".vnd-edit").forEach(b=>b.onclick=()=>open(S.getCol("vendedores").find(x=>x.id===b.dataset.id)));
    c.querySelectorAll(".vnd-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir este vendedor?")){ S.remove("vendedores",b.dataset.id); P.toast("Vendedor excluído"); P.go("vendedores"); } });
  }
};

/* =================== GAMIFICAÇÃO (config) =================== */
M.gamificacao = {
  label: "Gamificação",
  _defaults(){
    return {
      ativa:true,
      actions:{ login:5, visita:20, chamado:10, reclamacao:10, comissao:5, material:5, share:8, precos:3 },
      levels:[ {n:"Bronze",min:0},{n:"Prata",min:150},{n:"Ouro",min:400},{n:"Diamante",min:800} ]
    };
  },
  _cfg(){ return S.get("gam_config") || this._defaults(); },
  render(){
    const cfg = this._cfg();
    const lbl = { login:"Acesso diário", visita:"Visita registrada", chamado:"Chamado aberto", reclamacao:"Reclamação registrada", comissao:"Simulação de comissão", material:"Material consultado", share:"Conteúdo compartilhado", precos:"Tabela de preços consultada" };
    return `
    <div class="between" style="margin-bottom:18px">
      <div class="muted">Configure os pontos, níveis e ative a gamificação no app dos vendedores.</div>
      <label class="row" style="gap:9px;cursor:pointer"><span style="font-weight:700;font-size:13px">Gamificação ativa</span>
        <span class="sw ${cfg.ativa?'on':''}" id="gm-toggle"></span></label>
    </div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Pontos por ação</div>
        <div id="gm-actions">
          ${Object.keys(cfg.actions).map(k=>`
            <div class="gm-row"><span>${lbl[k]||k}</span>
              <div class="gm-pt"><span>+</span><input type="number" min="0" data-act="${k}" value="${cfg.actions[k]}"></div></div>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Níveis (pontos mínimos)</div>
        <div id="gm-levels">
          ${cfg.levels.map((l,i)=>`
            <div class="gm-lvrow">
              <input class="gm-lvn" data-i="${i}" value="${esc(l.n)}" placeholder="Nome">
              <div class="gm-pt"><input type="number" min="0" class="gm-lvm" data-i="${i}" value="${l.min}"><span>pts</span></div>
              <button class="btn-ic gm-lvdel" data-i="${i}" title="Remover"><i data-lucide="x"></i></button>
            </div>`).join("")}
        </div>
        <button class="btn outline sm" id="gm-addlv" style="margin-top:10px"><i data-lucide="plus"></i> Adicionar nível</button>
      </div>
    </div>
    <div style="margin-top:18px;display:flex;gap:10px">
      <button class="btn" id="gm-save"><i data-lucide="check"></i> Salvar e aplicar no app</button>
      <button class="btn outline" id="gm-reset">Restaurar padrão</button>
    </div>
    <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> As alterações são aplicadas no app dos vendedores em tempo real.</div>`;
  },
  mount(c){
    const self=this;
    let levels = self._cfg().levels.slice();
    let ativa = self._cfg().ativa;
    const tg = c.querySelector("#gm-toggle");
    tg.onclick = ()=>{ ativa=!ativa; tg.classList.toggle("on",ativa); };
    c.querySelector("#gm-addlv").onclick = ()=>{
      levels = self._collectLevels(c).concat([{n:"Novo nível",min:1000}]);
      self._renderLevels(c, levels);
    };
    c.querySelector("#gm-levels").addEventListener("click",e=>{
      const b=e.target.closest(".gm-lvdel"); if(!b)return;
      levels = self._collectLevels(c); levels.splice(+b.dataset.i,1); self._renderLevels(c, levels);
    });
    c.querySelector("#gm-save").onclick = ()=>{
      const actions={}; c.querySelectorAll("#gm-actions [data-act]").forEach(i=>actions[i.dataset.act]=parseInt(i.value,10)||0);
      const lv = self._collectLevels(c).sort((a,b)=>a.min-b.min);
      S.set("gam_config", { ativa, actions, levels:lv });
      P.toast("Gamificação atualizada — aplicada no app");
      P.go("gamificacao");
    };
    c.querySelector("#gm-reset").onclick = ()=>{ S.set("gam_config", self._defaults()); P.toast("Restaurado para o padrão"); P.go("gamificacao"); };
  },
  _collectLevels(c){
    const ns=c.querySelectorAll(".gm-lvn"), ms=c.querySelectorAll(".gm-lvm");
    const out=[]; ns.forEach((n,i)=>out.push({ n:n.value||("Nível "+(i+1)), min:parseInt(ms[i].value,10)||0 }));
    return out;
  },
  _renderLevels(c, levels){
    c.querySelector("#gm-levels").innerHTML = levels.map((l,i)=>`
      <div class="gm-lvrow">
        <input class="gm-lvn" data-i="${i}" value="${esc(l.n)}" placeholder="Nome">
        <div class="gm-pt"><input type="number" min="0" class="gm-lvm" data-i="${i}" value="${l.min}"><span>pts</span></div>
        <button class="btn-ic gm-lvdel" data-i="${i}" title="Remover"><i data-lucide="x"></i></button>
      </div>`).join("");
    P.icons();
  }
};

/* =================== ACOMPANHAMENTO (visitas + vendas consolidado) =================== */
M.acompanhamento = {
  label: "Acompanhamento",
  render(){
    const ORG = window.SBS_ORG;
    const visitas = S.getCol("visitas");
    const plano = S.getCol("plano_acao");
    const pedidos = S.getCol("pedidos");
    const auth = visitas.filter(v=>v.autenticada).length;
    const atendidos = plano.filter(p=>p.status==="ok").length;
    const emAcao = plano.filter(p=>p.status==="andamento").length;
    // por regional
    let rows = [];
    if(ORG){
      ORG.regionais().forEach(r=>{
        const time = ORG.supervisoresDe(r.email).map(s=>s.email.toLowerCase());
        const nomes = ORG.supervisoresDe(r.email).map(s=>s.nome.toUpperCase());
        const nv = visitas.filter(v=>time.includes((v.email||"").toLowerCase())).length;
        const av = visitas.filter(v=>time.includes((v.email||"").toLowerCase())&&v.autenticada).length;
        rows.push({ nome:r.nome, sups:time.length, nv, av });
      });
    }
    const maxN = Math.max(1,...rows.map(r=>r.nv));
    const recent = visitas.slice(0,12);
    const stLbl = {ok:["b-good","Concluída"], andamento:["b-info","Andamento"], proposta:["b-warn","Proposta"]};
    return `
    <div class="grid cols-4" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="map-pin"></i></span></div><div class="v">${visitas.length}</div><div class="l">Visitas registradas</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="shield-check"></i></span></div><div class="v">${auth}</div><div class="l">Autenticadas por GPS</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="check-circle-2"></i></span></div><div class="v">${atendidos}</div><div class="l">Clientes atendidos</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="clock"></i></span></div><div class="v">${emAcao}</div><div class="l">Prospecção em ação</div></div>
    </div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Visitas por regional</div>
        ${rows.map(r=>`<div class="ind-bar"><span class="ind-bl">${esc(r.nome)}</span>
          <div class="ind-track"><span style="width:${Math.round(r.nv/maxN*100)}%"></span></div>
          <span class="ind-bv">${r.nv}</span></div>`).join("") || '<div class="muted">Sem dados.</div>'}
        <div class="muted" style="font-size:12px;margin-top:12px">Barras = visitas da equipe de cada regional.</div>
      </div>
      <div class="card">
        <div class="sec-title" style="margin:0 0 12px">Visitas recentes</div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Vendedor</th><th>Município</th><th>Data</th><th>GPS</th></tr></thead><tbody>
        ${recent.length? recent.map(v=>`<tr>
          <td class="strong">${esc(v.cliente)}</td>
          <td class="sub">${esc(v.vendedor||"—")}</td>
          <td class="sub">${esc(v.municipio||"—")}</td>
          <td class="sub">${esc(v.data||"")}${v.hora?" "+esc(v.hora):""}</td>
          <td>${v.autenticada?'<span class="badge b-good">✓</span>':'<span class="sub">—</span>'}</td>
        </tr>`).join("") : '<tr><td colspan="5"><div class="empty"><i data-lucide="map-pin-off"></i><div class="t">Nenhuma visita ainda</div></div></td></tr>'}
        </tbody></table></div>
      </div>
    </div>`;
  }
};

/* =================== PROJEÇÕES DA EQUIPE =================== */
M.projecoes = {
  label: "Projeções da Equipe",
  render(){
    const ORG = window.SBS_ORG;
    const list = S.getCol("projecoes");
    const totVis = list.reduce((s,p)=>s+(+p.visitas||0),0);
    const totMeta = list.reduce((s,p)=>s+(+p.meta||0),0);
    const totPros = list.reduce((s,p)=>s+(+p.prospec||0),0);
    return `
    <div class="grid cols-4" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="calendar-check"></i></span></div><div class="v">${list.length}</div><div class="l">Projeções enviadas</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="map-pin"></i></span></div><div class="v">${totVis}</div><div class="l">Visitas planejadas</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="target"></i></span></div><div class="v">${totPros}</div><div class="l">Prospecções planej.</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="badge-dollar-sign"></i></span></div><div class="v">${P.fmtMi(totMeta)}</div><div class="l">Meta total projetada</div></div>
    </div>
    <div class="card">
      <div class="sec-title" style="margin:0 0 12px">Projeções de trabalho da força de vendas</div>
      <div class="table-wrap"><table class="tbl"><thead><tr>
        <th>Responsável</th><th>Cargo</th><th>Período</th><th class="right">Visitas</th><th class="right">Prospec.</th><th class="right">Meta venda</th><th>Foco</th>
      </tr></thead><tbody>
        ${list.length? list.map(p=>{ const o=(ORG&&ORG.get(p.email))||{}; return `<tr>
          <td class="strong">${esc(o.nome||p.autor||p.email)}</td>
          <td class="sub">${esc(o.papel||p.papel||"")}</td>
          <td class="sub">${esc(p.periodo||"")}</td>
          <td class="right strong">${p.visitas||0}</td>
          <td class="right">${p.prospec||0}</td>
          <td class="right" style="color:var(--green-800);font-weight:800">${P.fmtMoney(p.meta||0)}</td>
          <td class="sub">${esc(p.foco||"—")}</td>
        </tr>`; }).join("") : '<tr><td colspan="7"><div class="empty"><i data-lucide="calendar-off"></i><div class="t">Nenhuma projeção enviada pela equipe ainda</div></div></td></tr>'}
      </tbody></table></div>
      <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> As projeções são criadas pelos supervisores e gerentes regionais no app; aqui o Nacional vê todas consolidadas.</div>
    </div>`;
  }
};

/* =================== ROTAS DA EQUIPE (com conflitos) =================== */
M.rotas = {
  label: "Rotas da Equipe",
  render(){
    const ORG = window.SBS_ORG;
    const rotas = S.getCol("rotas").slice().sort((a,b)=>(b.data||"").localeCompare(a.data||""));
    // conflitos: mesma data + mesmo município por +1 pessoa
    const byDia={};
    rotas.forEach(r=>{ (r.municipios||[]).forEach(m=>{ const k=r.data+"|"+m; (byDia[k]=byDia[k]||new Set()).add((r.email||"").toLowerCase()); }); });
    const isConf = r => (r.municipios||[]).some(m=>{ const s=byDia[r.data+"|"+m]; return s&&s.size>1; });
    const nConf = rotas.filter(isConf).length;
    const totParadas = rotas.reduce((s,r)=>s+(r.paradas||[]).length,0);
    const feitas = rotas.reduce((s,r)=>s+(r.paradas||[]).filter(p=>p.done).length,0);
    const fmtData = iso => (iso||"").split("-").reverse().join("/");
    return `
    <div class="grid cols-4" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="map"></i></span></div><div class="v">${rotas.length}</div><div class="l">Rotas planejadas</div></div>
      <div class="kpi"><div class="top"><span class="ic" ${nConf?'style="background:var(--danger-bg);color:var(--danger)"':''}><i data-lucide="alert-triangle"></i></span></div><div class="v">${nConf}</div><div class="l">Conflitos de área</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="map-pin"></i></span></div><div class="v">${totParadas}</div><div class="l">Paradas no total</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="map-pin-check"></i></span></div><div class="v">${feitas}</div><div class="l">Visitas concluídas</div></div>
    </div>
    ${nConf?`<div class="card" style="border-left:4px solid var(--danger);margin-bottom:16px"><div style="font-weight:800;color:var(--danger);font-size:14px"><i data-lucide="alert-triangle" style="width:16px;height:16px;vertical-align:-3px"></i> ${nConf} rota(s) com sobreposição</div><div class="muted" style="font-size:12.5px;margin-top:5px">Vendedores diferentes na mesma cidade no mesmo dia — avalie redistribuir.</div></div>`:""}
    <div class="card">
      <div class="sec-title" style="margin:0 0 12px">Roteiros da força de vendas</div>
      <div class="table-wrap"><table class="tbl"><thead><tr>
        <th>Data</th><th>Responsável</th><th>Cargo</th><th>Municípios</th><th class="right">Paradas</th><th>Progresso</th><th>Status</th>
      </tr></thead><tbody>
        ${rotas.length? rotas.map(r=>{ const o=(ORG&&ORG.get(r.email))||{}; const done=(r.paradas||[]).filter(p=>p.done).length; const conf=isConf(r); return `<tr>
          <td class="strong">${fmtData(r.data)}</td>
          <td>${esc(o.nome||r.autor||r.email)}</td>
          <td class="sub">${esc(o.papel||r.papel||"")}</td>
          <td class="sub">${esc((r.municipios||[]).join(", ")||"—")}</td>
          <td class="right strong">${(r.paradas||[]).length}</td>
          <td class="sub">${done}/${(r.paradas||[]).length}</td>
          <td>${conf?'<span class="badge b-danger">Conflito</span>':'<span class="badge b-good">OK</span>'}</td>
        </tr>`; }).join("") : '<tr><td colspan="7"><div class="empty"><i data-lucide="map-pin-off"></i><div class="t">Nenhuma rota planejada ainda</div></div></td></tr>'}
      </tbody></table></div>
      <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> As rotas são criadas pela equipe no app (Clientes & Rotas). O painel detecta conflitos de cidade/dia automaticamente.</div>
    </div>`;
  }
};

/* =================== MARKETING (imagens / Drive) =================== */
M.marketing = {
  label: "Marketing",
  render(){
    const itens = S.getCol("marketing");
    const DR = window.SBS_DRIVE;
    const arquivos = itens.filter(i=>i.tipo!=="pasta");
    const pasta = itens.find(i=>i.tipo==="pasta");
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">Galeria de marketing — links do Google Drive, visíveis no app</div>
      <div class="row" style="gap:8px">
        <button class="btn outline" id="mk-folder"><i data-lucide="folder"></i> ${pasta?"Editar pasta":"Definir pasta do Drive"}</button>
        <button class="btn outline" id="mk-import"><i data-lucide="upload"></i> Importar fotos</button>
        <input type="file" id="mk-files" accept="image/*" multiple hidden>
        <button class="btn" id="mk-new"><i data-lucide="link"></i> Adicionar por link</button>
      </div>
    </div>
    <div class="grid cols-3" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="image"></i></span></div><div class="v">${arquivos.length}</div><div class="l">Arquivos cadastrados</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="folder"></i></span></div><div class="v">${pasta?"1":"0"}</div><div class="l">Pasta do Drive</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="tags"></i></span></div><div class="v">${new Set(arquivos.map(a=>a.categoria).filter(Boolean)).size}</div><div class="l">Categorias</div></div>
    </div>
    ${arquivos.length? `<div class="mkp-grid">${arquivos.map(i=>{ const th=i.thumb||(DR&&DR.thumb(i.url,400)); return `
      <div class="mkp-card">
        <div class="mkp-thumb">${th?`<img src="${th}" alt="" onerror="this.style.display='none'">`:'<i data-lucide="image"></i>'}</div>
        <div class="mkp-info"><div class="strong">${esc(i.titulo||"Material")}</div><div class="sub">${esc(i.categoria||"—")}</div></div>
        <div class="mkp-acts">
          <a class="btn-ic" href="${DR?DR.viewUrl(i.url):i.url}" target="_blank" rel="noopener" title="Abrir"><i data-lucide="external-link"></i></a>
          <button class="btn-ic mk-edit" data-id="${i.id}" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="btn-ic mk-del" data-id="${i.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`; }).join("")}</div>`
      : `<div class="card"><div class="empty"><i data-lucide="image-off"></i><div class="t">Nenhuma imagem cadastrada</div><div class="muted" style="font-size:12.5px;margin-top:4px">Clique em "Adicionar imagem" e cole o link do Drive de cada arte.</div></div></div>`}
    <div class="muted" style="font-size:12px;margin-top:14px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Cole o link de cada arquivo do Drive (compartilhamento aberto). Para imagens, a miniatura aparece automaticamente. A "pasta do Drive" vira um botão de atalho no app.</div>`;
  },
  _form(m){ m=m||{};
    return `
      <div class="fld"><label>Título</label><input id="f-tit" value="${esc(m.titulo||"")}" placeholder="Ex.: Banner Soja Premium"></div>
      <div class="fld"><label>Categoria</label><input id="f-cat" value="${esc(m.categoria||"")}" placeholder="Ex.: Banners, Posts, Catálogos"></div>
      <div class="fld"><label>Link do Drive (arquivo)</label><input id="f-url" value="${esc(m.url||"")}" placeholder="https://drive.google.com/file/d/..."></div>
      <div class="muted" style="font-size:12px">Use o link de compartilhamento do arquivo (com acesso "qualquer pessoa com o link").</div>`;
  },
  mount(c){
    const self=this;
    // importar fotos do computador (resize → dataURL → store)
    const fileInp = c.querySelector("#mk-files");
    c.querySelector("#mk-import").onclick=()=>fileInp.click();
    fileInp.onchange=e=>{
      const files=[...e.target.files].filter(f=>/^image\//.test(f.type));
      if(!files.length) return;
      let done=0;
      P.toast("Importando "+files.length+" foto(s)…");
      files.forEach(f=>{
        const r=new FileReader();
        r.onload=()=>{ const img=new Image(); img.onload=()=>{
          const max=1200, sc=Math.min(1,max/Math.max(img.width,img.height));
          const cv=document.createElement("canvas"); cv.width=Math.round(img.width*sc); cv.height=Math.round(img.height*sc);
          cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          const dataUrl=cv.toDataURL("image/jpeg",0.82);
          S.add("marketing",{ titulo:f.name.replace(/\.[^.]+$/,""), categoria:"", tipo:"arquivo", url:dataUrl, thumb:dataUrl });
          if(++done===files.length){ P.toast(done+" foto(s) importada(s) — já no app"); P.go("marketing"); }
        }; img.src=r.result; };
        r.readAsDataURL(f);
      });
      fileInp.value="";
    };
    c.querySelector("#mk-new").onclick=()=>{
      P.modal("Adicionar por link", self._form(), foot("mk-save"));
      document.getElementById("mk-save").onclick=()=>{
        const url=val("f-url").trim(); if(!url){ P.toast("Cole o link do Drive"); return; }
        S.add("marketing",{ titulo:val("f-tit")||"Material", categoria:val("f-cat"), url, tipo:"arquivo" });
        P.closeModal(); P.toast("Imagem adicionada — já aparece no app"); P.go("marketing");
      };
    };
    c.querySelector("#mk-folder").onclick=()=>{
      const pasta=S.getCol("marketing").find(i=>i.tipo==="pasta")||{};
      P.modal("Pasta do Drive", `<div class="fld"><label>Link da pasta</label><input id="f-furl" value="${esc(pasta.url||"")}" placeholder="https://drive.google.com/drive/folders/..."></div><div class="muted" style="font-size:12px">Vira um botão "Abrir pasta completa" no app.</div>`, foot("mkf-save"));
      document.getElementById("mkf-save").onclick=()=>{
        const url=val("f-furl").trim();
        if(pasta.id){ if(url) S.update("marketing",pasta.id,{url}); else S.remove("marketing",pasta.id); }
        else if(url){ S.add("marketing",{ titulo:"Pasta de Marketing", tipo:"pasta", url }); }
        P.closeModal(); P.toast("Pasta atualizada"); P.go("marketing");
      };
    };
    c.querySelectorAll(".mk-edit").forEach(b=>b.onclick=()=>{ const it=S.getCol("marketing").find(x=>x.id===b.dataset.id);
      P.modal("Editar imagem", self._form(it), foot("mk-save2"));
      document.getElementById("mk-save2").onclick=()=>{ S.update("marketing",it.id,{ titulo:val("f-tit"), categoria:val("f-cat"), url:val("f-url").trim() }); P.closeModal(); P.toast("Atualizado"); P.go("marketing"); };
    });
    c.querySelectorAll(".mk-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir este material?")){ S.remove("marketing",b.dataset.id); P.go("marketing"); } });
  }
};

/* =================== NOVOS CLIENTES (cadastrados em visita) =================== */
M.novos = {
  label: "Novos Clientes",
  render(){
    const list = S.getCol("novos_clientes").slice().reverse();
    const novos = list.filter(c=>c.status!=="cadastrado").length;
    return `
    <div class="between" style="margin-bottom:16px">
      <div class="muted">Clientes prospectados em campo — base para cadastro no ERP</div>
      <button class="btn" id="nv-export"><i data-lucide="download"></i> Exportar CSV</button>
    </div>
    <div class="grid cols-3" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="user-plus"></i></span></div><div class="v">${list.length}</div><div class="l">Total captados</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="sparkles"></i></span></div><div class="v">${novos}</div><div class="l">Aguardando cadastro</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="users"></i></span></div><div class="v">${new Set(list.map(c=>c.vendedor)).size}</div><div class="l">Vendedores</div></div>
    </div>
    <div class="card">
      <div class="table-wrap"><table class="tbl"><thead><tr>
        <th>Cliente</th><th>Município</th><th>Contato</th><th>Telefone</th><th>Cultura</th><th>Vendedor</th><th>Data</th><th>Status</th><th></th>
      </tr></thead><tbody>
        ${list.length? list.map(c=>`<tr>
          <td class="strong">${esc(c.nome)}</td>
          <td class="sub">${esc(c.municipio||"—")}</td>
          <td class="sub">${esc(c.contato||"—")}</td>
          <td class="sub">${esc(c.telefone||"—")}</td>
          <td class="sub">${esc(c.cultura||"—")}</td>
          <td class="sub">${esc(c.vendedor||"—")}</td>
          <td class="sub">${esc(c.data||"")}</td>
          <td>${c.status==="cadastrado"?'<span class="badge b-good">Cadastrado</span>':'<span class="badge b-warn">Novo</span>'}</td>
          <td class="right"><div class="cell-actions">
            <button class="btn-ic nv-toggle" data-id="${c.id}" title="Marcar cadastrado"><i data-lucide="check"></i></button>
            <button class="btn-ic nv-del" data-id="${c.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
          </div></td>
        </tr>`).join("") : '<tr><td colspan="9"><div class="empty"><i data-lucide="user-plus"></i><div class="t">Nenhum cliente novo captado ainda</div><div class="muted" style="font-size:12.5px;margin-top:4px">Aparecem aqui quando o vendedor marca "Cliente novo" no relatório de visita.</div></div></td></tr>'}
      </tbody></table></div>
    </div>`;
  },
  mount(c){
    c.querySelector("#nv-export").onclick=()=>{
      const list=S.getCol("novos_clientes");
      if(!list.length){ P.toast("Nenhum cliente para exportar"); return; }
      const head=["Cliente","Municipio","Contato","Telefone","Cultura","Vendedor","Data","Status"];
      const rows=list.map(c=>[c.nome,c.municipio,c.contato,c.telefone,c.cultura,c.vendedor,c.data,c.status||"novo"]);
      const csv=[head].concat(rows).map(r=>r.map(v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"').join(";")).join("\r\n");
      const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="novos-clientes-sbs.csv";
      document.body.appendChild(a); a.click(); setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href);},100);
      P.toast("CSV exportado");
    };
    c.querySelectorAll(".nv-toggle").forEach(b=>b.onclick=()=>{ const it=S.getCol("novos_clientes").find(x=>x.id===b.dataset.id); S.update("novos_clientes",b.dataset.id,{status:it.status==="cadastrado"?"novo":"cadastrado"}); P.go("novos"); });
    c.querySelectorAll(".nv-del").forEach(b=>b.onclick=()=>{ if(confirm("Excluir este cliente?")){ S.remove("novos_clientes",b.dataset.id); P.go("novos"); } });
  }
};

/* =================== PERDAS DE PEDIDOS (indicadores) =================== */
M.perdas = {
  label: "Perdas de Pedidos",
  render(){
    const list = S.getCol("perdas");
    const total = list.reduce((s,p)=>s+(+p.valor||0),0);
    const porMotivo={}; list.forEach(p=>{ porMotivo[p.motivo]=(porMotivo[p.motivo]||0)+(+p.valor||0); });
    const porConc={}; list.forEach(p=>{ if(p.concorrente) porConc[p.concorrente]=(porConc[p.concorrente]||0)+1; });
    const maxM=Math.max(1,...Object.values(porMotivo));
    const motivosSorted=Object.entries(porMotivo).sort((a,b)=>b[1]-a[1]);
    return `
    <div class="grid cols-4" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic" style="background:var(--danger-bg);color:var(--danger)"><i data-lucide="trending-down"></i></span></div><div class="v">${list.length}</div><div class="l">Pedidos perdidos</div></div>
      <div class="kpi"><div class="top"><span class="ic" style="background:var(--danger-bg);color:var(--danger)"><i data-lucide="banknote"></i></span></div><div class="v">${P.fmtMi(total)}</div><div class="l">Valor perdido</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="tag"></i></span></div><div class="v" style="font-size:15px">${motivosSorted[0]?motivosSorted[0][0]:"—"}</div><div class="l">Motivo nº1 (R$)</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="swords"></i></span></div><div class="v">${Object.keys(porConc).length}</div><div class="l">Concorrentes citados</div></div>
    </div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Perdas por motivo (valor)</div>
        ${motivosSorted.length? motivosSorted.map(([m,v])=>`<div class="ind-bar"><span class="ind-bl">${esc(m)}</span><div class="ind-track"><span style="width:${Math.round(v/maxM*100)}%;background:oklch(0.58 0.18 25)"></span></div><span class="ind-bv">${P.fmtMi(v)}</span></div>`).join("") : '<div class="muted">Sem dados ainda.</div>'}
      </div>
      <div class="card">
        <div class="sec-title" style="margin:0 0 12px">Registros recentes</div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Motivo</th><th>Concorrente</th><th class="right">Valor</th><th>Vendedor</th></tr></thead><tbody>
        ${list.length? list.slice().reverse().slice(0,30).map(p=>`<tr>
          <td class="strong">${esc(p.cliente||"—")}</td><td class="sub">${esc(p.motivo||"")}</td><td class="sub">${esc(p.concorrente||"—")}</td>
          <td class="right strong" style="color:var(--danger)">${P.fmtMoney(p.valor||0)}</td><td class="sub">${esc(p.vendedor||"")}</td>
        </tr>`).join("") : '<tr><td colspan="5"><div class="empty"><i data-lucide="trending-down"></i><div class="t">Nenhuma perda registrada</div></div></td></tr>'}
        </tbody></table></div>
      </div>
    </div>
    ${list.some(p=>p.swot&&(p.swot.f||p.swot.o||p.swot.op||p.swot.t))?`
    <div class="card" style="margin-top:16px">
      <div class="sec-title" style="margin:0 0 12px">Análise SWOT das perdas</div>
      ${list.filter(p=>p.swot&&(p.swot.f||p.swot.o||p.swot.op||p.swot.t)).slice(-6).reverse().map(p=>`
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px">
          <div class="strong" style="margin-bottom:8px">${esc(p.cliente||"Cliente")} <span class="sub" style="font-weight:600">· ${esc(p.motivo||"")}</span></div>
          <div class="swot-grid">
            ${p.swot.f?`<div class="sw-box sw-f"><b>Forças</b>${esc(p.swot.f)}</div>`:""}
            ${p.swot.o?`<div class="sw-box sw-o"><b>Fraquezas</b>${esc(p.swot.o)}</div>`:""}
            ${p.swot.op?`<div class="sw-box sw-op"><b>Oportunidades</b>${esc(p.swot.op)}</div>`:""}
            ${p.swot.t?`<div class="sw-box sw-t"><b>Ameaças</b>${esc(p.swot.t)}</div>`:""}
          </div>
        </div>`).join("")}
    </div>`:""}
    <div class="muted" style="font-size:12px;margin-top:14px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> As perdas são registradas pela equipe no app, com motivo e análise SWOT. Use estes indicadores para agir sobre as causas.</div>`;
  }
};

/* =================== APROVAÇÕES DE DESCONTO =================== */
M.aprovacoes = {
  label: "Aprovações de Desconto",
  // papel (governança) do usuário logado no painel
  _papel(){
    const em=(P.session&&P.session.email||"").toLowerCase();
    const o=window.SBS_ORG&&window.SBS_ORG.get(em);
    if(o) return o.papel;
    const perfil=P.session&&P.session.perfil;
    return perfil==="Administrador"?"admin":"";
  },
  // pode este usuário decidir esta solicitação? (nível que aguarda == seu papel; admin pode tudo)
  _pode(a){
    const papel=this._papel(), em=(P.session&&P.session.email||"").toLowerCase();
    if(a.status!=="pendente") return false;
    if(papel==="admin") return true;
    if((a.aprovadorEmail||"").toLowerCase()===em) return true;
    if(papel==="ceo" && a.aguardando==="ceo") return true;
    if(papel==="nacional" && a.aguardando==="nacional") return true;
    if(papel==="regional" && a.aguardando==="regional") return true;
    if(papel==="supervisor" && a.aguardando==="supervisor") return true;
    return false;
  },
  render(){
    const list = S.getCol("aprovacoes").slice().reverse();
    const pend = list.filter(a=>a.status==="pendente");
    const aprov = list.filter(a=>a.status==="aprovado");
    const rec = list.filter(a=>a.status==="recusado");
    const niv = {supervisor:"Supervisor 15%", regional:"Regional 18%", nacional:"Nacional 20%", ceo:"CEO >20%"};
    const si = a => a.status==="aprovado"?["b-good","Aprovado"]:a.status==="recusado"?["b-danger","Recusado"]:["b-warn","Aguard. "+(niv[a.aguardando]||a.aguardando)];
    const papel=this._papel();
    const minhas = pend.filter(a=>this._pode(a));
    return `
    <div class="grid cols-4" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic" ${minhas.length?'style="background:var(--warn-bg);color:oklch(0.5 0.12 70)"':''}><i data-lucide="gavel"></i></span></div><div class="v">${minhas.length}</div><div class="l">Aguardam você</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="hourglass"></i></span></div><div class="v">${pend.length}</div><div class="l">Pendentes (total)</div></div>
      <div class="kpi"><div class="top"><span class="ic" style="background:var(--good-bg);color:var(--good)"><i data-lucide="check"></i></span></div><div class="v">${aprov.length}</div><div class="l">Aprovados</div></div>
      <div class="kpi"><div class="top"><span class="ic" style="background:var(--danger-bg);color:var(--danger)"><i data-lucide="x"></i></span></div><div class="v">${rec.length}</div><div class="l">Recusados</div></div>
    </div>
    <div class="card">
      <div class="sec-title" style="margin:0 0 4px">Régua de aprovação — seu nível: <b style="color:var(--brand)">${niv[papel]||(papel==="admin"?"Administrador (todos)":"—")}</b></div>
      <div class="ruler"><span class="r-step ${papel==='supervisor'?'r-ok':''}">Supervisor<br><b>até 15%</b></span><span class="r-step ${papel==='regional'?'r-ok':''}">+ Regional<br><b>18%</b></span><span class="r-step ${papel==='nacional'?'r-ok':''}">+ Nacional<br><b>20%</b></span><span class="r-step ${papel==='ceo'?'r-ceo':''}">CEO / Thiago Maschietto<br><b>acima de 20%</b></span></div>
    </div>

    ${minhas.length?`<div class="card" style="margin-top:16px">
      <div class="sec-title" style="margin:0 0 12px">Aguardando sua aprovação</div>
      ${minhas.map(a=>`<div class="ap-prow">
        <div><div class="strong">${esc(a.cliente||"—")} · <span style="color:var(--brand)">${a.desconto}%</span></div>
          <div class="sub">${esc(a.solicitante||"")} · ${P.fmtMoney(a.valor||0)}${a.justificativa?' · '+esc(a.justificativa):''}</div></div>
        <div class="ap-prow-btns">
          <button class="btn" data-pa-ok="${a.id}"><i data-lucide="check"></i> Aprovar</button>
          <button class="btn outline" data-pa-no="${a.id}" style="color:var(--danger)"><i data-lucide="x"></i> Recusar</button>
        </div>
      </div>`).join("")}
    </div>`:""}

    <div class="card" style="margin-top:16px">
      <div class="sec-title" style="margin:0 0 12px">Todas as solicitações</div>
      <div class="table-wrap"><table class="tbl"><thead><tr>
        <th>Cliente</th><th>Solicitante</th><th class="right">Valor</th><th class="right">Desc.</th><th>Nível exigido</th><th>Status</th><th>Liberação</th><th>Data</th>
      </tr></thead><tbody>
        ${list.length? list.map(a=>{
          const h=(a.historico||[]).filter(x=>x.ok&&(x.nota||x.img)).slice(-1)[0]||{};
          const nota=a.liberacaoNota||h.nota||"";
          const img=a.liberacaoImg||h.img||null;
          return `<tr>
          <td class="strong">${esc(a.cliente||"—")}</td>
          <td class="sub">${esc(a.solicitante||"")}</td>
          <td class="right strong">${P.fmtMoney(a.valor||0)}</td>
          <td class="right strong" style="color:var(--brand)">${a.desconto}%</td>
          <td class="sub">${niv[a.nivelExigido]||a.nivelExigido}</td>
          <td><span class="badge ${si(a)[0]}">${si(a)[1]}</span></td>
          <td>${(nota||img)?`<div class="ap-lib-cell">${img?`<img src="${img}" class="ap-lib-thumb" data-libimg="${img}" data-libnote="${esc(nota)}">`:""}${nota?`<span class="sub" title="${esc(nota)}">${esc(nota.length>40?nota.slice(0,40)+"…":nota)}</span>`:""}</div>`:'<span class="sub">—</span>'}</td>
          <td class="sub">${esc(a.data||"")}</td>
        </tr>`; }).join("") : '<tr><td colspan="8"><div class="empty"><i data-lucide="badge-check"></i><div class="t">Nenhuma solicitação ainda</div></div></td></tr>'}
      </tbody></table></div>
      <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> Você só vê os botões de aprovar/recusar das solicitações no seu nível de alçada.</div>
    </div>`;
  },
  mount(c){
    const self=this;
    const order=["supervisor","regional","nacional","ceo"];
    function aprovadorParaNivel(nivel, solicitanteEmail){
      const ORG=window.SBS_ORG; if(!ORG) return null;
      if(nivel==="regional") return ORG.gerenteDe(solicitanteEmail) || (ORG.regionais()[0]||{}).email;
      if(nivel==="nacional"){ const n=ORG.PEOPLE.find(p=>p.papel==="nacional"); return n?n.email:null; }
      if(nivel==="ceo"){ const x=ORG.PEOPLE.find(p=>p.papel==="ceo"); return x?x.email:"thiago.maschietto@sbsgreen.com.br"; }
      return solicitanteEmail;
    }
    function notif(email,titulo,texto){ if(email) S.add("notificacoes",{title:titulo,text:texto,tipo:"aviso",icon:"badge-dollar-sign",destino:email,data:S.today(),de:(P.session&&P.session.email)||""}); }
    function decidir(id, ok, extra){
      const a=S.getCol("aprovacoes").find(x=>x.id===id); if(!a) return;
      const hist=(a.historico||[]).concat([{nivel:a.aguardando, por:(P.session&&P.session.nome)||"", email:(P.session&&P.session.email)||"", ok, nota:(extra&&extra.nota)||"", img:(extra&&extra.img)||null, data:S.today()}]);
      if(!ok){ S.update("aprovacoes",id,{status:"recusado",historico:hist}); notif(a.email,"Desconto recusado","Seu desconto de "+a.desconto+"% para "+a.cliente+" foi recusado."); P.toast("Recusado"); P.go("aprovacoes"); return; }
      const ai=order.indexOf(a.aguardando), ei=order.indexOf(a.nivelExigido);
      if(ai<ei){ const nv=order[ai+1], em=aprovadorParaNivel(nv,a.email);
        S.update("aprovacoes",id,{aguardando:nv,aprovadorEmail:em,historico:hist});
        notif(em,"Aprovação de desconto",a.solicitante+" · "+a.desconto+"% para "+a.cliente+". Sua aprovação é necessária.");
        P.toast("Aprovado — encaminhado ao próximo nível");
      } else { S.update("aprovacoes",id,{status:"aprovado",liberacaoNota:(extra&&extra.nota)||"",liberacaoImg:(extra&&extra.img)||null,historico:hist}); notif(a.email,"Desconto aprovado","Seu desconto de "+a.desconto+"% para "+a.cliente+" foi aprovado!"+(extra&&extra.nota?" Obs: "+extra.nota:"")); P.toast("Aprovado"); }
      P.go("aprovacoes");
    }
    function abrirAprov(id){
      const a=S.getCol("aprovacoes").find(x=>x.id===id); if(!a) return;
      P.modal("Liberar "+a.desconto+"% · "+(a.cliente||""),
        `<div class="fld"><label>Descrição da liberação</label><textarea id="apl-note" placeholder="Observação ou condição da aprovação..."></textarea></div>
         <div class="fld"><label>Imagem / comprovante (opcional)</label><input id="apl-img" type="file" accept="image/*"><div id="apl-prev" style="margin-top:8px"></div></div>`,
        `<button class="btn outline" onclick="PANEL.closeModal()">Cancelar</button><button class="btn" id="apl-ok">Confirmar aprovação</button>`);
      let imgData=null;
      document.getElementById("apl-img").onchange=e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
        r.onload=()=>{ const img=new Image(); img.onload=()=>{ const max=1000,sc=Math.min(1,max/Math.max(img.width,img.height));
          const cv=document.createElement("canvas"); cv.width=img.width*sc; cv.height=img.height*sc; cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          imgData=cv.toDataURL("image/jpeg",0.8); document.getElementById("apl-prev").innerHTML=`<img src="${imgData}" style="width:90px;height:90px;object-fit:cover;border-radius:10px">`;
        }; img.src=r.result; }; r.readAsDataURL(f); };
      document.getElementById("apl-ok").onclick=()=>{ const note=val("apl-note"); P.closeModal(); decidir(id,true,{nota:note,img:imgData}); };
    }
    c.querySelectorAll("[data-pa-ok]").forEach(b=>b.onclick=()=>abrirAprov(b.dataset.paOk));
    c.querySelectorAll("[data-pa-no]").forEach(b=>b.onclick=()=>{ if(confirm("Recusar esta solicitação?")) decidir(b.dataset.paNo,false); });
    c.querySelectorAll("[data-libimg]").forEach(im=>im.onclick=()=>{
      P.modal("Comprovante da liberação", `<img src="${im.dataset.libimg}" style="width:100%;border-radius:12px">${im.dataset.libnote?`<div class="muted" style="margin-top:12px;font-size:13.5px">${im.dataset.libnote}</div>`:""}`, `<button class="btn" onclick="PANEL.closeModal()">Fechar</button>`);
    });
  }
};

/* =================== USABILIDADE DO APP =================== */
M.usabilidade = {
  label: "Usabilidade do App",
  render(){
    const uso = S.getCol("uso");
    const LABEL = {home:"Home",dashboard:"Dashboard",ranking:"Ranking",visitas:"Visitas",plano:"Plano de Ação",clientes:"Clientes & Rotas",rotas:"Rotas",perdas:"Perdas",aprovacoes:"Aprovações",projecao:"Projeção",equipe:"Minha Equipe",acompanhamento:"Acompanhamento",pendencias:"Pendências",marketing:"Marketing",materiais:"Materiais",precos:"Tabela de Preços",campanhas:"Campanhas",comissao:"Comissão",pagamento:"Pagamento",credito:"Crédito",comercial:"Pol. Comercial",ciclo:"Ciclo do Pedido",treinamentos:"Treinamentos",reclamacao:"Reclamação",chamado:"Chamado",frete:"Frete",cargas:"Cargas",notificacoes:"Notificações",config:"Configurações"};
    // agrega por tela
    const porTela={}; let totalAcessos=0;
    uso.forEach(r=>{ Object.entries(r.screens||{}).forEach(([k,v])=>{ porTela[k]=(porTela[k]||0)+v; totalAcessos+=v; }); });
    const telasSorted = Object.entries(porTela).sort((a,b)=>b[1]-a[1]);
    const maxT = Math.max(1,...telasSorted.map(t=>t[1]));
    // usuários mais ativos
    const usersSorted = uso.slice().sort((a,b)=>(b.total||0)-(a.total||0));
    const maxU = Math.max(1,...usersSorted.map(u=>u.total||0));
    // ativos hoje
    const hoje = S.today();
    const ativosHoje = uso.filter(u=>(u.ultimo||"").slice(0,10)===hoje).length;
    // por equipe (regional do gerente)
    const ORG=window.SBS_ORG;
    const porEquipe={};
    uso.forEach(u=>{
      let reg="Outros";
      if(ORG){ const p=ORG.get(u.email);
        if(p){ if(p.papel==="regional") reg=p.nome; else if(p.papel==="supervisor"){ const g=ORG.get(p.gerente); reg=g?g.nome:"Sem regional"; } else if(p.papel==="nacional"||p.papel==="ceo"||p.papel==="admin") reg="Diretoria/Adm"; } }
      porEquipe[reg]=(porEquipe[reg]||0)+(u.total||0);
    });
    const equipeSorted=Object.entries(porEquipe).sort((a,b)=>b[1]-a[1]);
    const maxE=Math.max(1,...equipeSorted.map(e=>e[1]));
    // atividade por dia (últimos 14 dias)
    const porDia={};
    uso.forEach(u=>{ Object.entries(u.dias||{}).forEach(([d,v])=>{ porDia[d]=(porDia[d]||0)+v; }); });
    const dias=[]; for(let i=13;i>=0;i--){ const dt=new Date(Date.now()-i*86400000); const key=dt.toISOString().slice(0,10); dias.push([key, porDia[key]||0, dt.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})]); }
    const maxD=Math.max(1,...dias.map(d=>d[1]));
    return `
    <div class="grid cols-4" style="margin-bottom:18px">
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="users"></i></span></div><div class="v">${uso.length}</div><div class="l">Usuários ativos</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="activity"></i></span></div><div class="v">${totalAcessos}</div><div class="l">Acessos a telas</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="calendar-check"></i></span></div><div class="v">${ativosHoje}</div><div class="l">Ativos hoje</div></div>
      <div class="kpi"><div class="top"><span class="ic"><i data-lucide="layout-grid"></i></span></div><div class="v">${telasSorted.length}</div><div class="l">Telas usadas</div></div>
    </div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Módulos mais usados</div>
        ${telasSorted.length? telasSorted.map(([k,v])=>`<div class="ind-bar"><span class="ind-bl">${esc(LABEL[k]||k)}</span><div class="ind-track"><span style="width:${Math.round(v/maxT*100)}%"></span></div><span class="ind-bv">${v}</span></div>`).join("") : '<div class="muted">Sem dados ainda. Os acessos aparecem conforme a equipe usa o app.</div>'}
      </div>
      <div class="card">
        <div class="sec-title" style="margin:0 0 14px">Usuários mais ativos</div>
        ${usersSorted.length? usersSorted.slice(0,12).map(u=>`<div class="ind-bar"><span class="ind-bl" title="${esc(u.email||'')}">${esc(u.nome||u.email||'—')}</span><div class="ind-track"><span style="width:${Math.round((u.total||0)/maxU*100)}%"></span></div><span class="ind-bv">${u.total||0}</span></div>`).join("") : '<div class="muted">Sem dados ainda.</div>'}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="sec-title" style="margin:0 0 12px">Atividade por dia (últimos 14 dias)</div>
      <div class="day-chart">
        ${dias.map(d=>`<div class="day-col"><div class="day-bar" style="height:${Math.max(4,Math.round(d[1]/maxD*90))}px" title="${d[1]} acessos"></div><div class="day-lb">${d[2]}</div></div>`).join("")}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="sec-title" style="margin:0 0 14px">Uso por equipe / regional</div>
      ${equipeSorted.length? equipeSorted.map(([k,v])=>`<div class="ind-bar"><span class="ind-bl">${esc(k)}</span><div class="ind-track"><span style="width:${Math.round(v/maxE*100)}%"></span></div><span class="ind-bv">${v}</span></div>`).join("") : '<div class="muted">Sem dados ainda.</div>'}
    </div>
    <div class="card" style="margin-top:16px">
      <div class="sec-title" style="margin:0 0 12px">Detalhe por usuário</div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Usuário</th><th>Cargo</th><th class="right">Acessos</th><th>Tela favorita</th><th>Último acesso</th></tr></thead><tbody>
        ${usersSorted.length? usersSorted.map(u=>{ const fav=Object.entries(u.screens||{}).sort((a,b)=>b[1]-a[1])[0]; return `<tr>
          <td class="strong">${esc(u.nome||u.email)}</td><td class="sub">${esc(u.papel||"")}</td>
          <td class="right strong">${u.total||0}</td>
          <td class="sub">${fav?esc(LABEL[fav[0]]||fav[0])+" ("+fav[1]+")":"—"}</td>
          <td class="sub">${esc(u.ultimo||"")}</td>
        </tr>`; }).join("") : '<tr><td colspan="5"><div class="empty"><i data-lucide="activity"></i><div class="t">Nenhum uso registrado ainda</div></div></td></tr>'}
      </tbody></table></div>
      <div class="muted" style="font-size:12px;margin-top:12px;display:flex;gap:7px;align-items:center"><i data-lucide="info" style="width:15px;height:15px"></i> O app registra automaticamente cada tela acessada por usuário — sem dados pessoais além do uso.</div>
    </div>`;
  }
};

})();
