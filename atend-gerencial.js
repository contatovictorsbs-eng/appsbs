/* ===========================================================
   SBS Painel de Atendimento — Visão Gerencial
   window.ATEND_VIEWS.gerencial  (indicadores · canais · agentes · regras)
   =========================================================== */
(function(){
  window.ATEND_VIEWS = window.ATEND_VIEWS || {};
  const A = window.ATEND, esc = (s)=>ATEND.esc(s);
  let sub = "indicadores";

  const SUBS = [
    ["indicadores","Indicadores","bar-chart-3"],
    ["canais","Canais","plug"],
    ["agentes","Agentes","users"],
    ["regras","Regras de roteamento","route"],
    ["ajuda","Ajuda","circle-help"]
  ];

  window.ATEND_VIEWS.gerencial = {
    render(){
      return ''+
      '<div class="ax-ger">'+
        '<div class="ax-gtabs">'+SUBS.map(function(s){ return '<button class="ax-gtab'+(sub===s[0]?' on':'')+'" data-sub="'+s[0]+'"><i data-lucide="'+s[2]+'"></i> '+s[1]+'</button>'; }).join("")+'</div>'+
        '<div class="ax-gbody" id="ax-gbody"></div>'+
      '</div>';
    },
    mount(c){
      c.querySelectorAll("[data-sub]").forEach(function(b){ b.addEventListener("click", function(){ sub=b.dataset.sub; A.refresh(); }); });
      paintSub(c);
    }
  };

  function paintSub(c){
    const body = c.querySelector("#ax-gbody");
    if(sub==="ajuda"){
      body.innerHTML = window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("atendimento") : '<div class="ax-empty">Documentação indisponível.</div>';
      A.icons(); window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(body, "atendimento"); return;
    }
    body.innerHTML = ({ indicadores:indicadores, canais:canais, agentes:agentes, regras:regras }[sub]||indicadores)();
    A.icons();
    if(sub==="regras") wireRegras(c);
    if(sub==="canais") wireCanais(c);
  }

  /* ---- INDICADORES ---- */
  function indicadores(){
    const all = A.allConversas();
    const scope = A.scopeBrands();
    const inScope = all.filter(c=>scope.indexOf(c.brand)>=0);
    const pend = inScope.filter(c=>c.status==="pendente").length;
    const aber = inScope.filter(c=>c.status==="aberto").length;
    const reso = inScope.filter(c=>c.status==="resolvido").length;
    const kpi = (ic,v,l,tone)=>'<div class="ax-kpi '+(tone||'')+'"><span class="ax-kpi-ic"><i data-lucide="'+ic+'"></i></span><div class="ax-kpi-v">'+v+'</div><div class="ax-kpi-l">'+l+'</div></div>';
    // por marca
    const byBrand = scope.map(function(b){
      const br=A.brand(b); const list=inScope.filter(c=>c.brand===b);
      const ativos=list.filter(c=>c.status!=="resolvido").length;
      const max=Math.max(1,...scope.map(x=>inScope.filter(c=>c.brand===x&&c.status!=="resolvido").length));
      return '<div class="ax-brow"><div class="ax-brow-top"><span><span class="ax-dot sm" style="background:'+br.color+'"></span>'+esc(br.name)+'</span><b>'+ativos+' ativas</b></div>'+
        '<div class="ax-brbar"><span style="width:'+Math.max(4,Math.round(ativos/max*100))+'%;background:'+br.color+'"></span></div></div>';
    }).join("");
    // por canal
    const chCount = {};
    inScope.forEach(c=>{ chCount[c.channel]=(chCount[c.channel]||0)+1; });
    const chRows = Object.keys(chCount).sort((a,b)=>chCount[b]-chCount[a]).map(function(ch){
      const meta=A.channel(ch); return '<div class="ax-li"><span><i data-lucide="'+meta.icon+'" class="ax-ic"></i> '+esc(meta.name)+'</span><b>'+chCount[ch]+'</b></div>';
    }).join("");
    return ''+
      '<div class="ax-kpis">'+
        kpi("inbox", inScope.length, "Conversas (total)", "")+
        kpi("clock", pend, "Pendentes", pend?"warn":"")+
        kpi("loader", aber, "Em atendimento", "")+
        kpi("check-circle-2", reso, "Resolvidas", "ok")+
      '</div>'+
      '<div class="ax-gcols">'+
        '<div class="ax-card"><div class="ax-card-h"><i data-lucide="bar-chart-3"></i> Volume por marca</div>'+(byBrand||'<div class="ax-empty">Sem dados.</div>')+'</div>'+
        '<div class="ax-card"><div class="ax-card-h"><i data-lucide="radio"></i> Por canal</div>'+(chRows||'<div class="ax-empty">Sem dados.</div>')+'</div>'+
      '</div>'+
      '<div class="ax-note"><i data-lucide="link"></i> As reclamações e os chamados abertos no app entram automaticamente nesta caixa (marca SBS · canal App).</div>';
  }

  /* ---- CANAIS ---- */
  function canais(){
    const rows = A.canais().filter(function(c){ return A.scopeBrands().indexOf(c.brand)>=0; });
    return '<div class="ax-card"><div class="ax-card-h"><i data-lucide="plug"></i> Canais conectados</div>'+
      '<div class="ax-table">'+rows.map(function(ch){
        const br=A.brand(ch.brand), meta=A.channel(ch.tipo);
        const conn = ch.status==="connected";
        return '<div class="ax-trow">'+
          '<span class="ax-dot" style="background:'+br.color+'"></span>'+
          '<span class="ax-tch"><i data-lucide="'+meta.icon+'" class="ax-ic"></i> '+esc(meta.name)+'</span>'+
          '<span class="ax-tid">'+esc(ch.identificador)+'</span>'+
          '<span class="ax-tbr">'+esc(br.name)+'</span>'+
          '<span class="ax-cstat '+(conn?'on':'off')+'">'+(conn?'Conectado':'Pendente')+'</span>'+
          '<button class="ax-btn ghost sm" data-toggle-ch="'+ch.id+'">'+(conn?'Desconectar':'Conectar')+'</button>'+
        '</div>';
      }).join("")+'</div></div>'+
      '<div class="ax-note"><i data-lucide="info"></i> Demonstração: a conexão real de WhatsApp/E-mail/redes exige as credenciais de cada canal. Aqui você gerencia o cadastro e o status.</div>';
  }
  function wireCanais(c){
    c.querySelectorAll("[data-toggle-ch]").forEach(function(b){ b.addEventListener("click", function(){
      const arr=A.canais(); const i=arr.findIndex(x=>x.id===b.dataset.toggleCh); if(i<0) return;
      arr[i]=Object.assign({},arr[i],{status:arr[i].status==="connected"?"pending":"connected"});
      A.S.setCol("atend_canais",arr); A.toast("Canal atualizado"); A.refresh();
    }); });
  }

  /* ---- AGENTES ---- */
  function agentes(){
    const PAPEL={admin:"Administrador",supervisor:"Supervisor",atendente:"Atendente"};
    return '<div class="ax-card"><div class="ax-card-h"><i data-lucide="users"></i> Equipe de atendimento</div>'+
      '<div class="ax-table">'+A.agentes().map(function(a){
        const brs=(a.brands||[]).map(function(b){ const br=A.brand(b); return '<span class="ax-mini" style="background:'+br.soft+';color:'+br.color+'">'+esc(br.name)+'</span>'; }).join("");
        return '<div class="ax-trow">'+
          '<span class="ax-ag-av" style="background:'+a.cor+'">'+esc(a.nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase())+'</span>'+
          '<span class="ax-tch">'+esc(a.nome)+'</span>'+
          '<span class="ax-tbr">'+(PAPEL[a.papel]||a.papel)+'</span>'+
          '<span class="ax-tbrs">'+(a.papel==="admin"||a.papel==="supervisor"?'<span class="ax-mini" style="background:#EEF0F2;color:#5B6470">Todas as marcas</span>':brs)+'</span>'+
        '</div>';
      }).join("")+'</div></div>'+
      '<div class="ax-note"><i data-lucide="shield"></i> Os acessos e papéis são definidos pela administração. Cada atendente vê apenas as conversas das marcas atribuídas.</div>';
  }

  /* ---- REGRAS ---- */
  function regras(){
    return '<div class="ax-card"><div class="ax-card-h"><i data-lucide="route"></i> Regras de roteamento automático</div>'+
      '<div class="ax-table">'+A.regras().map(function(r){
        return '<div class="ax-trow">'+
          '<span class="ax-rk">se contém <b>"'+esc(r.palavra)+'"</b></span>'+
          '<span class="ax-rr"><i data-lucide="corner-down-right" class="ax-ic"></i> '+esc(r.rota)+'</span>'+
          '<label class="ax-sw"><input type="checkbox" data-rule="'+r.id+'" '+(r.ativo?'checked':'')+'><span></span></label>'+
        '</div>';
      }).join("")+'</div></div>'+
      '<div class="ax-note"><i data-lucide="info"></i> Quando uma mensagem nova contém a palavra-chave, ela é encaminhada automaticamente para a fila indicada.</div>';
  }
  function wireRegras(c){
    c.querySelectorAll("[data-rule]").forEach(function(inp){ inp.addEventListener("change", function(){
      const arr=A.regras(); const i=arr.findIndex(x=>x.id===inp.dataset.rule); if(i<0) return;
      arr[i]=Object.assign({},arr[i],{ativo:inp.checked}); A.S.setCol("atend_regras",arr);
      A.toast("Regra "+(inp.checked?"ativada":"desativada"));
    }); });
  }
})();
