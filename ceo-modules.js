/* ===========================================================
   SBS Painel do CEO — módulos (somente leitura)
   Panorama · Comercial · Equipe em Campo · Atendimento ·
   Adoção do App · Estado do Sistema
   =========================================================== */
(function(){
  if(typeof CEO === "undefined" || !CEO.Modules) return;
  const M = CEO.Modules, S = CEO.S, esc = CEO.esc, money = CEO.money, mi = CEO.mi;

  function col(n){ return S.getCol(n)||[]; }
  function meta(){ return S.get("sistema_meta")||{versao:"2.0.0",atualizadoEm:"—"}; }

  function pedAgg(){
    const ped = col("pedidos");
    let faturado=0, carteira=0, comissao=0;
    const byV = {};
    ped.forEach(p=>{
      const v = Number(p.valor)||0, c = Number(p.comissao)||0;
      if((p.status||"")==="faturado") faturado+=v; else carteira+=v;
      comissao+=c;
      const k = p.vendedor||"—";
      if(!byV[k]) byV[k]={nome:k, valor:0, comissao:0, n:0};
      byV[k].valor+=v; byV[k].comissao+=c; byV[k].n++;
    });
    const ranking = Object.values(byV).sort((a,b)=>b.valor-a.valor);
    return { ped, faturado, carteira, comissao, total:faturado+carteira, ranking };
  }
  function liveCount(){
    if(!window.SBS_MAPA) return {online:0,total:0};
    const r = SBS_MAPA.readRoster();
    let on=0; r.forEach(x=>{ if(SBS_MAPA.statusOf(x)==="online") on++; });
    return { online:on, total:r.length };
  }
  function kpi(ic,v,l,tone){ return `<div class="ceo-kpi ${tone||''}"><span class="ceo-kpi-ic"><i data-lucide="${ic}"></i></span><div class="ceo-kpi-v">${v}</div><div class="ceo-kpi-l">${l}</div></div>`; }

  /* =================== PANORAMA =================== */
  M.panorama = {
    label:"Panorama Geral",
    render(){
      const a = pedAgg();
      const vend = col("vendedores"); const ativos = vend.filter(v=>v.ativo!==false).length;
      const recl = col("reclamacoes"); const reclAb = recl.filter(r=>r.status!=="resolvido").length;
      const cham = col("chamados"); const chamAb = cham.filter(c=>c.status!=="resolvido").length;
      const live = liveCount(); const m = meta();
      const top = a.ranking.slice(0,5);
      const maxV = top.length?top[0].valor:1;
      return `
      <div class="ceo-kpis">
        ${kpi("badge-dollar-sign", mi(a.faturado), "Faturado", "good")}
        ${kpi("wallet", mi(a.carteira), "Em carteira", "")}
        ${kpi("clipboard-list", a.ped.length.toLocaleString("pt-BR"), "Pedidos", "")}
        ${kpi("percent", mi(a.comissao), "Comissões previstas", "")}
        ${kpi("users", ativos, "Vendedores ativos", "")}
        ${kpi("message-square-warning", reclAb, "Reclamações abertas", reclAb?"warn":"")}
      </div>

      <div class="ceo-cols">
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="trophy"></i> Top vendedores · por volume</div>
          ${top.length? top.map((r,i)=>`
            <div class="ceo-rank">
              <span class="ceo-rank-pos">${i+1}</span>
              <div class="ceo-rank-main">
                <div class="ceo-rank-top"><span>${esc(r.nome)}</span><b>${mi(r.valor)}</b></div>
                <div class="ceo-bar"><span style="width:${Math.max(4,Math.round(r.valor/maxV*100))}%"></span></div>
              </div>
            </div>`).join("") : `<div class="ceo-empty">Sem pedidos ainda.</div>`}
        </div>
        <div class="ceo-side">
          <div class="ceo-mini">
            <div class="ceo-mini-h"><i data-lucide="radio"></i> Equipe ao vivo</div>
            <div class="ceo-mini-v">${live.online}<small>/ ${live.total} cadastrados</small></div>
            <a class="ceo-mini-link" data-nav-to="equipe">Ver no mapa →</a>
          </div>
          <div class="ceo-mini">
            <div class="ceo-mini-h"><i data-lucide="headset"></i> Atendimento</div>
            <div class="ceo-mini-row"><span>Reclamações abertas</span><b class="${reclAb?'hot':''}">${reclAb}</b></div>
            <div class="ceo-mini-row"><span>Chamados pendentes</span><b class="${chamAb?'hot':''}">${chamAb}</b></div>
          </div>
          <div class="ceo-mini">
            <div class="ceo-mini-h"><i data-lucide="server"></i> Sistema</div>
            <div class="ceo-mini-v small">v${esc(m.versao)}</div>
            <div class="ceo-mini-foot">atualizado em ${esc(m.atualizadoEm)}</div>
          </div>
        </div>
      </div>

      <div class="ceo-note"><i data-lucide="eye"></i> Visão somente leitura. Os dados são os mesmos das demais plataformas, em tempo real. Funcionalidades e versões são geridas pelo Painel de T.I.</div>`;
    },
    mount(c){ wireNav(c); }
  };

  /* =================== COMERCIAL =================== */
  M.comercial = {
    label:"Comercial",
    render(){
      const a = pedAgg();
      const maxV = a.ranking.length?a.ranking[0].valor:1;
      const perdas = col("perdas");
      const recentes = a.ped.slice(0,12);
      const stBadge = s => ({faturado:'<span class="badge b-good">Faturado</span>',producao:'<span class="badge b-info">Produção</span>',transito:'<span class="badge b-info">Trânsito</span>',cotacao:'<span class="badge b-muted">Cotação</span>'}[s]||`<span class="badge b-muted">${esc(s||'—')}</span>`);
      return `
      <div class="ceo-kpis four">
        ${kpi("badge-dollar-sign", mi(a.faturado), "Faturado", "good")}
        ${kpi("wallet", mi(a.carteira), "Em carteira", "")}
        ${kpi("layers", mi(a.total), "Total geral", "")}
        ${kpi("percent", mi(a.comissao), "Comissões previstas", "")}
      </div>
      <div class="ceo-card" style="margin-bottom:18px">
        <div class="ceo-card-h"><i data-lucide="bar-chart-3"></i> Ranking de vendedores</div>
        ${a.ranking.length? a.ranking.map((r,i)=>`
          <div class="ceo-rank">
            <span class="ceo-rank-pos">${i+1}</span>
            <div class="ceo-rank-main">
              <div class="ceo-rank-top"><span>${esc(r.nome)} <em class="ceo-dim">· ${r.n} ped.</em></span><b>${mi(r.valor)}</b></div>
              <div class="ceo-bar"><span style="width:${Math.max(4,Math.round(r.valor/maxV*100))}%"></span></div>
            </div>
          </div>`).join("") : `<div class="ceo-empty">Sem pedidos.</div>`}
      </div>
      <div class="ceo-card">
        <div class="ceo-card-h"><i data-lucide="clipboard-list"></i> Pedidos recentes</div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Pedido</th><th>Cliente</th><th>Vendedor</th><th class="right">Valor</th><th>Status</th></tr></thead><tbody>
          ${recentes.map(p=>`<tr>
            <td class="strong">#${esc(p.num||'—')}</td>
            <td>${esc(p.cliente||'—')}</td>
            <td class="sub">${esc(p.vendedor||'—')}</td>
            <td class="right strong">${mi(p.valor)}</td>
            <td>${stBadge(p.status)}</td>
          </tr>`).join("")}
        </tbody></table></div>
        ${perdas.length?`<div class="ceo-dim" style="margin-top:12px;font-size:12.5px"><i data-lucide="trending-down" style="width:14px;height:14px;vertical-align:-2px"></i> ${perdas.length} perda(s) de pedido registrada(s) pela equipe.</div>`:""}
      </div>`;
    }
  };

  /* =================== EQUIPE EM CAMPO (mapa) =================== */
  M.equipe = {
    label:"Equipe em Campo",
    render(){ return window.SBS_MAPA ? window.SBS_MAPA.html() : '<div class="ceo-card">Mapa indisponível.</div>'; },
    mount(c){
      if(!window.SBS_MAPA) return;
      window.SBS_MAPA.mount(c, { toast:CEO.toast, isActive:function(){ return CEO.current==="equipe"; }, readOnly:true });
    }
  };

  /* =================== ATENDIMENTO =================== */
  M.atendimento = {
    label:"Atendimento",
    render(){
      const recl = col("reclamacoes"), cham = col("chamados");
      const rc = { aberto:0, analise:0, resolvido:0 };
      recl.forEach(r=>{ rc[r.status==="resolvido"?"resolvido":(r.status==="aberto"?"aberto":"analise")]++; });
      const cc = { aberto:0, analise:0, resolvido:0 };
      cham.forEach(c=>{ cc[c.status==="resolvido"?"resolvido":(c.status==="aberto"?"aberto":"analise")]++; });
      const recRecl = recl.slice(0,8), recCham = cham.slice(0,8);
      const pill = (n,l,t)=>`<div class="ceo-pill ${t}"><b>${n}</b><span>${l}</span></div>`;
      return `
      <div class="ceo-cols2">
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="message-square-warning"></i> Reclamações</div>
          <div class="ceo-pills">${pill(rc.aberto,"Abertas","hot")}${pill(rc.analise,"Em análise","warn")}${pill(rc.resolvido,"Resolvidas","ok")}</div>
          <div class="ceo-list">
            ${recRecl.length?recRecl.map(r=>`<div class="ceo-li"><div><div class="ceo-li-t">${esc(r.protocolo||r.cliente||'—')}</div><div class="ceo-li-s">${esc(r.cliente||'')} · ${esc(r.vendedor||'')}</div></div><span class="badge ${r.status==='resolvido'?'b-good':(r.status==='aberto'?'b-warn':'b-info')}">${esc(r.status||'—')}</span></div>`).join(""):`<div class="ceo-empty">Nenhuma reclamação.</div>`}
          </div>
        </div>
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="life-buoy"></i> Chamados internos</div>
          <div class="ceo-pills">${pill(cc.aberto,"Abertos","hot")}${pill(cc.analise,"Em análise","warn")}${pill(cc.resolvido,"Resolvidos","ok")}</div>
          <div class="ceo-list">
            ${recCham.length?recCham.map(c=>`<div class="ceo-li"><div><div class="ceo-li-t">${esc(c.protocolo||c.assunto||'—')}</div><div class="ceo-li-s">${esc(c.area||'')} · ${esc(c.solicitante||'')}</div></div><span class="badge ${c.status==='resolvido'?'b-good':(c.status==='aberto'?'b-warn':'b-info')}">${esc(c.status||'—')}</span></div>`).join(""):`<div class="ceo-empty">Nenhum chamado.</div>`}
          </div>
        </div>
      </div>`;
    }
  };

  /* =================== ADOÇÃO DO APP =================== */
  M.adocao = {
    label:"Adoção do App",
    render(){
      const uso = col("uso").slice().sort((a,b)=>(b.total||0)-(a.total||0));
      const vend = col("vendedores").filter(v=>v.ativo!==false);
      const ativos = uso.length;
      const totalAcoes = uso.reduce((s,u)=>s+(u.total||0),0);
      const maxT = uso.length?(uso[0].total||1):1;
      const cobertura = vend.length?Math.round(ativos/vend.length*100):0;
      return `
      <div class="ceo-kpis four">
        ${kpi("smartphone", ativos, "Usuários ativos no app", "")}
        ${kpi("mouse-pointer-click", totalAcoes.toLocaleString("pt-BR"), "Ações registradas", "")}
        ${kpi("user-check", cobertura+"%", "Cobertura da equipe", cobertura<50?"warn":"good")}
        ${kpi("users", vend.length, "Vendedores cadastrados", "")}
      </div>
      <div class="ceo-card">
        <div class="ceo-card-h"><i data-lucide="activity"></i> Uso por pessoa</div>
        ${uso.length? uso.map(u=>`
          <div class="ceo-rank">
            <span class="ceo-rank-av">${esc((u.nome||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span>
            <div class="ceo-rank-main">
              <div class="ceo-rank-top"><span>${esc(u.nome||u.email||'—')}</span><b>${(u.total||0).toLocaleString("pt-BR")} <em class="ceo-dim">ações</em></b></div>
              <div class="ceo-bar"><span style="width:${Math.max(4,Math.round((u.total||0)/maxT*100))}%"></span></div>
              <div class="ceo-li-s">último acesso: ${esc(u.ultimo||'—')}</div>
            </div>
          </div>`).join("") : `<div class="ceo-empty">Ainda sem registros de uso. Os dados aparecem conforme a equipe usa o app.</div>`}
      </div>`;
    }
  };

  /* =================== MARKETING & P&D =================== */
  function seedAreas(){
    // garante dados para leitura do CEO mesmo se os painéis ainda não rodaram
    const MD=window.MARKETING_DATA, PDD=window.PD_DATA, RHD=window.RH_DATA;
    if(MD){
      if(!col("mkt_campanhas").length) S.setCol("mkt_campanhas", MD.campanhas.map(c=>Object.assign({},c)));
      if(!col("mkt_eventos").length) S.setCol("mkt_eventos", MD.eventos.map(c=>Object.assign({},c)));
      if(!col("mkt_social").length) S.setCol("mkt_social", MD.social.map(c=>Object.assign({},c)));
    }
    if(PDD){
      if(!col("pd_projetos").length) S.setCol("pd_projetos", PDD.projetos.map(c=>Object.assign({},c)));
      if(!col("pd_ensaios").length) S.setCol("pd_ensaios", PDD.ensaios.map(c=>Object.assign({},c)));
      if(!col("pd_cultivares").length) S.setCol("pd_cultivares", PDD.cultivares.map(c=>Object.assign({},c)));
      if(!col("pd_ideias").length) S.setCol("pd_ideias", PDD.ideias.map(c=>Object.assign({},c)));
    }
    if(RHD){
      if(!col("rh_vagas").length) S.setCol("rh_vagas", RHD.vagas.map(c=>Object.assign({},c)));
      if(!col("rh_candidatos").length) S.setCol("rh_candidatos", RHD.candidatos.map(c=>Object.assign({},c)));
      if(!col("rh_colaboradores").length) S.setCol("rh_colaboradores", RHD.colaboradores.map(c=>Object.assign({},c)));
    }
  }
  M.areas = {
    label:"Áreas (Mkt · P&D · RH)",
    render(){
      seedAreas();
      const camp=col("mkt_campanhas").filter(c=>c.id);
      const ativas=camp.filter(c=>c.status==="ativa");
      const verba=ativas.reduce((s,c)=>s+(+c.verba||0),0);
      const social=col("mkt_social");
      const seg=social.reduce((s,c)=>s+(+c.seguidores||0),0);
      const eventos=col("mkt_eventos");
      const leads=eventos.reduce((s,e)=>s+(+e.leads||0),0);
      const proj=col("pd_projetos");
      const ensaios=col("pd_ensaios");
      const cult=col("pd_cultivares");
      const ideias=col("pd_ideias");
      const FASE={ideacao:"Ideação",pesquisa:"Pesquisa",ensaio:"Ensaio",validacao:"Validação",registro:"Registro",lancamento:"Lançamento"};
      const fasesK=Object.keys(FASE);
      const maxF=Math.max(1,...fasesK.map(f=>proj.filter(p=>p.fase===f).length));
      return `
      <div class="ceo-version" style="background:#0B6B61"><div><div class="ceo-version-v">Marketing</div><div class="ceo-version-l">campanhas, conteúdo, redes e eventos</div></div>
        <div class="ceo-version-side"><div><b>${ativas.length}</b> ativas</div><div><b>${mi(verba)}</b> verba</div><div><b>${seg.toLocaleString("pt-BR")}</b> seguidores</div><div><b>${leads.toLocaleString("pt-BR")}</b> leads</div></div></div>
      <div class="ceo-cols2">
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="megaphone"></i> Campanhas ativas</div>
          ${ativas.length?ativas.map(c=>`<div class="ceo-li"><div><div class="ceo-li-t">${esc(c.nome)}</div><div class="ceo-li-s">${esc(c.canal||"")} · ${esc(c.responsavel||"")}</div></div><b>${mi(c.verba)}</b></div>`).join(""):`<div class="ceo-empty">Nenhuma campanha ativa.</div>`}
        </div>
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="share-2"></i> Redes sociais</div>
          ${social.length?social.map(s=>`<div class="ceo-li"><span><i data-lucide="${esc(s.icon||'share-2')}" class="ax-ic" style="width:14px;height:14px;vertical-align:-2px"></i> ${esc(s.canal)}</span><b>${(+s.seguidores||0).toLocaleString("pt-BR")}</b></div>`).join(""):`<div class="ceo-empty">Sem dados.</div>`}
        </div>
      </div>

      <div class="ceo-version" style="background:#13241F;margin-top:20px"><div><div class="ceo-version-v">P&D / Inovação</div><div class="ceo-version-l">pesquisa, ensaios e novas cultivares</div></div>
        <div class="ceo-version-side"><div><b>${proj.filter(p=>p.fase!=="lancamento").length}</b> projetos</div><div><b>${ensaios.filter(e=>e.status==="andamento").length}</b> ensaios</div><div><b>${cult.length}</b> cultivares</div><div><b>${ideias.filter(i=>i.status!=="arquivada").length}</b> ideias</div></div></div>
      <div class="ceo-cols2">
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="git-branch"></i> Projetos por fase</div>
          ${fasesK.map(f=>{const n=proj.filter(p=>p.fase===f).length;return `<div class="ceo-brow"><div class="ceo-brow-top"><span>${FASE[f]}</span><b>${n}</b></div><div class="ceo-bar"><span style="width:${Math.max(4,Math.round(n/maxF*100))}%"></span></div></div>`;}).join("")}
        </div>
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="sprout"></i> Cultivares em desenvolvimento</div>
          ${cult.length?cult.map(c=>`<div class="ceo-li"><div><div class="ceo-li-t">${esc(c.nome)}</div><div class="ceo-li-s">${esc(c.cultura||"")} · ${esc(c.destaque||"")}</div></div><span class="badge b-info">${esc(c.estagio||"")}</span></div>`).join(""):`<div class="ceo-empty">Sem dados.</div>`}
        </div>
      </div>
      <div class="ceo-version" style="background:#174D2F;margin-top:20px"><div><div class="ceo-version-v">RH</div><div class="ceo-version-l">recrutamento, pessoas e endomarketing</div></div>
        <div class="ceo-version-side"><div><b>${col("rh_vagas").filter(v=>v.status!=="fechada").length}</b> vagas abertas</div><div><b>${col("rh_candidatos").filter(c=>c.etapa!=="contratado").length}</b> em processo</div><div><b>${col("rh_colaboradores").filter(c=>c.status==="ativo").length}</b> colaboradores</div></div></div>
      <div class="ceo-cols2">
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="briefcase"></i> Vagas em aberto</div>
          ${col("rh_vagas").filter(v=>v.status!=="fechada").length?col("rh_vagas").filter(v=>v.status!=="fechada").map(v=>`<div class="ceo-li"><div><div class="ceo-li-t">${esc(v.titulo)}</div><div class="ceo-li-s">${esc(v.area||"")} · ${esc(v.local||"")}</div></div><b>${col("rh_candidatos").filter(c=>c.vaga===v.id&&c.etapa!=="contratado").length} cand.</b></div>`).join(""):`<div class="ceo-empty">Nenhuma vaga aberta.</div>`}
        </div>
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="users"></i> Time por área</div>
          ${(function(){var by={};col("rh_colaboradores").filter(c=>c.status==="ativo").forEach(c=>{by[c.area=c.area||"Outros"]=(by[c.area]||0)+1;});var ks=Object.keys(by);var mx=Math.max(1,...ks.map(k=>by[k]));return ks.length?ks.map(k=>`<div class="ceo-brow"><div class="ceo-brow-top"><span>${esc(k)}</span><b>${by[k]}</b></div><div class="ceo-bar"><span style="width:${Math.max(6,Math.round(by[k]/mx*100))}%"></span></div></div>`).join(""):`<div class="ceo-empty">Sem dados.</div>`;})()}
        </div>
      </div>
      <div class="ceo-note"><i data-lucide="eye"></i> Leitura consolidada de Marketing, P&D e RH. A gestão é feita nos respectivos painéis.</div>`;
    }
  };

  /* =================== ESTADO DO SISTEMA =================== */
  M.sistema = {
    label:"Estado do Sistema",
    render(){
      const m = meta();
      const feats = col("features");
      const on = feats.filter(f=>f.enabled).length, off = feats.length-on;
      const gm = col("gmuds");
      const done = gm.filter(g=>g.status==="concluida").slice(0,6);
      const abertas = gm.filter(g=>g.status!=="concluida"&&g.status!=="cancelada").length;
      const grupos = {};
      feats.forEach(f=>{ (grupos[f.grupo=f.grupo||"Outros"]=grupos[f.grupo]||[]).push(f); });
      const TIPOS = { corretiva:"Corretiva", evolutiva:"Evolutiva", emergencial:"Emergencial" };
      return `
      <div class="ceo-version"><div><div class="ceo-version-v">v${esc(m.versao)}</div><div class="ceo-version-l">versão em produção · atualizada em ${esc(m.atualizadoEm)}</div></div>
        <div class="ceo-version-side"><div><b>${on}</b> liberadas</div><div><b>${off}</b> desligadas</div><div><b>${abertas}</b> GMuds em aberto</div></div></div>

      <div class="ceo-cols2">
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="toggle-right"></i> Funcionalidades</div>
          ${Object.keys(grupos).map(g=>`
            <div class="ceo-fgrp">${esc(g)}</div>
            ${grupos[g].map(f=>`<div class="ceo-feat"><span>${esc(f.label)}</span><span class="ceo-flag ${f.enabled?'on':'off'}">${f.enabled?'Liberada':'Desligada'}</span></div>`).join("")}
          `).join("")}
        </div>
        <div class="ceo-card">
          <div class="ceo-card-h"><i data-lucide="history"></i> Últimas entregas (GMud)</div>
          ${done.length? done.map(g=>`<div class="ceo-gm"><div class="ceo-gm-top">${g.versao?`<span class="ceo-gm-v">v${esc(g.versao)}</span>`:""}<span class="badge b-muted">${TIPOS[g.tipo]||esc(g.tipo||'')}</span></div><div class="ceo-gm-t">${esc(g.titulo)}</div><div class="ceo-li-s">${esc(g.janela||g.criadoEm||'')}</div></div>`).join("") : `<div class="ceo-empty">Nenhuma entrega concluída ainda.</div>`}
        </div>
      </div>
      <div class="ceo-note"><i data-lucide="shield"></i> Funcionalidades e versões são controladas pelo <b>Painel de T.I.</b> Esta tela é apenas de leitura.</div>`;
    }
  };

  /* ---- helper: links data-nav-to ---- */
  function wireNav(c){
    c.querySelectorAll("[data-nav-to]").forEach(b=>b.addEventListener("click", ()=>CEO.go(b.dataset.navTo)));
  }
})();
