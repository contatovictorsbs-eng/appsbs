/* ===========================================================
   SBS Painel T.I. — Pesquisa de Tecnologia (resultados)
   Lê window.PESQUISA_TEC (pesquisa-tec-data.js) e usa SBS_CHART.
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  var esc=TI.esc, C=window.SBS_CHART;
  function D(){ return window.PESQUISA_TEC; }
  function cor(m){ return m>=4?"#0B8A5E":m>=3?"#C0710F":"#b3261e"; }

  TI.Modules.pesquisa = {
    label:"Pesquisa de Tecnologia",
    render(){
      var d=D(); if(!d) return '<div class="ti-note warn">Dados da pesquisa não carregados.</div>';
      var secs=Object.keys(d.secAvg).map(function(k){ return { l:d.secAvg[k].nome, v:d.secAvg[k].media, color:cor(d.secAvg[k].media) }; });
      var setores=Object.keys(d.porSetor).sort(function(a,b){return d.porSetor[b]-d.porSetor[a];}).map(function(k){ return {l:k,v:d.porSetor[k]}; });
      var papeis=Object.keys(d.porPapel).map(function(k){ return {l:k,v:d.porPapel[k],color:"#2A4A7F"}; });
      // melhores e piores questões
      var qs=d.perQ.slice().sort(function(a,b){return b.media-a.media;});
      var top=qs.slice(0,3), bottom=qs.slice(-3).reverse();
      var openCards=(d.abertas||[]).map(function(a){
        var ex=a.respostas.slice(0,4);
        return '<div class="ti-panel" style="margin-bottom:14px"><div class="ti-panel-h"><i data-lucide="message-square-quote"></i> '+esc(a.pergunta.slice(0,90))+'</div>'+
          ex.map(function(r){ return '<div class="ti-int"><span class="ti-hdot info" style="background:#2A4A7F"></span><div class="ti-int-b"><div class="ti-int-d" style="font-size:13px;color:var(--ink,#16201a)">"'+esc(r)+'"</div></div></div>'; }).join("")+
          (a.respostas.length>4?'<div class="ti-int-d" style="padding:8px 0 0">+'+(a.respostas.length-4)+' outra(s) resposta(s)</div>':'')+'</div>';
      }).join("");
      return `
      <div class="ti-kpis">
        <div class="ti-kpi info"><span class="ti-kpi-ic"><i data-lucide="users"></i></span><div class="ti-kpi-v">${d.total}</div><div class="ti-kpi-l">Respondentes</div></div>
        <div class="ti-kpi ${d.geral>=4?'ok':d.geral>=3?'warn':''}"><span class="ti-kpi-ic"><i data-lucide="gauge"></i></span><div class="ti-kpi-v">${d.geral}</div><div class="ti-kpi-l">Média geral (1–5)</div></div>
        <div class="ti-kpi"><span class="ti-kpi-ic"><i data-lucide="list-checks"></i></span><div class="ti-kpi-v">${d.perQ.length}</div><div class="ti-kpi-l">Afirmações avaliadas</div></div>
        <div class="ti-kpi"><span class="ti-kpi-ic"><i data-lucide="building-2"></i></span><div class="ti-kpi-v">${Object.keys(d.porSetor).length}</div><div class="ti-kpi-l">Setores</div></div>
      </div>
      <div class="ti-cols">
        <div class="ti-panel"><div class="ti-panel-h"><i data-lucide="bar-chart-3"></i> Média por dimensão</div>${C?C.bars(secs,{fmt:function(v){return v.toFixed(2);}}):""}</div>
        <div class="ti-panel"><div class="ti-panel-h"><i data-lucide="building"></i> Respostas por setor</div>${C?C.bars(setores,{color:"#2A4A7F"}):""}</div>
      </div>
      <div class="ti-cols" style="margin-top:14px">
        <div class="ti-panel"><div class="ti-panel-h" style="color:#0B8A5E"><i data-lucide="thumbs-up"></i> Pontos mais fortes</div>
          ${top.map(function(q){ return '<div class="ti-int"><span class="ti-hdot ok"></span><div class="ti-int-b"><div class="ti-int-t">'+esc(q.q)+'</div><div class="ti-int-d">média '+q.media+'</div></div></div>'; }).join("")}</div>
        <div class="ti-panel"><div class="ti-panel-h" style="color:#b3261e"><i data-lucide="thumbs-down"></i> Pontos de atenção</div>
          ${bottom.map(function(q){ return '<div class="ti-int"><span class="ti-hdot erro"></span><div class="ti-int-b"><div class="ti-int-t">'+esc(q.q)+'</div><div class="ti-int-d">média '+q.media+'</div></div></div>'; }).join("")}</div>
      </div>
      <div class="ti-panel" style="margin-top:14px"><div class="ti-panel-h"><i data-lucide="pie-chart"></i> Perfil dos respondentes</div>
        <div class="ti-cols"><div>${C?C.bars(papeis,{color:"#2A4A7F"}):""}</div>
        <div>${C?C.donut(Object.keys(d.porTempo).map(function(k,i){ return {l:k,v:d.porTempo[k],color:["#2A4A7F","#0B8A5E","#C0710F","#8a6d3b","#69756f"][i%5]}; })):""}</div></div>
      </div>
      <h3 style="margin:22px 0 12px;font-size:15px;font-weight:800">Respostas abertas</h3>
      ${openCards}
      <div class="ti-note info"><i data-lucide="lightbulb"></i> Leitura: a empresa vê a tecnologia como estratégica (dimensões altas), mas <b>ferramentas/experiência</b> (3,39) e <b>tecnologia × negócio</b> (3,57) são os pontos a evoluir — alinhado com os relatos de equipamentos/sistemas lentos.</div>`;
    }
  };
})();
