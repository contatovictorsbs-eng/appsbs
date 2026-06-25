/* ===========================================================
   SBS Painel T.I. — módulos
   Visão Geral · Liberação de Features · GMud · Changelog
   =========================================================== */
(function(){
  const M = TI.Modules, S = TI.S, esc = TI.esc;

  const TIPOS  = { corretiva:"Corretiva", evolutiva:"Evolutiva", emergencial:"Emergencial" };
  const RISCOS = { baixo:"Baixo", medio:"Médio", alto:"Alto" };
  const STATUS = {
    rascunho:    { l:"Rascunho",      c:"s-draft" },
    agendada:    { l:"Agendada",      c:"s-sched" },
    em_execucao: { l:"Em execução",   c:"s-run" },
    concluida:   { l:"Concluída",     c:"s-done" },
    cancelada:   { l:"Cancelada",     c:"s-cancel" },
  };
  const FLOW = ["rascunho","agendada","em_execucao","concluida"];

  function features(){ return S.getCol("features")||[]; }
  function gmuds(){ return S.getCol("gmuds")||[]; }
  function meta(){ return S.get("sistema_meta")||{versao:"2.0.0",atualizadoEm:S.today()}; }
  function who(){ return (TI.session&&TI.session.nome)||"T.I."; }
  function nowStr(){ return S.today()+" "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); }

  function notify(title, text, icon){
    S.add("notificacoes", { title, text, tipo:"aviso", icon:icon||"git-pull-request-arrow",
      destino:"todos", data:S.today(), de:(TI.session&&TI.session.email)||"ti@sbsgreen.com.br" });
  }
  function bumpVersion(v){
    if(!v) return;
    S.set("sistema_meta", { versao:v, atualizadoEm:S.today() });
  }

  /* =================== VISÃO GERAL =================== */
  M.overview = {
    label:"Visão Geral",
    render(){
      const f = features();
      const on = f.filter(x=>x.enabled).length, off = f.length-on;
      const g = gmuds();
      const abertas = g.filter(x=>x.status!=="concluida"&&x.status!=="cancelada").length;
      const emExec = g.filter(x=>x.status==="em_execucao").length;
      const m = meta();
      const card = (ic,v,l,tone)=>`<div class="ti-kpi ${tone||''}"><span class="ti-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="ti-kpi-v">${v}</div><div class="ti-kpi-l">${l}</div></div></div>`;
      const recent = g.slice(0,5);
      return `
      <div class="ti-kpis">
        ${card("toggle-right", on, "Features liberadas", "ok")}
        ${card("toggle-left", off, "Features desligadas", off?"warn":"")}
        ${card("git-pull-request-arrow", abertas, "GMuds em aberto", abertas?"info":"")}
        ${card("tag", "v"+m.versao, "Versão atual do sistema", "brand")}
      </div>

      <div class="ti-cols">
        <div class="ti-panel">
          <div class="ti-panel-h"><i data-lucide="history"></i> Últimas mudanças (GMud)</div>
          ${recent.length? recent.map(x=>`
            <div class="ti-row" data-gmud="${x.id}">
              <div class="ti-row-main">
                <div class="ti-row-t">${esc(x.numero)} · ${esc(x.titulo)}</div>
                <div class="ti-row-s">${TIPOS[x.tipo]||x.tipo} · ${x.janela?esc(x.janela):"sem janela"}</div>
              </div>
              <span class="ti-badge ${STATUS[x.status].c}">${STATUS[x.status].l}</span>
            </div>`).join("") : `<div class="ti-empty">Nenhuma GMud registrada ainda.</div>`}
        </div>
        <div class="ti-panel">
          <div class="ti-panel-h"><i data-lucide="alert-triangle"></i> Atenção</div>
          ${emExec? `<div class="ti-note run"><b>${emExec}</b> mudança(s) em execução agora.</div>`:""}
          ${off? `<div class="ti-note warn"><b>${off}</b> feature(s) desligada(s) — usuários não as veem no app.</div>`:""}
          ${(!emExec&&!off)? `<div class="ti-note ok">Tudo liberado e estável. Nenhuma mudança em andamento.</div>`:""}
          <div class="ti-quick">
            <button class="ti-btn" data-nav-to="features"><i data-lucide="toggle-right"></i> Gerenciar features</button>
            <button class="ti-btn primary" data-nav-to="gmud-new"><i data-lucide="plus"></i> Nova GMud</button>
          </div>
        </div>
      </div>`;
    },
    mount(c){
      c.querySelectorAll("[data-nav-to]").forEach(b=>b.addEventListener("click",()=>{
        const t=b.dataset.navTo;
        if(t==="gmud-new"){ TI.go("gmud"); setTimeout(()=>openGmudForm(),60); }
        else TI.go(t);
      }));
      c.querySelectorAll("[data-gmud]").forEach(r=>r.addEventListener("click",()=>{ TI.go("gmud"); setTimeout(()=>openGmudDetail(r.dataset.gmud),60); }));
    }
  };

  /* =================== LIBERAÇÃO DE FEATURES =================== */
  M.features = {
    label:"Liberação de Features",
    render(){
      const f = features();
      const grupos = {};
      f.forEach(x=>{ (grupos[x.grupo=x.grupo||"Outros"]=grupos[x.grupo]||[]).push(x); });
      const on = f.filter(x=>x.enabled).length;
      return `
      <div class="ti-toolbar">
        <div class="ti-sub">${on} de ${f.length} liberadas · alterações refletem em tempo real no app</div>
      </div>
      ${Object.keys(grupos).map(gp=>`
        <div class="ti-group">
          <div class="ti-group-h">${esc(gp)}</div>
          ${grupos[gp].map(x=>`
            <div class="ti-feat ${x.enabled?'':'is-off'}">
              <span class="ti-feat-ic"><i data-lucide="${x.icon||'square'}"></i></span>
              <div class="ti-feat-main">
                <div class="ti-feat-t">${esc(x.label)}</div>
                <div class="ti-feat-s">${x.enabled?'Liberada':'Desligada'} · ${(x.perfis&&!x.perfis.includes('todos'))?('perfis: '+x.perfis.join(', ')):'todos os perfis'}${x.atualizadoPor?' · por '+esc(x.atualizadoPor):''}</div>
              </div>
              <label class="ti-switch"><input type="checkbox" data-feat="${x.id}" ${x.enabled?'checked':''}><span class="ti-slider"></span></label>
            </div>`).join("")}
        </div>`).join("")}
      <div class="ti-note info" style="margin-top:16px"><i data-lucide="info"></i> Desligar uma feature a remove do menu e da home do app para todos os usuários — sem republicar. Registre a mudança em <b>GMud</b> para notificar a equipe.</div>`;
    },
    mount(c){
      c.querySelectorAll("[data-feat]").forEach(inp=>inp.addEventListener("change",()=>{
        const id = inp.dataset.feat;
        const arr = features();
        const i = arr.findIndex(x=>x.id===id);
        if(i<0) return;
        arr[i] = { ...arr[i], enabled:inp.checked, atualizadoEm:nowStr(), atualizadoPor:who() };
        S.setCol("features", arr);
        TI.toast((inp.checked?"Liberada: ":"Desligada: ")+arr[i].label);
        TI.go("features");
      }));
    }
  };

  /* =================== GMUD =================== */
  M.gmud = {
    label:"GMud · Gestão de Mudanças",
    render(){
      const g = gmuds();
      return `
      <div class="ti-toolbar">
        <div class="ti-sub">${g.length} mudança(s) registrada(s)</div>
        <button class="ti-btn primary" id="gm-new"><i data-lucide="plus"></i> Nova GMud</button>
      </div>
      ${g.length? `<div class="ti-cards">${g.map(x=>cardGmud(x)).join("")}</div>`
        : `<div class="ti-empty big"><i data-lucide="git-pull-request-arrow"></i><div>Nenhuma mudança registrada.</div><button class="ti-btn primary" id="gm-new2"><i data-lucide="plus"></i> Registrar primeira GMud</button></div>`}`;
    },
    mount(c){
      const nb = c.querySelector("#gm-new")||c.querySelector("#gm-new2");
      nb && nb.addEventListener("click",()=>openGmudForm());
      c.querySelectorAll("[data-gmud]").forEach(card=>card.addEventListener("click",e=>{
        if(e.target.closest("[data-stop]")) return;
        openGmudDetail(card.dataset.gmud);
      }));
    }
  };

  function cardGmud(x){
    const st = STATUS[x.status]||STATUS.rascunho;
    const riskCls = x.risco==="alto"?"r-alto":x.risco==="medio"?"r-medio":"r-baixo";
    const feats = (x.featuresImpactadas||[]).map(id=>{ const f=features().find(y=>y.id===id); return f?f.label:id; });
    return `
    <div class="ti-card" data-gmud="${x.id}">
      <div class="ti-card-top">
        <span class="ti-num">${esc(x.numero)}</span>
        <span class="ti-badge ${st.c}">${st.l}</span>
      </div>
      <div class="ti-card-t">${esc(x.titulo)}</div>
      <div class="ti-card-meta">
        <span class="ti-tag">${TIPOS[x.tipo]||x.tipo}</span>
        <span class="ti-tag ${riskCls}">Risco ${RISCOS[x.risco]||x.risco}</span>
        ${x.versao?`<span class="ti-tag">v${esc(x.versao)}</span>`:""}
      </div>
      ${x.janela?`<div class="ti-card-x"><i data-lucide="calendar-clock"></i> ${esc(x.janela)}</div>`:""}
      ${feats.length?`<div class="ti-card-x"><i data-lucide="toggle-right"></i> ${feats.slice(0,3).map(esc).join(", ")}${feats.length>3?" +"+(feats.length-3):""}</div>`:""}
      <div class="ti-card-x"><i data-lucide="user"></i> ${esc(x.responsavel||"—")}</div>
    </div>`;
  }

  /* ---- formulário Nova/Editar GMud ---- */
  function openGmudForm(existing){
    const ed = existing||{};
    const featOpts = features().map(f=>`<label class="ti-chk"><input type="checkbox" value="${f.id}" ${(ed.featuresImpactadas||[]).includes(f.id)?'checked':''}> ${esc(f.label)}</label>`).join("");
    const opt = (o,cur)=>Object.keys(o).map(k=>`<option value="${k}" ${cur===k?'selected':''}>${o[k]}</option>`).join("");
    TI.modal(existing?"Editar GMud":"Nova GMud", `
      <div class="ti-form">
        <div class="ti-fld full"><label>Título da mudança</label><input id="gf-titulo" value="${esc(ed.titulo||'')}" placeholder="Ex.: Liberar Protocolo de Renovação de Pastagem"></div>
        <div class="ti-fld full"><label>Descrição</label><textarea id="gf-desc" placeholder="O que muda, motivo e impacto esperado...">${esc(ed.descricao||'')}</textarea></div>
        <div class="ti-fld"><label>Tipo</label><select id="gf-tipo">${opt(TIPOS, ed.tipo||'evolutiva')}</select></div>
        <div class="ti-fld"><label>Risco</label><select id="gf-risco">${opt(RISCOS, ed.risco||'baixo')}</select></div>
        <div class="ti-fld"><label>Janela de execução</label><input id="gf-janela" type="datetime-local" value="${ed._janelaRaw||''}"></div>
        <div class="ti-fld"><label>Responsável / executor</label><input id="gf-resp" value="${esc(ed.responsavel||who())}" placeholder="Nome"></div>
        <div class="ti-fld"><label>Nº de versão (opcional)</label><input id="gf-versao" value="${esc(ed.versao||'')}" placeholder="Ex.: 2.1.0"></div>
        <div class="ti-fld"><label>Público da notificação</label><select id="gf-publico"><option value="todos">Todos os usuários</option></select></div>
        <div class="ti-fld full"><label>Features impactadas</label><div class="ti-chks">${featOpts}</div></div>
        <div class="ti-fld full"><label>Plano de rollback / contingência</label><textarea id="gf-plano" placeholder="Como reverter se algo der errado...">${esc(ed.plano||'')}</textarea></div>
      </div>`,
      `<button class="ti-btn" id="gf-cancel">Cancelar</button><button class="ti-btn primary" id="gf-save"><i data-lucide="save"></i> ${existing?'Salvar':'Registrar GMud'}</button>`);
    document.getElementById("gf-cancel").addEventListener("click",TI.closeModal);
    document.getElementById("gf-save").addEventListener("click",()=>{
      const v = id=>{ const el=document.getElementById(id); return el?el.value.trim():""; };
      const titulo = v("gf-titulo"); if(!titulo){ TI.toast("Informe o título"); return; }
      const janelaRaw = document.getElementById("gf-janela").value;
      const janela = janelaRaw ? new Date(janelaRaw).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "";
      const feats = [...document.querySelectorAll(".ti-chks input:checked")].map(i=>i.value);
      const data = { titulo, descricao:v("gf-desc"), tipo:v("gf-tipo"), risco:v("gf-risco"),
        janela, _janelaRaw:janelaRaw, responsavel:v("gf-resp"), versao:v("gf-versao"),
        publico:v("gf-publico"), featuresImpactadas:feats, plano:v("gf-plano") };
      if(existing){
        S.update("gmuds", existing.id, { ...data, historico:(existing.historico||[]).concat([{ t:nowStr(), por:who(), acao:"editada" }]) });
        TI.toast("GMud atualizada");
      } else {
        const num = "GM-"+String(1000+gmuds().length+1);
        S.add("gmuds", { numero:num, status:"rascunho", criadoEm:nowStr(), criadoPor:who(),
          historico:[{ t:nowStr(), por:who(), acao:"criada" }], ...data });
        TI.toast("GMud "+num+" registrada");
      }
      TI.closeModal(); TI.go("gmud");
    });
  }

  /* ---- detalhe + workflow de status ---- */
  function openGmudDetail(id){
    const x = gmuds().find(g=>g.id===id); if(!x) return;
    const st = STATUS[x.status]||STATUS.rascunho;
    const feats = (x.featuresImpactadas||[]).map(fid=>{ const f=features().find(y=>y.id===fid); return f?f.label:fid; });
    const kv = (k,v)=>v?`<div class="ti-kv"><div class="k">${k}</div><div class="v">${v}</div></div>`:"";
    const idx = FLOW.indexOf(x.status);
    const steps = FLOW.map((s,i)=>`<div class="ti-step ${i<=idx&&x.status!=='cancelada'?'on':''} ${x.status==='cancelada'?'cx':''}"><span>${i+1}</span>${STATUS[s].l}</div>`).join('<span class="ti-step-line"></span>');
    TI.side(
      `<div class="side-eyebrow">${esc(x.numero)} · GMud</div><h2>${esc(x.titulo)}</h2><span class="ti-badge ${st.c}" style="margin-top:8px">${st.l}</span>`,
      `<div class="ti-steps">${steps}</div>
       ${x.descricao?`<div class="ti-kv"><div class="k">Descrição</div><div class="v">${esc(x.descricao)}</div></div>`:""}
       ${kv("Tipo", TIPOS[x.tipo]||x.tipo)}
       ${kv("Risco", RISCOS[x.risco]||x.risco)}
       ${kv("Janela", esc(x.janela))}
       ${kv("Responsável", esc(x.responsavel))}
       ${kv("Versão", x.versao?("v"+esc(x.versao)):"")}
       ${feats.length?`<div class="ti-kv"><div class="k">Features impactadas</div><div class="v">${feats.map(f=>`<span class="ti-tag">${esc(f)}</span>`).join(" ")}</div></div>`:""}
       ${x.plano?`<div class="ti-kv"><div class="k">Plano de rollback</div><div class="v">${esc(x.plano)}</div></div>`:""}
       ${(x.historico&&x.historico.length)?`<div class="ti-kv"><div class="k">Histórico</div><div class="v">${x.historico.map(h=>`<div class="ti-hist">${esc(h.t)} · ${esc(h.por)} — ${esc(h.acao)}</div>`).join("")}</div></div>`:""}`,
      gmudFoot(x)
    );
    wireGmudFoot(x);
  }

  function gmudFoot(x){
    const btns = [];
    btns.push(`<button class="ti-btn" data-act="editar"><i data-lucide="pencil"></i> Editar</button>`);
    if(x.status==="rascunho")    btns.push(`<button class="ti-btn primary" data-act="agendar"><i data-lucide="calendar-check"></i> Agendar</button>`);
    if(x.status==="agendada")    btns.push(`<button class="ti-btn primary" data-act="executar"><i data-lucide="play"></i> Iniciar execução</button>`);
    if(x.status==="em_execucao") btns.push(`<button class="ti-btn primary" data-act="concluir"><i data-lucide="check"></i> Concluir & notificar</button>`);
    if(x.status!=="concluida"&&x.status!=="cancelada") btns.push(`<button class="ti-btn danger" data-act="cancelar"><i data-lucide="x"></i> Cancelar</button>`);
    return btns.join("");
  }
  function wireGmudFoot(x){
    const foot = document.getElementById("side-foot");
    foot.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>{
      const act = b.dataset.act;
      if(act==="editar"){ TI.closeSide(); openGmudForm({ ...x }); return; }
      const map = { agendar:"agendada", executar:"em_execucao", concluir:"concluida", cancelar:"cancelada" };
      const novo = map[act];
      const hist = (x.historico||[]).concat([{ t:nowStr(), por:who(), acao:STATUS[novo].l.toLowerCase() }]);
      S.update("gmuds", x.id, { status:novo, historico:hist });
      if(act==="concluir"){
        // notifica a equipe e atualiza a versão do sistema
        const txt = (TIPOS[x.tipo]||"Mudança")+': '+x.titulo+(x.versao?(" (v"+x.versao+")"):"")+".";
        notify("Atualização do sistema "+(x.versao?("· v"+x.versao):""), txt, "git-pull-request-arrow");
        bumpVersion(x.versao);
        TI.toast("Concluída — equipe notificada");
      } else {
        TI.toast("GMud "+STATUS[novo].l.toLowerCase());
      }
      TI.closeSide(); TI.go(TI.current);
    }));
  }

  /* =================== CHANGELOG =================== */
  M.changelog = {
    label:"Versões / Changelog",
    render(){
      const m = meta();
      const done = gmuds().filter(x=>x.status==="concluida");
      return `
      <div class="ti-version"><div class="ti-version-v">v${esc(m.versao)}</div><div class="ti-version-l">versão atual em produção · atualizada em ${esc(m.atualizadoEm)}</div></div>
      ${done.length? `<div class="ti-timeline">${done.map(x=>`
        <div class="ti-tl">
          <div class="ti-tl-dot"></div>
          <div class="ti-tl-body">
            <div class="ti-tl-top">${x.versao?`<span class="ti-tl-v">v${esc(x.versao)}</span>`:""}<span class="ti-tag">${TIPOS[x.tipo]||x.tipo}</span><span class="ti-tl-num">${esc(x.numero)}</span></div>
            <div class="ti-tl-t">${esc(x.titulo)}</div>
            ${x.descricao?`<div class="ti-tl-d">${esc(x.descricao)}</div>`:""}
            <div class="ti-tl-x">${esc(x.janela||x.criadoEm||"")}${x.responsavel?" · "+esc(x.responsavel):""}</div>
          </div>
        </div>`).join("")}</div>`
        : `<div class="ti-empty big"><i data-lucide="history"></i><div>Nenhuma versão publicada ainda. Conclua uma GMud para gerar o histórico.</div></div>`}`;
    }
  };

})();
