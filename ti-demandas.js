/* ===========================================================
   SBS Painel T.I. — Demandas & Escalonamento
   Entrada de demandas dos setores (coleção "demandas"). A T.I.
   faz triagem, escala para desenvolvimento atrelando uma GMud e,
   a cada mudança de status, comunica automaticamente o setor
   solicitante (coleção compartilhada "notificacoes").
   =========================================================== */
(function(){
  const M = TI.Modules, S = TI.S, esc = TI.esc;

  const ST = {
    aberta:           { l:"Aberta",            c:"s-draft",  next:"triagem" },
    triagem:          { l:"Em triagem",        c:"s-sched",  next:"em_desenvolvimento" },
    em_desenvolvimento:{ l:"Em desenvolvimento", c:"s-run",  next:"em_teste" },
    em_teste:         { l:"Em teste (homologação)", c:"s-sched", next:"concluida" },
    concluida:        { l:"Concluída",         c:"s-done",   next:null },
    recusada:         { l:"Recusada",          c:"s-cancel", next:null }
  };
  const PRIO = {
    baixa:{l:"Baixa",c:"#69756f",bg:"#EEF1F0"}, media:{l:"Média",c:"#1E73C2",bg:"#E5F0FB"},
    alta:{l:"Alta",c:"#C0710F",bg:"#FBEFE0"}, critica:{l:"Crítica",c:"#b3261e",bg:"#FDE8E6"}
  };
  // setor solicitante -> grupo de notificação
  const SETOR_GRP = {
    "Vendas":"grp:vendas", "Marketing":"grp:marketing", "P&D":"grp:pd", "RH":"grp:rh",
    "Atendimento":"grp:atendimento", "Inteligência de Mercado":"grp:mercado", "Diretoria":"grp:ceo"
  };

  const TIPO = {
    ajuste:{l:"Ajuste",ic:"wrench",c:"#2A4A7F"}, bug:{l:"Bug",ic:"bug",c:"#b3261e"},
    projeto:{l:"Projeto",ic:"folder-kanban",c:"#7A52C0"}, integracao:{l:"Integração",ic:"git-compare",c:"#0B8A5E"},
    documentacao:{l:"Documentação",ic:"file-text",c:"#C0710F"}
  };
  const PWEIGHT = { critica:0, alta:1, media:2, baixa:3 };
  let fSetor="*", fTipo="*", fStatus="*", ordPrio=false;

  function demandas(){ return S.getCol("demandas")||[]; }
  function gmuds(){ return S.getCol("gmuds")||[]; }
  function who(){ return (TI.session&&TI.session.nome)||"T.I."; }
  function nowStr(){ return S.today()+" "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); }

  function notificarSetor(d, title, text){
    const grp = SETOR_GRP[d.setor] || "todos";
    S.add("notificacoes", { title:title, text:text, tipo:"aviso", icon:"git-pull-request-arrow",
      destino:grp, destinoLabel:d.setor, data:S.today(), ts:Date.now(), de:(TI.session&&TI.session.email)||"ti@sbsgreen.com.br" });
    // se o solicitante for um e-mail, avisa direto também
    if(d.solicitante && /@/.test(d.solicitante)){
      S.add("notificacoes", { title:title, text:text, tipo:"aviso", icon:"git-pull-request-arrow",
        destino:d.solicitante.toLowerCase(), data:S.today(), ts:Date.now(), de:(TI.session&&TI.session.email)||"ti@sbsgreen.com.br" });
    }
  }

  M.demandas = {
    label:"Demandas & Escalonamento",
    render(){
      const all = demandas().slice();
      const abertas = all.filter(d=>d.status==="aberta"||d.status==="triagem").length;
      const dev = all.filter(d=>d.status==="em_desenvolvimento").length;
      const done = all.filter(d=>d.status==="concluida").length;
      // filtros + ordenação (backlog)
      let ds = all.filter(d=>(fSetor==="*"||d.setor===fSetor) && (fTipo==="*"||(d.tipo||"ajuste")===fTipo) && (fStatus==="*"||d.status===fStatus));
      ds.sort((a,b)=> ordPrio ? ((PWEIGHT[a.prioridade]??2)-(PWEIGHT[b.prioridade]??2)) : ((b.ts||0)-(a.ts||0)));
      const setores=[...new Set(all.map(d=>d.setor).filter(Boolean))];
      const card=(ic,v,l,tone)=>`<div class="ti-kpi ${tone||''}"><span class="ti-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="ti-kpi-v">${v}</div><div class="ti-kpi-l">${l}</div></div></div>`;
      return `
      <div class="ti-kpis">
        ${card("inbox", abertas, "Aguardando triagem", abertas?"warn":"")}
        ${card("hammer", dev, "Em desenvolvimento", dev?"info":"")}
        ${card("check-circle-2", done, "Concluídas", "ok")}
        ${card("layers", all.length, "Total no backlog", "brand")}
      </div>
      <div class="ti-toolbar" style="flex-wrap:wrap;gap:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <select class="ti-input" id="dm-fsetor"><option value="*">Todos os setores</option>${setores.map(s=>`<option ${fSetor===s?"selected":""}>${esc(s)}</option>`).join("")}</select>
          <select class="ti-input" id="dm-ftipo"><option value="*">Todos os tipos</option>${Object.keys(TIPO).map(k=>`<option value="${k}" ${fTipo===k?"selected":""}>${TIPO[k].l}</option>`).join("")}</select>
          <select class="ti-input" id="dm-fstatus"><option value="*">Todos os status</option>${Object.keys(ST).map(k=>`<option value="${k}" ${fStatus===k?"selected":""}>${ST[k].l}</option>`).join("")}</select>
          <button class="ti-btn ${ordPrio?'primary':''}" id="dm-ord"><i data-lucide="arrow-down-wide-narrow"></i> ${ordPrio?"Por prioridade":"Mais recentes"}</button>
        </div>
        <button class="ti-btn primary" id="dm-new"><i data-lucide="plus"></i> Registrar demanda</button>
      </div>
      <div class="ti-card"><div class="ti-table">
        <div class="ti-trow head"><span>Demanda</span><span>Setor</span><span>Prioridade</span><span>GMud</span><span>Status</span></div>
        ${ds.length? ds.map(d=>{
          const st=ST[d.status]||ST.aberta, p=PRIO[d.prioridade]||PRIO.media, tp=TIPO[d.tipo]||TIPO.ajuste;
          const gm=gmuds().find(g=>g.id===d.gmudId);
          return `<div class="ti-trow dm-row" data-id="${d.id}" style="cursor:pointer">
            <span class="ti-tmain"><div class="ti-tt"><span class="ti-pill" style="color:${tp.c};background:${tp.c}1a;margin-right:6px"><i data-lucide="${tp.ic}" style="width:11px;height:11px;vertical-align:-1px"></i> ${tp.l}</span>${esc(d.titulo)}</div><div class="ti-ts">${esc(d.solicitante||"")} · ${esc(d.data||"")}</div></span>
            <span>${esc(d.setor)}</span>
            <span><span class="ti-pill" style="color:${p.c};background:${p.bg}">${p.l}</span></span>
            <span class="ti-ts">${gm?esc(gm.numero):"—"}</span>
            <span><span class="ti-badge ${st.c}">${st.l}</span></span>
          </div>`;
        }).join("") : `<div class="ti-empty">Nenhuma demanda neste filtro.</div>`}
      </div></div>
      <div class="ti-note"><i data-lucide="info"></i> Esteira: Aberta → Triagem → Desenvolvimento → <b>Teste do setor (homologação)</b> → Concluída. Ao enviar para teste, o setor solicitante é avisado para validar em homologação antes de liberar. Cada mudança de status notifica o solicitante automaticamente.</div>`;
    },
    mount(c){
      c.querySelector("#dm-new") && (c.querySelector("#dm-new").onclick=()=>{ window.SBS_DEMANDA && SBS_DEMANDA.open(); });
      const fs=c.querySelector("#dm-fsetor"); fs&&(fs.onchange=()=>{ fSetor=fs.value; TI.go("demandas"); });
      const ft=c.querySelector("#dm-ftipo"); ft&&(ft.onchange=()=>{ fTipo=ft.value; TI.go("demandas"); });
      const fst=c.querySelector("#dm-fstatus"); fst&&(fst.onchange=()=>{ fStatus=fst.value; TI.go("demandas"); });
      const ord=c.querySelector("#dm-ord"); ord&&(ord.onclick=()=>{ ordPrio=!ordPrio; TI.go("demandas"); });
      c.querySelectorAll(".dm-row").forEach(r=>r.addEventListener("click",()=>detalhe(r.dataset.id)));
    }
  };

  function detalhe(id){
    const d = demandas().find(x=>x.id===id); if(!d) return;
    const st = ST[d.status]||ST.aberta, p=PRIO[d.prioridade]||PRIO.media;
    const gm = gmuds().find(g=>g.id===d.gmudId);
    const kv=(k,v)=>v?`<div class="ti-kv"><div class="k">${k}</div><div class="v">${v}</div></div>`:"";
    const hist=(d.historico||[]).slice().reverse().map(h=>`<div class="ti-hist"><i data-lucide="dot"></i><div><b>${esc(h.o||h.status||"")}</b><span>${esc(new Date(h.quando||Date.now()).toLocaleString("pt-BR"))}</span></div></div>`).join("")||'<div class="ti-ts">Sem histórico.</div>';
    const gmOpts = gmuds().filter(g=>g.status!=="concluida"&&g.status!=="cancelada")
      .map(g=>`<option value="${g.id}" ${d.gmudId===g.id?'selected':''}>${esc(g.numero)} · ${esc(g.titulo)}</option>`).join("");

    TI.side(
      `<div class="side-eyebrow">${esc(d.setor)} · Demanda</div><h2>${esc(d.titulo)}</h2><span class="ti-badge ${st.c}" style="margin-top:8px">${st.l}</span>`,
      `<div class="ti-kvs">
        ${kv("Solicitante", esc(d.solicitante||"—"))}
        ${kv("Prioridade", `<span class="ti-pill" style="color:${p.c};background:${p.bg}">${p.l}</span>`)}
        ${kv("Aberta em", esc(d.data||"—"))}
        ${kv("GMud atrelada", gm?esc(gm.numero+" · "+gm.titulo):"—")}
      </div>
      ${d.descricao?`<div class="ti-block"><div class="ti-block-h">Descrição</div><div class="ti-block-x">${esc(d.descricao)}</div></div>`:""}
      <div class="ti-block"><div class="ti-block-h">Atrelar a uma GMud</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select id="dm-gmud" class="ti-input" style="flex:1;min-width:180px"><option value="">— nenhuma —</option>${gmOpts}</select>
          <button class="ti-btn" id="dm-link"><i data-lucide="link"></i> Vincular</button>
          <button class="ti-btn" id="dm-newgmud"><i data-lucide="git-pull-request-arrow"></i> Criar GMud</button>
        </div>
      </div>
      <div class="ti-block"><div class="ti-block-h">Histórico</div>${hist}</div>`,
      botoes(d)
    );
    const foot=document.getElementById("side-foot");
    foot.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>acao(d, b.dataset.act)));
    const body=document.getElementById("side-body");
    body.querySelector("#dm-link") && (body.querySelector("#dm-link").onclick=()=>{
      const gid=body.querySelector("#dm-gmud").value;
      S.update("demandas", d.id, { gmudId:gid, historico:(d.historico||[]).concat([{quando:Date.now(), o:gid?"GMud vinculada":"GMud desvinculada", status:d.status}]) });
      TI.toast(gid?"GMud vinculada":"GMud desvinculada"); TI.closeSide(); TI.go("demandas");
    });
    body.querySelector("#dm-newgmud") && (body.querySelector("#dm-newgmud").onclick=()=>criarGmud(d));
    TI.icons&&TI.icons();
  }

  function botoes(d){
    const b=[];
    if(d.status==="aberta") b.push(`<button class="ti-btn primary" data-act="triagem"><i data-lucide="search-check"></i> Pôr em triagem</button>`);
    if(d.status==="triagem") b.push(`<button class="ti-btn primary" data-act="em_desenvolvimento"><i data-lucide="hammer"></i> Escalar p/ desenvolvimento</button>`);
    if(d.status==="em_desenvolvimento") b.push(`<button class="ti-btn primary" data-act="em_teste"><i data-lucide="flask-conical"></i> Enviar p/ teste do setor</button>`);
    if(d.status==="em_teste"){
      b.push(`<button class="ti-btn primary" data-act="concluida"><i data-lucide="check"></i> Aprovado — concluir</button>`);
      b.push(`<button class="ti-btn" data-act="em_desenvolvimento"><i data-lucide="undo-2"></i> Reprovar — voltar ao dev</button>`);
    }
    if(d.status!=="concluida"&&d.status!=="recusada") b.push(`<button class="ti-btn danger" data-act="recusada"><i data-lucide="x"></i> Recusar</button>`);
    return b.join("");
  }

  function acao(d, novo){
    const st=ST[novo]; if(!st) return;
    const hist=(d.historico||[]).concat([{quando:Date.now(), o:"Status → "+st.l+" (por "+who()+")", status:novo}]);
    S.update("demandas", d.id, { status:novo, atualizado:Date.now(), historico:hist });
    // comunica o setor solicitante
    const msgs={
      triagem:["Demanda em triagem · "+d.setor, 'Sua demanda "'+d.titulo+'" entrou em triagem na T.I.'],
      em_desenvolvimento:["Demanda em desenvolvimento · "+d.setor, 'A T.I. está desenvolvendo/ajustando "'+d.titulo+'".'],
      em_teste:["Demanda pronta p/ TESTE · "+d.setor, 'Sua demanda "'+d.titulo+'" está pronta para você validar em HOMOLOGAÇÃO. Entre no ambiente de testes pelo seletor \u201cTestar (homologação)\u201d no canto inferior esquerdo do painel, confira se ficou como esperado e avise a T.I. se aprova.'],
      concluida:["Demanda concluída · "+d.setor, 'Pronto! "'+d.titulo+'" foi aprovada no teste e já está disponível em produção.'],
      recusada:["Demanda não aprovada · "+d.setor, 'A demanda "'+d.titulo+'" não pôde ser atendida agora. Fale com a T.I. para detalhes.']
    };
    if(msgs[novo]) notificarSetor(d, msgs[novo][0], msgs[novo][1]);
    TI.toast("Status atualizado — setor avisado");
    TI.closeSide(); TI.go("demandas");
  }

  function criarGmud(d){
    const num="GM-"+String(1000+gmuds().length+1);
    const g=S.add("gmuds", { numero:num, status:"rascunho", criadoEm:nowStr(), criadoPor:who(),
      titulo:d.titulo, tipo:"evolutiva", risco:(d.prioridade==="critica"||d.prioridade==="alta")?"alto":"medio",
      descricao:(d.descricao||"")+"\n\n(Origem: demanda de "+d.setor+")", publico:"", featuresImpactadas:[],
      historico:[{ t:nowStr(), por:who(), acao:"criada a partir de demanda" }] });
    S.update("demandas", d.id, { gmudId:g.id, status:d.status==="aberta"?"triagem":d.status,
      historico:(d.historico||[]).concat([{quando:Date.now(), o:"GMud "+num+" criada desta demanda", status:d.status}]) });
    TI.toast("GMud "+num+" criada e vinculada");
    TI.closeSide(); TI.go("demandas");
  }
})();
