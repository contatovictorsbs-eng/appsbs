/* ===========================================================
   SBS Painel de Atendimento — Visão Operacional (caixa)
   window.ATEND_VIEWS.operacional
   =========================================================== */
(function(){
  window.ATEND_VIEWS = window.ATEND_VIEWS || {};
  const A = window.ATEND, esc = (s)=>ATEND.esc(s);

  let filterBrand = "all", filterStatus = "all", search = "", selectedId = null;

  const TAG_TONE = { gold:"#9A6B00,#FBF0DF", green:"#0B8A5E,#E3F4EC", teal:"#0E7E72,#E3F4F1", neutral:"#5B6470,#EEF0F2" };
  function tagStyle(tone){ var t=(TAG_TONE[tone]||TAG_TONE.neutral).split(","); return "color:"+t[0]+";background:"+t[1]; }
  const STATUS = { pendente:{l:"Pendente",c:"#C0710F",bg:"#FBEFE0"}, aberto:{l:"Em atendimento",c:"#1E73C2",bg:"#E5F0FB"}, resolvido:{l:"Resolvido",c:"#0B8A5E",bg:"#E4F5EC"} };

  function visible(){
    const scope = A.scopeBrands();
    return A.allConversas().filter(function(c){
      if(scope.indexOf(c.brand)<0) return false;
      if(filterBrand!=="all" && c.brand!==filterBrand) return false;
      if(filterStatus!=="all" && c.status!==filterStatus) return false;
      if(search){
        var q=search.toLowerCase();
        if((c.nome||"").toLowerCase().indexOf(q)<0 && (c.org||"").toLowerCase().indexOf(q)<0) return false;
      }
      return true;
    }).sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
  }

  function brandCounts(){
    const scope = A.scopeBrands(); const all = A.allConversas();
    const out = {};
    scope.forEach(function(b){ out[b]=all.filter(function(c){ return c.brand===b && c.status!=="resolvido"; }).length; });
    out.all = all.filter(function(c){ return scope.indexOf(c.brand)>=0 && c.status!=="resolvido"; }).length;
    return out;
  }

  window.ATEND_VIEWS.operacional = {
    render(){
      return ''+
      '<div class="ax-wrap">'+
        '<aside class="ax-side">'+
          '<div class="ax-side-sec">Marcas</div>'+
          '<div id="ax-brands"></div>'+
          '<div class="ax-side-sec" style="margin-top:16px">Situação</div>'+
          '<div id="ax-status"></div>'+
        '</aside>'+
        '<section class="ax-list">'+
          '<div class="ax-search"><i data-lucide="search"></i><input id="ax-q" placeholder="Buscar cliente ou empresa..."></div>'+
          '<div class="ax-rows" id="ax-rows"></div>'+
        '</section>'+
        '<section class="ax-detail" id="ax-detail"></section>'+
      '</div>';
    },
    mount(c){
      paintBrands(c); paintStatus(c); paintRows(c);
      const q = c.querySelector("#ax-q");
      q.addEventListener("input", function(){ search=this.value.trim(); paintRows(c); });
      // seleção inicial
      const vis = visible();
      if(!selectedId || !vis.find(x=>x.id===selectedId)) selectedId = vis.length?vis[0].id:null;
      paintDetail(c);
    }
  };

  function paintBrands(c){
    const counts = brandCounts(); const scope = A.scopeBrands();
    let html = brandRow("all","Todas as marcas","#15171A",counts.all);
    scope.forEach(function(b){ const br=A.brand(b); html += brandRow(b, br.name, br.color, counts[b]||0); });
    c.querySelector("#ax-brands").innerHTML = html;
    c.querySelectorAll("[data-brand]").forEach(function(el){ el.addEventListener("click", function(){ filterBrand=el.dataset.brand; selectedId=null; A.refresh(); }); });
  }
  function brandRow(id,name,color,count){
    const on = filterBrand===id;
    return '<button class="ax-brand'+(on?' on':'')+'" data-brand="'+id+'">'+
      '<span class="ax-dot" style="background:'+color+'"></span>'+
      '<span class="ax-brand-n">'+esc(name)+'</span>'+
      '<span class="ax-brand-c">'+count+'</span></button>';
  }
  function paintStatus(c){
    const tabs = [["all","Todas"],["pendente","Pendentes"],["aberto","Em atendimento"],["resolvido","Resolvidas"]];
    c.querySelector("#ax-status").innerHTML = tabs.map(function(t){
      return '<button class="ax-stat'+(filterStatus===t[0]?' on':'')+'" data-status="'+t[0]+'">'+t[1]+'</button>';
    }).join("");
    c.querySelectorAll("[data-status]").forEach(function(el){ el.addEventListener("click", function(){ filterStatus=el.dataset.status; selectedId=null; A.refresh(); }); });
  }

  function paintRows(c){
    const vis = visible();
    const box = c.querySelector("#ax-rows");
    if(!vis.length){ box.innerHTML = '<div class="ax-empty">Nenhuma conversa nesta visão.</div>'; return; }
    box.innerHTML = vis.map(function(cv){
      const br=A.brand(cv.brand), ch=A.channel(cv.channel), st=STATUS[cv.status]||STATUS.pendente;
      const last = cv.mensagens && cv.mensagens.length ? cv.mensagens[cv.mensagens.length-1].texto : "";
      return '<button class="ax-row'+(cv.id===selectedId?' on':'')+'" data-id="'+esc(cv.id)+'">'+
        '<span class="ax-row-bar" style="background:'+br.color+'"></span>'+
        '<div class="ax-row-main">'+
          '<div class="ax-row-top"><span class="ax-row-name">'+esc(cv.nome)+'</span><span class="ax-row-time">'+A.ago(cv.ts)+'</span></div>'+
          '<div class="ax-row-snip">'+esc(last).slice(0,72)+'</div>'+
          '<div class="ax-row-meta"><span class="ax-chip" style="'+chTone(cv.brand)+'"><i data-lucide="'+ch.icon+'"></i>'+esc(ch.name)+'</span>'+
            '<span class="ax-srow" style="color:'+st.c+'">'+st.l+'</span>'+
            (cv.unread?'<span class="ax-unread">'+cv.unread+'</span>':'')+'</div>'+
        '</div></button>';
    }).join("");
    A.icons();
    box.querySelectorAll("[data-id]").forEach(function(el){ el.addEventListener("click", function(){ selectedId=el.dataset.id; paintRows(c); paintDetail(c); }); });
  }
  function chTone(brandId){ const b=A.brand(brandId); return "color:"+b.color+";background:"+b.soft; }

  function paintDetail(c){
    const box = c.querySelector("#ax-detail");
    const cv = A.allConversas().find(x=>x.id===selectedId);
    if(!cv){ box.innerHTML = '<div class="ax-nodetail"><i data-lucide="inbox"></i><div>Selecione uma conversa</div></div>'; A.icons(); return; }
    const br=A.brand(cv.brand), ch=A.channel(cv.channel), st=STATUS[cv.status]||STATUS.pendente;
    const isApp = !!cv._app;
    const ag = cv.agente ? (A.agentes().find(a=>a.id===cv.agente)||{}).nome : "";
    box.innerHTML = ''+
      '<div class="ax-dh">'+
        '<div class="ax-dh-l">'+
          '<span class="ax-dh-av" style="background:'+br.color+'">'+esc(cv.nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase())+'</span>'+
          '<div><div class="ax-dh-name">'+esc(cv.nome)+(cv.org?' <span class="ax-dh-org">· '+esc(cv.org)+'</span>':'')+'</div>'+
            '<div class="ax-dh-sub"><span class="ax-dot sm" style="background:'+br.color+'"></span>'+esc(br.name)+' · <i data-lucide="'+ch.icon+'" class="ax-ic"></i> '+esc(ch.name)+(cv.contato&&cv.contato.local?' · '+esc(cv.contato.local):'')+'</div></div>'+
        '</div>'+
        '<div class="ax-dh-r"><span class="ax-badge" style="color:'+st.c+';background:'+st.bg+'">'+st.l+'</span></div>'+
      '</div>'+
      '<div class="ax-tags">'+(cv.tags||[]).filter(t=>t.label).map(function(t){ return '<span class="ax-tag" style="'+tagStyle(t.tone)+'">'+esc(t.label)+'</span>'; }).join("")+
        (ag?'<span class="ax-tag" style="color:#5B6470;background:#EEF0F2">Atendente: '+esc(ag)+'</span>':'')+'</div>'+
      '<div class="ax-thread" id="ax-thread">'+
        (cv.mensagens||[]).map(function(m){
          const mine = m.de==="agente";
          return '<div class="ax-msg '+(mine?'me':'them')+'"><div class="ax-bubble">'+esc(m.texto)+'<span class="ax-time">'+esc(m.hora||"")+'</span></div></div>';
        }).join("")+
      '</div>'+
      (isApp
        ? '<div class="ax-appbar"><span><i data-lucide="link"></i> Item vindo do app ('+(cv._app==="reclamacao"?"Reclamação":"Chamado")+'). Tratativa completa no Painel Gerencial.</span>'+
            (cv.status!=="resolvido"?'<button class="ax-btn ok" data-resolve-app="1">Marcar resolvido</button>':'')+'</div>'
        : '<div class="ax-reply">'+
            '<textarea id="ax-draft" placeholder="Escreva uma resposta para '+esc(cv.nome)+'..."></textarea>'+
            '<div class="ax-reply-acts">'+
              '<div class="ax-reply-l">'+
                (cv.agente!==A.currentAgentId?'<button class="ax-btn ghost" data-assign="1"><i data-lucide="user-plus"></i> Atribuir a mim</button>':'')+
                (cv.status!=="resolvido"?'<button class="ax-btn ghost ok" data-resolve="1"><i data-lucide="check"></i> Resolver</button>':'<button class="ax-btn ghost" data-reopen="1"><i data-lucide="rotate-ccw"></i> Reabrir</button>')+
              '</div>'+
              '<button class="ax-btn send" data-send="1"><i data-lucide="send"></i> Enviar</button>'+
            '</div>'+
          '</div>');
    A.icons();
    const thread = box.querySelector("#ax-thread"); if(thread) thread.scrollTop = thread.scrollHeight;
    wireDetail(c, cv);
  }

  function wireDetail(c, cv){
    const box = c.querySelector("#ax-detail");
    const send = box.querySelector("[data-send]");
    if(send) send.addEventListener("click", function(){
      const ta = box.querySelector("#ax-draft"); const txt=(ta.value||"").trim(); if(!txt) return;
      const arr = A.conversas(); const i = arr.findIndex(x=>x.id===cv.id); if(i<0) return;
      const hora = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
      arr[i] = Object.assign({}, arr[i]);
      arr[i].mensagens = (arr[i].mensagens||[]).concat([{ de:"agente", texto:txt, hora:hora }]);
      arr[i].status = "aberto"; arr[i].agente = A.currentAgentId; arr[i].unread = 0; arr[i].ts = Date.now();
      A.S.setCol("atend_conversas", arr);
      A.refresh();
    });
    const assign = box.querySelector("[data-assign]");
    if(assign) assign.addEventListener("click", function(){ patch(cv, { agente:A.currentAgentId, status:cv.status==="pendente"?"aberto":cv.status }); A.toast("Conversa atribuída a você"); });
    const resolve = box.querySelector("[data-resolve]");
    if(resolve) resolve.addEventListener("click", function(){ patch(cv, { status:"resolvido", unread:0 }); A.toast("Conversa resolvida"); });
    const reopen = box.querySelector("[data-reopen]");
    if(reopen) reopen.addEventListener("click", function(){ patch(cv, { status:"aberto" }); A.toast("Conversa reaberta"); });
    const resolveApp = box.querySelector("[data-resolve-app]");
    if(resolveApp) resolveApp.addEventListener("click", function(){
      if(cv._app==="reclamacao") A.S.update("reclamacoes", cv._ref, { status:"resolvido", etapa:"Retorno ao cliente" });
      else A.S.update("chamados", cv._ref, { status:"resolvido" });
      A.toast("Item do app marcado como resolvido"); A.refresh();
    });
  }
  function patch(cv, p){
    const arr = A.conversas(); const i = arr.findIndex(x=>x.id===cv.id); if(i<0) return;
    arr[i] = Object.assign({}, arr[i], p); A.S.setCol("atend_conversas", arr); A.refresh();
  }
})();
