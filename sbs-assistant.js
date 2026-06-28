/* ===========================================================
   SBS — Assistente Virtual (insights) · compartilhado
   Botão flutuante + painel. Lê os dados da plataforma (store) e
   gera insights via window.claude.complete. NÃO aparece no app do
   colaborador (não incluir o script lá).
   =========================================================== */
(function(){
  var PLAT = (function(){ var m=document.querySelector('meta[name="sbs-platform"]'); return m?m.getAttribute("content"):""; })();
  if(PLAT==="colaborador") return; // sem assistente no app do funcionário

  var NAMES = { vendedor:"Portal do Vendedor", gerencial:"Painel Gerencial", ti:"Painel de T.I.", ceo:"Painel do CEO", atendimento:"Central de Atendimento", marketing:"Marketing", pd:"P&D / Inovação", rh:"RH" };
  var platNome = NAMES[PLAT]||"Sistema SBS";

  function S(){ return window.SBSStore; }
  function n(c){ return (S()&&S().getCol(c)||[]).length; }
  function money(v){ v=Number(v||0); if(v>=1e6) return "R$ "+(v/1e6).toFixed(1)+" mi"; if(v>=1e3) return "R$ "+(v/1e3).toFixed(0)+" mil"; return "R$ "+v; }

  /* fala com a IA: no preview usa window.claude; no site publicado usa a função de backend */
  async function askAI(prompt){
    if(window.claude && window.claude.complete){
      try{ var r=await window.claude.complete(prompt); if(r) return r; }catch(e){}
    }
    var resp=await fetch("/.netlify/functions/assistente",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt:prompt}) });
    if(!resp.ok) throw new Error("http "+resp.status);
    var j=await resp.json();
    return j.text||j.completion||j.error||"";
  }

  /* funcionalidades do painel (da Central de Ajuda) — para responder ‘como faço X’ */
  function docsResumo(){
    try{
      var d=window.SBS_DOCS&&SBS_DOCS.plataformas&&SBS_DOCS.plataformas[PLAT];
      if(!d) return "";
      var grupos=d.grupos||(d.itens?[{itens:d.itens}]:[]);
      var linhas=[];
      grupos.forEach(function(g){ (g.itens||[]).forEach(function(it){ if(it.titulo) linhas.push("- "+it.titulo+(it.resumo?(": "+it.resumo):"")); }); });
      return linhas.length? ("\nFUNCIONALIDADES DESTE PAINEL (para orientar o uso):\n"+linhas.slice(0,40).join("\n")) : "";
    }catch(e){ return ""; }
  }

  /* resumo por setor (cada painel vê só o seu; T.I. e CEO veem tudo) */
  function secComercial(g){
    var ped=g("pedidos"), fat=0,cart=0; ped.forEach(function(p){ if((p.status||"")==="faturado") fat+=+p.valor||0; else cart+=+p.valor||0; });
    var byV={}; ped.forEach(function(p){ var k=p.vendedor||"—"; byV[k]=(byV[k]||0)+(+p.valor||0); });
    var rank=Object.keys(byV).sort(function(a,b){return byV[b]-byV[a];}).slice(0,5);
    return "[COMERCIAL] Pedidos: "+ped.length+" | Faturado: "+money(fat)+" | Carteira: "+money(cart)+
      "\nTop vendedores: "+rank.map(function(k){return k+" ("+money(byV[k])+")";}).join(", ")+
      "\nReclamações abertas: "+g("reclamacoes").filter(function(r){return r.status!=="resolvido";}).length;
  }
  function secAtendimento(g){
    var cv=g("atend_conversas");
    return "[ATENDIMENTO] Conversas: "+cv.length+" | Pendentes: "+cv.filter(function(c){return c.status==="pendente";}).length+" | Em atendimento: "+cv.filter(function(c){return c.status==="aberto";}).length+" | Resolvidas: "+cv.filter(function(c){return c.status==="resolvido";}).length;
  }
  function secMarketing(g){
    var camp=g("mkt_campanhas").filter(function(c){return c.id;});
    var soc=g("mkt_social");
    return "[MARKETING] Campanhas: "+camp.length+" (ativas: "+camp.filter(function(c){return c.status==="ativa";}).length+") | Verba ativa: "+money(camp.filter(function(c){return c.status==="ativa";}).reduce(function(s,c){return s+(+c.verba||0);},0))+
      "\nSeguidores: "+soc.reduce(function(s,c){return s+(+c.seguidores||0);},0)+" | Eventos: "+n("mkt_eventos")+" | Conteúdos: "+n("mkt_conteudo");
  }
  function secPD(g){
    var pj=g("pd_projetos"), fases={}; pj.forEach(function(p){ fases[p.fase]=(fases[p.fase]||0)+1; });
    return "[P&D] Projetos: "+pj.length+" por fase "+JSON.stringify(fases)+
      "\nEnsaios: "+n("pd_ensaios")+" | Cultivares: "+n("pd_cultivares")+" | Ideias: "+n("pd_ideias");
  }
  function secRH(g){
    var vg=g("rh_vagas");
    return "[RH] Vagas: "+vg.length+" (abertas: "+vg.filter(function(v){return v.status!=="fechada";}).length+") | Candidatos: "+n("rh_candidatos")+" | Colaboradores ativos: "+g("rh_colaboradores").filter(function(c){return c.status==="ativo";}).length;
  }
  function secTI(g, st){
    var fe=g("features"), pl=g("plataformas");
    return "[SISTEMA] Features: "+fe.filter(function(f){return f.enabled;}).length+"/"+fe.length+" ligadas | GMuds em aberto: "+g("gmuds").filter(function(x){return x.status!=="concluida"&&x.status!=="cancelada";}).length+" | Versão: "+((st.get("sistema_meta")||{}).versao||"—")+" | Plataformas ativas: "+pl.filter(function(p){return p.enabled!==false;}).length+"/"+pl.length;
  }

  function contexto(){
    var st=S(); if(!st) return "Sem dados.";
    var g=function(c){ return st.getCol(c)||[]; };
    // T.I. e CEO: acesso a TODOS os setores
    if(PLAT==="ti"||PLAT==="ceo"){
      return [secComercial(g),secAtendimento(g),secMarketing(g),secPD(g),secRH(g),secTI(g,st)].join("\n\n");
    }
    // demais: apenas o próprio setor
    if(PLAT==="gerencial"||PLAT==="vendedor") return secComercial(g);
    if(PLAT==="atendimento") return secAtendimento(g)+"\nReclamações do app abertas: "+g("reclamacoes").filter(function(r){return r.status!=="resolvido";}).length;
    if(PLAT==="marketing") return secMarketing(g);
    if(PLAT==="pd") return secPD(g)+"\nReclamações de campo (insumo): "+g("reclamacoes").filter(function(r){return r.status!=="resolvido";}).length;
    if(PLAT==="rh") return secRH(g);
    return "Sem dados deste setor.";
  }

  var SUG = {
    gerencial:["Resumo do dia","Quem está abaixo da meta?","Riscos na carteira"],
    ceo:["Visão executiva geral","3 pontos de atenção","Comparar os setores"],
    vendedor:["Minhas prioridades hoje","Onde focar para bater meta"],
    atendimento:["Fila crítica agora","Resumo do atendimento"],
    marketing:["Desempenho das campanhas","O que priorizar"],
    pd:["Status do pipeline","Riscos nos projetos"],
    rh:["Resumo do recrutamento","Gargalos na seleção"],
    ti:["Saúde do sistema","Pendências de GMud","Visão de todos os setores"]
  };

  function injectCss(){
    if(document.getElementById("sbs-as-css")) return;
    var st=document.createElement("style"); st.id="sbs-as-css";
    st.textContent=
      '.sbs-as-fab{position:fixed;right:22px;bottom:22px;z-index:90000;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(150deg,#0E9B8E,#0B6B61);color:#fff;box-shadow:0 10px 26px rgba(11,107,97,.4);display:flex;align-items:center;justify-content:center;font-family:inherit}'+
      '.sbs-as-fab svg{width:25px;height:25px}'+
      '.sbs-as-fab .pip{position:absolute;top:-3px;right:-3px;background:#E5A019;color:#fff;font-size:9px;font-weight:800;border-radius:9px;padding:1px 5px;border:2px solid #fff}'+
      '.sbs-as-panel{position:fixed;right:22px;bottom:88px;z-index:90001;width:380px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 130px);background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.32);display:none;flex-direction:column;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}'+
      '.sbs-as-panel.open{display:flex}'+
      '.sbs-as-head{background:linear-gradient(150deg,#0E9B8E,#0B6B61);color:#fff;padding:15px 18px;display:flex;align-items:center;gap:11px}'+
      '.sbs-as-head .ic{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.18);display:grid;place-items:center}'+
      '.sbs-as-head .ic svg{width:19px;height:19px}'+
      '.sbs-as-head .t1{font-size:15px;font-weight:800;line-height:1.1}'+
      '.sbs-as-head .t2{font-size:11px;opacity:.85}'+
      '.sbs-as-x{margin-left:auto;cursor:pointer;opacity:.85}.sbs-as-x svg{width:20px;height:20px}'+
      '.sbs-as-body{flex:1;overflow-y:auto;padding:16px;background:#f6f8f7;display:flex;flex-direction:column;gap:11px}'+
      '.sbs-as-msg{max-width:88%;padding:11px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;white-space:pre-wrap}'+
      '.sbs-as-msg.bot{background:#fff;border:1px solid #e6ebe9;align-self:flex-start;border-bottom-left-radius:4px;color:#16201a}'+
      '.sbs-as-msg.me{background:#0B6B61;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}'+
      '.sbs-as-msg.bot b{color:#0B6B61}'+
      '.sbs-as-typing{font-size:12px;color:#6b7a74;align-self:flex-start;padding:4px 6px}'+
      '.sbs-as-sug{display:flex;flex-wrap:wrap;gap:7px;padding:10px 14px;border-top:1px solid #eef1f0;background:#fff}'+
      '.sbs-as-sug button{border:1px solid #d6ddd9;background:#fff;color:#0B6B61;border-radius:18px;padding:7px 12px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer}'+
      '.sbs-as-sug button:hover{background:#E9F3EF}'+
      '.sbs-as-input{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #eef1f0;background:#fff}'+
      '.sbs-as-input input{flex:1;border:1.5px solid #e0e5e2;border-radius:22px;padding:10px 15px;font-family:inherit;font-size:13.5px;outline:none}'+
      '.sbs-as-input input:focus{border-color:#0B6B61}'+
      '.sbs-as-input button{width:42px;height:42px;border-radius:50%;border:0;background:#0B6B61;color:#fff;cursor:pointer;flex:0 0 auto;display:grid;place-items:center}'+
      '.sbs-as-input button svg{width:17px;height:17px}'+
      '.sbs-as-input button:disabled{opacity:.5}';
    document.head.appendChild(st);
  }

  var openedOnce=false;
  function build(){
    injectCss();
    var fab=document.createElement("button"); fab.className="sbs-as-fab"; fab.title="Assistente SBS";
    fab.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg><span class="pip">IA</span>';
    document.body.appendChild(fab);

    var panel=document.createElement("div"); panel.className="sbs-as-panel";
    panel.innerHTML=
      '<div class="sbs-as-head"><span class="ic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></span>'+
        '<div><div class="t1">Assistente SBS</div><div class="t2">'+((PLAT==="ti"||PLAT==="ceo")?"Insights · todos os setores":"Insights · "+platNome)+'</div></div>'+
        '<span class="sbs-as-x" id="sbs-as-x"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></div>'+
      '<div class="sbs-as-body" id="sbs-as-body"></div>'+
      '<div class="sbs-as-sug" id="sbs-as-sug"></div>'+
      '<div class="sbs-as-input"><input id="sbs-as-in" placeholder="Pergunte sobre os dados..." autocomplete="off"><button id="sbs-as-send"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div>';
    document.body.appendChild(panel);

    var body=panel.querySelector("#sbs-as-body");
    var input=panel.querySelector("#sbs-as-in");
    var sendBtn=panel.querySelector("#sbs-as-send");

    function add(role, text){ var d=document.createElement("div"); d.className="sbs-as-msg "+(role==="me"?"me":"bot"); d.innerHTML=role==="me"?escape(text):format(text); body.appendChild(d); body.scrollTop=body.scrollHeight; return d; }
    function escape(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function format(s){ return escape(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^[-•]\s/gm,"• "); }

    function suggestions(){
      var sug=panel.querySelector("#sbs-as-sug"); var arr=SUG[PLAT]||["Resumo dos dados","Pontos de atenção"];
      sug.innerHTML=arr.map(function(s){ return '<button>'+s+'</button>'; }).join("");
      sug.querySelectorAll("button").forEach(function(b){ b.addEventListener("click",function(){ ask(b.textContent); }); });
    }

    var busy=false;
    async function ask(q){
      if(busy||!q) return; busy=true; input.value=""; sendBtn.disabled=true;
      add("me",q);
      var typing=document.createElement("div"); typing.className="sbs-as-typing"; typing.textContent="Analisando os dados…"; body.appendChild(typing); body.scrollTop=body.scrollHeight;
      var allAccess = (PLAT==="ti"||PLAT==="ceo");
      var prompt="Você é o Assistente SBS, um analista de negócios do agronegócio (sementes) integrado ao "+platNome+" da empresa SBS Green Seeds. "+
        "Responda em português do Brasil, de forma curta, direta e prática (linguagem de campo, sem jargão técnico). "+
        "Você ajuda em DUAS frentes: (1) gerar insights a partir dos DADOS ATUAIS; (2) ensinar a USAR o sistema, com base na lista de funcionalidades. "+
        "Quando útil, traga 2-4 bullets. Não invente números que não estão nos dados.\n"+
        (allAccess
          ? "Você tem visão GLOBAL de todos os setores (T.I./Diretoria). Pode cruzar informações entre eles.\n"
          : "IMPORTANTE: sobre DADOS você responde apenas sobre o setor deste painel ("+platNome+"). Se perguntarem dados de outro setor, diga que estão em outro painel (só T.I./Diretoria têm visão geral). Dúvidas de COMO USAR este painel pode responder sempre.\n")+
        docsResumo()+
        "\n\nDADOS ATUAIS:\n"+contexto()+"\n\nPergunta do usuário: "+q;
      try{
        var resp=await askAI(prompt);
        typing.remove(); add("bot", resp||"Não consegui gerar agora. Tente novamente.");
      }catch(e){
        typing.remove(); add("bot","Não foi possível falar com a IA agora. Verifique a conexão e tente de novo.");
      }
      busy=false; sendBtn.disabled=false; input.focus();
    }

    fab.addEventListener("click",function(){
      panel.classList.toggle("open");
      if(panel.classList.contains("open")){
        input.focus();
        if(!openedOnce){ openedOnce=true; suggestions(); add("bot","Olá! Sou o **Assistente SBS**. Posso analisar os dados do "+platNome+" e trazer insights. Escolha uma sugestão abaixo ou faça uma pergunta."); }
      }
    });
    panel.querySelector("#sbs-as-x").addEventListener("click",function(){ panel.classList.remove("open"); });
    sendBtn.addEventListener("click",function(){ ask(input.value.trim()); });
    input.addEventListener("keydown",function(e){ if(e.key==="Enter") ask(input.value.trim()); });

    // permite abrir o assistente de qualquer lugar (ex.: item de menu)
    window.SBS_ASSIST = {
      open:function(){ if(!panel.classList.contains("open")){ fab.click(); } else { input.focus(); } },
      ask:function(q){ if(!panel.classList.contains("open")) fab.click(); ask(q); }
    };

    injectNavItem();
  }

  /* item de menu "Assistente IA" na sidebar de cada painel (estilo clonado dos itens existentes) */
  function injectNavItem(){
    function add(){
      var nav=document.getElementById("nav"); if(!nav) return;
      if(nav.querySelector("[data-assist-item]")) return;
      var sample=nav.querySelector("[data-nav], .nav-item, a"); if(!sample) return;
      var el=document.createElement(sample.tagName.toLowerCase());
      el.className=sample.className.replace(/\bactive\b|\bon\b/g,"").trim();
      el.setAttribute("data-assist-item","1");
      el.style.cursor="pointer";
      el.innerHTML='<i data-lucide="sparkles"></i><span>Assistente IA</span>';
      el.addEventListener("click",function(e){ e.preventDefault(); e.stopImmediatePropagation(); window.SBS_ASSIST&&SBS_ASSIST.open(); }, true);
      nav.appendChild(el);
      window.lucide&&lucide.createIcons();
    }
    add();
    try{
      var nav=document.getElementById("nav");
      if(nav){ var mo=new MutationObserver(function(){ if(!nav.querySelector("[data-assist-item]")) add(); }); mo.observe(nav,{childList:true}); }
    }catch(e){}
  }

  if(document.readyState!=="loading") setTimeout(build,300);
  else document.addEventListener("DOMContentLoaded",function(){ setTimeout(build,300); });
})();
