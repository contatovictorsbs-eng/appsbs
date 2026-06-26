/* ===========================================================
   SBS Painel de Marketing — módulos
   =========================================================== */
(function(){
  const M = MKT.Modules, S = MKT.S, esc = MKT.esc, money = MKT.money, num = MKT.num, dateBR = MKT.dateBR;

  const CAMP_ST = { ativa:{l:"Ativa",c:"#0B8A5E",bg:"#E4F5EC"}, planejada:{l:"Planejada",c:"#1E73C2",bg:"#E5F0FB"}, rascunho:{l:"Rascunho",c:"#69756f",bg:"#EEF1F0"}, encerrada:{l:"Encerrada",c:"#8a6d3b",bg:"#F5EFE0"} };
  const CT_ST = { ideia:{l:"Ideia",c:"#69756f",bg:"#EEF1F0"}, producao:{l:"Em produção",c:"#C0710F",bg:"#FBEFE0"}, agendado:{l:"Agendado",c:"#1E73C2",bg:"#E5F0FB"}, publicado:{l:"Publicado",c:"#0B8A5E",bg:"#E4F5EC"} };
  const EV_ST = { planejado:{l:"Planejado",c:"#69756f",bg:"#EEF1F0"}, confirmado:{l:"Confirmado",c:"#1E73C2",bg:"#E5F0FB"}, realizado:{l:"Realizado",c:"#0B8A5E",bg:"#E4F5EC"} };

  function campanhas(){ return (S.getCol("mkt_campanhas")||[]).filter(c=>c.id); }
  function eventos(){ return S.getCol("mkt_eventos")||[]; }
  function conteudo(){ return S.getCol("mkt_conteudo")||[]; }
  function social(){ return S.getCol("mkt_social")||[]; }
  function materiais(){ return (S.getCol("marketing")||[]).filter(i=>i.tipo!=="pasta"); }
  function who(){ return (MKT.session&&MKT.session.nome)||"Marketing"; }

  function kpi(ic,v,l,tone){ return `<div class="mc-kpi ${tone||''}"><span class="mc-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="mc-kpi-v">${v}</div><div class="mc-kpi-l">${l}</div></div></div>`; }
  function badge(map,st){ const s=map[st]||Object.values(map)[0]; return `<span class="mc-badge" style="color:${s.c};background:${s.bg}">${s.l}</span>`; }

  /* =================== VISÃO GERAL =================== */
  M.visao = {
    label:"Visão Geral",
    render(){
      const camp=campanhas(), ativas=camp.filter(c=>c.status==="ativa").length;
      const verba=camp.filter(c=>c.status==="ativa"||c.status==="planejada").reduce((s,c)=>s+(+c.verba||0),0);
      const leads=eventos().reduce((s,e)=>s+(+e.leads||0),0);
      const seg=social().reduce((s,c)=>s+(+c.seguidores||0),0);
      const pend=conteudo().filter(c=>c.status!=="publicado").length;
      const prox=eventos().filter(e=>e.status!=="realizado").sort((a,b)=>(a.inicio>b.inicio?1:-1));
      const ativasList=camp.filter(c=>c.status==="ativa");
      return `
      <div class="mc-kpis">
        ${kpi("megaphone", ativas, "Campanhas ativas", "ok")}
        ${kpi("wallet", money(verba), "Verba em campanhas ativas/planejadas", "")}
        ${kpi("users-round", num(seg), "Seguidores (todas as redes)", "")}
        ${kpi("sparkles", leads?num(leads):"0", "Leads de eventos (ano)", "")}
      </div>
      <div class="mc-cols">
        <div class="mc-card">
          <div class="mc-card-h"><i data-lucide="megaphone"></i> Campanhas ativas</div>
          ${ativasList.length? ativasList.map(c=>`
            <div class="mc-row" data-go-camp="${c.id}">
              <div class="mc-row-main"><div class="mc-row-t">${esc(c.nome)}</div><div class="mc-row-s">${esc(c.canal||"")} · ${dateBR(c.inicio)} a ${dateBR(c.fim)}</div></div>
              <div class="mc-row-r">${money(c.verba)}</div>
            </div>`).join("") : `<div class="mc-empty">Nenhuma campanha ativa.</div>`}
          <button class="mc-btn ghost" data-nav-to="campanhas" style="margin-top:12px"><i data-lucide="arrow-right"></i> Ver todas</button>
        </div>
        <div class="mc-side">
          <div class="mc-mini"><div class="mc-mini-h"><i data-lucide="calendar-days"></i> Conteúdo pendente</div><div class="mc-mini-v">${pend}</div><a class="mc-mini-link" data-nav-to="conteudo">Ver calendário →</a></div>
          <div class="mc-mini"><div class="mc-mini-h"><i data-lucide="tent"></i> Próximos eventos</div>
            ${prox.slice(0,3).map(e=>`<div class="mc-mini-row"><span>${esc(e.nome)}</span><b>${dateBR(e.inicio)}</b></div>`).join("")||'<div class="mc-mini-row"><span>Nenhum</span></div>'}
          </div>
        </div>
      </div>
      <div class="mc-note"><i data-lucide="link"></i> Os materiais publicados ficam disponíveis em "Marketing" no app do vendedor para compartilhar com clientes. Os indicadores desta tela alimentam o Painel do CEO.</div>`;
    },
    mount(c){
      c.querySelectorAll("[data-nav-to]").forEach(b=>b.addEventListener("click",()=>MKT.go(b.dataset.navTo)));
      c.querySelectorAll("[data-go-camp]").forEach(r=>r.addEventListener("click",()=>{ MKT.go("campanhas"); }));
    }
  };

  /* =================== CAMPANHAS =================== */
  M.campanhas = {
    label:"Campanhas",
    render(){
      const camp=campanhas();
      return `
      <div class="mc-toolbar">
        <div class="mc-sub">${camp.length} campanha(s) de marketing</div>
        <button class="mc-btn primary" id="camp-new"><i data-lucide="plus"></i> Nova campanha</button>
      </div>
      <div class="mc-cards">${camp.map(c=>cardCamp(c)).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#camp-new").addEventListener("click",()=>formCamp());
      c.querySelectorAll("[data-camp]").forEach(card=>card.addEventListener("click",()=>detailCamp(card.dataset.camp)));
    }
  };
  function cardCamp(c){
    const pct = c.status==="encerrada"&&c.resultado ? null : null;
    return `<div class="mc-ccard" data-camp="${c.id}">
      <div class="mc-ccard-top">${badge(CAMP_ST,c.status)}<span class="mc-ccard-verba">${money(c.verba)}</span></div>
      <div class="mc-ccard-t">${esc(c.nome)}</div>
      <div class="mc-ccard-d">${esc(c.descricao||"")}</div>
      <div class="mc-ccard-meta">
        <span><i data-lucide="radio"></i> ${esc(c.canal||"—")}</span>
        <span><i data-lucide="calendar"></i> ${dateBR(c.inicio)} – ${dateBR(c.fim)}</span>
        <span><i data-lucide="user"></i> ${esc(c.responsavel||"—")}</span>
        ${c.meta?`<span><i data-lucide="target"></i> Meta ${esc(c.meta)}${c.resultado?" · "+esc(c.resultado):""}</span>`:""}
      </div>
    </div>`;
  }
  function detailCamp(id){
    const c=campanhas().find(x=>x.id===id); if(!c) return;
    const kv=(k,v)=>v?`<div class="kv"><div class="k">${k}</div><div class="vv">${v}</div></div>`:"";
    MKT.side(
      `<div><div class="mc-eyebrow">Campanha</div><h2>${esc(c.nome)}</h2>${badge(CAMP_ST,c.status)}</div><span class="side-x" id="side-x"><i data-lucide="x"></i></span>`,
      `${kv("Descrição",esc(c.descricao))}${kv("Canal",esc(c.canal))}${kv("Período",dateBR(c.inicio)+" a "+dateBR(c.fim))}${kv("Público",esc(c.publico))}${kv("Verba",money(c.verba))}${kv("Meta",esc(c.meta))}${kv("Resultado",esc(c.resultado))}${kv("Responsável",esc(c.responsavel))}`,
      `<button class="mc-btn ghost" id="camp-edit"><i data-lucide="pencil"></i> Editar</button>
       ${c.status!=="ativa"?`<button class="mc-btn ok" data-set="ativa"><i data-lucide="play"></i> Ativar</button>`:`<button class="mc-btn ghost" data-set="encerrada"><i data-lucide="square"></i> Encerrar</button>`}`
    );
    document.getElementById("side-x").addEventListener("click",MKT.closeSide);
    document.getElementById("camp-edit").addEventListener("click",()=>{ MKT.closeSide(); formCamp(c); });
    document.querySelectorAll("[data-set]").forEach(b=>b.addEventListener("click",()=>{ S.update("mkt_campanhas",c.id,{status:b.dataset.set}); MKT.toast("Campanha "+(b.dataset.set==="ativa"?"ativada":"encerrada")); MKT.closeSide(); MKT.refresh(); }));
  }
  function formCamp(ed){
    ed=ed||{};
    const opt=(o,cur)=>o.map(k=>`<option value="${k}" ${cur===k?"selected":""}>${k[0].toUpperCase()+k.slice(1)}</option>`).join("");
    MKT.modal(ed.id?"Editar campanha":"Nova campanha",`
      <div class="fld"><label>Nome</label><input id="cf-nome" value="${esc(ed.nome||'')}" placeholder="Ex.: Soja Premium 25/26"></div>
      <div class="fld"><label>Descrição</label><textarea id="cf-desc" placeholder="Benefício, mecânica...">${esc(ed.descricao||'')}</textarea></div>
      <div class="fld-row">
        <div class="fld"><label>Status</label><select id="cf-status">${opt(["rascunho","planejada","ativa","encerrada"],ed.status||"rascunho")}</select></div>
        <div class="fld"><label>Canal</label><input id="cf-canal" value="${esc(ed.canal||'')}" placeholder="App + WhatsApp"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Início</label><input id="cf-ini" type="date" value="${esc(ed.inicio||'')}"></div>
        <div class="fld"><label>Fim</label><input id="cf-fim" type="date" value="${esc(ed.fim||'')}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Verba (R$)</label><input id="cf-verba" type="number" value="${ed.verba||''}" placeholder="0"></div>
        <div class="fld"><label>Meta</label><input id="cf-meta" value="${esc(ed.meta||'')}" placeholder="500 ton"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Público</label><input id="cf-pub" value="${esc(ed.publico||'')}" placeholder="Produtores de soja"></div>
        <div class="fld"><label>Responsável</label><input id="cf-resp" value="${esc(ed.responsavel||who())}"></div>
      </div>`,
      `<button class="mc-btn ghost" id="cf-cancel">Cancelar</button><button class="mc-btn primary" id="cf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("cf-cancel").addEventListener("click",MKT.closeModal);
    document.getElementById("cf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("cf-nome"); if(!nome){ MKT.toast("Informe o nome"); return; }
      const data={ nome, descricao:v("cf-desc"), status:v("cf-status"), canal:v("cf-canal"), inicio:v("cf-ini"), fim:v("cf-fim"), verba:+v("cf-verba")||0, meta:v("cf-meta"), publico:v("cf-pub"), responsavel:v("cf-resp") };
      if(ed.id) S.update("mkt_campanhas",ed.id,data);
      else S.add("mkt_campanhas",Object.assign({id:"cmp"+Date.now()},data));
      MKT.toast("Campanha salva"); MKT.closeModal(); MKT.refresh();
    });
  }

  /* =================== MATERIAIS & CRIATIVOS =================== */
  M.materiais = {
    label:"Materiais & Criativos",
    render(){
      const its=materiais();
      const cats=Array.from(new Set(its.map(i=>i.categoria).filter(Boolean)));
      return `
      <div class="mc-toolbar"><div class="mc-sub">${its.length} material(is) · ficam disponíveis em "Marketing" no app do vendedor</div>
        <button class="mc-btn primary" id="mat-new"><i data-lucide="plus"></i> Adicionar material</button></div>
      ${its.length? `<div class="mc-grid">${its.map(i=>cardMat(i)).join("")}</div>` : `<div class="mc-empty big"><i data-lucide="image"></i><div>Nenhum material cadastrado.</div></div>`}`;
    },
    mount(c){
      c.querySelector("#mat-new").addEventListener("click",()=>formMat());
      c.querySelectorAll("[data-del-mat]").forEach(b=>b.addEventListener("click",e=>{ e.stopPropagation(); if(confirm("Remover este material?")){ S.remove("marketing",b.dataset.delMat); MKT.toast("Material removido"); MKT.refresh(); } }));
      c.querySelectorAll("[data-edit-mat]").forEach(b=>b.addEventListener("click",()=>{ const it=materiais().find(x=>x.id===b.dataset.editMat); formMat(it); }));
    }
  };
  function cardMat(i){
    const th=i.thumb||i.url;
    return `<div class="mc-mat">
      <div class="mc-mat-thumb" data-edit-mat="${i.id}">${th&&/^(data:|http)/.test(th)?`<img src="${th}" alt="" loading="lazy">`:`<span class="mc-mat-ph"><i data-lucide="image"></i></span>`}</div>
      <div class="mc-mat-body">
        <div class="mc-mat-name">${esc(i.titulo||"Material")}</div>
        ${i.categoria?`<div class="mc-mat-cat">${esc(i.categoria)}</div>`:""}
        <div class="mc-mat-acts"><button class="mc-link" data-edit-mat="${i.id}">Editar</button><button class="mc-link danger" data-del-mat="${i.id}">Remover</button></div>
      </div>
    </div>`;
  }
  function formMat(ed){
    ed=ed||{};
    MKT.modal(ed.id?"Editar material":"Adicionar material",`
      <div class="fld"><label>Título</label><input id="mf-tit" value="${esc(ed.titulo||'')}" placeholder="Ex.: Arte Soja Premium"></div>
      <div class="fld"><label>Categoria</label><input id="mf-cat" value="${esc(ed.categoria||'')}" placeholder="Ex.: Campanhas"></div>
      <div class="fld"><label>URL da imagem/arte</label><input id="mf-url" value="${esc(ed.url||'')}" placeholder="https://... ou link do Drive"></div>
      <div class="fld"><label>Ou enviar arquivo</label><input id="mf-file" type="file" accept="image/*"></div>
      <div class="mc-prev" id="mf-prev">${ed.url&&/^(data:|http)/.test(ed.url)?`<img src="${ed.thumb||ed.url}" alt="">`:""}</div>`,
      `<button class="mc-btn ghost" id="mf-cancel">Cancelar</button><button class="mc-btn primary" id="mf-save"><i data-lucide="save"></i> Salvar</button>`);
    let dataUrl = ed.url&&/^data:/.test(ed.url)?ed.url:"";
    document.getElementById("mf-file").addEventListener("change",e=>{
      const f=e.target.files[0]; if(!f) return;
      const r=new FileReader(); r.onload=()=>{ const img=new Image(); img.onload=()=>{ const mx=1200,sc=Math.min(1,mx/Math.max(img.width,img.height)); const cv=document.createElement("canvas"); cv.width=img.width*sc; cv.height=img.height*sc; cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height); dataUrl=cv.toDataURL("image/jpeg",0.82); document.getElementById("mf-prev").innerHTML=`<img src="${dataUrl}" alt="">`; }; img.src=r.result; }; r.readAsDataURL(f);
    });
    document.getElementById("mf-cancel").addEventListener("click",MKT.closeModal);
    document.getElementById("mf-save").addEventListener("click",()=>{
      const tit=document.getElementById("mf-tit").value.trim(); if(!tit){ MKT.toast("Informe o título"); return; }
      const url=dataUrl||document.getElementById("mf-url").value.trim();
      if(!url){ MKT.toast("Informe a URL ou envie um arquivo"); return; }
      const data={ titulo:tit, categoria:document.getElementById("mf-cat").value.trim(), url:url, tipo:"imagem" };
      if(ed.id) S.update("marketing",ed.id,data); else S.add("marketing",Object.assign({id:"mat"+Date.now()},data));
      MKT.toast("Material salvo"); MKT.closeModal(); MKT.refresh();
    });
  }

  /* =================== CALENDÁRIO DE CONTEÚDO =================== */
  M.conteudo = {
    label:"Calendário de Conteúdo",
    render(){
      const its=conteudo().slice().sort((a,b)=>(a.data>b.data?1:-1));
      const cols=[["ideia","Ideias"],["producao","Em produção"],["agendado","Agendado"],["publicado","Publicado"]];
      return `
      <div class="mc-toolbar"><div class="mc-sub">${its.length} item(ns) no pipeline editorial</div>
        <button class="mc-btn primary" id="ct-new"><i data-lucide="plus"></i> Novo conteúdo</button></div>
      <div class="mc-kanban">${cols.map(col=>`
        <div class="mc-kcol">
          <div class="mc-kcol-h">${col[1]} <span>${its.filter(i=>i.status===col[0]).length}</span></div>
          ${its.filter(i=>i.status===col[0]).map(i=>`
            <div class="mc-kcard" data-ct="${i.id}">
              <div class="mc-kcard-t">${esc(i.titulo)}</div>
              <div class="mc-kcard-m"><span class="mc-tagc">${esc(i.canal)}</span> ${esc(i.formato||"")}</div>
              <div class="mc-kcard-f"><i data-lucide="calendar"></i> ${dateBR(i.data)} · ${esc(i.responsavel||"")}</div>
            </div>`).join("")||'<div class="mc-kempty">—</div>'}
        </div>`).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#ct-new").addEventListener("click",()=>formCt());
      c.querySelectorAll("[data-ct]").forEach(card=>card.addEventListener("click",()=>formCt(conteudo().find(x=>x.id===card.dataset.ct))));
    }
  };
  function formCt(ed){
    ed=ed||{};
    const opt=(o,cur)=>o.map(k=>`<option value="${k[0]}" ${cur===k[0]?"selected":""}>${k[1]}</option>`).join("");
    MKT.modal(ed.id?"Editar conteúdo":"Novo conteúdo",`
      <div class="fld"><label>Título</label><input id="tf-tit" value="${esc(ed.titulo||'')}" placeholder="Ex.: Vídeo sobre cultivar X"></div>
      <div class="fld-row">
        <div class="fld"><label>Canal</label><input id="tf-canal" value="${esc(ed.canal||'')}" placeholder="Instagram"></div>
        <div class="fld"><label>Formato</label><input id="tf-fmt" value="${esc(ed.formato||'')}" placeholder="Reels"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Data</label><input id="tf-data" type="date" value="${esc(ed.data||'')}"></div>
        <div class="fld"><label>Status</label><select id="tf-status">${opt([["ideia","Ideia"],["producao","Em produção"],["agendado","Agendado"],["publicado","Publicado"]],ed.status||"ideia")}</select></div>
      </div>
      <div class="fld"><label>Responsável</label><input id="tf-resp" value="${esc(ed.responsavel||who())}"></div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="tf-del">Remover</button>':''}<button class="mc-btn ghost" id="tf-cancel">Cancelar</button><button class="mc-btn primary" id="tf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("tf-cancel").addEventListener("click",MKT.closeModal);
    const del=document.getElementById("tf-del"); if(del) del.addEventListener("click",()=>{ S.remove("mkt_conteudo",ed.id); MKT.toast("Removido"); MKT.closeModal(); MKT.refresh(); });
    document.getElementById("tf-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const tit=v("tf-tit"); if(!tit){ MKT.toast("Informe o título"); return; }
      const data={ titulo:tit, canal:v("tf-canal"), formato:v("tf-fmt"), data:v("tf-data"), status:v("tf-status"), responsavel:v("tf-resp") };
      if(ed.id) S.update("mkt_conteudo",ed.id,data); else S.add("mkt_conteudo",Object.assign({id:"ct"+Date.now()},data));
      MKT.toast("Conteúdo salvo"); MKT.closeModal(); MKT.refresh();
    });
  }

  /* =================== REDES & CANAIS =================== */
  M.redes = {
    label:"Redes & Canais",
    render(){
      const sc=social();
      const totSeg=sc.reduce((s,c)=>s+(+c.seguidores||0),0);
      const totAlc=sc.reduce((s,c)=>s+(+c.alcance||0),0);
      const avgEng=sc.length?(sc.reduce((s,c)=>s+(+c.engaj||0),0)/sc.length):0;
      return `
      <div class="mc-kpis">
        ${kpi("users-round", num(totSeg), "Seguidores totais", "")}
        ${kpi("eye", num(totAlc), "Alcance no mês", "")}
        ${kpi("heart", avgEng.toFixed(1)+"%", "Engajamento médio", "ok")}
        ${kpi("share-2", sc.length, "Canais monitorados", "")}
      </div>
      <div class="mc-card">
        <div class="mc-card-h"><i data-lucide="bar-chart-3"></i> Desempenho por canal</div>
        <div class="mc-table">
          <div class="mc-trow head"><span>Canal</span><span class="r">Seguidores</span><span class="r">Variação</span><span class="r">Alcance</span><span class="r">Engaj.</span><span></span></div>
          ${sc.map(c=>`<div class="mc-trow" data-sc="${c.id}">
            <span class="mc-tch"><i data-lucide="${esc(c.icon||'share-2')}" class="mc-ic"></i> ${esc(c.canal)}</span>
            <span class="r strong">${num(c.seguidores)}</span>
            <span class="r ${(+c.var>=0)?'up':'down'}">${(+c.var>=0?'+':'')}${c.var}%</span>
            <span class="r">${num(c.alcance)}</span>
            <span class="r">${c.engaj}%</span>
            <span class="r"><button class="mc-link" data-edit-sc="${c.id}">Atualizar</button></span>
          </div>`).join("")}
        </div>
      </div>
      <div class="mc-note"><i data-lucide="info"></i> Demonstração: os números são atualizados manualmente aqui. A conexão automática às APIs de cada rede é um passo de integração à parte.</div>`;
    },
    mount(c){
      c.querySelectorAll("[data-edit-sc]").forEach(b=>b.addEventListener("click",()=>formSc(social().find(x=>x.id===b.dataset.editSc))));
    }
  };
  function formSc(ed){
    ed=ed||{};
    MKT.modal("Atualizar "+esc(ed.canal||"canal"),`
      <div class="fld-row">
        <div class="fld"><label>Seguidores</label><input id="sf-seg" type="number" value="${ed.seguidores||0}"></div>
        <div class="fld"><label>Variação (%)</label><input id="sf-var" type="number" step="0.1" value="${ed.var||0}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Alcance</label><input id="sf-alc" type="number" value="${ed.alcance||0}"></div>
        <div class="fld"><label>Engajamento (%)</label><input id="sf-eng" type="number" step="0.1" value="${ed.engaj||0}"></div>
      </div>`,
      `<button class="mc-btn ghost" id="sf-cancel">Cancelar</button><button class="mc-btn primary" id="sf-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("sf-cancel").addEventListener("click",MKT.closeModal);
    document.getElementById("sf-save").addEventListener("click",()=>{
      S.update("mkt_social",ed.id,{ seguidores:+document.getElementById("sf-seg").value||0, var:+document.getElementById("sf-var").value||0, alcance:+document.getElementById("sf-alc").value||0, engaj:+document.getElementById("sf-eng").value||0 });
      MKT.toast("Canal atualizado"); MKT.closeModal(); MKT.refresh();
    });
  }

  /* =================== EVENTOS & FEIRAS =================== */
  M.eventos = {
    label:"Eventos & Feiras",
    render(){
      const evs=eventos().slice().sort((a,b)=>(a.inicio>b.inicio?1:-1));
      const custo=evs.reduce((s,e)=>s+(+e.custo||0),0);
      const leads=evs.reduce((s,e)=>s+(+e.leads||0),0);
      return `
      <div class="mc-kpis">
        ${kpi("tent", evs.length, "Eventos no ano", "")}
        ${kpi("wallet", money(custo), "Investimento total", "")}
        ${kpi("sparkles", num(leads), "Leads captados", "ok")}
        ${kpi("calendar-clock", evs.filter(e=>e.status!=="realizado").length, "Por vir", "")}
      </div>
      <div class="mc-toolbar"><div class="mc-sub">Agenda de feiras e eventos próprios</div>
        <button class="mc-btn primary" id="ev-new"><i data-lucide="plus"></i> Novo evento</button></div>
      <div class="mc-cards">${evs.map(e=>`
        <div class="mc-ccard" data-ev="${e.id}">
          <div class="mc-ccard-top">${badge(EV_ST,e.status)}<span class="mc-ccard-verba">${money(e.custo)}</span></div>
          <div class="mc-ccard-t">${esc(e.nome)}</div>
          <div class="mc-ccard-d">${esc(e.tipo||"")} · ${esc(e.local||"")}</div>
          <div class="mc-ccard-meta">
            <span><i data-lucide="calendar"></i> ${dateBR(e.inicio)}${e.fim&&e.fim!==e.inicio?" – "+dateBR(e.fim):""}</span>
            ${e.leads?`<span><i data-lucide="sparkles"></i> ${num(e.leads)} leads</span>`:""}
            <span><i data-lucide="user"></i> ${esc(e.responsavel||"—")}</span>
          </div>
        </div>`).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#ev-new").addEventListener("click",()=>formEv());
      c.querySelectorAll("[data-ev]").forEach(card=>card.addEventListener("click",()=>formEv(eventos().find(x=>x.id===card.dataset.ev))));
    }
  };
  function formEv(ed){
    ed=ed||{};
    const opt=(o,cur)=>o.map(k=>`<option value="${k[0]}" ${cur===k[0]?"selected":""}>${k[1]}</option>`).join("");
    MKT.modal(ed.id?"Editar evento":"Novo evento",`
      <div class="fld"><label>Nome</label><input id="ef-nome" value="${esc(ed.nome||'')}" placeholder="Ex.: Agrishow"></div>
      <div class="fld-row">
        <div class="fld"><label>Tipo</label><input id="ef-tipo" value="${esc(ed.tipo||'')}" placeholder="Feira / Evento próprio"></div>
        <div class="fld"><label>Local</label><input id="ef-local" value="${esc(ed.local||'')}" placeholder="Cidade, UF"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Início</label><input id="ef-ini" type="date" value="${esc(ed.inicio||'')}"></div>
        <div class="fld"><label>Fim</label><input id="ef-fim" type="date" value="${esc(ed.fim||'')}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Status</label><select id="ef-status">${opt([["planejado","Planejado"],["confirmado","Confirmado"],["realizado","Realizado"]],ed.status||"planejado")}</select></div>
        <div class="fld"><label>Custo (R$)</label><input id="ef-custo" type="number" value="${ed.custo||''}"></div>
      </div>
      <div class="fld-row">
        <div class="fld"><label>Leads</label><input id="ef-leads" type="number" value="${ed.leads||0}"></div>
        <div class="fld"><label>Responsável</label><input id="ef-resp" value="${esc(ed.responsavel||who())}"></div>
      </div>`,
      `${ed.id?'<button class="mc-btn ghost danger" id="ef-del">Remover</button>':''}<button class="mc-btn ghost" id="ef-cancel">Cancelar</button><button class="mc-btn primary" id="ef-save"><i data-lucide="save"></i> Salvar</button>`);
    document.getElementById("ef-cancel").addEventListener("click",MKT.closeModal);
    const del=document.getElementById("ef-del"); if(del) del.addEventListener("click",()=>{ S.remove("mkt_eventos",ed.id); MKT.toast("Removido"); MKT.closeModal(); MKT.refresh(); });
    document.getElementById("ef-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("ef-nome"); if(!nome){ MKT.toast("Informe o nome"); return; }
      const data={ nome, tipo:v("ef-tipo"), local:v("ef-local"), inicio:v("ef-ini"), fim:v("ef-fim"), status:v("ef-status"), custo:+v("ef-custo")||0, leads:+v("ef-leads")||0, responsavel:v("ef-resp") };
      if(ed.id) S.update("mkt_eventos",ed.id,data); else S.add("mkt_eventos",Object.assign({id:"ev"+Date.now()},data));
      MKT.toast("Evento salvo"); MKT.closeModal(); MKT.refresh();
    });
  }

  /* =================== AJUDA =================== */
  M.ajuda = {
    label:"Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("marketing") : '<div class="mc-card">Documentação indisponível.</div>'; },
    mount(c){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(c,"marketing"); }
  };
})();
