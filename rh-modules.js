/* ===========================================================
   SBS Painel de RH — módulos
   Recrutamento & Seleção + Pessoas / Endomarketing
   =========================================================== */
(function(){
  const M = RH.Modules, S = RH.S, esc = RH.esc, num = RH.num, dateBR = RH.dateBR;

  const VG_ST = { aberta:{l:"Aberta",c:"#0B8A5E",bg:"#E4F5EC"}, triagem:{l:"Em triagem",c:"#1E73C2",bg:"#E5F0FB"}, fechada:{l:"Fechada",c:"#69756f",bg:"#EEF1F0"} };
  const ETAPAS = [["triagem","Triagem"],["entrevista","Entrevista"],["teste","Teste"],["proposta","Proposta"],["contratado","Contratado"]];
  const ET_LABEL = { triagem:"Triagem", entrevista:"Entrevista", teste:"Teste", proposta:"Proposta", contratado:"Contratado" };
  const EV_ST = { planejado:{l:"Planejado",c:"#69756f",bg:"#EEF1F0"}, agendado:{l:"Agendado",c:"#1E73C2",bg:"#E5F0FB"}, realizado:{l:"Realizado",c:"#0B8A5E",bg:"#E4F5EC"} };

  function vagas(){ return S.getCol("rh_vagas")||[]; }
  function candidatos(){ return S.getCol("rh_candidatos")||[]; }
  function colaboradores(){ return S.getCol("rh_colaboradores")||[]; }
  function comunicados(){ return S.getCol("rh_comunicados")||[]; }
  function eventos(){ return S.getCol("rh_eventos")||[]; }
  function vagaTit(id){ const v=vagas().find(x=>x.id===id); return v?v.titulo:"—"; }
  function who(){ return (RH.session&&RH.session.nome)||"RH"; }

  function kpi(ic,v,l,tone){ return `<div class="mc-kpi ${tone||''}"><span class="mc-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="mc-kpi-v">${v}</div><div class="mc-kpi-l">${l}</div></div></div>`; }
  function badge(map,st){ const s=map[st]||Object.values(map)[0]; return `<span class="mc-badge" style="color:${s.c};background:${s.bg}">${s.l}</span>`; }
  function stars(n){ n=+n||0; let h=""; for(let i=1;i<=5;i++) h+=`<i data-lucide="star" class="rh-star ${i<=n?'on':''}"></i>`; return `<span class="rh-stars">${h}</span>`; }
  function ini(nome){ return (nome||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

  /* =================== VISÃO GERAL =================== */
  M.visao = {
    label:"Visão Geral",
    render(){
      const vg=vagas(), cd=candidatos(), co=colaboradores();
      const abertas=vg.filter(v=>v.status==="aberta"||v.status==="triagem");
      const posicoes=abertas.reduce((s,v)=>s+(+v.vagas||1),0);
      const emProc=cd.filter(c=>c.etapa!=="contratado").length;
      const contratadosMes=cd.filter(c=>c.etapa==="contratado").length;
      // aniversariantes do mês
      const mes=new Date().toISOString().slice(5,7);
      const aniv=co.filter(c=>(c.aniversario||"").slice(0,2)===mes);
      return `
      <div class="mc-kpis">
        ${kpi("briefcase", abertas.length, "Vagas abertas ("+posicoes+" posições)", "ok")}
        ${kpi("user-search", emProc, "Candidatos em processo", "")}
        ${kpi("users", co.filter(c=>c.status==="ativo").length, "Colaboradores ativos", "")}
        ${kpi("user-check", contratadosMes, "Contratações recentes", "")}
      </div>
      <div class="mc-cols">
        <div class="mc-card">
          <div class="mc-card-h"><i data-lucide="briefcase"></i> Vagas em aberto</div>
          ${abertas.length? abertas.map(v=>`
            <div class="mc-row" data-nav-to="vagas">
              <div class="mc-row-main"><div class="mc-row-t">${esc(v.titulo)}</div><div class="mc-row-s">${esc(v.area)} · ${esc(v.local)} · ${esc(v.senioridade)}</div></div>
              <div class="mc-row-r">${candidatos().filter(c=>c.vaga===v.id&&c.etapa!=="contratado").length} cand.</div>
            </div>`).join("") : `<div class="mc-empty">Nenhuma vaga aberta.</div>`}
          <button class="mc-btn ghost" data-nav-to="vagas" style="margin-top:12px"><i data-lucide="arrow-right"></i> Ver todas</button>
        </div>
        <div class="mc-side">
          <div class="mc-mini"><div class="mc-mini-h"><i data-lucide="cake"></i> Aniversariantes do mês</div>
            ${aniv.length? aniv.map(a=>`<div class="mc-mini-row"><span>${esc(a.nome)}</span><b>${esc((a.aniversario||"").slice(3,5))}/${esc((a.aniversario||"").slice(0,2))}</b></div>`).join("") : '<div class="mc-mini-row"><span>Nenhum neste mês</span></div>'}
          </div>
          <div class="mc-mini"><div class="mc-mini-h"><i data-lucide="party-popper"></i> Próximos eventos</div>
            ${eventos().filter(e=>e.status!=="realizado").slice(0,3).map(e=>`<div class="mc-mini-row"><span>${esc(e.titulo)}</span><b>${dateBR(e.data)}</b></div>`).join("")||'<div class="mc-mini-row"><span>Nenhum</span></div>'}
          </div>
        </div>
      </div>
      <div class="mc-note"><i data-lucide="users"></i> Recrutamento & Seleção e Endomarketing num só lugar. As comunicações internas e a agenda mantêm o time conectado.</div>`;
    },
    mount(c){ c.querySelectorAll("[data-nav-to]").forEach(b=>b.addEventListener("click",()=>RH.go(b.dataset.navTo))); }
  };

  /* =================== VAGAS =================== */
  M.vagas = {
    label:"Vagas",
    render(){
      const vg=vagas();
      return `
      <div class="mc-toolbar"><div class="mc-sub">${vg.filter(v=>v.status!=="fechada").length} vaga(s) em aberto · ${vg.length} no total</div>
        <button class="mc-btn primary" id="vg-new"><i data-lucide="plus"></i> Nova vaga</button></div>
      <div class="mc-cards">${vg.map(v=>`
        <div class="mc-ccard" data-vg="${v.id}">
          <div class="mc-ccard-top">${badge(VG_ST,v.status)}<span class="mc-ccard-verba">${v.vagas||1} ${(v.vagas||1)>1?'posições':'posição'}</span></div>
          <div class="mc-ccard-t">${esc(v.titulo)}</div>
          <div class="mc-ccard-d">${esc(v.descricao||"")}</div>
          <div class="mc-ccard-meta">
            <span><i data-lucide="building-2"></i> ${esc(v.area||"—")} · ${esc(v.senioridade||"")}</span>
            <span><i data-lucide="map-pin"></i> ${esc(v.local||"—")} · ${esc(v.tipo||"")}</span>
            <span><i data-lucide="user-search"></i> ${candidatos().filter(c=>c.vaga===v.id).length} candidato(s)</span>
            <span><i data-lucide="user"></i> ${esc(v.recrutador||"—")}</span>
          </div>
        </div>`).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#vg-new").addEventListener("click",()=>formVg());
      c.querySelectorAll("[data-vg]").forEach(card=>card.addEventListener("click",()=>detailVg(card.dataset.vg)));
    }
  };
  function detailVg(id){
    const v=vagas().find(x=>x.id===id); if(!v) return;
    const cds=candidatos().filter(c=>c.vaga===id);
    const kv=(k,val)=>val?`<div class="kv"><div class="k">${k}</div><div class="vv">${val}</div></div>`:"";
    RH.side(
      `<div><div class="mc-eyebrow">Vaga</div><h2>${esc(v.titulo)}</h2>${badge(VG_ST,v.status)}</div><span class="side-x" id="side-x"><i data-lucide="x"></i></span>`,
      `${kv("Descrição",esc(v.descricao))}${kv("Área",esc(v.area))}${kv("Local",esc(v.local))}${kv("Tipo",esc(v.tipo))}${kv("Senioridade",esc(v.senioridade))}${kv("Posições",v.vagas)}${kv("Abertura",dateBR(v.abertura))}${kv("Recrutador",esc(v.recrutador))}
       ${cds.length?`<div class="kv"><div class="k">Candidatos</div><div class="vv">${cds.map(c=>`<div class="pd-sub-li">${esc(c.nome)} · ${ET_LABEL[c.etapa]||c.etapa}</div>`).join("")}</div></div>`:""}`,
      `<button class="mc-btn ghost" id="vg-edit"><i data-lucide="pencil"></i> Editar</button>
       ${v.status!=="fechada"?`<button class="mc-btn ghost" data-vgset="fechada"><i data-lucide="square"></i> Fechar vaga</button>`:`<button class="mc-btn ok" data-vgset="aberta"><i data-lucide="play"></i> Reabrir</button>`}`
    );
    document.getElementById("side-x").addEventListener("click",RH.closeSide);
    document.getElementById("vg-edit").addEventListener("click",()=>{ RH.closeSide(); formVg(v); });
    document.querySelectorAll("[data-vgset]").forEach(b=>b.addEventListener("click",()=>{ S.update("rh_vagas",v.id,{status:b.dataset.vgset}); RH.toast("Vaga atualizada"); RH.closeSide(); RH.refresh(); }));
  }
  function formVg(ed){
    ed=ed||{};
    const sopt=[["aberta","Aberta"],["triagem","Em triagem"],["fechada","Fechada"]].map(k=>`<option value="${k[0]}" ${ed.status===k[0]?"selected":""}>${k[1]}</option>`).join("");
    RH.modal(ed.id?"Editar vaga":"Nova vaga",`
      <div class="fld"><label>Título</label><input id="gf-tit" value="${esc(ed.titulo||'')}" placeholder="Ex.: Representante Comercial"></div>
      <div class="fld"><label>Descrição</label><textarea id="gf-desc" placeholder="Resumo da vaga...">${esc(ed.descricao||'')}</textarea></div>
      <div class="fld-row">
        <div class="fld"><label>Área</label><input id="gf-area" value="${esc(ed.area||'')}" placeholder="Comercial"></div>
        <div class="fld"><label>Senioridade</label><input id="gf-sen" value="${esc(ed.senioridade||'')}" placeholder="Pleno"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Local</label><input id="gf-local" value="${esc(ed.local||'')}" placeholder="Cidade, UF"></div>
        <div class="fld"><label>Tipo</label><input id="gf-tipo" value="${esc(ed.tipo||'')}" placeholder="CLT / Estágio"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Status</label><select id="gf-status">${sopt}</select></div>
        <div class="fld"><label>Nº de posições</label><input id="gf-vagas" type="number" value="${ed.vagas||1}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Abertura</label><input id="gf-ab" type="date" value="${esc(ed.abertura||'')}"></div>
        <div class="fld"><label>Recrutador</label><input id="gf-rec" value="${esc(ed.recrutador||who())}"></div>
      </div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="gf-del">Remover</button>':''}<button class="mc-btn ghost" id="gf-cancel">Cancelar</button><button class="mc-btn primary" id="gf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("gf-cancel").addEventListener("click",RH.closeModal);
    const del=document.getElementById("gf-del"); if(del) del.addEventListener("click",()=>{ S.remove("rh_vagas",ed.id); RH.toast("Vaga removida"); RH.closeModal(); RH.refresh(); });
    document.getElementById("gf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("gf-tit"); if(!tit){ RH.toast("Informe o título"); return; }
      const data={ titulo:tit, descricao:v("gf-desc"), area:v("gf-area"), senioridade:v("gf-sen"), local:v("gf-local"), tipo:v("gf-tipo"), status:v("gf-status"), vagas:+v("gf-vagas")||1, abertura:v("gf-ab"), recrutador:v("gf-rec") };
      if(ed.id) S.update("rh_vagas",ed.id,data); else S.add("rh_vagas",Object.assign({id:"vg"+Date.now()},data));
      RH.toast("Vaga salva"); RH.closeModal(); RH.refresh();
    });
  }

  /* =================== CANDIDATOS (pipeline) =================== */
  M.candidatos = {
    label:"Candidatos",
    render(){
      const cd=candidatos();
      const vg=vagas();
      const filtro = M.candidatos._vaga||"all";
      const list = filtro==="all"?cd:cd.filter(c=>c.vaga===filtro);
      const opts = `<option value="all">Todas as vagas</option>`+vg.map(v=>`<option value="${v.id}" ${filtro===v.id?"selected":""}>${esc(v.titulo)}</option>`).join("");
      return `
      <div class="mc-toolbar">
        <div class="rh-filter"><i data-lucide="filter"></i><select id="cd-filtro">${opts}</select></div>
        <button class="mc-btn primary" id="cd-new"><i data-lucide="plus"></i> Novo candidato</button>
      </div>
      <div class="rh-pipe">${ETAPAS.map(et=>`
        <div class="rh-pcol">
          <div class="rh-pcol-h">${et[1]} <span>${list.filter(c=>c.etapa===et[0]).length}</span></div>
          ${list.filter(c=>c.etapa===et[0]).map(c=>`
            <div class="rh-ccard" data-cd="${c.id}">
              <div class="rh-ccard-top"><span class="rh-av">${ini(c.nome)}</span><div class="rh-ccard-i"><div class="rh-ccard-n">${esc(c.nome)}</div><div class="rh-ccard-v">${esc(vagaTit(c.vaga))}</div></div></div>
              ${c.nota?stars(c.nota):''}
              ${RH.discBadge?RH.discBadge(c.disc):''}
              <div class="rh-ccard-f"><span class="rh-orig">${esc(c.origem||"")}</span> ${dateBR(c.data)}</div>
            </div>`).join("")||'<div class="mc-kempty">—</div>'}
        </div>`).join("")}</div>`;
    },
    mount(c){
      const f=c.querySelector("#cd-filtro");
      f.addEventListener("change",()=>{ M.candidatos._vaga=f.value; RH.refresh(); });
      c.querySelector("#cd-new").addEventListener("click",()=>formCd());
      c.querySelectorAll("[data-cd]").forEach(card=>card.addEventListener("click",()=>detailCd(card.dataset.cd)));
    }
  };
  function detailCd(id){
    const c=candidatos().find(x=>x.id===id); if(!c) return;
    const kv=(k,val)=>val?`<div class="kv"><div class="k">${k}</div><div class="vv">${val}</div></div>`:"";
    const idx=ETAPAS.findIndex(e=>e[0]===c.etapa);
    const steps=ETAPAS.map((e,i)=>`<div class="rh-step ${i<=idx?'on':''}"><span>${i+1}</span>${e[1]}</div>`).join('<span class="rh-step-line"></span>');
    RH.side(
      `<div><div class="mc-eyebrow">Candidato · ${esc(vagaTit(c.vaga))}</div><h2>${esc(c.nome)}</h2>${stars(c.nota)}</div><span class="side-x" id="side-x"><i data-lucide="x"></i></span>`,
      `<div class="rh-steps">${steps}</div>
       ${c.disc&&(c.disc.D||c.disc.I||c.disc.S||c.disc.C)?`<div class="kv"><div class="k">Perfil DISC</div><div class="vv"><div class="rh-disc-head">${RH.discBadge(c.disc)} <b>${esc(RH.discPerfil(c.disc).label)}</b></div>${RH.discBars(c.disc)}</div></div>`:''}
       ${kv("E-mail",esc(c.email))}${kv("Telefone",esc(c.fone))}${kv("Origem",esc(c.origem))}${kv("Aplicou em",dateBR(c.data))}${kv("Observações",esc(c.obs))}`,
      `<button class="mc-btn ghost" id="cd-edit"><i data-lucide="pencil"></i> Editar</button>
       <button class="mc-btn ghost" id="cd-disc"><i data-lucide="brain"></i> DISC</button>
       ${idx<ETAPAS.length-1?`<button class="mc-btn primary" data-adv="1"><i data-lucide="arrow-right"></i> Avançar para ${ETAPAS[idx+1][1]}</button>`:`<span class="rh-hired"><i data-lucide="check-circle-2"></i> Contratado</span>`}`
    );
    document.getElementById("side-x").addEventListener("click",RH.closeSide);
    document.getElementById("cd-edit").addEventListener("click",()=>{ RH.closeSide(); formCd(c); });
    document.getElementById("cd-disc").addEventListener("click",()=>{ RH.closeSide(); RH.openDisc(c.id, ()=>detailCd(c.id)); });
    const adv=document.querySelector("[data-adv]");
    if(adv) adv.addEventListener("click",()=>{ S.update("rh_candidatos",c.id,{etapa:ETAPAS[idx+1][0]}); RH.toast("Candidato em "+ETAPAS[idx+1][1]); RH.closeSide(); RH.refresh(); });
  }
  function formCd(ed){
    ed=ed||{};
    const vopt=vagas().map(v=>`<option value="${v.id}" ${ed.vaga===v.id?"selected":""}>${esc(v.titulo)}</option>`).join("");
    const eopt=ETAPAS.map(e=>`<option value="${e[0]}" ${ed.etapa===e[0]?"selected":""}>${e[1]}</option>`).join("");
    RH.modal(ed.id?"Editar candidato":"Novo candidato",`
      <div class="fld"><label>Nome</label><input id="df-nome" value="${esc(ed.nome||'')}" placeholder="Nome completo"></div>
      <div class="fld"><label>Vaga</label><select id="df-vaga">${vopt}</select></div>
      <div class="fld-row">
        <div class="fld"><label>E-mail</label><input id="df-email" value="${esc(ed.email||'')}" placeholder="email@..."></div>
        <div class="fld"><label>Telefone</label><input id="df-fone" value="${esc(ed.fone||'')}" placeholder="+55..."></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Etapa</label><select id="df-etapa">${eopt}</select></div>
        <div class="fld"><label>Origem</label><input id="df-orig" value="${esc(ed.origem||'')}" placeholder="LinkedIn / Indicação"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Avaliação (0-5)</label><input id="df-nota" type="number" min="0" max="5" value="${ed.nota||0}"></div>
        <div class="fld"><label>Data</label><input id="df-data" type="date" value="${esc(ed.data||'')}"></div>
      </div>
      <div class="fld"><label>Observações</label><textarea id="df-obs" placeholder="Notas da entrevista...">${esc(ed.obs||'')}</textarea></div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="df-del">Remover</button>':''}<button class="mc-btn ghost" id="df-cancel">Cancelar</button><button class="mc-btn primary" id="df-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("df-cancel").addEventListener("click",RH.closeModal);
    const del=document.getElementById("df-del"); if(del) del.addEventListener("click",()=>{ S.remove("rh_candidatos",ed.id); RH.toast("Removido"); RH.closeModal(); RH.refresh(); });
    document.getElementById("df-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("df-nome"); if(!nome){ RH.toast("Informe o nome"); return; }
      const data={ nome, vaga:v("df-vaga"), email:v("df-email"), fone:v("df-fone"), etapa:v("df-etapa"), origem:v("df-orig"), nota:Math.max(0,Math.min(5,+v("df-nota")||0)), data:v("df-data"), obs:v("df-obs") };
      if(ed.id) S.update("rh_candidatos",ed.id,data); else S.add("rh_candidatos",Object.assign({id:"cd"+Date.now()},data));
      RH.toast("Candidato salvo"); RH.closeModal(); RH.refresh();
    });
  }

  /* =================== COLABORADORES =================== */
  M.colaboradores = {
    label:"Colaboradores",
    render(){
      const co=colaboradores();
      const areas={}; co.forEach(c=>{ areas[c.area=c.area||"Outros"]=(areas[c.area]||0)+1; });
      return `
      <div class="mc-toolbar"><div class="mc-sub">${co.filter(c=>c.status==="ativo").length} colaborador(es) ativo(s) · ${Object.keys(areas).length} áreas</div>
        <button class="mc-btn primary" id="co-new"><i data-lucide="user-plus"></i> Cadastrar funcionário</button></div>
      <div class="mc-card"><div class="mc-table">
        <div class="rh-corow head"><span>Colaborador</span><span>Cargo</span><span>Área</span><span>Local</span><span>Admissão</span><span></span></div>
        ${co.map(c=>`<div class="rh-corow" data-co="${c.id}">
          <span class="rh-coname"><span class="rh-av sm">${ini(c.nome)}</span> ${esc(c.nome)}</span>
          <span>${esc(c.cargo||"—")}</span>
          <span><span class="mc-badge" style="color:#0B6B61;background:#E9F3EF">${esc(c.area||"—")}</span></span>
          <span class="rh-dim">${esc(c.local||"—")}</span>
          <span class="rh-dim">${dateBR(c.admissao)}</span>
          <span class="r"><i data-lucide="chevron-right" class="mc-ic"></i></span>
        </div>`).join("")}
      </div></div>`;
    },
    mount(c){
      c.querySelector("#co-new").addEventListener("click",()=>formCo());
      c.querySelectorAll("[data-co]").forEach(r=>r.addEventListener("click",()=>detailCo(r.dataset.co)));
    }
  };
  function detailCo(id){
    const c=colaboradores().find(x=>x.id===id); if(!c) return;
    const kv=(k,val)=>val?`<div class="kv"><div class="k">${k}</div><div class="vv">${val}</div></div>`:"";
    RH.side(
      `<div><div class="mc-eyebrow">Colaborador</div><h2>${esc(c.nome)}</h2><span class="mc-badge" style="color:#0B6B61;background:#E9F3EF">${esc(c.area||"")}</span></div><span class="side-x" id="side-x"><i data-lucide="x"></i></span>`,
      `${kv("Cargo",esc(c.cargo))}${kv("Área",esc(c.area))}${kv("Local",esc(c.local))}${kv("Admissão",dateBR(c.admissao))}${kv("Aniversário",(c.aniversario||"").slice(3,5)+"/"+(c.aniversario||"").slice(0,2))}${kv("E-mail",esc(c.email))}${kv("Situação",c.status==="ativo"?"Ativo":"Inativo")}`,
      `<button class="mc-btn ghost" id="co-edit"><i data-lucide="pencil"></i> Editar</button>`
    );
    document.getElementById("side-x").addEventListener("click",RH.closeSide);
    document.getElementById("co-edit").addEventListener("click",()=>{ RH.closeSide(); formCo(c); });
  }
  function formCo(ed){
    ed=ed||{};
    const curFoto = ed.email && window.SBS_AVATAR ? SBS_AVATAR.url(ed.email) : null;
    RH.modal(ed.id?"Editar funcionário":"Cadastrar funcionário",`
      <div class="rh-cadfoto">
        <span class="rh-cadav" id="of-av" style="${curFoto?`background-image:url('${curFoto}')`:''}">${curFoto?'':'<i data-lucide="user"></i>'}</span>
        <label class="mc-link" style="cursor:pointer">Adicionar foto<input type="file" accept="image/*" id="of-file" hidden></label>
      </div>
      <div class="fld"><label>Nome completo</label><input id="of-nome" value="${esc(ed.nome||'')}" placeholder="Nome do funcionário"></div>
      <div class="fld-row">
        <div class="fld"><label>Cargo</label><input id="of-cargo" value="${esc(ed.cargo||'')}" placeholder="Cargo"></div>
        <div class="fld"><label>Área</label><input id="of-area" value="${esc(ed.area||'')}" placeholder="Comercial / RH / P&D"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Local</label><input id="of-local" value="${esc(ed.local||'')}" placeholder="Cidade, UF"></div>
        <div class="fld"><label>Admissão</label><input id="of-adm" type="date" value="${esc(ed.admissao||'')}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Aniversário (MM-DD)</label><input id="of-aniv" value="${esc(ed.aniversario||'')}" placeholder="06-28"></div>
        <div class="fld"><label>Situação</label><select id="of-status"><option value="ativo" ${ed.status!=="inativo"?"selected":""}>Ativo</option><option value="inativo" ${ed.status==="inativo"?"selected":""}>Inativo</option></select></div>
      </div>
      <div class="fld"><label>E-mail (acesso ao app)</label><input id="of-email" value="${esc(ed.email||'')}" placeholder="nome.sobrenome@sbsgreen.com.br"></div>
      <div class="mc-note" style="margin:0"><i data-lucide="smartphone"></i> Com o e-mail cadastrado, o funcionário já acessa o <b>Portal do Colaborador</b> (mural, agenda, feed e seus dados).</div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="of-del">Remover</button>':''}<button class="mc-btn ghost" id="of-cancel">Cancelar</button><button class="mc-btn primary" id="of-save"><i data-lucide="save"></i> ${ed.id?'Salvar':'Cadastrar'}</button>`);
    let _foto = curFoto || null;
    const fileInp = document.getElementById("of-file");
    if(fileInp) fileInp.addEventListener("change",e=>{
      const f=e.target.files[0]; if(!f) return;
      const r=new FileReader(); r.onload=()=>{ const img=new Image(); img.onload=()=>{
        const s=Math.min(img.width,img.height); const cv=document.createElement("canvas"); cv.width=320; cv.height=320;
        cv.getContext("2d").drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,320,320);
        _foto=cv.toDataURL("image/jpeg",0.85);
        const av=document.getElementById("of-av"); if(av){ av.innerHTML=""; av.style.backgroundImage="url('"+_foto+"')"; }
      }; img.src=r.result; }; r.readAsDataURL(f);
    });
    document.getElementById("of-cancel").addEventListener("click",RH.closeModal);
    const del=document.getElementById("of-del"); if(del) del.addEventListener("click",()=>{ S.remove("rh_colaboradores",ed.id); RH.toast("Funcionário removido"); RH.closeModal(); RH.refresh(); });
    document.getElementById("of-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("of-nome"); if(!nome){ RH.toast("Informe o nome"); return; }
      let email=v("of-email");
      const data={ nome, cargo:v("of-cargo"), area:v("of-area"), local:v("of-local"), admissao:v("of-adm"), aniversario:v("of-aniv"), status:v("of-status"), email:email };
      if(ed.id) S.update("rh_colaboradores",ed.id,data); else S.add("rh_colaboradores",Object.assign({id:"co"+Date.now()},data));
      if(email && _foto && window.SBS_AVATAR) SBS_AVATAR.save(email, _foto);
      RH.toast(ed.id?"Funcionário salvo":"Funcionário cadastrado"); RH.closeModal(); RH.refresh();
    });
  }

  /* =================== ENDOMARKETING =================== */
  M.endomarketing = {
    label:"Endomarketing",
    render(){
      const cm=comunicados().slice().sort((a,b)=>(a.data<b.data?1:-1));
      const ev=eventos().slice().sort((a,b)=>(a.data>b.data?1:-1));
      return `
      <div class="mc-toolbar"><div class="mc-sub">Comunicação interna e agenda do time</div>
        <div style="display:flex;gap:8px"><button class="mc-btn ghost" id="nt-pub"><i data-lucide="bell"></i> Notificar app</button><button class="mc-btn ghost" id="fd-pub"><i data-lucide="smartphone"></i> Publicar no app</button><button class="mc-btn ghost" id="ev-new"><i data-lucide="calendar-plus"></i> Evento</button><button class="mc-btn primary" id="cm-new"><i data-lucide="plus"></i> Comunicado</button></div></div>
      <div class="mc-cols">
        <div class="mc-card">
          <div class="mc-card-h"><i data-lucide="megaphone"></i> Mural de comunicados</div>
          ${cm.length? cm.map(c=>`
            <div class="rh-com ${c.destaque?'hot':''}" data-cm="${c.id}">
              <div class="rh-com-top"><span class="rh-com-cat">${esc(c.categoria||"")}</span><span class="rh-com-date">${dateBR(c.data)}</span></div>
              <div class="rh-com-t">${c.destaque?'<i data-lucide="pin" class="rh-pin"></i> ':''}${esc(c.titulo)}</div>
              <div class="rh-com-x">${esc(c.texto||"")}</div>
            </div>`).join("") : `<div class="mc-empty">Nenhum comunicado.</div>`}
        </div>
        <div class="mc-side">
          <div class="mc-card" style="margin:0">
            <div class="mc-card-h"><i data-lucide="party-popper"></i> Agenda interna</div>
            ${ev.map(e=>`<div class="rh-ev" data-ev="${e.id}"><div class="rh-ev-d"><b>${dateBR(e.data).slice(0,5)}</b></div><div class="rh-ev-b"><div class="rh-ev-t">${esc(e.titulo)}</div><div class="rh-ev-s">${esc(e.tipo||"")} · ${esc(e.local||"")}</div></div>${badge(EV_ST,e.status)}</div>`).join("")||'<div class="mc-empty">Sem eventos.</div>'}
          </div>
        </div>
      </div>`;
    },
    mount(c){
      const fp=c.querySelector("#fd-pub"); if(fp) fp.addEventListener("click",()=>RH.openFeedPost());
      const nt=c.querySelector("#nt-pub"); if(nt) nt.addEventListener("click",()=>RH.openNotif());
      c.querySelector("#cm-new").addEventListener("click",()=>formCm());
      c.querySelector("#ev-new").addEventListener("click",()=>formEv());
      c.querySelectorAll("[data-cm]").forEach(card=>card.addEventListener("click",()=>formCm(comunicados().find(x=>x.id===card.dataset.cm))));
      c.querySelectorAll("[data-ev]").forEach(card=>card.addEventListener("click",()=>formEv(eventos().find(x=>x.id===card.dataset.ev))));
    }
  };
  function formCm(ed){
    ed=ed||{};
    RH.modal(ed.id?"Editar comunicado":"Novo comunicado",`
      <div class="fld"><label>Título</label><input id="mf-tit" value="${esc(ed.titulo||'')}" placeholder="Assunto do comunicado"></div>
      <div class="fld"><label>Texto</label><textarea id="mf-txt" placeholder="Mensagem para o time...">${esc(ed.texto||'')}</textarea></div>
      <div class="fld-row">
        <div class="fld"><label>Categoria</label><input id="mf-cat" value="${esc(ed.categoria||'')}" placeholder="Benefícios / Endomarketing"></div>
        <div class="fld"><label>Data</label><input id="mf-data" type="date" value="${esc(ed.data||new Date().toISOString().slice(0,10))}"></div>
      </div>
      <label class="rh-check"><input type="checkbox" id="mf-dest" ${ed.destaque?'checked':''}> Fixar no topo (destaque)</label>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="mf-del">Remover</button>':''}<button class="mc-btn ghost" id="mf-cancel">Cancelar</button><button class="mc-btn primary" id="mf-save"><i data-lucide="save"></i> Publicar</button>`);
    document.getElementById("mf-cancel").addEventListener("click",RH.closeModal);
    const del=document.getElementById("mf-del"); if(del) del.addEventListener("click",()=>{ S.remove("rh_comunicados",ed.id); RH.toast("Removido"); RH.closeModal(); RH.refresh(); });
    document.getElementById("mf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("mf-tit"); if(!tit){ RH.toast("Informe o título"); return; }
      const data={ titulo:tit, texto:v("mf-txt"), categoria:v("mf-cat"), data:v("mf-data"), destaque:document.getElementById("mf-dest").checked, autor:who() };
      if(ed.id) S.update("rh_comunicados",ed.id,data); else S.add("rh_comunicados",Object.assign({id:"cm"+Date.now()},data));
      RH.toast("Comunicado publicado"); RH.closeModal(); RH.refresh();
    });
  }
  function formEv(ed){
    ed=ed||{};
    const sopt=[["planejado","Planejado"],["agendado","Agendado"],["realizado","Realizado"]].map(k=>`<option value="${k[0]}" ${ed.status===k[0]?"selected":""}>${k[1]}</option>`).join("");
    RH.modal(ed.id?"Editar evento":"Novo evento interno",`
      <div class="fld"><label>Título</label><input id="ef-tit" value="${esc(ed.titulo||'')}" placeholder="Ex.: Confraternização"></div>
      <div class="fld-row">
        <div class="fld"><label>Tipo</label><input id="ef-tipo" value="${esc(ed.tipo||'')}" placeholder="Treinamento / Onboarding"></div>
        <div class="fld"><label>Local</label><input id="ef-local" value="${esc(ed.local||'')}" placeholder="Sede / Online"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Data</label><input id="ef-data" type="date" value="${esc(ed.data||'')}"></div>
        <div class="fld"><label>Status</label><select id="ef-status">${sopt}</select></div>
      </div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="ef-del">Remover</button>':''}<button class="mc-btn ghost" id="ef-cancel">Cancelar</button><button class="mc-btn primary" id="ef-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("ef-cancel").addEventListener("click",RH.closeModal);
    const del=document.getElementById("ef-del"); if(del) del.addEventListener("click",()=>{ S.remove("rh_eventos",ed.id); RH.toast("Removido"); RH.closeModal(); RH.refresh(); });
    document.getElementById("ef-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("ef-tit"); if(!tit){ RH.toast("Informe o título"); return; }
      const data={ titulo:tit, tipo:v("ef-tipo"), local:v("ef-local"), data:v("ef-data"), status:v("ef-status") };
      if(ed.id) S.update("rh_eventos",ed.id,data); else S.add("rh_eventos",Object.assign({id:"ev"+Date.now()},data));
      RH.toast("Evento salvo"); RH.closeModal(); RH.refresh();
    });
  }

  /* =================== AJUDA =================== */
  M.ajuda = {
    label:"Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("rh") : '<div class="mc-card">Documentação indisponível.</div>'; },
    mount(c){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(c,"rh"); }
  };
})();
