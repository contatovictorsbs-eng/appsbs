/* ===========================================================
   SBS — Anel de Liberação (Homologação → Produção)   ·  custo zero
   -----------------------------------------------------------
   Permite construir uma funcionalidade nova, validá-la primeiro
   em HOMOLOGAÇÃO e só depois "soltar" para PRODUÇÃO — com 1 clique
   no Painel de T.I. (módulo "Lançamentos").

   Como funciona:
     • Cada funcionalidade controlada vira uma entrada na coleção
       de nuvem "releases": { id, label, grupo, stage, ... }.
     • stage = "homolog"  → aparece SÓ no ambiente de homologação.
       stage = "prod"     → liberada para todos (produção também).
     • Um id que NÃO está no catálogo é considerado LIBERADO
       (não esconde nada do que já existe hoje).

   Em HOMOLOGAÇÃO tudo aparece (é o ambiente de testes).
   Em PRODUÇÃO some o que ainda está em "homolog".

   O esconder é automático: qualquer elemento marcado com
     data-release-id="x"   (ou data-nav / data-go / data-id / data-tab
     cujo valor seja um id em "homolog")
   é ocultado em produção. Não precisa mexer em cada tela.

   DEVE carregar DEPOIS de sbs-ambiente.js e sbs-store.js.
   =========================================================== */
(function(){
  var COL = "releases";
  function S(){ return window.SBSStore; }
  function isHomolog(){ return !!(window.SBS_ENV && window.SBS_ENV.isHomolog); }
  function today(){ var s=S(); return (s&&s.today)?s.today():new Date().toISOString().slice(0,10); }

  function list(){ var s=S(); return s ? (s.getCol(COL)||[]) : []; }
  function find(id){ return list().find(function(r){ return r.id===id; }); }
  function stage(id){ var r=find(id); return r ? r.stage : "prod"; }   // desconhecido = liberado

  // a funcionalidade aparece para este ambiente?
  function visible(id){
    if(isHomolog()) return true;          // homologação vê tudo
    return stage(id) !== "homolog";        // produção só o que foi liberado
  }

  // registra uma feature nova (idempotente). Novas nascem em "homolog".
  function ensure(id, meta){
    var s=S(); if(!s||!id) return;
    if(find(id)) return;
    var cur=list();
    cur.unshift(Object.assign({ id:id, label:id, grupo:"Geral", stage:"homolog", criadoEm:today() }, meta||{}));
    s.setCol(COL, cur);
  }

  function setStage(id, st, quem){
    var s=S(); var cur=list(); var r=cur.find(function(x){ return x.id===id; }); if(!r||!s) return;
    r.stage = st;
    if(st==="prod"){ r.liberadoEm=today(); r.liberadoPor=quem||"T.I."; }
    else { r.recolhidoEm=today(); r.recolhidoPor=quem||"T.I."; }
    s.setCol(COL, cur);
    regate();
  }

  function remove(id){
    var s=S(); if(!s) return;
    s.setCol(COL, list().filter(function(r){ return r.id!==id; }));
    regate();
  }

  // ---- esconde no DOM o que está em homolog (só em produção) ----
  var SEL = "[data-release-id],[data-nav],[data-go],[data-id],[data-tab],[data-mod]";
  function idOf(el){
    return el.getAttribute("data-release-id")||el.getAttribute("data-nav")||
           el.getAttribute("data-go")||el.getAttribute("data-id")||
           el.getAttribute("data-tab")||el.getAttribute("data-mod");
  }
  function gateDom(root){
    if(isHomolog()) return;                 // homologação não esconde nada
    root = root||document;
    var hidden = {};
    list().forEach(function(r){ if(r.stage==="homolog") hidden[r.id]=1; });
    if(!Object.keys(hidden).length) return;
    var els = root.querySelectorAll(SEL);
    for(var i=0;i<els.length;i++){
      var id = idOf(els[i]);
      if(id && hidden[id]) els[i].style.display="none";
    }
  }
  var _raf=0;
  function regate(){
    if(isHomolog()) return;
    if(_raf) return;
    _raf = (window.requestAnimationFrame||setTimeout)(function(){ _raf=0; gateDom(document); }, 16);
  }
  function watch(){
    if(isHomolog()) return;
    try{
      var mo=new MutationObserver(function(){ regate(); });
      mo.observe(document.documentElement,{childList:true,subtree:true});
    }catch(e){}
    if(document.body) gateDom(document);
    else document.addEventListener("DOMContentLoaded", function(){ gateDom(document); });
    // re-sincroniza quando a nuvem trouxer mudanças de "releases"
    try{ S() && S().onChange && S().onChange(function(d){ if(!d||d.key===COL) regate(); }); }catch(e){}
  }

  window.SBS_RELEASE = {
    COL: COL, list: list, find: find, stage: stage, visible: visible,
    ensure: ensure, setStage: setStage, remove: remove, gateDom: gateDom, regate: regate,
    isHomolog: isHomolog
  };

  watch();
})();
