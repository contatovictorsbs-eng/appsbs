/* ===========================================================
   SBS — Rastreamento de localização (app do vendedor)
   -----------------------------------------------------------
   Captura a posição GPS do aparelho e publica na nuvem para o
   Painel Gerencial exibir o mapa da equipe em tempo real.

   • Chave por usuário: "rast:<email>" → { lat,lng,acc,ts,... }
     (uma chave por pessoa evita conflito quando vários enviam.)
   • Atualiza ao mover >30m ou a cada ~25s.
   • Respeita a feature "rastreamento" (T.I. pode desligar).
   • Transparência: mostra um selo "Localização ativa" no app.

   IMPORTANTE (limitação de app web): o GPS só é capturado com o
   app ABERTO na tela. Não há rastreio em segundo plano — para
   isso seria necessário um app nativo instalado.
   =========================================================== */
(function(){
  var S = window.SBSStore;
  if(!S) return;

  var KEY_PREFIX = "rast:";
  var MIN_INTERVAL = 25000;   // 25s entre envios
  var MIN_MOVE = 30;          // ou ao mover 30m
  var watchId = null;
  var lastSent = 0;
  var lastPos = null;
  var started = false;
  var deniedShown = false;

  function featureOn(){
    if(window.SBS_FEATURES && SBS_FEATURES.enabled) return SBS_FEATURES.enabled("rastreamento");
    return true; // default liberado
  }
  function currentEmail(){
    var u = (window.DATA && window.DATA.user) || {};
    if(u.email) return u.email.toLowerCase();
    try{ return (localStorage.getItem("sbs_user")||"").toLowerCase(); }catch(e){ return ""; }
  }
  function haversine(a,b){
    if(!a||!b) return Infinity;
    var R=6371000, toR=Math.PI/180;
    var dLat=(b.lat-a.lat)*toR, dLng=(b.lng-a.lng)*toR;
    var la1=a.lat*toR, la2=b.lat*toR;
    var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.sin(dLng/2)*Math.sin(dLng/2)*Math.cos(la1)*Math.cos(la2);
    return 2*R*Math.asin(Math.sqrt(x));
  }
  var PAPEL_LABEL = { nacional:"Gerente Nacional", regional:"Gerente Regional", supervisor:"Supervisor", admin:"Administrador", ceo:"Diretoria" };

  function publish(pos){
    var email = currentEmail(); if(!email) return;
    var u = (window.DATA && window.DATA.user) || {};
    var org = window.SBS_ORG && window.SBS_ORG.get(email);
    var papel = (org && org.papel) || u.papel || "supervisor";
    var rec = {
      email: email,
      nome: (org && org.nome) || u.name || email.split("@")[0],
      papel: papel,
      papelLabel: PAPEL_LABEL[papel] || "Força de Vendas",
      gerente: (window.SBS_ORG && window.SBS_ORG.gerenteDe(email)) || "",
      fone: u.fone || u.telefone || "",
      lat: pos.lat, lng: pos.lng, acc: pos.acc,
      vel: pos.vel,
      ts: Date.now(),
      tsLabel: new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})
    };
    S.set(KEY_PREFIX + email, rec);   // dispara sync p/ nuvem
    lastSent = Date.now();
    lastPos = { lat:pos.lat, lng:pos.lng };
    badge("on");
  }

  function onPos(p){
    if(!featureOn()){ stop(); return; }
    var pos = {
      lat:p.coords.latitude, lng:p.coords.longitude,
      acc:Math.round(p.coords.accuracy||0),
      vel:(p.coords.speed!=null && p.coords.speed>=0)?Math.round(p.coords.speed*3.6):null // m/s→km/h
    };
    var moved = haversine(lastPos, pos);
    var due = (Date.now()-lastSent) >= MIN_INTERVAL;
    if(lastSent===0 || due || moved>=MIN_MOVE) publish(pos);
  }

  function onErr(e){
    if(e && e.code===1 && !deniedShown){ // permission denied
      deniedShown = true;
      badge("off");
    }
  }

  function start(){
    if(started) return;
    if(!navigator.geolocation){ return; }
    if(!featureOn()){ return; }
    if(!currentEmail()){ return; }
    started = true;
    badge("wait");
    watchId = navigator.geolocation.watchPosition(onPos, onErr, {
      enableHighAccuracy:true, maximumAge:15000, timeout:20000
    });
  }
  function stop(){
    if(watchId!=null){ navigator.geolocation.clearWatch(watchId); watchId=null; }
    started = false;
    var email = currentEmail();
    badge("hide");
  }

  /* ---- selo de transparência no app ---- */
  function badge(state){
    var el = document.getElementById("sbs-track-badge");
    if(state==="hide"){ if(el) el.remove(); return; }
    if(!el){
      el = document.createElement("div");
      el.id = "sbs-track-badge";
      el.innerHTML = '<span class="dot"></span><span class="txt">Localização ativa</span>';
      el.addEventListener("click", function(){
        if(window.SBS && window.SBS.toast) window.SBS.toast("Sua localização é compartilhada com a gestão durante o expediente, com o app aberto.");
      });
      (document.body||document.documentElement).appendChild(el);
      injectCss();
    }
    el.setAttribute("data-state", state);
    var txt = el.querySelector(".txt");
    if(txt) txt.textContent = state==="off" ? "Localização desligada" : (state==="wait" ? "Localizando…" : "Localização ativa");
  }
  function injectCss(){
    if(document.getElementById("sbs-track-css")) return;
    var st=document.createElement("style"); st.id="sbs-track-css";
    st.textContent = '#sbs-track-badge{position:fixed;left:50%;transform:translateX(-50%);bottom:78px;z-index:60;display:flex;align-items:center;gap:7px;background:rgba(17,40,34,.92);color:#fff;border-radius:30px;padding:7px 13px;font:600 11.5px/1 "Plus Jakarta Sans",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.22);cursor:pointer;backdrop-filter:blur(4px)}'+
      '#sbs-track-badge .dot{width:8px;height:8px;border-radius:50%;background:#46d39a;box-shadow:0 0 0 0 rgba(70,211,154,.6);animation:sbsTrackPulse 1.8s infinite}'+
      '#sbs-track-badge[data-state="off"] .dot{background:#e8643a;animation:none}'+
      '#sbs-track-badge[data-state="wait"] .dot{background:#f0b73a}'+
      '@keyframes sbsTrackPulse{0%{box-shadow:0 0 0 0 rgba(70,211,154,.55)}70%{box-shadow:0 0 0 7px rgba(70,211,154,0)}100%{box-shadow:0 0 0 0 rgba(70,211,154,0)}}';
    document.head.appendChild(st);
  }

  /* ---- bootstrap: aguarda login e mantém o estado coerente ---- */
  function tick(){
    var email = currentEmail();
    if(email && featureOn()){ if(!started) start(); }
    else { if(started || !email) stop(); }
  }
  setInterval(tick, 4000);
  // tenta começar logo após o carregamento
  if(document.readyState!=="loading") setTimeout(tick, 1500);
  else document.addEventListener("DOMContentLoaded", function(){ setTimeout(tick,1500); });

  window.SBS_TRACK = { start, stop, publish:function(){ if(navigator.geolocation) navigator.geolocation.getCurrentPosition(onPos,onErr,{enableHighAccuracy:true}); } };
})();
