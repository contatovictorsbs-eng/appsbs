/* ===========================================================
   SBS Painel T.I. — Centro de Projetos
   Estrutura e mede projetos de tecnologia. Coleção "ti_projetos".
   Cada projeto: fases, progresso, responsável, métricas, status.
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  var S=TI.S, esc=TI.esc;

  var ST={ ideacao:{l:"Ideação",c:"#69756f",bg:"#EEF1F0"}, planejado:{l:"Planejado",c:"#1E73C2",bg:"#E5F0FB"},
    andamento:{l:"Em andamento",c:"#C0710F",bg:"#FBEFE0"}, concluido:{l:"Concluído",c:"#0B8A5E",bg:"#E4F5EC"},
    pausado:{l:"Pausado",c:"#8a6d3b",bg:"#F5EFE0"} };
  var PRI={ alta:{l:"Alta",c:"#b3261e",bg:"#FDE8E6"}, media:{l:"Média",c:"#C0710F",bg:"#FBEFE0"}, baixa:{l:"Baixa",c:"#69756f",bg:"#EEF1F0"} };

  function projs(){ return S.getCol("ti_projetos")||[]; }
  function seed(){
    if(projs().length) return;
    S.setCol("ti_projetos",[
      { id:"tp1", nome:"Projeto exemplo", desc:"Descreva o objetivo do projeto.", status:"andamento", prioridade:"media",
        responsavel:"T.I.", inicio:"2026-06-01", previsto:"2026-12-01", progresso:40,
        fases:[{nome:"Levantamento",done:true},{nome:"Desenvolvimento",done:false},{nome:"Testes",done:false},{nome:"Entrega",done:false}],
        metricas:[{nome:"Orçamento usado",valor:"35%"},{nome:"Esforço (h)",valor:"120"}] }
    ]);
  }
  function badge(map,k){ var s=map[k]||Object.values(map)[0]; return '<span class="mc-badge" style="color:'+s.c+';background:'+s.bg+'">'+s.l+'</span>'; }

  TI.Modules.projetos = {
    label:"Centro de Projetos",
    render(){
      seed();
      var ps=projs();
      var por={}; ps.forEach(function(p){ por[p.status]=(por[p.status]||0)+1; });
      var andamento=por.andamento||0, concl=por.concluido||0;
      var progMedio=ps.length?Math.round(ps.reduce(function(s,p){return s+(+p.progresso||0);},0)/ps.length):0;
      return `
      <div class="ti-kpis">
        <div class="ti-kpi info"><span class="ti-kpi-ic"><i data-lucide="folder-kanban"></i></span><div class="ti-kpi-v">${ps.length}</div><div class="ti-kpi-l">Projetos</div></div>
        <div class="ti-kpi warn"><span class="ti-kpi-ic"><i data-lucide="loader"></i></span><div class="ti-kpi-v">${andamento}</div><div class="ti-kpi-l">Em andamento</div></div>
        <div class="ti-kpi ok"><span class="ti-kpi-ic"><i data-lucide="check-circle-2"></i></span><div class="ti-kpi-v">${concl}</div><div class="ti-kpi-l">Concluídos</div></div>
        <div class="ti-kpi"><span class="ti-kpi-ic"><i data-lucide="gauge"></i></span><div class="ti-kpi-v">${progMedio}%</div><div class="ti-kpi-l">Progresso médio</div></div>
      </div>
      <div class="ti-toolbar"><div class="ti-sub">Estruture e meça os projetos de tecnologia</div>
        <button class="ti-btn primary" id="pr-new"><i data-lucide="plus"></i> Novo projeto</button></div>
      <div class="ti-cards">${ps.map(cardP).join("")}</div>`;
    },
    mount(c){
      c.querySelector("#pr-new").addEventListener("click",function(){ formP(); });
      c.querySelectorAll("[data-pr]").forEach(function(el){ el.addEventListener("click",function(){ detP(el.dataset.pr); }); });
    }
  };
  function cardP(p){
    var fasesDone=(p.fases||[]).filter(function(f){return f.done;}).length, fasesN=(p.fases||[]).length;
    return '<div class="ti-card" data-pr="'+p.id+'">'+
      '<div class="ti-card-top"><span class="ti-num">'+esc(p.responsavel||"—")+'</span>'+badge(ST,p.status)+'</div>'+
      '<div class="ti-card-t">'+esc(p.nome)+'</div>'+
      '<div class="ti-card-meta">'+badge(PRI,p.prioridade)+'<span class="ti-tag">'+fasesDone+'/'+fasesN+' fases</span></div>'+
      '<div class="mc-bar2" style="height:7px;background:#eef1f0;border-radius:5px;overflow:hidden;margin:8px 0"><span style="display:block;height:100%;width:'+(+p.progresso||0)+'%;background:#2A4A7F;border-radius:5px"></span></div>'+
      '<div class="ti-card-x"><i data-lucide="calendar"></i> '+esc(p.inicio||"")+' → '+esc(p.previsto||"")+'</div>'+
    '</div>';
  }
  function detP(id){
    var p=projs().find(function(x){return x.id===id;}); if(!p) return;
    var kv=function(k,v){ return v?'<div class="ti-kv"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>':''; };
    var fases=(p.fases||[]).map(function(f,i){ return '<label class="ti-chk" style="display:flex"><input type="checkbox" data-fase="'+i+'" '+(f.done?'checked':'')+'> '+esc(f.nome)+'</label>'; }).join("");
    var mets=(p.metricas||[]).map(function(m){ return '<div class="ti-kv"><div class="k">'+esc(m.nome)+'</div><div class="v">'+esc(m.valor)+'</div></div>'; }).join("");
    TI.side(
      '<div class="side-eyebrow">Projeto</div><h2>'+esc(p.nome)+'</h2>'+badge(ST,p.status),
      kv("Descrição",esc(p.desc))+kv("Responsável",esc(p.responsavel))+kv("Prioridade",(PRI[p.prioridade]||{}).l)+kv("Período",esc(p.inicio)+" → "+esc(p.previsto))+
      '<div class="ti-kv"><div class="k">Progresso</div><div class="v"><div style="height:8px;background:#eef1f0;border-radius:5px;overflow:hidden"><span style="display:block;height:100%;width:'+(+p.progresso||0)+'%;background:#2A4A7F"></span></div><div style="font-size:12px;color:#8a978f;margin-top:4px">'+(+p.progresso||0)+'%</div></div></div>'+
      '<div class="ti-kv"><div class="k">Fases</div><div class="v">'+fases+'</div></div>'+
      (mets?'<div class="ti-kv"><div class="k">Métricas</div><div class="v">'+mets+'</div></div>':''),
      '<button class="ti-btn" id="pr-edit"><i data-lucide="pencil"></i> Editar</button><button class="ti-btn danger" id="pr-del"><i data-lucide="trash-2"></i> Excluir</button>'
    );
    document.querySelectorAll("[data-fase]").forEach(function(cb){ cb.addEventListener("change",function(){
      var f=(p.fases||[]).slice(); f[+cb.dataset.fase]=Object.assign({},f[+cb.dataset.fase],{done:cb.checked});
      var prog=Math.round(f.filter(function(x){return x.done;}).length/f.length*100);
      S.update("ti_projetos",p.id,{fases:f,progresso:prog}); TI.toast("Atualizado"); detP(p.id);
    }); });
    document.getElementById("pr-edit").addEventListener("click",function(){ TI.closeSide(); formP(p); });
    document.getElementById("pr-del").addEventListener("click",function(){ if(confirm("Excluir projeto?")){ S.remove("ti_projetos",p.id); TI.closeSide(); TI.go("projetos"); } });
  }
  function formP(ed){
    ed=ed||{};
    var opt=function(o,c){ return Object.keys(o).map(function(k){ return '<option value="'+k+'" '+(c===k?'selected':'')+'>'+o[k].l+'</option>'; }).join(""); };
    TI.modal(ed.id?"Editar projeto":"Novo projeto",
      '<div class="ti-form"><div class="ti-fld full"><label>Nome</label><input id="pf-n" value="'+esc(ed.nome||'')+'"></div>'+
      '<div class="ti-fld full"><label>Descrição</label><textarea id="pf-d">'+esc(ed.desc||'')+'</textarea></div>'+
      '<div class="ti-fld"><label>Status</label><select id="pf-s">'+opt(ST,ed.status||'planejado')+'</select></div>'+
      '<div class="ti-fld"><label>Prioridade</label><select id="pf-p">'+opt(PRI,ed.prioridade||'media')+'</select></div>'+
      '<div class="ti-fld"><label>Responsável</label><input id="pf-r" value="'+esc(ed.responsavel||'T.I.')+'"></div>'+
      '<div class="ti-fld"><label>Progresso %</label><input id="pf-pr" type="number" min="0" max="100" value="'+(ed.progresso||0)+'"></div>'+
      '<div class="ti-fld"><label>Início</label><input id="pf-i" type="date" value="'+esc(ed.inicio||'')+'"></div>'+
      '<div class="ti-fld"><label>Previsão</label><input id="pf-pv" type="date" value="'+esc(ed.previsto||'')+'"></div>'+
      '<div class="ti-fld full"><label>Fases (uma por linha)</label><textarea id="pf-f">'+esc((ed.fases||[]).map(function(f){return f.nome;}).join("\n"))+'</textarea></div></div>',
      '<button class="ti-btn" id="pf-c">Cancelar</button><button class="ti-btn primary" id="pf-sv"><i data-lucide="save"></i> Salvar</button>');
    document.getElementById("pf-c").addEventListener("click",TI.closeModal);
    document.getElementById("pf-sv").addEventListener("click",function(){
      var v=function(id){ var e=document.getElementById(id); return e?e.value.trim():""; };
      var nome=v("pf-n"); if(!nome){ TI.toast("Informe o nome"); return; }
      var fasesTxt=v("pf-f").split("\n").map(function(x){return x.trim();}).filter(Boolean);
      var oldFases=(ed.fases||[]);
      var fases=fasesTxt.map(function(n,i){ var ex=oldFases.find(function(o){return o.nome===n;}); return {nome:n,done:ex?ex.done:false}; });
      var data={ nome:nome, desc:v("pf-d"), status:v("pf-s"), prioridade:v("pf-p"), responsavel:v("pf-r"),
        progresso:Math.max(0,Math.min(100,+v("pf-pr")||0)), inicio:v("pf-i"), previsto:v("pf-pv"), fases:fases, metricas:ed.metricas||[] };
      if(ed.id) S.update("ti_projetos",ed.id,data); else S.add("ti_projetos",Object.assign({id:"tp"+Date.now()},data));
      TI.toast("Projeto salvo"); TI.closeModal(); TI.go("projetos");
    });
  }
})();
