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

  var NS = "sbsdb:";
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
    try{
      sb = window.supabase.createClient(cfg.url, cfg.anonKey, { realtime:{ params:{ eventsPerSecond:5 } } });
    }catch(e){ setStatus("erro de configuração", false); return; }

    // 1) baixa estado atual da nuvem
    sb.from("sbs_kv").select("key,value").then(function(res){
      if(res.error){ setStatus("erro: "+res.error.message, false); return; }
      var rows = res.data || [];
      if(rows.length){
        rows.forEach(function(r){ try{ localStorage.setItem(NS+r.key, JSON.stringify(r.value)); }catch(e){} });
      } else {
        // nuvem vazia → semeia com o estado local atual
        seedCloud();
      }
      setStatus("sincronizado", true);
      broadcast({ remote:true, hydrate:true });
      subscribe();
    });

    // 2) gravações locais → enviam para a nuvem
    window.addEventListener("sbsdb-change", function(e){
      var d = e.detail || {};
      if(d.remote) return;            // veio da nuvem, não reenvia
      var key = d.key; if(!key) return;
      var raw; try{ raw = localStorage.getItem(NS+key); }catch(e){ return; }
      if(raw==null) return;
      var val; try{ val = JSON.parse(raw); }catch(e){ return; }
      pushing[key] = true;
      sb.from("sbs_kv").upsert({ key:key, value:val, updated_at:new Date().toISOString() }).then(function(r){
        setTimeout(function(){ pushing[key]=false; }, 400);
        if(r && r.error) setStatus("erro ao salvar: "+r.error.message, true);
      });
    });
  }

  // 3) tempo real: mudanças na nuvem → atualiza este aparelho
  function subscribe(){
    sb.channel("sbs_kv_rt")
      .on("postgres_changes", { event:"*", schema:"public", table:"sbs_kv" }, function(payload){
        var row = payload.new; if(!row || !row.key) return;
        if(pushing[row.key]) return;  // fui eu que gravei
        try{ localStorage.setItem(NS+row.key, JSON.stringify(row.value)); }catch(e){}
        broadcast({ key:row.key, remote:true });
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
      sb.from("sbs_kv").upsert({ key:key, value:val }).then(function(){ setTimeout(function(){ pushing[key]=false; }, 400); });
    });
  }

  function broadcast(detail){
    try{ window.dispatchEvent(new CustomEvent("sbsdb-change",{ detail:detail })); }catch(e){}
  }
})();
