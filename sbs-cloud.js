/* ===========================================================
   SBS — Adaptador de nuvem (Supabase)  ·  sincroniza a store
   -----------------------------------------------------------
   Mantém o localStorage (cache síncrono que o app já usa) em
   sincronia com uma tabela única `sbs_kv` no Supabase:

     • Ao abrir: baixa os dados da nuvem → grava no localStorage
     • Ao gravar (painel/app): envia a alteração para a nuvem
     • Tempo real: alteração na nuvem → atualiza os outros aparelhos

   Mapeia 1:1 o modelo chave→JSON da store. Se SBS_BACKEND não
   estiver configurado, não faz nada (modo local).
   =========================================================== */
(function(){
  var cfg = window.SBS_BACKEND || {};
  var statusEl = null;
  function setStatus(txt, ok){
    // marca um atributo global que a UI pode exibir
    window.SBS_CLOUD = { on:true, ready:!!ok, msg:txt };
  }
  if(!cfg.url || !cfg.anonKey){ window.SBS_CLOUD = { on:false }; return; }
  setStatus("conectando…", false);

  var ENV = window.SBS_ENV || { cloudPrefix:"", inScope:function(k){ return k.indexOf("hml:")!==0; }, toCloudKey:function(k){ return k; }, toStoreKey:function(k){ return k; } };
  var NS = ENV.ns || "sbsdb:";
  var pushing = {};   // evita eco (eu mesmo gravei)
  var sb = null;

  loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js", init);

  function loadScript(src, cb){
    var s = document.createElement("script");
    s.src = src; s.onload = cb;
    s.onerror = function(){ setStatus("falha ao carregar SDK", false); };
    document.head.appendChild(s);
  }

  function init(){
    if(window.SBS_CLOUD_ROWS_ON){ window.SBS_CLOUD = { on:true, standby:true, mode:"row" }; return; }
    try{
      sb = window.supabase.createClient(cfg.url, cfg.anonKey, { realtime:{ params:{ eventsPerSecond:5 } } });
    }catch(e){ setStatus("erro de configuração", false); return; }

    // 1) baixa estado atual da nuvem
    sb.from("sbs_kv").select("key,value").then(function(res){
      if(res.error){ setStatus("erro: "+res.error.message, false); return; }
      var rows = (res.data || []).filter(function(r){ return ENV.inScope(r.key); });
      if(rows.length){
        rows.forEach(function(r){ try{ localStorage.setItem(NS+ENV.toStoreKey(r.key), JSON.stringify(r.value)); }catch(e){} });
      } else {
        // escopo deste ambiente vazio na nuvem → semeia com o estado local atual
        seedCloud();
      }
      setStatus("sincronizado", true);
      broadcast({ remote:true, hydrate:true });
      subscribe();
    });

    // 2) gravações locais → enviam para a nuvem (coalescidas p/ eficiência)
    var pendentes = {};   // key -> timer
    var WAIT = 350;       // junta rajadas de edição em uma só requisição

    function enviar(key){
      var raw; try{ raw = localStorage.getItem(NS+key); }catch(e){ return; }
      if(raw==null) return;
      var val; try{ val = JSON.parse(raw); }catch(e){ return; }
      pushing[key] = true;
      sb.from("sbs_kv").upsert({ key:ENV.toCloudKey(key), value:val, updated_at:new Date().toISOString() }).then(function(r){
        setTimeout(function(){ pushing[key]=false; }, 400);
        if(r && r.error) setStatus("erro ao salvar: "+r.error.message, true);
      });
    }
    function flushAll(){
      Object.keys(pendentes).forEach(function(k){
        if(pendentes[k]){ clearTimeout(pendentes[k]); pendentes[k]=null; enviar(k); }
      });
    }

    window.addEventListener("sbsdb-change", function(e){
      var d = e.detail || {};
      if(d.remote) return;            // veio da nuvem, não reenvia
      var key = d.key; if(!key) return;
      // coalescência: várias mudanças seguidas na mesma chave viram 1 envio
      if(pendentes[key]) clearTimeout(pendentes[key]);
      pendentes[key] = setTimeout(function(){ pendentes[key]=null; enviar(key); }, WAIT);
    });

    // garante o envio do que ficou pendente ao fechar/ocultar a aba
    window.addEventListener("beforeunload", flushAll);
    document.addEventListener("visibilitychange", function(){ if(document.hidden) flushAll(); });
  }

  // 3) tempo real: mudanças na nuvem → atualiza este aparelho
  function subscribe(){
    sb.channel("sbs_kv_rt")
      .on("postgres_changes", { event:"*", schema:"public", table:"sbs_kv" }, function(payload){
        var row = payload.new; if(!row || !row.key) return;
        if(!ENV.inScope(row.key)) return;       // ignora dados do outro ambiente
        var sk = ENV.toStoreKey(row.key);
        if(pushing[sk]) return;  // fui eu que gravei
        try{ localStorage.setItem(NS+sk, JSON.stringify(row.value)); }catch(e){}
        broadcast({ key:sk, remote:true });
      })
      .subscribe();
  }

  function seedCloud(){
    var keys = [];
    try{ keys = Object.keys(localStorage).filter(function(k){ return k.indexOf(NS)===0; }); }catch(e){}
    keys.forEach(function(k){
      var key = k.slice(NS.length); var val;
      try{ val = JSON.parse(localStorage.getItem(k)); }catch(e){ return; }
      pushing[key] = true;
      sb.from("sbs_kv").upsert({ key:ENV.toCloudKey(key), value:val }).then(function(){ setTimeout(function(){ pushing[key]=false; }, 400); });
    });
  }

  function broadcast(detail){
    try{ window.dispatchEvent(new CustomEvent("sbsdb-change",{ detail:detail })); }catch(e){}
  }
})();
