/* ===========================================================
   SBS Painel de Marketing — Central Google & Meta
   Conexão centralizada das contas (Google Ads/Analytics/Business,
   Meta Ads/Instagram/Facebook/WhatsApp) + métricas consolidadas.
   Coleção "mkt_integracoes". (Conexão real de API exige backend
   OAuth — aqui é a central de gestão + métricas manuais.)
   =========================================================== */
(function(){
  if(typeof MKT==="undefined"||!MKT.Modules) return;
  var S=MKT.S, esc=MKT.esc, num=MKT.num, money=MKT.money;

  var CATALOG=[
    { id:"google_ads",   grupo:"Google", nome:"Google Ads",        icon:"badge-dollar-sign", desc:"Campanhas de mídia paga (search/display)." },
    { id:"google_an",    grupo:"Google", nome:"Google Analytics 4", icon:"line-chart",        desc:"Tráfego e conversões do site." },
    { id:"google_bus",   grupo:"Google", nome:"Google Business",    icon:"map-pin",           desc:"Perfil da empresa e avaliações." },
    { id:"meta_ads",     grupo:"Meta",   nome:"Meta Ads",           icon:"target",            desc:"Anúncios no Facebook e Instagram." },
    { id:"meta_ig",      grupo:"Meta",   nome:"Instagram",          icon:"at-sign",           desc:"Conteúdo e engajamento." },
    { id:"meta_fb",      grupo:"Meta",   nome:"Facebook Page",      icon:"thumbs-up",         desc:"Página e alcance." },
    { id:"meta_wa",      grupo:"Meta",   nome:"WhatsApp Business",  icon:"message-circle",    desc:"Mensagens e catálogos." }
  ];

  function regs(){ return S.getCol("mkt_integracoes")||[]; }
  function seed(){
    if(regs().length) return;
    S.setCol("mkt_integracoes", CATALOG.map(function(c){ return { id:c.id, status:"desconectado", conta:"", invest:0, alcance:0, conversoes:0 }; }));
  }
  function reg(id){ return regs().find(function(r){return r.id===id;})||{ id:id, status:"desconectado" }; }

  MKT.Modules.integracoes = {
    label:"Google & Meta",
    render(){
      seed();
      var conn=regs().filter(function(r){return r.status==="conectado";}).length;
      var invest=regs().reduce(function(s,r){return s+(+r.invest||0);},0);
      var alc=regs().reduce(function(s,r){return s+(+r.alcance||0);},0);
      var conv=regs().reduce(function(s,r){return s+(+r.conversoes||0);},0);
      var grupos={}; CATALOG.forEach(function(c){ (grupos[c.grupo]=grupos[c.grupo]||[]).push(c); });
      return `
      <div class="mc-kpis">
        ${kpi("plug", conn+"/"+CATALOG.length, "Contas conectadas", conn?"ok":"")}
        ${kpi("badge-dollar-sign", money(invest), "Investimento (mídia)", "")}
        ${kpi("eye", num(alc), "Alcance consolidado", "")}
        ${kpi("target", num(conv), "Conversões", "ok")}
      </div>
      ${Object.keys(grupos).map(function(g){ return `
        <div class="mc-card" style="margin-bottom:14px">
          <div class="mc-card-h"><i data-lucide="${g==='Google'?'globe':'thumbs-up'}"></i> ${g}</div>
          ${grupos[g].map(function(c){ var r=reg(c.id); var on=r.status==="conectado"; return `
            <div class="mc-int">
              <span class="mc-int-ic ${on?'on':''}"><i data-lucide="${c.icon}"></i></span>
              <div class="mc-int-b"><div class="mc-int-t">${esc(c.nome)}</div><div class="mc-int-d">${on?('Conectado · '+esc(r.conta||'')):esc(c.desc)}</div></div>
              ${on?`<div class="mc-int-met"><b>${money(r.invest)}</b><span>invest.</span></div>`:''}
              <button class="mc-btn ${on?'ghost':'primary'}" data-conn="${c.id}">${on?'Gerenciar':'Conectar'}</button>
            </div>`; }).join("")}
        </div>`; }).join("")}
      <div class="mc-note"><i data-lucide="info"></i> Central unificada de Google e Meta. O cadastro e as métricas são geridos aqui. A <b>sincronização automática via API</b> (OAuth com Google/Meta) exige um servidor de integração — é o próximo passo quando houver backend. Os números consolidados alimentam o Painel do CEO.</div>`;
    },
    mount(c){
      c.querySelectorAll("[data-conn]").forEach(function(b){ b.addEventListener("click",function(){ form(b.dataset.conn); }); });
    }
  };
  function kpi(ic,v,l,t){ return '<div class="mc-kpi '+(t||'')+'"><span class="mc-kpi-ic"><i data-lucide="'+ic+'"></i></span><div><div class="mc-kpi-v">'+v+'</div><div class="mc-kpi-l">'+l+'</div></div></div>'; }

  function form(id){
    var c=CATALOG.find(function(x){return x.id===id;}); var r=reg(id);
    MKT.modal((r.status==="conectado"?"Gerenciar ":"Conectar ")+c.nome,
      '<div class="mc-note" style="margin:0 0 14px"><i data-lucide="shield"></i> Demonstração: informe a conta e as métricas do período. A autorização OAuth real será feita com backend.</div>'+
      '<div class="fld"><label>Conta / ID</label><input id="ig-conta" value="'+esc(r.conta||'')+'" placeholder="Ex.: ID da conta de anúncios"></div>'+
      '<div class="fld-row"><div class="fld"><label>Investimento (R$)</label><input id="ig-inv" type="number" value="'+(r.invest||0)+'"></div>'+
      '<div class="fld"><label>Alcance</label><input id="ig-alc" type="number" value="'+(r.alcance||0)+'"></div></div>'+
      '<div class="fld"><label>Conversões</label><input id="ig-conv" type="number" value="'+(r.conversoes||0)+'"></div>',
      (r.status==="conectado"?'<button class="mc-btn ghost danger" id="ig-disc">Desconectar</button>':'')+'<button class="mc-btn ghost" id="ig-c">Cancelar</button><button class="mc-btn primary" id="ig-s"><i data-lucide="plug"></i> '+(r.status==="conectado"?"Salvar":"Conectar")+'</button>');
    document.getElementById("ig-c").addEventListener("click",MKT.closeModal);
    var dc=document.getElementById("ig-disc"); if(dc) dc.addEventListener("click",function(){ upd(id,{status:"desconectado",conta:"",invest:0,alcance:0,conversoes:0}); MKT.toast("Desconectado"); MKT.closeModal(); MKT.refresh(); });
    document.getElementById("ig-s").addEventListener("click",function(){
      var v=function(x){ var e=document.getElementById(x); return e?e.value.trim():""; };
      upd(id,{status:"conectado",conta:v("ig-conta"),invest:+v("ig-inv")||0,alcance:+v("ig-alc")||0,conversoes:+v("ig-conv")||0});
      MKT.toast(c.nome+" conectado"); MKT.closeModal(); MKT.refresh();
    });
  }
  function upd(id,data){
    var arr=regs().slice(); var i=arr.findIndex(function(r){return r.id===id;});
    if(i>=0) arr[i]=Object.assign({},arr[i],data); else arr.push(Object.assign({id:id},data));
    S.setCol("mkt_integracoes",arr);
  }
})();
