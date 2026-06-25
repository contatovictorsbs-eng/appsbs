/* ===========================================================
   SBS — Gamificação: pontos, níveis, conquistas e ranking
   Pontos por uso real das funcionalidades. Estado por usuário
   em localStorage; ranking combina o usuário + a equipe.
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;

let ACTIONS = {
  login:      { p:5,  label:"Acesso diário" },
  visita:     { p:20, label:"Visita registrada" },
  chamado:    { p:10, label:"Chamado aberto" },
  reclamacao: { p:10, label:"Reclamação registrada" },
  comissao:   { p:5,  label:"Simulação de comissão" },
  material:   { p:5,  label:"Material consultado" },
  share:      { p:8,  label:"Conteúdo compartilhado" },
  precos:     { p:3,  label:"Tabela de preços consultada" },
  rota:       { p:12, label:"Rota planejada" },
  chegada:    { p:15, label:"Check-in em visita" },
  prospeccao: { p:10, label:"Cliente prospectado" },
  projecao:   { p:10, label:"Projeção de trabalho enviada" },
  contato:    { p:4,  label:"Contato de cliente atualizado" },
  frete:      { p:3,  label:"Frete calculado" },
  carga:      { p:3,  label:"Carga consultada" },
};

let LEVELS = [
  { n:"Bronze",   min:0,   cor:"#b07a3a" },
  { n:"Prata",    min:150, cor:"#8a97a0" },
  { n:"Ouro",     min:400, cor:"#caa11e" },
  { n:"Diamante", min:800, cor:"#10B0A0" },
];

let GAM_ON = true;

// aplica configuração do painel (store) sobre os padrões
function applyConfig(){
  const cfg = window.SBSStore && window.SBSStore.get("gam_config");
  if(!cfg) return;
  if(typeof cfg.ativa === "boolean") GAM_ON = cfg.ativa;
  if(cfg.actions){ Object.keys(cfg.actions).forEach(k=>{ if(ACTIONS[k]) ACTIONS[k].p = Number(cfg.actions[k])||0; }); }
  if(cfg.levels && cfg.levels.length){
    const cores = ["#b07a3a","#8a97a0","#caa11e","#10B0A0","#7c5cff"];
    LEVELS = cfg.levels.map((l,i)=>({ n:l.n, min:Number(l.min)||0, cor:l.cor||cores[i]||"#10B0A0" }));
  }
}

const BADGES = [
  { id:"bem_vindo",  nome:"Bem-vindo",      icon:"hand-heart",    desc:"Primeiro acesso ao portal",          cond:s=>s.points>0 },
  { id:"primeira_v", nome:"Primeira visita",icon:"map-pin",       desc:"Registrou a 1ª visita",              cond:s=>(s.counts.visita||0)>=1 },
  { id:"campo",      nome:"Homem de campo", icon:"tractor",       desc:"Registrou 10 visitas",               cond:s=>(s.counts.visita||0)>=10 },
  { id:"negociador", nome:"Negociador",     icon:"percent",       desc:"Fez 5 simulações de comissão",       cond:s=>(s.counts.comissao||0)>=5 },
  { id:"estudioso",  nome:"Estudioso",      icon:"book-open",     desc:"Consultou 5 materiais técnicos",     cond:s=>(s.counts.material||0)>=5 },
  { id:"comunicador",nome:"Comunicador",    icon:"share-2",       desc:"Compartilhou conteúdo 3 vezes",      cond:s=>(s.counts.share||0)>=3 },
  { id:"atento",     nome:"Sempre atento",  icon:"flame",         desc:"7 dias de acesso",                   cond:s=>(s.counts.login||0)>=7 },
  { id:"roteirista",nome:"Roteirista",     icon:"route",         desc:"Planejou 3 rotas",                   cond:s=>(s.counts.rota||0)>=3 },
  { id:"presente",  nome:"Presença em campo",icon:"map-pin-check", desc:"5 check-ins de chegada",             cond:s=>(s.counts.chegada||0)>=5 },
  { id:"cacador",   nome:"Caçador BS",      icon:"crosshair",     desc:"Prospectou 10 clientes só-BS",       cond:s=>(s.counts.prospeccao||0)>=10 },
  { id:"planejador",nome:"Planejador",      icon:"calendar-check",desc:"Enviou 4 projeções",                 cond:s=>(s.counts.projecao||0)>=4 },
  { id:"ouro",      nome:"Nível Ouro",     icon:"crown",         desc:"Alcançou o nível Ouro",              cond:s=>s.points>=400 },
];

function key(){ return "sbs_gam:"+((D.user&&D.user.email)||"anon"); }
function load(){
  try{ return JSON.parse(localStorage.getItem(key())) || {points:0,counts:{},badges:[],last:""}; }
  catch(e){ return {points:0,counts:{},badges:[],last:""}; }
}
function save(st){ try{ localStorage.setItem(key(), JSON.stringify(st)); }catch(e){} }

function levelOf(points){
  let lv = LEVELS[0], idx=0;
  LEVELS.forEach((l,i)=>{ if(points>=l.min){ lv=l; idx=i; } });
  const next = LEVELS[idx+1] || null;
  return { ...lv, idx, next };
}

function refreshBadges(st){
  BADGES.forEach(b=>{ if(b.cond(st) && st.badges.indexOf(b.id)<0) st.badges.push(b.id); });
}

function award(action){
  applyConfig();
  if(!GAM_ON) return;
  const a = ACTIONS[action]; if(!a) return;
  const st = load();
  // login: só 1x por dia
  if(action==="login"){
    const today = new Date().toDateString();
    if(st.last===today) return;
    st.last = today;
  }
  st.points += a.p;
  st.counts[action] = (st.counts[action]||0) + 1;
  const before = st.badges.length;
  refreshBadges(st);
  save(st);
  // toast de pontos
  if(window.SBS && window.SBS.toast) window.SBS.toast("+"+a.p+" pontos · "+a.label);
  // se ganhou conquista nova, avisa
  if(st.badges.length>before){
    const nb = BADGES.find(b=>b.id===st.badges[st.badges.length-1]);
    if(nb) setTimeout(()=>window.SBS.toast("🏆 Conquista: "+nb.nome), 1400);
  }
  if(window.SBS && window.SBS.updateBell) {/* no-op */}
}

window.Gam = { award, awardOnce, load, levelOf, ACTIONS, LEVELS, BADGES };

const _seen = new Set();
function awardOnce(action, tag){
  const k = action+":"+(tag||"");
  if(_seen.has(k)) return;
  _seen.add(k);
  award(action);
}

/* ---------------- TELA: RANKING & CONQUISTAS ---------------- */
S.ranking = {
  title: "Ranking & Conquistas",
  render(){
    applyConfig();
    const st = load();
    const lv = levelOf(st.points);
    const nextTxt = lv.next ? `${lv.next.min - st.points} pts para ${lv.next.n}` : "Nível máximo!";
    const prog = lv.next ? Math.round((st.points - lv.min)/(lv.next.min - lv.min)*100) : 100;

    // ranking: equipe (mock) + usuário (pontos reais)
    const me = (D.user&&D.user.name)||"Você";
    const peers = [
      { nome:"Marina Souza",  pts: 920 },
      { nome:"Carlos Lima",   pts: 610 },
      { nome:"Júlia Prado",   pts: 430 },
      { nome:"André Reis",    pts: 280 },
      { nome:"Bruno Tavares", pts: 175 },
    ];
    const all = peers.concat([{ nome:me, pts:st.points, you:true }])
      .sort((a,b)=>b.pts-a.pts);
    const pos = all.findIndex(x=>x.you)+1;
    const medal = i => i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+"º";

    const earned = new Set(st.badges);

    return `
    <div class="gam-hero">
      <div class="gam-lvl" style="--lc:${lv.cor}">
        <div class="gam-ring" style="--p:${prog}"><div class="gam-ring-in"><b>${st.points}</b><span>pontos</span></div></div>
        <div class="gam-lvl-info">
          <div class="gam-lvl-name" style="color:${lv.cor}"><i data-lucide="award"></i> Nível ${lv.n}</div>
          <div class="gam-pos">Você está em <b>${pos}º</b> no ranking da equipe</div>
          <div class="gam-next">${nextTxt}</div>
        </div>
      </div>
    </div>

    <div class="section-title">Ranking da equipe</div>
    <div class="card" style="padding:6px 14px">
      ${all.map((r,i)=>`
        <div class="rank ${r.you?'you':''}">
          <span class="rpos">${medal(i)}</span>
          <div class="rinfo"><div class="rname">${r.nome}${r.you?' <span class="badge b-brand" style="font-size:10px">você</span>':''}</div>
            <div class="rreg">Nível ${levelOf(r.pts).n}</div></div>
          <div class="rval">${r.pts} pts</div>
        </div>`).join("")}
    </div>

    <div class="section-title">Conquistas <span class="muted" style="text-transform:none;font-weight:600">· ${earned.size}/${BADGES.length}</span></div>
    <div class="badges-grid">
      ${BADGES.map(b=>{ const got=earned.has(b.id); return `
        <div class="badge-card ${got?'got':'locked'}">
          <span class="bc-ic"><i data-lucide="${got?b.icon:'lock'}"></i></span>
          <div class="bc-name">${b.nome}</div>
          <div class="bc-desc">${b.desc}</div>
        </div>`; }).join("")}
    </div>

    <div class="section-title">Como ganhar pontos</div>
    <div class="card" style="padding:6px 14px">
      ${Object.values(ACTIONS).map(a=>`
        <div class="pts-row"><span>${a.label}</span><b>+${a.p}</b></div>`).join("")}
    </div>

    <div class="section-title">Regras da gamificação</div>
    <div class="card" style="padding:14px">
      <div style="font-weight:800;font-size:13.5px;margin-bottom:8px">Como funcionam os níveis</div>
      <div class="lvl-rules">
        ${LEVELS.map((l,i)=>{ const max=LEVELS[i+1]?(LEVELS[i+1].min-1):null; return `
          <div class="lvl-rule"><span class="lvl-dot" style="background:${l.cor}"></span>
            <span class="lvl-rn">${l.n}</span>
            <span class="lvl-rp">${l.min}${max!=null?(" – "+max):"+"} pts</span></div>`; }).join("")}
      </div>
      <ul class="doc-list" style="margin-top:14px">
        <li><i data-lucide="check"></i><span>Você acumula pontos a cada ação realizada no portal.</span></li>
        <li><i data-lucide="check"></i><span>Os pontos sobem seu nível e sua posição no ranking da equipe.</span></li>
        <li><i data-lucide="check"></i><span>Conquistas são desbloqueadas ao atingir metas de uso.</span></li>
        <li><i data-lucide="check"></i><span>O ranking é atualizado conforme o uso de toda a equipe.</span></li>
      </ul>
    </div>
    <div class="note" style="margin-top:12px"><i data-lucide="info"></i><span>Use o portal no dia a dia — registrar visitas, abrir chamados, consultar materiais — e suba no ranking da equipe.</span></div>`;
  }
};

})();
