/* ===========================================================
   SBS — Motor do Mapa da Equipe (compartilhado)
   -----------------------------------------------------------
   Renderizador único usado pelo Painel Gerencial e pelo Painel
   do CEO. A EQUIPE é a lista de vendedores CADASTRADOS (coleção
   "vendedores"), cruzada com a posição GPS ("rast:<email>").

   Uso:
     SBS_MAPA.html()                  → markup do módulo
     SBS_MAPA.mount(container, host)  → inicializa o mapa
       host = { toast(msg), isActive():bool, readOnly?:bool, store? }
   Mapa: Leaflet + OpenStreetMap (gratuito, sem chave de API).
   =========================================================== */
window.SBS_MAPA = (function(){
  var NS = "sbsdb:";
  var S = window.SBSStore || null, host = null, cont = null;
  var map = null, layer = null, markers = {}, leafletLoading = false, wired = false, timer = null;

  var T_ONLINE = 3*60*1000, T_RECENT = 20*60*1000;
  var COLORS = { online:"#1F9E8C", recent:"#E5A019", offline:"#9aa6a1", nolocation:"#c2ccc7" };

  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function active(){ return host && (!host.isActive || host.isActive()); }

  function store(){ return S || window.SBSStore; }
  function rastOf(email){
    if(!email) return null;
    try{ var v = JSON.parse(localStorage.getItem(NS+"rast:"+email.toLowerCase())); return (v && v.lat!=null && v.lng!=null) ? v : null; }
    catch(e){ return null; }
  }

  function readRoster(){
    var st = store(); if(!st) return [];
    var out = [], seen = {};
    (st.getCol("vendedores")||[]).forEach(function(v){
      if(v.ativo===false) return;
      var email = (v.email||"").toLowerCase();
      var r = rastOf(email);
      seen[email] = true;
      out.push({
        email: email, nome: v.nome || email || "—",
        fone: v.telefone || (r && r.fone) || "",
        papelLabel: v.regiao || v.equipe || "Vendedor",
        lat: r?r.lat:null, lng: r?r.lng:null, acc: r?r.acc:null, vel: r?r.vel:null,
        ts: r?r.ts:0, tsLabel: r?r.tsLabel:"", hasPos: !!r
      });
    });
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if(k && k.indexOf(NS+"rast:")===0){
          var em = k.slice((NS+"rast:").length).toLowerCase();
          if(seen[em]) continue;
          var rec; try{ rec = JSON.parse(localStorage.getItem(k)); }catch(e){ continue; }
          if(!rec || rec.lat==null || rec.lng==null) continue;
          out.push({ email:em, nome:rec.nome||em, fone:rec.fone||"", papelLabel:(rec.papelLabel||"")+" (fora do cadastro)",
            lat:rec.lat, lng:rec.lng, acc:rec.acc, vel:rec.vel, ts:rec.ts||0, tsLabel:rec.tsLabel||"", hasPos:true });
        }
      }
    }catch(e){}
    var rank = { online:0, recent:1, offline:2, nolocation:3 };
    out.sort(function(a,b){ var ra=rank[statusOf(a)], rb=rank[statusOf(b)]; return ra!==rb ? ra-rb : (b.ts||0)-(a.ts||0); });
    return out;
  }

  function statusOf(r){
    if(!r.hasPos) return "nolocation";
    var age = Date.now()-(r.ts||0);
    if(age < T_ONLINE) return "online";
    if(age < T_RECENT) return "recent";
    return "offline";
  }
  function ago(ts){
    if(!ts) return "sem registro";
    var s = Math.floor((Date.now()-ts)/1000);
    if(s<60) return "agora há pouco";
    var m = Math.floor(s/60); if(m<60) return "há "+m+" min";
    var h = Math.floor(m/60); if(h<24) return "há "+h+"h";
    return "há "+Math.floor(h/24)+"d";
  }

  function ensureLeaflet(cb){
    if(window.L){ cb(); return; }
    if(leafletLoading){ var t=setInterval(function(){ if(window.L){ clearInterval(t); cb(); } },120); return; }
    leafletLoading = true;
    var css = document.createElement("link"); css.rel="stylesheet";
    css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
    var js = document.createElement("script");
    js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = cb; document.head.appendChild(js);
  }

  function html(){
    return ''+
    '<div class="mapwrap">'+
      '<div class="map-side">'+
        '<div class="map-side-h">'+
          '<div class="map-stat"><span class="ms-dot on"></span><b id="mp-on">0</b> ao vivo</div>'+
          '<div class="map-stat"><span class="ms-dot re"></span><b id="mp-re">0</b> recente</div>'+
          '<div class="map-stat"><span class="ms-dot of"></span><b id="mp-of">0</b> sem sinal</div>'+
        '</div>'+
        '<div class="map-search"><i data-lucide="search"></i><input id="mp-q" placeholder="Buscar vendedor..."></div>'+
        '<div class="map-list" id="mp-list"></div>'+
      '</div>'+
      '<div class="map-main">'+
        '<div id="mp-map" class="map-canvas"></div>'+
        '<button class="map-fit" id="mp-fit" title="Enquadrar todos"><i data-lucide="maximize"></i></button>'+
        '<div class="map-empty" id="mp-empty" style="display:none">'+
          '<i data-lucide="map-pin-off"></i>'+
          '<div class="me-t">Nenhum vendedor em campo agora</div>'+
          '<div class="me-s">Os vendedores cadastrados aparecem na lista ao lado. A posição no mapa surge quando alguém abre o app com o GPS ativo (funciona com o app aberto na tela).</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  function mount(container, h){
    host = h || {};
    S = host.store || window.SBSStore;
    cont = container;
    ensureLeaflet(function(){ initMap(); });
  }

  function initMap(){
    var mapEl = cont.querySelector("#mp-map");
    if(map){ try{ map.remove(); }catch(e){} }
    map = null; layer = null; markers = {};
    map = L.map(mapEl, { zoomControl:true, attributionControl:true }).setView([-15.78,-47.93], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19, attribution:"&copy; OpenStreetMap" }).addTo(map);
    layer = L.layerGroup().addTo(map);

    cont.querySelector("#mp-fit").addEventListener("click", function(){ fitAll(); });
    cont.querySelector("#mp-q").addEventListener("input", function(){ renderList((this.value||"").trim().toLowerCase()); });

    refresh(true);

    if(!wired){
      wired = true;
      S.onChange(function(d){
        if(!active() || !cont || !d) return;
        if(d.hydrate || (d.key && (d.key.indexOf("rast:")===0 || d.key==="vendedores"))) refresh(false);
      });
    }
    if(timer) clearInterval(timer);
    timer = setInterval(function(){ if(active() && cont) refresh(false); }, 30000);
  }

  function markerHtml(st){ return '<div class="pin" style="--pc:'+COLORS[st]+'"><span class="pin-pulse"></span><span class="pin-dot"></span></div>'; }

  function refresh(fit){
    if(!map || !cont) return;
    var roster = readRoster();
    var counts = { online:0, recent:0, sem:0 };
    var withPos = {};
    roster.forEach(function(r){
      var st = statusOf(r);
      if(st==="online") counts.online++; else if(st==="recent") counts.recent++; else counts.sem++;
      if(!r.hasPos) return;
      withPos[r.email] = true;
      var ll = [r.lat, r.lng];
      var icon = L.divIcon({ className:"pin-wrap", html:markerHtml(st), iconSize:[26,26], iconAnchor:[13,13] });
      if(markers[r.email]){
        markers[r.email].setLatLng(ll).setIcon(icon);
        markers[r.email]._rec = r;
        if(markers[r.email].isPopupOpen()) markers[r.email].setPopupContent(popupHtml(r));
      } else {
        var mk = L.marker(ll, { icon:icon }).addTo(layer);
        mk._rec = r;
        mk.bindPopup(popupHtml(r), { className:"map-popup", minWidth:230, closeButton:true });
        mk.on("popupopen", function(){ wirePopup(mk.getPopup(), mk._rec); });
        markers[r.email] = mk;
      }
    });
    Object.keys(markers).forEach(function(em){ if(!withPos[em]){ layer.removeLayer(markers[em]); delete markers[em]; } });

    var setT=function(id,v){ var e=cont.querySelector(id); if(e) e.textContent=v; };
    setT("#mp-on", counts.online); setT("#mp-re", counts.recent); setT("#mp-of", counts.sem);
    var emp = cont.querySelector("#mp-empty"); if(emp) emp.style.display = roster.length ? "none" : "flex";

    renderList((cont.querySelector("#mp-q").value||"").trim().toLowerCase());
    if(fit && Object.keys(markers).length) fitAll();
  }

  function fitAll(){
    var pts = Object.keys(markers).map(function(k){ return markers[k].getLatLng(); });
    if(!pts.length) return;
    if(pts.length===1){ map.setView(pts[0], 14); return; }
    map.fitBounds(L.latLngBounds(pts).pad(0.25));
  }

  function renderList(q){
    if(!cont) return;
    var roster = readRoster();
    var list = cont.querySelector("#mp-list");
    var rows = roster.filter(function(r){ return !q || (r.nome||"").toLowerCase().indexOf(q)>=0 || (r.papelLabel||"").toLowerCase().indexOf(q)>=0; });
    if(!rows.length){ list.innerHTML = '<div class="map-none">'+(roster.length?"Nenhum vendedor encontrado.":"Nenhum vendedor cadastrado. Cadastre em Vendedores.")+'</div>'; return; }
    list.innerHTML = rows.map(function(r){
      var st = statusOf(r);
      var ini = (r.nome||"?").split(" ").map(function(w){return w[0];}).slice(0,2).join("").toUpperCase();
      var sub = r.hasPos ? (r.papelLabel+" · "+ago(r.ts)) : (r.papelLabel+" · sem localização");
      return '<div class="map-person'+(r.hasPos?'':' nopos')+'" data-em="'+esc(r.email)+'">'+
        '<span class="mp-av" style="--pc:'+COLORS[st]+'">'+esc(ini)+'<span class="mp-stat"></span></span>'+
        '<div class="mp-info"><div class="mp-nome">'+esc(r.nome||r.email)+'</div><div class="mp-sub">'+esc(sub)+'</div></div>'+
        (st==="online"?'<span class="mp-live">AO VIVO</span>':'')+
      '</div>';
    }).join("");
    list.querySelectorAll(".map-person").forEach(function(row){
      row.addEventListener("click", function(){
        var em = row.dataset.em, mk = markers[em];
        if(mk){ map.setView(mk.getLatLng(), 15, { animate:true }); mk.openPopup(); }
        else if(host.toast){ host.toast("Sem localização no momento — vendedor não está com o app aberto."); }
      });
    });
  }

  function popupHtml(r){
    var st = statusOf(r);
    var stLabel = st==="online"?"Ao vivo":(st==="recent"?"Visto "+ago(r.ts):"Offline · "+ago(r.ts));
    return ''+
    '<div class="pop">'+
      '<div class="pop-h"><span class="pop-st '+st+'"></span><b>'+esc(r.nome||r.email)+'</b></div>'+
      '<div class="pop-role">'+esc(r.papelLabel||"")+'</div>'+
      '<div class="pop-meta">'+
        '<div><span>Status</span>'+esc(stLabel)+'</div>'+
        '<div><span>Atualizado</span>'+esc(r.tsLabel||ago(r.ts))+'</div>'+
        '<div><span>Precisão</span>± '+(r.acc!=null?r.acc:"?")+' m</div>'+
        (r.vel!=null?'<div><span>Velocidade</span>'+r.vel+' km/h</div>':'')+
        '<div><span>Telefone</span>'+(r.fone?esc(r.fone):"—")+'</div>'+
      '</div>'+
      '<div class="pop-acts">'+
        '<button class="pop-btn call" data-act="call" data-em="'+esc(r.email)+'"><i data-lucide="phone"></i> Ligar</button>'+
        '<a class="pop-btn route" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+r.lat+','+r.lng+'&travelmode=driving"><i data-lucide="navigation"></i> Criar rota</a>'+
      '</div>'+
    '</div>';
  }

  function wirePopup(popup, r){
    if(window.lucide) lucide.createIcons();
    var node = popup.getElement(); if(!node) return;
    var callBtn = node.querySelector('[data-act="call"]');
    if(callBtn) callBtn.addEventListener("click", function(){
      var fone = r.fone;
      if(!fone){
        if(host.readOnly){ if(host.toast) host.toast("Sem telefone cadastrado para "+(r.nome||"este vendedor")+"."); return; }
        var typed = window.prompt("Telefone de "+(r.nome||"")+" (será salvo no cadastro do vendedor):","");
        if(typed && typed.replace(/\D/g,"").length>=8){
          fone = typed.trim();
          var vs = S.getCol("vendedores")||[];
          var i = vs.findIndex(function(x){ return (x.email||"").toLowerCase()===(r.email||"").toLowerCase(); });
          if(i>=0){ vs[i] = Object.assign({}, vs[i], { telefone:fone }); S.setCol("vendedores", vs); }
        } else { return; }
      }
      window.location.href = "tel:"+fone.replace(/[^\d+]/g,"");
    });
  }

  return { html:html, mount:mount, refresh:function(){ refresh(false); }, readRoster:readRoster, statusOf:statusOf };
})();
