/* ===========================================================
   SBS — Módulos de gestão:
   - acompanhamento: Gerente Nacional vê visitas + vendas consolidadas
   - projecao: todos criam projeção de trabalho; nacional vê todas
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;
const fmtK = n => { n=Number(n)||0; return n>=1e6?("R$ "+(n/1e6).toFixed(1)+" mi"):n>=1e3?("R$ "+(n/1e3).toFixed(0)+" mil"):("R$ "+n); };

function isGestor(u){ return ["regional","nacional","admin"].includes(u.papel); }

/* ============ PENDÊNCIAS (Nacional / Regional) ============ */
S.pendencias = {
  title: "Pendências da Equipe",
  render(){
    const u = D.user, ORG = window.SBS_ORG;
    if(!isGestor(u)) return `<div class="card" style="text-align:center;color:var(--muted)">Acesso exclusivo de gestores.</div>`;
    const aprov = (window.SBSStore?window.SBSStore.getCol("aprovacoes"):[]).filter(a=>a.status==="pendente");
    const rotas = (window.SBSStore?window.SBSStore.getCol("rotas"):[]);
    const perdas = (window.SBSStore?window.SBSStore.getCol("perdas"):[]);
    // escopo de e-mails
    const esc = (ORG?ORG.escopo(u.email):[u.email]).map(e=>e.toLowerCase());
    const inScope = em => u.papel==="nacional"||u.papel==="admin"||u.papel==="ceo" || esc.includes((em||"").toLowerCase());
    // pendências por pessoa
    const pessoas = u.papel==="regional" ? ORG.supervisoresDe(u.email)
      : ORG.PEOPLE.filter(p=>["supervisor","regional"].includes(p.papel));
    function pend(p){
      const ap = aprov.filter(a=>(a.email||"").toLowerCase()===p.email.toLowerCase()).length;
      const rotasAbertas = rotas.filter(r=>(r.email||"").toLowerCase()===p.email.toLowerCase() && (r.paradas||[]).some(s=>!s.done)).length;
      const perdasRec = perdas.filter(x=>(x.email||"").toLowerCase()===p.email.toLowerCase()).length;
      return { ap, rotasAbertas, perdasRec, total: ap+rotasAbertas };
    }
    const linhas = pessoas.map(p=>({p, ...pend(p)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);
    const totAprov = aprov.filter(a=>inScope(a.email)).length;
    return `
    <div class="hero" style="background:linear-gradient(150deg,oklch(0.5 0.14 50),oklch(0.64 0.15 60))">
      <div class="uname" style="font-size:18px">Pendências da Equipe</div>
      <div class="urole" style="opacity:.92">O que está parado e precisa de ação</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${totAprov}</div><div class="hs-l">aprovações pendentes</div></div>
        <div class="hero-stat"><div class="hs-v">${linhas.length}</div><div class="hs-l">pessoas com pend.</div></div>
      </div>
    </div>

    <div class="section-title">Por pessoa</div>
    ${linhas.length? linhas.map(x=>`
      <div class="card pend-row" style="margin-bottom:10px">
        <div class="row-between">
          <div><div style="font-weight:800;font-size:14.5px">${x.p.nome}</div>
            <div class="muted" style="font-size:11.5px">${x.p.papel==="regional"?"Gerente Regional":"Supervisor"}</div></div>
          <button class="team-bell" data-pnotify="${x.p.email}" title="Cobrar"><i data-lucide="send"></i></button>
        </div>
        <div class="pend-tags">
          ${x.ap?`<span class="pend-t pt-a"><i data-lucide="badge-percent"></i>${x.ap} aprovação(ões)</span>`:""}
          ${x.rotasAbertas?`<span class="pend-t pt-r"><i data-lucide="map"></i>${x.rotasAbertas} rota(s) aberta(s)</span>`:""}
        </div>
      </div>`).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma pendência. Equipe em dia! 🎉</div>`}
    <div id="pend-notify"></div>`;
  },
  mount(root){
    root.querySelectorAll("[data-pnotify]").forEach(b=>b.addEventListener("click",()=>{
      const email=b.dataset.pnotify;
      const nome=(window.SBS_ORG.get(email)||{}).nome||email;
      const box=root.querySelector("#pend-notify");
      box.innerHTML=`<div class="card" style="margin-top:14px">
        <div style="font-weight:800;font-size:14.5px;margin-bottom:4px">Cobrar ${nome}</div>
        <div class="muted" style="font-size:12px;margin-bottom:12px">Chega no app com som e pede confirmação de leitura.</div>
        <div class="field"><label>Mensagem</label><textarea id="pn-msg" placeholder="Ex.: Resolver as aprovações pendentes hoje."></textarea></div>
        <button class="btn" id="pn-send"><i data-lucide="send"></i> Enviar cobrança</button>
      </div>`;
      window.lucide&&lucide.createIcons();
      root.querySelector("#pn-send").addEventListener("click",()=>{
        const msg=root.querySelector("#pn-msg").value.trim(); if(!msg){ window.SBS.toast("Escreva a mensagem"); return; }
        if(window.SBSStore){ window.SBSStore.add("notificacoes",{ title:(D.user.role||"Gestão")+": "+D.user.name, text:msg, tipo:"aviso", icon:"alert-triangle", destino:email, data:window.SBSStore.today(), de:D.user.email }); }
        window.SBS.toast("Cobrança enviada para "+nome.split(" ")[0]); box.innerHTML="";
      });
    }));
  }
};

/* ============ ACOMPANHAMENTO (Nacional / Regional) ============ */
S.acompanhamento = {
  title: "Acompanhamento",
  render(){
    const u = D.user, ORG = window.SBS_ORG;
    if(!isGestor(u)) return `<div class="card" style="text-align:center;color:var(--muted)">Acesso exclusivo de gestores.</div>`;
    const visitas = window.SBSStore ? window.SBSStore.getCol("visitas") : [];
    const plano = window.SBSStore ? window.SBSStore.getCol("plano_acao") : [];

    // escopo de pessoas
    const escEmails = (ORG ? ORG.escopo(u.email) : [u.email]).map(e=>e.toLowerCase());
    const inScope = v => !v.email || escEmails.includes((v.email||"").toLowerCase()) || u.papel==="nacional" || u.papel==="admin";
    const vis = visitas.filter(inScope);
    const auth = vis.filter(v=>v.autenticada).length;
    const atendidos = plano.filter(p=>p.status==="ok").length;
    const emAcao = plano.filter(p=>p.status==="andamento").length;

    // agrupa visitas por regional (nacional) ou por supervisor (regional)
    let grupos = [];
    if(u.papel==="nacional"||u.papel==="admin"){
      ORG.regionais().forEach(r=>{
        const time = ORG.supervisoresDe(r.email).map(s=>s.email.toLowerCase());
        const n = vis.filter(v=>time.includes((v.email||"").toLowerCase())).length;
        grupos.push({ nome:r.nome, sub:ORG.supervisoresDe(r.email).length+" supervisores", n });
      });
    } else {
      ORG.supervisoresDe(u.email).forEach(s=>{
        const n = vis.filter(v=>(v.email||"").toLowerCase()===s.email.toLowerCase()).length;
        grupos.push({ nome:s.nome, sub:"supervisor", n });
      });
    }
    const maxN = Math.max(1,...grupos.map(g=>g.n));
    const recentes = vis.slice(0,8);
    const stLbl = {ok:["b-good","Concluída"], andamento:["b-info","Andamento"], proposta:["b-warn","Proposta"]};

    return `
    <div class="hero" style="background:linear-gradient(150deg,#0B6B61,#10B0A0)">
      <div class="uname" style="font-size:18px">${u.papel==="nacional"?"Acompanhamento Nacional":"Acompanhamento da Regional"}</div>
      <div class="urole" style="opacity:.92">Visitas, prospecção e vendas da equipe</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${vis.length}</div><div class="hs-l">visitas</div></div>
        <div class="hero-stat"><div class="hs-v">${auth}</div><div class="hs-l">autenticadas</div></div>
        <div class="hero-stat"><div class="hs-v">${atendidos}</div><div class="hs-l">clientes atendidos</div></div>
      </div>
    </div>

    <div class="section-title">Visitas por ${u.papel==="nacional"?"regional":"supervisor"}</div>
    <div class="card funnel">
      ${grupos.map(g=>`
        <div class="fn">
          <div class="fn-bar" style="width:${20+Math.round(g.n/maxN*70)}%">${g.n}</div>
          <div class="fn-meta">${g.nome} · ${g.sub}</div>
        </div>`).join("") || '<div class="muted" style="text-align:center;padding:10px">Sem dados ainda.</div>'}
    </div>

    <div class="section-title">Prospecção (Plano de Ação)</div>
    <div class="kpi-grid">
      <div class="kpi"><div class="top"><span class="kic"><i data-lucide="check-circle-2"></i></span></div><div><div class="kv">${atendidos}</div><div class="kl">Atendidos</div></div></div>
      <div class="kpi"><div class="top"><span class="kic"><i data-lucide="clock"></i></span></div><div><div class="kv">${emAcao}</div><div class="kl">Em ação</div></div></div>
    </div>

    <div class="section-title">Visitas recentes da equipe</div>
    ${recentes.length? recentes.map(v=>`
      <div class="visit">
        <div class="vz-date"><span>${(v.data||"--").slice(0,2)}</span><small>${(v.data||"").slice(3,5)?"/"+(v.data||"").slice(3,5):""}</small></div>
        <div class="vz-info">
          <div class="row-between" style="gap:8px"><div class="vz-name">${v.cliente}</div><span class="badge ${(stLbl[v.status]||stLbl.ok)[0]}">${(stLbl[v.status]||stLbl.ok)[1]}</span></div>
          ${v.vendedor?`<div class="vz-by"><i data-lucide="user-round"></i>${v.vendedor}</div>`:""}
          <div class="vz-muni"><i data-lucide="map-pin"></i>${v.municipio||"—"}</div>
          ${v.autenticada?`<div class="vz-auth"><i data-lucide="shield-check"></i>Autenticada por GPS</div>`:""}
        </div>
      </div>`).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma visita registrada ainda.</div>`}
    `;
  }
};

/* ============ PROJEÇÃO DE TRABALHO ============ */
S.projecao = {
  title: "Projeção de Trabalho",
  render(){
    const u = D.user, ORG = window.SBS_ORG;
    const all = window.SBSStore ? window.SBSStore.getCol("projecoes") : [];
    const nac = u.papel==="nacional"||u.papel==="admin";
    const reg = u.papel==="regional";
    // escopo
    let lista = all;
    if(reg){ const esc=ORG.escopo(u.email).map(e=>e.toLowerCase()); lista=all.filter(p=>esc.includes((p.email||"").toLowerCase())); }
    else if(!nac){ lista=all.filter(p=>(p.email||"").toLowerCase()===(u.email||"").toLowerCase()); }

    const totVisitas = lista.reduce((s,p)=>s+(+p.visitas||0),0);
    const totMeta = lista.reduce((s,p)=>s+(+p.meta||0),0);

    const card = p=>{
      const nome = (ORG.get(p.email)||{}).nome || p.autor || p.email;
      return `<div class="proj-card">
        <div class="proj-top"><div><div class="proj-sem">${p.periodo||"Semana"}</div><div class="proj-by">${nome}</div></div>
          ${(nac||reg)?`<span class="badge b-muted">${(ORG.get(p.email)||{}).papel||""}</span>`:`<button class="btn-ic proj-del" data-id="${p.id}"><i data-lucide="trash-2"></i></button>`}</div>
        <div class="proj-grid">
          <div class="proj-kv"><b>${p.visitas||0}</b><span>visitas planej.</span></div>
          <div class="proj-kv"><b>${fmtK(p.meta||0)}</b><span>meta venda</span></div>
          <div class="proj-kv"><b>${p.prospec||0}</b><span>prospecções</span></div>
        </div>
        ${p.foco?`<div class="proj-foco"><i data-lucide="target"></i>${p.foco}</div>`:""}
      </div>`;
    };

    return `
    <div class="hero" style="background:linear-gradient(150deg,var(--green-800),var(--green-600))">
      <div class="uname" style="font-size:18px">${nac?"Projeções da Equipe Comercial":"Projeção de Trabalho"}</div>
      <div class="urole" style="opacity:.9">${nac?"Visão consolidada — toda a força de vendas":"Planeje sua semana e acompanhe sua meta"}</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${lista.length}</div><div class="hs-l">projeções</div></div>
        <div class="hero-stat"><div class="hs-v">${totVisitas}</div><div class="hs-l">visitas planej.</div></div>
        <div class="hero-stat"><div class="hs-v">${fmtK(totMeta)}</div><div class="hs-l">meta total</div></div>
      </div>
    </div>

    ${!nac?`<button class="btn" id="pj-new" style="margin-top:14px"><i data-lucide="plus"></i> Nova projeção</button>
    <form id="pj-form" class="card" style="margin-top:14px;display:none">
      <div style="font-weight:800;font-size:14.5px;margin-bottom:12px">Nova projeção semanal</div>
      <div class="field"><label>Período</label><input id="pj-per" placeholder="Ex.: 23–27 jun"></div>
      <div class="field-2">
        <div class="field"><label>Visitas planejadas</label><input id="pj-vis" inputmode="numeric" placeholder="Ex.: 15"></div>
        <div class="field"><label>Prospecções</label><input id="pj-pros" inputmode="numeric" placeholder="Ex.: 5"></div>
      </div>
      <div class="field"><label>Meta de venda (R$)</label><input id="pj-meta" inputmode="numeric" placeholder="Ex.: 300000"></div>
      <div class="field"><label>Foco da semana</label><input id="pj-foco" placeholder="Ex.: fechar Fazenda Boa Vista e prospectar revenda X"></div>
      <button class="btn" type="submit"><i data-lucide="check"></i> Salvar projeção</button>
    </form>`:""}

    <div class="section-title">${nac?"Todas as projeções":"Minhas projeções"}</div>
    <div id="pj-list">${lista.length? lista.map(card).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma projeção ${nac?"cadastrada":"sua ainda"}.</div>`}</div>`;
  },
  mount(root){
    const u = D.user;
    const form = root.querySelector("#pj-form");
    const nb = root.querySelector("#pj-new");
    if(nb) nb.addEventListener("click",()=>{ form.style.display = form.style.display==="none"?"block":"none"; });
    if(form) form.addEventListener("submit",e=>{
      e.preventDefault();
      const g=id=>{ const el=root.querySelector(id); return el?el.value.trim():""; };
      if(window.SBSStore){ window.SBSStore.add("projecoes",{
        email:u.email, autor:u.name, papel:u.papel,
        periodo:g("#pj-per")||"Semana", visitas:+g("#pj-vis")||0, prospec:+g("#pj-pros")||0,
        meta:parseInt((g("#pj-meta")||"0").replace(/\D/g,""),10)||0, foco:g("#pj-foco"),
        data: window.SBSStore.today() }); }
      window.SBS.toast("Projeção salva");
      window.Gam&&window.Gam.award("projecao");
      window.SBS.go("projecao");
    });
    root.querySelectorAll(".proj-del").forEach(b=>b.addEventListener("click",()=>{
      if(confirm("Excluir esta projeção?")){ window.SBSStore.remove("projecoes",b.dataset.id); window.SBS.go("projecao"); }
    }));
  }
};

})();
