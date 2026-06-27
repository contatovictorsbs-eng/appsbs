/* ===========================================================
   SBS Painel Gerencial — Análises (gráficos, metas, exportação)
   Usa SBS_CHART. Liga metas (coleção vendedores) ao realizado (pedidos).
   =========================================================== */
(function(){
  if(typeof PANEL==="undefined"||!PANEL.Modules) return;
  var S=PANEL.S, esc=PANEL.esc, C=window.SBS_CHART;

  function ped(){ return S.getCol("pedidos")||[]; }
  function vendedores(){ return (S.getCol("vendedores")||[]).filter(v=>v.ativo!==false); }
  function mes(d){ // "DD/MM/AAAA" -> "MM/AAAA"
    if(!d) return ""; var p=String(d).split("/"); return p.length===3?(p[1]+"/"+p[2]):"";
  }

  PANEL.Modules.analises = {
    label:"Análises & Relatórios",
    render(){
      if(!C) return '<div class="card">Gráficos indisponíveis.</div>';
      var p=ped(), fat=0, cart=0, byV={}, byMes={}, byStatus={};
      p.forEach(function(o){
        var v=+o.valor||0;
        if((o.status||"")==="faturado") fat+=v; else cart+=v;
        var k=o.vendedor||"—"; byV[k]=(byV[k]||0)+v;
        var m=mes(o.data); if(m) byMes[m]=(byMes[m]||0)+v;
        byStatus[o.status||"—"]=(byStatus[o.status||"—"]||0)+1;
      });
      // tendência mensal (ordenada)
      var meses=Object.keys(byMes).sort(function(a,b){ var pa=a.split("/"),pb=b.split("/"); return (pa[1]+pa[0])>(pb[1]+pb[0])?1:-1; });
      var lineData=meses.slice(-8).map(function(m){ return { l:m, v:Math.round(byMes[m]) }; });
      // ranking
      var rank=Object.keys(byV).sort(function(a,b){return byV[b]-byV[a];}).slice(0,8).map(function(k){ return { l:k, v:Math.round(byV[k]) }; });
      // status donut
      var STC={faturado:"#0B8A5E",producao:"#1E73C2",transito:"#C0710F",cotacao:"#9aa6a1"};
      var donutData=Object.keys(byStatus).map(function(s){ return { l:s, v:byStatus[s], color:STC[s]||"#69756f" }; });
      // metas vs realizado por vendedor
      var vs=vendedores();
      var metaRows=vs.map(function(v){ var real=byV[v.nome]||0; var meta=+v.meta||0; var pct=meta?Math.round(real/meta*100):0; return { nome:v.nome, meta:meta, real:real, pct:pct }; })
        .sort(function(a,b){return b.pct-a.pct;});
      var metaTot=vs.reduce(function(s,v){return s+(+v.meta||0);},0);
      var realTot=vs.reduce(function(s,v){return s+(byV[v.nome]||0);},0);
      var pctTot=metaTot?Math.round(realTot/metaTot*100):0;

      return `
      <div class="between" style="margin-bottom:16px">
        <div class="muted">Análises de vendas · metas e tendências</div>
        <div style="display:flex;gap:8px">
          <button class="btn-soft" id="an-csv"><i data-lucide="download"></i> CSV</button>
          <button class="btn-soft" id="an-pdf"><i data-lucide="printer"></i> PDF</button>
        </div>
      </div>

      <div class="grid cols-2" style="align-items:start;margin-bottom:16px">
        <div class="card">
          <div class="sec-title" style="margin:0 0 14px">Tendência de vendas (mensal)</div>
          ${lineData.length>1?C.line(lineData,{color:"#0B6B61",fmt:C.money}):'<div class="muted">Dados insuficientes.</div>'}
        </div>
        <div class="card">
          <div class="sec-title" style="margin:0 0 14px">Pedidos por status</div>
          ${C.donut(donutData)}
        </div>
      </div>

      <div class="card" style="margin-bottom:16px">
        <div class="sec-title" style="margin:0 0 14px">Ranking de vendedores (volume)</div>
        ${C.bars(rank,{color:"#0B6B61",fmt:C.money})}
      </div>

      <div class="card">
        <div class="between" style="margin-bottom:14px">
          <div class="sec-title" style="margin:0">Meta × Realizado</div>
          <div class="muted" style="font-size:13px">Equipe: <b style="color:var(--brand)">${pctTot}%</b> da meta (${C.money(realTot)} / ${C.money(metaTot)})</div>
        </div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Vendedor</th><th class="right">Meta</th><th class="right">Realizado</th><th>Atingimento</th></tr></thead><tbody>
          ${metaRows.map(function(r){ var col=r.pct>=100?"#0B8A5E":r.pct>=70?"#C0710F":"#b3261e"; return `<tr>
            <td class="strong">${esc(r.nome)}</td>
            <td class="right">${C.money(r.meta)}</td>
            <td class="right strong">${C.money(r.real)}</td>
            <td><div style="display:flex;align-items:center;gap:9px"><div style="flex:1;height:8px;background:#eef1f0;border-radius:5px;overflow:hidden;min-width:80px"><span style="display:block;height:100%;width:${Math.min(100,r.pct)}%;background:${col};border-radius:5px"></span></div><b style="color:${col};font-size:12.5px;width:42px;text-align:right">${r.pct}%</b></div></td>
          </tr>`; }).join("")}
        </tbody></table></div>
      </div>`;
    },
    mount(c){
      var vs=vendedores(), p=ped(), byV={};
      p.forEach(function(o){ var k=o.vendedor||"—"; byV[k]=(byV[k]||0)+(+o.valor||0); });
      c.querySelector("#an-csv").addEventListener("click",function(){
        var rows=[["Vendedor","Meta","Realizado","Atingimento %"]];
        vs.forEach(function(v){ var real=byV[v.nome]||0, meta=+v.meta||0; rows.push([v.nome,meta,Math.round(real),meta?Math.round(real/meta*100):0]); });
        C.exportCSV("metas-vendedores", rows);
      });
      c.querySelector("#an-pdf").addEventListener("click",function(){
        var html='<table><thead><tr><th>Vendedor</th><th>Meta</th><th>Realizado</th><th>Atingimento</th></tr></thead><tbody>'+
          vs.map(function(v){ var real=byV[v.nome]||0, meta=+v.meta||0, pct=meta?Math.round(real/meta*100):0; return '<tr><td>'+esc(v.nome)+'</td><td>'+C.money(meta)+'</td><td>'+C.money(real)+'</td><td>'+pct+'%</td></tr>'; }).join("")+'</tbody></table>';
        C.print("Meta × Realizado — Vendedores SBS", html);
      });
    }
  };
})();
