/* ===========================================================
   SBS Painel de P&D / Inovação — módulos
   =========================================================== */
(function(){
  const M = PD.Modules, S = PD.S, esc = PD.esc, num = PD.num, dateBR = PD.dateBR;

  const FASE = {
    ideacao:    { l:"Ideação",   c:"#69756f", bg:"#EEF1F0", n:1 },
    pesquisa:   { l:"Pesquisa",  c:"#1E73C2", bg:"#E5F0FB", n:2 },
    ensaio:     { l:"Ensaio",    c:"#0E7E72", bg:"#E3F4F1", n:3 },
    validacao:  { l:"Validação", c:"#7A52C0", bg:"#EFE9FB", n:4 },
    registro:   { l:"Registro",  c:"#C0710F", bg:"#FBEFE0", n:5 },
    lancamento: { l:"Lançamento",c:"#0B8A5E", bg:"#E4F5EC", n:6 }
  };
  const PRIOR = { alta:{l:"Alta",c:"#b3261e",bg:"#FDE8E6"}, media:{l:"Média",c:"#C0710F",bg:"#FBEFE0"}, baixa:{l:"Baixa",c:"#69756f",bg:"#EEF1F0"} };
  const ENS_ST = { planejado:{l:"Planejado",c:"#69756f",bg:"#EEF1F0"}, andamento:{l:"Em andamento",c:"#1E73C2",bg:"#E5F0FB"}, concluido:{l:"Concluído",c:"#0B8A5E",bg:"#E4F5EC"} };
  const IDEIA_ST = { nova:{l:"Nova",c:"#1E73C2",bg:"#E5F0FB"}, em_analise:{l:"Em análise",c:"#C0710F",bg:"#FBEFE0"}, aprovada:{l:"Aprovada",c:"#0B8A5E",bg:"#E4F5EC"}, arquivada:{l:"Arquivada",c:"#69756f",bg:"#EEF1F0"} };

  function projetos(){ return S.getCol("pd_projetos")||[]; }
  function ensaios(){ return S.getCol("pd_ensaios")||[]; }
  function cultivares(){ return S.getCol("pd_cultivares")||[]; }
  function ideias(){ return S.getCol("pd_ideias")||[]; }
  function marcos(){ return S.getCol("pd_marcos")||[]; }
  function docs(){ return S.getCol("pd_docs")||[]; }
  function reclamacoes(){ return S.getCol("reclamacoes")||[]; }
  function projNome(id){ const p=projetos().find(x=>x.id===id); return p?p.nome:"—"; }
  function who(){ return (PD.session&&PD.session.nome)||"P&D"; }

  function kpi(ic,v,l,tone){ return `<div class="mc-kpi ${tone||''}"><span class="mc-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="mc-kpi-v">${v}</div><div class="mc-kpi-l">${l}</div></div></div>`; }
  function badge(map,st){ const s=map[st]||Object.values(map)[0]; return `<span class="mc-badge" style="color:${s.c};background:${s.bg}">${s.l}</span>`; }

  /* =================== VISÃO GERAL =================== */
  M.visao = {
    label:"Visão Geral",
    render(){
      const pj=projetos(), ens=ensaios(), id=ideias(), cv=cultivares();
      const ativos=pj.filter(p=>p.fase!=="lancamento").length;
      const ensAnd=ens.filter(e=>e.status==="andamento").length;
      const ideiasNovas=id.filter(i=>i.status==="nova"||i.status==="em_analise").length;
      const proxMarco=marcos().filter(m=>m.status!=="concluido").sort((a,b)=>(a.data>b.data?1:-1))[0];
      // distribuição por fase (funil)
      const fases=Object.keys(FASE);
      const maxF=Math.max(1,...fases.map(f=>pj.filter(p=>p.fase===f).length));
      const campoIdeias=id.filter(i=>/campo|vendedor/i.test(i.origem||"")).length;
      return `
      <div class="mc-kpis">
        ${kpi("git-branch", ativos, "Projetos em andamento", "ok")}
        ${kpi("flask-conical", ensAnd, "Ensaios em campo", "")}
        ${kpi("sprout", cv.length, "Cultivares em desenvolvimento", "")}
        ${kpi("lightbulb", ideiasNovas, "Ideias em avaliação", "")}
      </div>
      <div class="mc-cols">
        <div class="mc-card">
          <div class="mc-card-h"><i data-lucide="bar-chart-3"></i> Projetos por fase</div>
          ${fases.map(f=>{ const n=pj.filter(p=>p.fase===f).length; return `
            <div class="pd-funil">
              <div class="pd-funil-top"><span><span class="pd-fdot" style="background:${FASE[f].c}"></span>${FASE[f].l}</span><b>${n}</b></div>
              <div class="pd-bar"><span style="width:${Math.max(4,Math.round(n/maxF*100))}%;background:${FASE[f].c}"></span></div>
            </div>`; }).join("")}
        </div>
        <div class="mc-side">
          <div class="mc-mini"><div class="mc-mini-h"><i data-lucide="message-square-warning"></i> Insumo do campo</div><div class="mc-mini-v">${campoIdeias}</div><a class="mc-mini-link" data-nav-to="ideias">ideias vindas de vendedores →</a></div>
          <div class="mc-mini"><div class="mc-mini-h"><i data-lucide="calendar-clock"></i> Próximo marco</div>
            ${proxMarco?`<div class="mc-mini-row"><span>${esc(proxMarco.titulo)}</span></div><div class="mc-mini-foot">${dateBR(proxMarco.data)} · ${esc(projNome(proxMarco.projeto))}</div>`:'<div class="mc-mini-row"><span>Nenhum pendente</span></div>'}
          </div>
        </div>
      </div>
      <div class="mc-note"><i data-lucide="link"></i> As reclamações de campo registradas no app viram insumo de pesquisa, e ideias dos vendedores entram no Banco de Ideias. Os indicadores desta tela alimentam o Painel do CEO.</div>`;
    },
    mount(c){ c.querySelectorAll("[data-nav-to]").forEach(b=>b.addEventListener("click",()=>PD.go(b.dataset.navTo))); }
  };

  /* =================== PIPELINE DE PROJETOS =================== */
  M.pipeline = {
    label:"Pipeline de Projetos",
    render(){
      const pj=projetos();
      const fases=Object.keys(FASE);
      return `
      <div class="mc-toolbar"><div class="mc-sub">${pj.length} projeto(s) de pesquisa</div>
        <button class="mc-btn primary" id="pj-new"><i data-lucide="plus"></i> Novo projeto</button></div>
      <div class="pd-pipe">${fases.map(f=>`
        <div class="pd-pcol">
          <div class="pd-pcol-h" style="border-color:${FASE[f].c}"><span style="color:${FASE[f].c}">${FASE[f].l}</span><span class="pd-pcount">${pj.filter(p=>p.fase===f).length}</span></div>
          ${pj.filter(p=>p.fase===f).map(p=>`
            <div class="pd-pcard" data-pj="${p.id}">
              <div class="pd-pcard-t">${esc(p.nome)}</div>
              <div class="pd-pcard-m">${esc(p.cultura||"")} · ${esc(p.lider||"")}</div>
              <div class="mc-bar2"><span style="width:${p.progresso||0}%;background:${FASE[f].c}"></span></div>
              <div class="pd-pcard-f">${badge(PRIOR,p.prioridade)}<span>${p.progresso||0}%</span></div>
            </div>`).join("")||'<div class="mc-kempty">—</div>'}
        </div>`).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#pj-new").addEventListener("click",()=>formPj());
      c.querySelectorAll("[data-pj]").forEach(card=>card.addEventListener("click",()=>detailPj(card.dataset.pj)));
    }
  };
  function detailPj(id){
    const p=projetos().find(x=>x.id===id); if(!p) return;
    const ens=ensaios().filter(e=>e.projeto===id);
    const mks=marcos().filter(m=>m.projeto===id);
    const kv=(k,v)=>v?`<div class="kv"><div class="k">${k}</div><div class="vv">${v}</div></div>`:"";
    PD.side(
      `<div><div class="mc-eyebrow">Projeto · ${esc(FASE[p.fase].l)}</div><h2>${esc(p.nome)}</h2>${badge(PRIOR,p.prioridade)}</div><span class="side-x" id="side-x"><i data-lucide="x"></i></span>`,
      `${kv("Objetivo",esc(p.objetivo))}${kv("Cultura",esc(p.cultura))}${kv("Líder",esc(p.lider))}${kv("Início",dateBR(p.inicio))}${kv("Previsão",dateBR(p.previsto))}${kv("Progresso",(p.progresso||0)+"%")}
       ${ens.length?`<div class="kv"><div class="k">Ensaios</div><div class="vv">${ens.map(e=>`<div class="pd-sub-li">${esc(e.local)} · ${esc(e.safra)} ${badge(ENS_ST,e.status)}</div>`).join("")}</div></div>`:""}
       ${mks.length?`<div class="kv"><div class="k">Marcos</div><div class="vv">${mks.map(m=>`<div class="pd-sub-li">${dateBR(m.data)} · ${esc(m.titulo)} ${m.status==="concluido"?'✓':''}</div>`).join("")}</div></div>`:""}`,
      `<button class="mc-btn ghost" id="pj-edit"><i data-lucide="pencil"></i> Editar</button>`
    );
    document.getElementById("side-x").addEventListener("click",PD.closeSide);
    document.getElementById("pj-edit").addEventListener("click",()=>{ PD.closeSide(); formPj(p); });
  }
  function formPj(ed){
    ed=ed||{};
    const fopt=Object.keys(FASE).map(k=>`<option value="${k}" ${ed.fase===k?"selected":""}>${FASE[k].l}</option>`).join("");
    const popt=["alta","media","baixa"].map(k=>`<option value="${k}" ${ed.prioridade===k?"selected":""}>${PRIOR[k].l}</option>`).join("");
    PD.modal(ed.id?"Editar projeto":"Novo projeto",`
      <div class="fld"><label>Nome do projeto</label><input id="pf-nome" value="${esc(ed.nome||'')}" placeholder="Ex.: Brachiaria tolerante à seca"></div>
      <div class="fld"><label>Objetivo</label><textarea id="pf-obj" placeholder="O que se busca...">${esc(ed.objetivo||'')}</textarea></div>
      <div class="fld-row">
        <div class="fld"><label>Cultura</label><input id="pf-cult" value="${esc(ed.cultura||'')}" placeholder="Soja / Milho / Forrageira"></div>
        <div class="fld"><label>Líder</label><input id="pf-lider" value="${esc(ed.lider||who())}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Fase</label><select id="pf-fase">${fopt}</select></div>
        <div class="fld"><label>Prioridade</label><select id="pf-prior">${popt}</select></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Início (AAAA-MM)</label><input id="pf-ini" value="${esc(ed.inicio||'')}" placeholder="2025-09"></div>
        <div class="fld"><label>Previsão (AAAA-MM)</label><input id="pf-prev" value="${esc(ed.previsto||'')}" placeholder="2027-03"></div>
      </div>
      <div class="fld"><label>Progresso (%)</label><input id="pf-prog" type="number" min="0" max="100" value="${ed.progresso||0}"></div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="pf-del">Remover</button>':''}<button class="mc-btn ghost" id="pf-cancel">Cancelar</button><button class="mc-btn primary" id="pf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("pf-cancel").addEventListener("click",PD.closeModal);
    const del=document.getElementById("pf-del"); if(del) del.addEventListener("click",()=>{ S.remove("pd_projetos",ed.id); PD.toast("Projeto removido"); PD.closeModal(); PD.refresh(); });
    document.getElementById("pf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("pf-nome"); if(!nome){ PD.toast("Informe o nome"); return; }
      const data={ nome, objetivo:v("pf-obj"), cultura:v("pf-cult"), lider:v("pf-lider"), fase:v("pf-fase"), prioridade:v("pf-prior"), inicio:v("pf-ini"), previsto:v("pf-prev"), progresso:Math.max(0,Math.min(100,+v("pf-prog")||0)) };
      if(ed.id) S.update("pd_projetos",ed.id,data); else S.add("pd_projetos",Object.assign({id:"pj"+Date.now()},data));
      PD.toast("Projeto salvo"); PD.closeModal(); PD.refresh();
    });
  }

  /* =================== ENSAIOS DE CAMPO =================== */
  M.ensaios = {
    label:"Ensaios de Campo",
    render(){
      const ens=ensaios();
      return `
      <div class="mc-toolbar"><div class="mc-sub">${ens.length} ensaio(s) · ${ens.filter(e=>e.status==="andamento").length} em andamento</div>
        <button class="mc-btn primary" id="en-new"><i data-lucide="plus"></i> Novo ensaio</button></div>
      <div class="mc-card">
        <div class="mc-table">
          <div class="pd-erow head"><span>Cultivar / Projeto</span><span>Local</span><span>Safra</span><span class="r">Rep.</span><span>Status</span><span></span></div>
          ${ens.map(e=>`<div class="pd-erow" data-en="${e.id}">
            <span><b>${esc(e.cultivar||"—")}</b><br><small>${esc(projNome(e.projeto))}</small></span>
            <span>${esc(e.local||"—")}</span>
            <span>${esc(e.safra||"—")}</span>
            <span class="r">${e.repeticoes||"—"}</span>
            <span>${badge(ENS_ST,e.status)}</span>
            <span class="r"><i data-lucide="chevron-right" class="mc-ic"></i></span>
          </div>`).join("")}
        </div>
      </div>`;
    },
    mount(c){
      c.querySelector("#en-new").addEventListener("click",()=>formEn());
      c.querySelectorAll("[data-en]").forEach(r=>r.addEventListener("click",()=>detailEn(r.dataset.en)));
    }
  };
  function detailEn(id){
    const e=ensaios().find(x=>x.id===id); if(!e) return;
    const kv=(k,v)=>v?`<div class="kv"><div class="k">${k}</div><div class="vv">${v}</div></div>`:"";
    PD.side(
      `<div><div class="mc-eyebrow">Ensaio de campo</div><h2>${esc(e.cultivar||"Ensaio")}</h2>${badge(ENS_ST,e.status)}</div><span class="side-x" id="side-x"><i data-lucide="x"></i></span>`,
      `${kv("Projeto",esc(projNome(e.projeto)))}${kv("Local",esc(e.local))}${kv("Safra",esc(e.safra))}${kv("Repetições",e.repeticoes)}${kv("Variáveis",esc(e.variaveis))}${kv("Resultado",esc(e.resultado)||'<span style="color:#999">aguardando</span>')}${kv("Responsável",esc(e.responsavel))}`,
      `<button class="mc-btn ghost" id="en-edit"><i data-lucide="pencil"></i> Editar / lançar resultado</button>`
    );
    document.getElementById("side-x").addEventListener("click",PD.closeSide);
    document.getElementById("en-edit").addEventListener("click",()=>{ PD.closeSide(); formEn(e); });
  }
  function formEn(ed){
    ed=ed||{};
    const popt=projetos().map(p=>`<option value="${p.id}" ${ed.projeto===p.id?"selected":""}>${esc(p.nome)}</option>`).join("");
    const sopt=["planejado","andamento","concluido"].map(k=>`<option value="${k}" ${ed.status===k?"selected":""}>${ENS_ST[k].l}</option>`).join("");
    PD.modal(ed.id?"Editar ensaio":"Novo ensaio",`
      <div class="fld"><label>Projeto</label><select id="nf-proj"><option value="">—</option>${popt}</select></div>
      <div class="fld-row">
        <div class="fld"><label>Cultivar testada</label><input id="nf-cult" value="${esc(ed.cultivar||'')}" placeholder="Ex.: BR-Seca-03"></div>
        <div class="fld"><label>Local</label><input id="nf-local" value="${esc(ed.local||'')}" placeholder="Cidade, UF"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Safra</label><input id="nf-safra" value="${esc(ed.safra||'')}" placeholder="2025/26"></div>
        <div class="fld"><label>Repetições</label><input id="nf-rep" type="number" value="${ed.repeticoes||''}"></div>
      </div>
      <div class="fld"><label>Variáveis avaliadas</label><input id="nf-var" value="${esc(ed.variaveis||'')}" placeholder="Produtividade, ciclo..."></div>
      <div class="fld-row">
        <div class="fld"><label>Status</label><select id="nf-status">${sopt}</select></div>
        <div class="fld"><label>Responsável</label><input id="nf-resp" value="${esc(ed.responsavel||who())}"></div>
      </div>
      <div class="fld"><label>Resultado</label><textarea id="nf-res" placeholder="Resultados observados...">${esc(ed.resultado||'')}</textarea></div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="nf-del">Remover</button>':''}<button class="mc-btn ghost" id="nf-cancel">Cancelar</button><button class="mc-btn primary" id="nf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("nf-cancel").addEventListener("click",PD.closeModal);
    const del=document.getElementById("nf-del"); if(del) del.addEventListener("click",()=>{ S.remove("pd_ensaios",ed.id); PD.toast("Removido"); PD.closeModal(); PD.refresh(); });
    document.getElementById("nf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const cult=v("nf-cult"); if(!cult){ PD.toast("Informe a cultivar"); return; }
      const data={ projeto:v("nf-proj"), cultivar:cult, local:v("nf-local"), safra:v("nf-safra"), repeticoes:+v("nf-rep")||0, variaveis:v("nf-var"), status:v("nf-status"), responsavel:v("nf-resp"), resultado:v("nf-res") };
      if(ed.id) S.update("pd_ensaios",ed.id,data); else S.add("pd_ensaios",Object.assign({id:"en"+Date.now()},data));
      PD.toast("Ensaio salvo"); PD.closeModal(); PD.refresh();
    });
  }

  /* =================== CULTIVARES =================== */
  M.cultivares = {
    label:"Cultivares",
    render(){
      const cv=cultivares();
      return `
      <div class="mc-toolbar"><div class="mc-sub">${cv.length} cultivar(es) em desenvolvimento</div>
        <button class="mc-btn primary" id="cv-new"><i data-lucide="plus"></i> Nova cultivar</button></div>
      <div class="mc-cards">${cv.map(c=>`
        <div class="mc-ccard" data-cv="${c.id}">
          <div class="mc-ccard-top"><span class="pd-codigo">${esc(c.codigo||"")}</span><span class="mc-badge" style="color:#0E7E72;background:#E3F4F1">${esc(c.estagio||"")}</span></div>
          <div class="mc-ccard-t">${esc(c.nome)}</div>
          <div class="mc-ccard-meta">
            <span><i data-lucide="sprout"></i> ${esc(c.cultura||"—")}</span>
            <span><i data-lucide="star"></i> ${esc(c.destaque||"—")}</span>
            ${c.vc&&c.vc!=="—"?`<span><i data-lucide="badge-check"></i> VC ${esc(c.vc)}</span>`:""}
            <span><i data-lucide="git-branch"></i> ${esc(projNome(c.projeto))}</span>
          </div>
        </div>`).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#cv-new").addEventListener("click",()=>formCv());
      c.querySelectorAll("[data-cv]").forEach(card=>card.addEventListener("click",()=>formCv(cultivares().find(x=>x.id===card.dataset.cv))));
    }
  };
  function formCv(ed){
    ed=ed||{};
    const popt=projetos().map(p=>`<option value="${p.id}" ${ed.projeto===p.id?"selected":""}>${esc(p.nome)}</option>`).join("");
    PD.modal(ed.id?"Editar cultivar":"Nova cultivar",`
      <div class="fld-row">
        <div class="fld"><label>Código</label><input id="vf-cod" value="${esc(ed.codigo||'')}" placeholder="Ex.: BR-Seca-03"></div>
        <div class="fld"><label>Cultura</label><input id="vf-cult" value="${esc(ed.cultura||'')}" placeholder="Forrageira"></div>
      </div>
      <div class="fld"><label>Nome comercial / provisório</label><input id="vf-nome" value="${esc(ed.nome||'')}" placeholder="Ex.: Brachiaria Resiliente"></div>
      <div class="fld"><label>Estágio</label><input id="vf-est" value="${esc(ed.estagio||'')}" placeholder="Ensaio multilocal / Registro MAPA"></div>
      <div class="fld-row">
        <div class="fld"><label>Destaque</label><input id="vf-dest" value="${esc(ed.destaque||'')}" placeholder="Tolerância a seca"></div>
        <div class="fld"><label>VC (%)</label><input id="vf-vc" value="${esc(ed.vc||'')}" placeholder="80%"></div>
      </div>
      <div class="fld"><label>Projeto vinculado</label><select id="vf-proj"><option value="">—</option>${popt}</select></div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="vf-del">Remover</button>':''}<button class="mc-btn ghost" id="vf-cancel">Cancelar</button><button class="mc-btn primary" id="vf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("vf-cancel").addEventListener("click",PD.closeModal);
    const del=document.getElementById("vf-del"); if(del) del.addEventListener("click",()=>{ S.remove("pd_cultivares",ed.id); PD.toast("Removida"); PD.closeModal(); PD.refresh(); });
    document.getElementById("vf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("vf-nome"); if(!nome){ PD.toast("Informe o nome"); return; }
      const data={ codigo:v("vf-cod"), cultura:v("vf-cult"), nome, estagio:v("vf-est"), destaque:v("vf-dest"), vc:v("vf-vc"), projeto:v("vf-proj") };
      if(ed.id) S.update("pd_cultivares",ed.id,data); else S.add("pd_cultivares",Object.assign({id:"cv"+Date.now()},data));
      PD.toast("Cultivar salva"); PD.closeModal(); PD.refresh();
    });
  }

  /* =================== BANCO DE IDEIAS =================== */
  M.ideias = {
    label:"Banco de Ideias",
    render(){
      const id=ideias().slice().sort((a,b)=>(b.votos||0)-(a.votos||0));
      // reclamações de campo como insumo
      const recl=reclamacoes().filter(r=>r.status!=="resolvido").slice(0,6);
      const cols=[["nova","Novas"],["em_analise","Em análise"],["aprovada","Aprovadas"],["arquivada","Arquivadas"]];
      return `
      <div class="mc-toolbar"><div class="mc-sub">${id.length} ideia(s) · ideias dos vendedores entram aqui pelo app</div>
        <button class="mc-btn primary" id="id-new"><i data-lucide="plus"></i> Nova ideia</button></div>
      <div class="pd-ideias">
        <div class="pd-ikanban">${cols.map(col=>`
          <div class="mc-kcol">
            <div class="mc-kcol-h">${col[1]} <span>${id.filter(i=>i.status===col[0]).length}</span></div>
            ${id.filter(i=>i.status===col[0]).map(i=>`
              <div class="mc-kcard" data-id="${i.id}">
                <div class="mc-kcard-t">${esc(i.titulo)}</div>
                <div class="pd-iorigem"><i data-lucide="${/campo|vendedor/i.test(i.origem||'')?'sprout':'lightbulb'}"></i> ${esc(i.origem||"")}</div>
                <div class="mc-kcard-f"><span class="pd-votos"><i data-lucide="thumbs-up"></i> ${i.votos||0}</span> ${esc(i.autor||"")}</div>
              </div>`).join("")||'<div class="mc-kempty">—</div>'}
          </div>`).join("")}</div>
        <div class="mc-card pd-insumo">
          <div class="mc-card-h"><i data-lucide="message-square-warning"></i> Insumo do campo (reclamações abertas)</div>
          ${recl.length? recl.map(r=>`<div class="pd-rec"><div class="pd-rec-t">${esc(r.produto||r.cliente||"Reclamação")}</div><div class="pd-rec-s">${esc((r.descricao||"").slice(0,90))}</div><button class="mc-link" data-vira="${r.id}">virar ideia →</button></div>`).join("") : `<div class="mc-empty">Sem reclamações abertas no momento.</div>`}
        </div>
      </div>`;
    },
    mount(c){
      c.querySelector("#id-new").addEventListener("click",()=>formId());
      c.querySelectorAll("[data-id]").forEach(card=>card.addEventListener("click",()=>formId(ideias().find(x=>x.id===card.dataset.id))));
      c.querySelectorAll("[data-vira]").forEach(b=>b.addEventListener("click",()=>{
        const r=reclamacoes().find(x=>x.id===b.dataset.vira); if(!r) return;
        S.add("pd_ideias",{ id:"id"+Date.now(), titulo:"[Campo] "+((r.produto?r.produto+": ":"")+(r.descricao||"").slice(0,60)), origem:"Campo (reclamação)", autor:r.vendedor||"Vendedor", status:"nova", votos:1, data:new Date().toISOString().slice(0,10), descricao:r.descricao||"" });
        PD.toast("Reclamação adicionada ao banco de ideias"); PD.refresh();
      }));
    }
  };
  function formId(ed){
    ed=ed||{};
    const sopt=["nova","em_analise","aprovada","arquivada"].map(k=>`<option value="${k}" ${ed.status===k?"selected":""}>${IDEIA_ST[k].l}</option>`).join("");
    PD.modal(ed.id?"Editar ideia":"Nova ideia",`
      <div class="fld"><label>Título</label><input id="if-tit" value="${esc(ed.titulo||'')}" placeholder="Resumo da ideia"></div>
      <div class="fld"><label>Descrição</label><textarea id="if-desc" placeholder="Detalhe a oportunidade...">${esc(ed.descricao||'')}</textarea></div>
      <div class="fld-row">
        <div class="fld"><label>Origem</label><input id="if-org" value="${esc(ed.origem||'P&D')}" placeholder="P&D / Campo / Qualidade"></div>
        <div class="fld"><label>Autor</label><input id="if-aut" value="${esc(ed.autor||who())}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Status</label><select id="if-status">${sopt}</select></div>
        <div class="fld"><label>Votos</label><input id="if-votos" type="number" value="${ed.votos||0}"></div>
      </div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="if-del">Remover</button>':''}<button class="mc-btn ghost" id="if-cancel">Cancelar</button><button class="mc-btn primary" id="if-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("if-cancel").addEventListener("click",PD.closeModal);
    const del=document.getElementById("if-del"); if(del) del.addEventListener("click",()=>{ S.remove("pd_ideias",ed.id); PD.toast("Removida"); PD.closeModal(); PD.refresh(); });
    document.getElementById("if-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("if-tit"); if(!tit){ PD.toast("Informe o título"); return; }
      const data={ titulo:tit, descricao:v("if-desc"), origem:v("if-org"), autor:v("if-aut"), status:v("if-status"), votos:+v("if-votos")||0, data:ed.data||new Date().toISOString().slice(0,10) };
      if(ed.id) S.update("pd_ideias",ed.id,data); else S.add("pd_ideias",Object.assign({id:"id"+Date.now()},data));
      PD.toast("Ideia salva"); PD.closeModal(); PD.refresh();
    });
  }

  /* =================== CRONOGRAMA & MARCOS =================== */
  M.cronograma = {
    label:"Cronograma & Marcos",
    render(){
      const mk=marcos().slice().sort((a,b)=>(a.data>b.data?1:-1));
      return `
      <div class="mc-toolbar"><div class="mc-sub">${mk.filter(m=>m.status!=="concluido").length} marco(s) pendente(s)</div>
        <button class="mc-btn primary" id="mk-new"><i data-lucide="plus"></i> Novo marco</button></div>
      <div class="mc-card"><div class="pd-timeline">${mk.map(m=>`
        <div class="pd-tl ${m.status==="concluido"?'done':''}" data-mk="${m.id}">
          <div class="pd-tl-dot"></div>
          <div class="pd-tl-body">
            <div class="pd-tl-top"><span class="pd-tl-date">${dateBR(m.data)}</span>${m.status==="concluido"?'<span class="mc-badge" style="color:#0B8A5E;background:#E4F5EC">Concluído</span>':'<span class="mc-badge" style="color:#C0710F;background:#FBEFE0">Pendente</span>'}</div>
            <div class="pd-tl-t">${esc(m.titulo)}</div>
            <div class="pd-tl-s">${esc(projNome(m.projeto))}</div>
          </div>
        </div>`).join("")||'<div class="mc-empty">Nenhum marco cadastrado.</div>'}</div></div>`;
    },
    mount(c){
      c.querySelector("#mk-new").addEventListener("click",()=>formMk());
      c.querySelectorAll("[data-mk]").forEach(r=>r.addEventListener("click",()=>formMk(marcos().find(x=>x.id===r.dataset.mk))));
    }
  };
  function formMk(ed){
    ed=ed||{};
    const popt=projetos().map(p=>`<option value="${p.id}" ${ed.projeto===p.id?"selected":""}>${esc(p.nome)}</option>`).join("");
    PD.modal(ed.id?"Editar marco":"Novo marco",`
      <div class="fld"><label>Título</label><input id="kf-tit" value="${esc(ed.titulo||'')}" placeholder="Ex.: Submissão registro ao MAPA"></div>
      <div class="fld"><label>Projeto</label><select id="kf-proj"><option value="">—</option>${popt}</select></div>
      <div class="fld-row">
        <div class="fld"><label>Data</label><input id="kf-data" type="date" value="${esc(ed.data||'')}"></div>
        <div class="fld"><label>Status</label><select id="kf-status"><option value="pendente" ${ed.status!=="concluido"?"selected":""}>Pendente</option><option value="concluido" ${ed.status==="concluido"?"selected":""}>Concluído</option></select></div>
      </div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="kf-del">Remover</button>':''}<button class="mc-btn ghost" id="kf-cancel">Cancelar</button><button class="mc-btn primary" id="kf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("kf-cancel").addEventListener("click",PD.closeModal);
    const del=document.getElementById("kf-del"); if(del) del.addEventListener("click",()=>{ S.remove("pd_marcos",ed.id); PD.toast("Removido"); PD.closeModal(); PD.refresh(); });
    document.getElementById("kf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("kf-tit"); if(!tit){ PD.toast("Informe o título"); return; }
      const data={ titulo:tit, projeto:v("kf-proj"), data:v("kf-data"), status:v("kf-status") };
      if(ed.id) S.update("pd_marcos",ed.id,data); else S.add("pd_marcos",Object.assign({id:"mk"+Date.now()},data));
      PD.toast("Marco salvo"); PD.closeModal(); PD.refresh();
    });
  }

  /* =================== DOCUMENTOS & LAUDOS =================== */
  M.documentos = {
    label:"Documentos & Laudos",
    render(){
      const dc=docs();
      return `
      <div class="mc-toolbar"><div class="mc-sub">${dc.length} documento(s) técnico(s)</div>
        <button class="mc-btn primary" id="dc-new"><i data-lucide="plus"></i> Novo documento</button></div>
      <div class="mc-card"><div class="mc-table">
        <div class="pd-drow head"><span>Documento</span><span>Tipo</span><span>Projeto</span><span>Data</span><span></span></div>
        ${dc.map(d=>`<div class="pd-drow" data-dc="${d.id}">
          <span class="mc-tch"><i data-lucide="file-text" class="mc-ic"></i> ${esc(d.titulo)}</span>
          <span><span class="mc-badge" style="color:#5B6470;background:#EEF1F0">${esc(d.tipo||"")}</span></span>
          <span>${esc(projNome(d.projeto))}</span>
          <span>${dateBR(d.data)}</span>
          <span class="r"><button class="mc-link danger" data-del-dc="${d.id}">Remover</button></span>
        </div>`).join("")}
      </div></div>
      <div class="mc-note"><i data-lucide="info"></i> Registro dos documentos técnicos, protocolos e laudos. Para anexar arquivos grandes, use o link do Drive no cadastro.</div>`;
    },
    mount(c){
      c.querySelector("#dc-new").addEventListener("click",()=>formDc());
      c.querySelectorAll("[data-del-dc]").forEach(b=>b.addEventListener("click",e=>{ e.stopPropagation(); if(confirm("Remover documento?")){ S.remove("pd_docs",b.dataset.delDc); PD.toast("Removido"); PD.refresh(); } }));
      c.querySelectorAll("[data-dc]").forEach(r=>r.addEventListener("click",()=>formDc(docs().find(x=>x.id===r.dataset.dc))));
    }
  };
  function formDc(ed){
    ed=ed||{};
    const popt=projetos().map(p=>`<option value="${p.id}" ${ed.projeto===p.id?"selected":""}>${esc(p.nome)}</option>`).join("");
    PD.modal(ed.id?"Editar documento":"Novo documento",`
      <div class="fld"><label>Título</label><input id="df-tit" value="${esc(ed.titulo||'')}" placeholder="Ex.: Laudo de germinação lote X"></div>
      <div class="fld-row">
        <div class="fld"><label>Tipo</label><input id="df-tipo" value="${esc(ed.tipo||'')}" placeholder="Laudo / Relatório / Protocolo"></div>
        <div class="fld"><label>Data</label><input id="df-data" type="date" value="${esc(ed.data||'')}"></div>
      </div>
      <div class="fld"><label>Projeto</label><select id="df-proj"><option value="">—</option>${popt}</select></div>
      <div class="fld"><label>Autor / origem</label><input id="df-aut" value="${esc(ed.autor||who())}"></div>
      <div class="fld"><label>Link do arquivo (opcional)</label><input id="df-url" value="${esc(ed.url||'')}" placeholder="https://drive..."></div>`,
      `<button class="mc-btn ghost" id="df-cancel">Cancelar</button><button class="mc-btn primary" id="df-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("df-cancel").addEventListener("click",PD.closeModal);
    document.getElementById("df-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("df-tit"); if(!tit){ PD.toast("Informe o título"); return; }
      const data={ titulo:tit, tipo:v("df-tipo"), data:v("df-data"), projeto:v("df-proj"), autor:v("df-aut"), url:v("df-url") };
      if(ed.id) S.update("pd_docs",ed.id,data); else S.add("pd_docs",Object.assign({id:"dc"+Date.now()},data));
      PD.toast("Documento salvo"); PD.closeModal(); PD.refresh();
    });
  }

  /* =================== AJUDA =================== */
  M.ajuda = {
    label:"Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("pd") : '<div class="mc-card">Documentação indisponível.</div>'; },
    mount(c){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(c,"pd"); }
  };
})();
