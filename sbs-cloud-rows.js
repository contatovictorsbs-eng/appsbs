/* ===========================================================
   SBS — Sincronização por LINHA (anti-conflito)   ·  FASE 2
   -----------------------------------------------------------
   Hoje cada alteração regrava a COLEÇÃO inteira na nuvem; dois
   editores ao mesmo tempo podem sobrescrever um ao outro.
   Esta camada grava SÓ o registro alterado (row-level), então
   edições simultâneas em itens diferentes não se atropelam.

   • Coleções (arrays) → cada item vira uma linha  r:<col>:<id>
   • Valores avulsos    → uma linha               k:<chave>

   SEGURANÇA: só roda em HOMOLOGAÇÃO e só quando ligado
   (localStorage "sbs_rowsync"==="1"). Em produção NUNCA roda.
   Quando ativo, faz o sbs-cloud.js (modo coleção) ficar em
   standby para não haver dupla escrita.

   Carregar DEPOIS de sbs-store.js e sbs-cloud.js.
   =========================================================== */
(function(){
  var ENV = window.SBS_ENV || {};
  var ligado = false;
  try{ ligado = localStorage.getItem("sbs_rowsync")==="1"; }catch(e){}
  // só homologação + ligado explicitamente
  if(!(ENV.isHomolog && ligado)) return;

  var cfg = window.SBS_BACKEND || {};
  if(!cfg.url || !cfg.anonKey) return;     // sem nuvem, nada a fazer

  // avisa o sbs-cloud.js (modo coleção) para entrar em standby
  window.SBS_CLOUD_ROWS_ON = true;

  var NS = ENV.ns || "sbsdbh:";
  var PFX = ENV.cloudPrefix || "hml:";     // isolamento do ambiente
  var sb = null;
  var snaps = {};            // col -> { id: jsonString }  (para diff)
  var pushing = {};          // cloudKey -> true  (evita eco)
  var applyingRemote = false;
  var WAIT = 350, pendentes = {};

  function status(msg, ready){ window.SBS_CLOUD = { on:true, ready:!!ready, mode:"row", msg:msg }; }
  status("conectando (linha)…", false);

  loadSDK("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js", init);
  function loadSDK(src, cb){
    if(window.supabase){ cb(); return; }
    var s=document.createElement("script"); s.src=src; s.onload=cb;
    s.onerror=function(){ status("falha ao carregar SDK", false); };
    document.head.appendChild(s);
  }

  function cloudKey(col, id){ return PFX + "r:" + col + ":" + id; }
  function kKey(key){ return PFX + "k:" + key; }
  function isArr(v){ return Object.prototype.toString.call(v)==="[object Array]"; }
  function localKeys(){
    var out=[]; try{ out=Object.keys(localStorage).filter(function(k){ return k.indexOf(NS)===0; }); }catch(e){}
    return out.map(function(k){ return k.slice(NS.length); });
  }
  function readLocal(key){ try{ var v=localStorage.getItem(NS+key); return v?JSON.parse(v):null; }catch(e){ return null; } }
  function writeLocal(key, val){
    applyingRemote = true;
    try{ localStorage.setItem(NS+key, JSON.stringify(val)); }catch(e){}
    try{ window.dispatchEvent(new CustomEvent("sbsdb-change",{ detail:{ key:key, remote:true } })); }catch(e){}
    applyingRemote = false;
  }

  function init(){
    try{ sb = window.supabase.createClient(cfg.url, cfg.anonKey, { realtime:{ params:{ eventsPerSecond:6 } } }); }
    catch(e){ status("erro de configuração", false); return; }

    // 1) baixa todas as linhas do ambiente e reconstrói as coleções
    sb.from("sbs_kv").select("key,value").then(function(res){
      if(res.error){ status("erro: "+res.error.message, false); return; }
      var rows = (res.data||[]).filter(function(r){ return r.key && r.key.indexOf(PFX)===0; });
      if(!rows.length){ seedRows(); status("sincronizado (linha)", true); subscribe(); return; }

      var cols = {};   // col -> { id: value }
      rows.forEach(function(r){
        var key = r.key.slice(PFX.length);
        if(key.indexOf("r:")===0){
          var rest = key.slice(2), ci = rest.indexOf(":");
          if(ci<0) return;
          var col = rest.slice(0,ci), id = rest.slice(ci+1);
          (cols[col]=cols[col]||{})[id] = r.value;
        } else if(key.indexOf("k:")===0){
          writeLocal(key.slice(2), r.value);
        }
      });
      Object.keys(cols).forEach(function(col){
        var map = cols[col], arr = Object.keys(map).map(function(id){ return map[id]; });
        writeLocal(col, arr);
        snaps[col] = {}; Object.keys(map).forEach(function(id){ snaps[col][id] = JSON.stringify(map[id]); });
      });
      status("sincronizado (linha)", true);
      subscribe();
    });

    // 2) mudança local → envia só o que mudou (coalescido)
    window.addEventListener("sbsdb-change", function(e){
      if(applyingRemote) return;
      var d = e.detail||{}; if(d.remote) return;
      var key = d.key; if(!key) return;
      if(pendentes[key]) clearTimeout(pendentes[key]);
      pendentes[key] = setTimeout(function(){ pendentes[key]=null; enviar(key); }, WAIT);
    });
    function flush(){ Object.keys(pendentes).forEach(function(k){ if(pendentes[k]){ clearTimeout(pendentes[k]); pendentes[k]=null; enviar(k); } }); }
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", function(){ if(document.hidden) flush(); });
  }

  // envia uma chave: array → diff por item; avulso → uma linha
  function enviar(key){
    var val = readLocal(key);
    if(val==null) return;
    if(isArr(val)){
      var prev = snaps[key] || {}, now = {};
      val.forEach(function(it){
        var id = it && (it.id!=null ? it.id : it.uid);
        if(id==null) return;                       // sem id: não dá para isolar a linha
        now[id] = JSON.stringify(it);
        if(prev[id] !== now[id]){
          var ck = cloudKey(key, id); pushing[ck]=true;
          sb.from("sbs_kv").upsert({ key:ck, value:it, updated_at:new Date().toISOString() })
            .then(function(){ setTimeout(function(){ pushing[ck]=false; }, 400); });
        }
      });
      // itens removidos → apaga a linha
      Object.keys(prev).forEach(function(id){
        if(!(id in now)){
          var ck = cloudKey(key, id); pushing[ck]=true;
          sb.from("sbs_kv").delete().eq("key", ck).then(function(){ setTimeout(function(){ pushing[ck]=false; }, 400); });
        }
      });
      snaps[key] = now;
    } else {
      var ck = kKey(key); pushing[ck]=true;
      sb.from("sbs_kv").upsert({ key:ck, value:val, updated_at:new Date().toISOString() })
        .then(function(){ setTimeout(function(){ pushing[ck]=false; }, 400); });
    }
  }

  // tempo real: linha mudou na nuvem → ajusta só aquele item
  function subscribe(){
    sb.channel("sbs_kv_rows")
      .on("postgres_changes", { event:"*", schema:"public", table:"sbs_kv" }, function(p){
        var row = p.new || p.old; if(!row || !row.key) return;
        if(row.key.indexOf(PFX)!==0) return;          // outro ambiente
        if(pushing[row.key]) return;                  // fui eu
        var key = row.key.slice(PFX.length);
        if(key.indexOf("r:")===0){
          var rest=key.slice(2), ci=rest.indexOf(":"); if(ci<0) return;
          var col=rest.slice(0,ci), id=rest.slice(ci+1);
          var arr = readLocal(col) || []; var i = arr.findIndex(function(x){ return String(x.id!=null?x.id:x.uid)===String(id); });
          if(p.eventType==="DELETE" || p.event==="DELETE"){ if(i>=0){ arr.splice(i,1); } }
          else { if(i>=0) arr[i]=p.new.value; else arr.unshift(p.new.value); }
          writeLocal(col, arr);
          snaps[col]=snaps[col]||{};
          if(p.eventType==="DELETE"||p.event==="DELETE") delete snaps[col][id]; else snaps[col][id]=JSON.stringify(p.new.value);
        } else if(key.indexOf("k:")===0 && p.new){
          writeLocal(key.slice(2), p.new.value);
        }
      })
      .subscribe();
  }

  // nuvem vazia → semeia com o estado local atual (vira linhas)
  function seedRows(){
    localKeys().forEach(function(key){
      if(key.indexOf("__")===0) return;             // chaves de controle locais
      var val = readLocal(key);
      if(val==null) return;
      if(isArr(val)){
        snaps[key]={};
        val.forEach(function(it){
          var id = it && (it.id!=null?it.id:it.uid); if(id==null) return;
          snaps[key][id]=JSON.stringify(it);
          var ck=cloudKey(key,id); pushing[ck]=true;
          sb.from("sbs_kv").upsert({ key:ck, value:it }).then(function(){ setTimeout(function(){ pushing[ck]=false; }, 400); });
        });
      } else {
        var ck=kKey(key); pushing[ck]=true;
        sb.from("sbs_kv").upsert({ key:ck, value:val }).then(function(){ setTimeout(function(){ pushing[ck]=false; }, 400); });
      }
    });
  }
})();
