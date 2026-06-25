/* ===========================================================
   SBS — Rotas (salvas, editáveis, monitoradas)
   - S.rotas: Minhas Rotas (supervisor) / Rotas da Equipe (gestor)
   - check-in de chegada (GPS) → notifica o gerente responsável
   - validação de conflito (mesmo município/mesmo dia) destacada
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;
const fmtData = iso => (iso||"").split("-").reverse().join("/");

function inScope(u, r){
  if(u.papel==="nacional"||u.papel==="admin") return true;
  if(u.papel==="regional" && window.SBS_ORG){
    return window.SBS_ORG.escopo(u.email).map(e=>e.toLowerCase()).includes((r.email||"").toLowerCase());
  }
  return (r.email||"").toLowerCase()===(u.email||"").toLowerCase();
}

// mapa de conflitos: por data, municípios usados por mais de uma pessoa
function conflitosPorData(rotas){
  const byDia={};
  rotas.forEach(r=>{ (r.municipios||[]).forEach(m=>{
    const k=r.data+"|"+m; (byDia[k]=byDia[k]||new Set()).add((r.email||"").toLowerCase());
  }); });
  return byDia; // k -> Set(emails)
}

S.rotas = {
  title: "Rotas",
  render(){
    const u = D.user, ORG = window.SBS_ORG;
    const todas = window.SBSStore ? window.SBSStore.getCol("rotas") : [];
    const minhas = todas.filter(r=>inScope(u,r));
    const gestor = ["regional","nacional","admin"].includes(u.papel);
    const conf = conflitosPorData(todas);
    const isConf = (r)=> (r.municipios||[]).some(m=>{ const s=conf[r.data+"|"+m]; return s && s.size>1; });

    // ordena por data desc
    minhas.sort((a,b)=>(b.data||"").localeCompare(a.data||""));

    const card = r=>{
      const meu = (r.email||"").toLowerCase()===(u.email||"").toLowerCase();
      const feitas = (r.paradas||[]).filter(p=>p.done).length;
      const conflito = isConf(r);
      return `<div class="rt-card ${conflito?'conf':''}" data-id="${r.id}">
        <div class="rt-head">
          <div>
            <div class="rt-data"><i data-lucide="calendar"></i>${fmtData(r.data)}</div>
            ${gestor&&!meu?`<div class="rt-autor">${r.autor} · ${(ORG&&ORG.get(r.email)||{}).papel||r.papel||''}</div>`:""}
          </div>
          <span class="badge ${feitas===(r.paradas||[]).length&&feitas>0?'b-good':'b-muted'}">${feitas}/${(r.paradas||[]).length} visitados</span>
        </div>
        ${conflito?`<div class="rt-conf"><i data-lucide="alert-triangle"></i>Conflito: outro vendedor na mesma cidade/dia</div>`:""}
        <div class="rt-stops">
          ${(r.paradas||[]).map((p,i)=>`
            <div class="rt-stop ${p.done?'done':''}">
              <span class="rt-n">${p.done?'<i data-lucide=\"check\"></i>':(i+1)}</span>
              <div class="rt-info"><div class="rt-cli">${p.c}</div><div class="rt-mun">${p.mun?p.mun+(p.uf?'/'+p.uf:''):'—'}</div></div>
              ${meu&&!p.done?`<button class="rt-chk" data-arrive="${r.id}|${i}" title="Cheguei"><i data-lucide="map-pin-check"></i></button>`:""}
            </div>`).join("")}
        </div>
        <div class="rt-actions">
          <button class="cl-act" data-map="${r.id}"><i data-lucide="navigation"></i>Abrir no mapa</button>
          ${meu?`<button class="cl-act" data-del="${r.id}"><i data-lucide="trash-2"></i>Excluir</button>`:""}
        </div>
      </div>`;
    };

    return `
    <div class="hero" style="background:linear-gradient(150deg,var(--green-800),var(--green-600))">
      <div class="uname" style="font-size:18px">${gestor?"Rotas da Equipe":"Minhas Rotas"}</div>
      <div class="urole" style="opacity:.9">${gestor?"Acompanhe roteiros e evite sobreposição":"Seu roteiro de visitas — toque em \u2018Cheguei\u2019 ao chegar"}</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${minhas.length}</div><div class="hs-l">rotas</div></div>
        <div class="hero-stat"><div class="hs-v">${minhas.filter(isConf).length}</div><div class="hs-l">com conflito</div></div>
        <div class="hero-stat"><div class="hs-v">${minhas.reduce((s,r)=>s+(r.paradas||[]).filter(p=>p.done).length,0)}</div><div class="hs-l">visitados</div></div>
      </div>
    </div>
    <button class="btn ghost" data-go="clientes" style="margin-top:14px"><i data-lucide="plus"></i> Montar nova rota (Clientes & Rotas)</button>
    <div class="section-title">${gestor?"Roteiros da equipe":"Suas rotas"}</div>
    <div id="rt-list">${minhas.length? minhas.map(card).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma rota salva ainda.</div>`}</div>`;
  },
  mount(root){
    const u = D.user;
    const get = id => (window.SBSStore?window.SBSStore.getCol("rotas"):[]).find(r=>r.id===id);
    root.querySelector("#rt-list").addEventListener("click",e=>{
      const mp=e.target.closest("[data-map]");
      if(mp){ const r=get(mp.dataset.map); if(!r)return;
        const stops=(r.paradas||[]).map(p=>encodeURIComponent(p.end||p.c));
        let url="https://www.google.com/maps/dir/?api=1&travelmode=driving&destination="+stops[stops.length-1];
        if(stops.length>1) url+="&waypoints="+stops.slice(0,-1).join("|");
        const a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener";
        document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(),0); return; }
      const dl=e.target.closest("[data-del]");
      if(dl){ if(confirm("Excluir esta rota?")){ window.SBSStore.remove("rotas",dl.dataset.del); window.SBS.go("rotas"); } return; }
      const ar=e.target.closest("[data-arrive]");
      if(ar){ arrive(ar.dataset.arrive); return; }
    });
    function arrive(token){
      const [id,idx]=token.split("|"); const i=+idx;
      const r=get(id); if(!r)return;
      const parada=r.paradas[i];
      const finish=(gps)=>{
        const paradas=r.paradas.slice(); paradas[i]={...paradas[i], done:true, chegada:new Date().toISOString(), gps:gps||null};
        window.SBSStore.update("rotas", id, {paradas});
        // notifica o gerente responsável
        const ger = window.SBS_ORG && window.SBS_ORG.gerenteDe(u.email);
        if(ger && window.SBSStore){
          window.SBSStore.add("notificacoes", {
            title:"Chegada em visita: "+u.name,
            text:u.name+" chegou em "+parada.c+(parada.mun?" ("+parada.mun+")":"")+".",
            tipo:"geral", icon:"map-pin-check", destino:ger, data:window.SBSStore.today(), de:u.email });
        }
        window.SBS.toast("Chegada registrada"+(ger?" · gerente avisado":""));
        window.Gam&&window.Gam.award("chegada");
        window.SBS.go("rotas");
      };
      if(navigator.geolocation){
        window.SBS.toast("Confirmando localização…");
        navigator.geolocation.getCurrentPosition(
          p=>finish({lat:p.coords.latitude,lng:p.coords.longitude,acc:Math.round(p.coords.accuracy)}),
          ()=>finish(null), {enableHighAccuracy:true,timeout:8000,maximumAge:0});
      } else finish(null);
    }
  }
};

})();
