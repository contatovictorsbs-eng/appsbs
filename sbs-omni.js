/* ===========================================================
   SBS — Omnibox compartilhado (busca global + notificações)
   Um lançador único (botão flutuante + Ctrl/Cmd-K) com duas abas:
   • Buscar: navega para qualquer tela do painel atual (varre a nav)
     e registros expostos por window.SBS_OMNI_SOURCES().
   • Notificações: caixa unificada da coleção compartilhada
     "notificacoes" (a mesma que o app e os painéis já alimentam).
   Inclua este script em qualquer painel — ele se auto-monta.
   =========================================================== */
(function(){
  if(window.__sbsOmni) return; window.__sbsOmni = true;
  const S = window.SBSStore;
  const READ_KEY = "sbs_notif_read";

  /* ---------- estado de leitura (por dispositivo) ---------- */
  function readSet(){ try{ return new Set(JSON.parse(localStorage.getItem(READ_KEY)||"[]")); }catch(e){ return new Set(); } }
  function markAllRead(){
    const ids=(S?S.getCol("notificacoes"):[]||[]).map(n=>n.id);
    try{ localStorage.setItem(READ_KEY, JSON.stringify(ids)); }catch(e){}
  }
  function notifs(){ return (S? (S.getCol("notificacoes")||[]) : []).slice(); }
  function unreadCount(){ const r=readSet(); return notifs().filter(n=>!r.has(n.id)).length; }

  /* ---------- fontes de busca ---------- */
  function navTargets(){
    const out=[], seen=new Set();
    document.querySelectorAll("[data-nav],[data-view],[data-sub],[data-go]").forEach(el=>{
      const key = el.getAttribute("data-nav")||el.getAttribute("data-view")||el.getAttribute("data-sub")||el.getAttribute("data-go");
      const label = (el.textContent||"").replace(/\s+/g," ").trim();
      if(!key||!label||label.length>48) return;
      const id = key+"|"+label;
      if(seen.has(id)) return; seen.add(id);
      out.push({ label, hint:"Ir para", el });
    });
    return out;
  }
  function extraSources(){
    try{ return (window.SBS_OMNI_SOURCES? window.SBS_OMNI_SOURCES()||[] : []); }catch(e){ return []; }
  }
  function search(q){
    q=(q||"").trim().toLowerCase();
    const all = navTargets().concat(extraSources());
    if(!q) return all.slice(0,8);
    return all.filter(x=>(x.label||"").toLowerCase().includes(q) || (x.hint||"").toLowerCase().includes(q)).slice(0,30);
  }

  /* ---------- UI ---------- */
  const style = document.createElement("style");
  style.textContent = `
  .omni-fab{position:fixed;left:18px;bottom:18px;z-index:9000;display:inline-flex;align-items:center;gap:8px;
    background:#15171A;color:#fff;border:0;border-radius:999px;padding:10px 15px;font:600 13px/1 inherit;cursor:pointer;
    box-shadow:0 8px 26px rgba(0,0,0,.28);font-family:inherit}
  .omni-fab:hover{filter:brightness(1.12)}
  .omni-fab kbd{background:rgba(255,255,255,.16);border-radius:6px;padding:2px 6px;font-size:11px;font-weight:700}
  .omni-fab .omni-bdg{background:#E5484D;border-radius:999px;min-width:18px;height:18px;padding:0 5px;font-size:11px;font-weight:800;display:grid;place-items:center}
  .omni-ov{position:fixed;inset:0;background:rgba(8,10,12,.5);z-index:9001;display:none;align-items:flex-start;justify-content:center;padding-top:9vh}
  .omni-ov.show{display:flex}
  .omni-box{background:#fff;width:min(620px,94vw);border-radius:16px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);font-family:inherit}
  .omni-tabs{display:flex;gap:4px;padding:10px 12px 0}
  .omni-tab{flex:0 0 auto;border:0;background:none;font:700 13px/1 inherit;color:#8A9099;padding:9px 14px;border-radius:9px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-family:inherit}
  .omni-tab.on{background:#F1F3F5;color:#15171A}
  .omni-tab .omni-bdg2{background:#E5484D;color:#fff;border-radius:999px;min-width:17px;height:17px;padding:0 5px;font-size:10px;font-weight:800;display:grid;place-items:center}
  .omni-srch{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #EEF0F2}
  .omni-srch i{width:18px;height:18px;color:#8A9099}
  .omni-srch input{flex:1;border:0;outline:0;font:500 15px/1.2 inherit;font-family:inherit;color:#15171A;background:none}
  .omni-list{max-height:54vh;overflow:auto;padding:8px}
  .omni-it{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:10px;cursor:pointer}
  .omni-it:hover,.omni-it.sel{background:#F4F6F8}
  .omni-it-ic{width:32px;height:32px;border-radius:9px;background:#EEF0F2;color:#5B6470;display:grid;place-items:center;flex:none}
  .omni-it-ic i{width:16px;height:16px}
  .omni-it-main{min-width:0;flex:1}
  .omni-it-t{font-size:14px;font-weight:700;color:#15171A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .omni-it-h{font-size:12px;color:#8A9099}
  .omni-it.unread .omni-it-ic{background:#E3F4F1;color:#0E7E72}
  .omni-it-dot{width:8px;height:8px;border-radius:50%;background:#0E9B8E;flex:none}
  .omni-empty{padding:30px;text-align:center;color:#8A9099;font-size:13px}
  .omni-foot{display:flex;justify-content:space-between;align-items:center;padding:9px 16px;border-top:1px solid #EEF0F2;font-size:11.5px;color:#8A9099}
  .omni-foot button{border:0;background:none;color:#0E7E72;font-weight:700;font-size:12px;cursor:pointer;font-family:inherit}
  @media(max-width:560px){.omni-fab kbd{display:none}}
  `;
  document.head.appendChild(style);

  const fab=document.createElement("button");
  fab.className="omni-fab";
  fab.innerHTML=`<i data-lucide="search"></i><span>Buscar</span><kbd>⌘K</kbd><span class="omni-bdg" id="omni-bdg" style="display:none">0</span>`;
  const ov=document.createElement("div");
  ov.className="omni-ov";
  ov.innerHTML=`<div class="omni-box" role="dialog" aria-label="Busca e notificações">
    <div class="omni-tabs">
      <button class="omni-tab on" data-tab="buscar"><i data-lucide="search"></i> Buscar</button>
      <button class="omni-tab" data-tab="notif"><i data-lucide="bell"></i> Notificações <span class="omni-bdg2" id="omni-bdg2" style="display:none">0</span></button>
    </div>
    <div class="omni-srch" id="omni-srch-wrap"><i data-lucide="search"></i><input id="omni-input" placeholder="Buscar telas e itens deste painel..." autocomplete="off"></div>
    <div class="omni-list" id="omni-list"></div>
    <div class="omni-foot"><span id="omni-hint">↑↓ navegar · Enter abrir · Esc fechar</span><span style="display:flex;gap:14px"><button id="omni-newnotif" style="display:none">+ Nova notificação</button><button id="omni-newdem" style="display:none">+ Abrir demanda</button><button id="omni-readall" style="display:none">Marcar tudo como lido</button></span></div>
  </div>`;
  function attach(){ document.body.appendChild(ov); window.lucide&&lucide.createIcons(); paintBadge(); }
  if(document.body) attach(); else document.addEventListener("DOMContentLoaded", attach);

  let tab="buscar", sel=0, results=[];
  function $(id){ return ov.querySelector(id); }

  function paintBadge(){
    const n=unreadCount();
    const b=document.getElementById("omni-bdg"); if(b){ b.style.display=n?"grid":"none"; b.textContent=n>99?"99+":n; }
    const b2=$("#omni-bdg2"); if(b2){ b2.style.display=n?"grid":"none"; b2.textContent=n>99?"99+":n; }
  }
  function open(which){
    tab=which||"buscar"; sel=0;
    ov.classList.add("show");
    ov.querySelectorAll(".omni-tab").forEach(t=>t.classList.toggle("on",t.dataset.tab===tab));
    $("#omni-srch-wrap").style.display = tab==="buscar"?"flex":"none";
    $("#omni-readall").style.display = tab==="notif"?"inline":"none";
    $("#omni-newnotif").style.display = tab==="notif"?"inline":"none";
    $("#omni-newdem").style.display = tab==="notif"?"inline":"none";
    if(tab==="buscar"){ const i=$("#omni-input"); i.value=""; setTimeout(()=>i.focus(),30); paintSearch(""); }
    else paintNotif();
    paintBadge();
  }
  function close(){ ov.classList.remove("show"); }

  function paintSearch(q){
    results=search(q).map(r=>({type:"nav",...r}));
    const list=$("#omni-list");
    if(!results.length){ list.innerHTML=`<div class="omni-empty">Nada encontrado para "${q}"</div>`; return; }
    list.innerHTML=results.map((r,i)=>`<div class="omni-it ${i===sel?'sel':''}" data-i="${i}">
      <span class="omni-it-ic"><i data-lucide="corner-down-right"></i></span>
      <div class="omni-it-main"><div class="omni-it-t">${escapeHtml(r.label)}</div><div class="omni-it-h">${escapeHtml(r.hint||"")}</div></div>
    </div>`).join("");
    window.lucide&&lucide.createIcons();
    list.querySelectorAll(".omni-it").forEach(el=>el.addEventListener("click",()=>run(+el.dataset.i)));
  }
  function paintNotif(){
    const r=readSet(); const ns=notifs().sort((a,b)=>(b.ts||0)-(a.ts||0));
    const list=$("#omni-list");
    if(!ns.length){ list.innerHTML=`<div class="omni-empty">Sem notificações.</div>`; return; }
    list.innerHTML=ns.slice(0,40).map(n=>{
      const unread=!r.has(n.id);
      return `<div class="omni-it ${unread?'unread':''}">
        <span class="omni-it-ic"><i data-lucide="${escapeHtml(n.icon||'bell')}"></i></span>
        <div class="omni-it-main"><div class="omni-it-t">${escapeHtml(n.title||n.titulo||"Aviso")}</div><div class="omni-it-h">${escapeHtml((n.text||n.texto||"")+(n.data?(" · "+n.data):""))}</div></div>
        ${unread?'<span class="omni-it-dot"></span>':''}
      </div>`;
    }).join("");
    window.lucide&&lucide.createIcons();
  }
  function run(i){
    const r=results[i]; if(!r) return;
    close();
    if(r.go){ try{ r.go(); }catch(e){} return; }
    if(r.el){ r.el.click(); }
  }
  function escapeHtml(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  /* ---------- eventos ---------- */
  fab.addEventListener("click", ()=>open(unreadCount()?"notif":"buscar"));
  ov.addEventListener("click", e=>{ if(e.target===ov) close(); });
  ov.querySelectorAll(".omni-tab").forEach(t=>t.addEventListener("click",()=>open(t.dataset.tab)));
  ov.addEventListener("input", e=>{ if(e.target.id==="omni-input"){ sel=0; paintSearch(e.target.value); } });
  document.addEventListener("click", e=>{ if(e.target.closest("#omni-readall")){ markAllRead(); paintNotif(); paintBadge(); } });
  document.addEventListener("click", e=>{ if(e.target.closest("#omni-newnotif")){ close(); window.SBS_NOTIFY&&SBS_NOTIFY.open(); } if(e.target.closest("#omni-newdem")){ close(); window.SBS_DEMANDA&&SBS_DEMANDA.open(); } });
  document.addEventListener("keydown", e=>{
    const k=e.key.toLowerCase();
    if((e.metaKey||e.ctrlKey)&&k==="k"){ e.preventDefault(); ov.classList.contains("show")?close():open("buscar"); return; }
    if(!ov.classList.contains("show")) return;
    if(k==="escape"){ close(); }
    else if(tab==="buscar"&&(k==="arrowdown"||k==="arrowup")){
      e.preventDefault(); sel=Math.max(0,Math.min(results.length-1, sel+(k==="arrowdown"?1:-1)));
      ov.querySelectorAll(".omni-it").forEach((el,i)=>el.classList.toggle("sel",i===sel));
      const s=ov.querySelector(".omni-it.sel"); s&&s.scrollIntoView({block:"nearest"});
    } else if(tab==="buscar"&&k==="enter"){ run(sel); }
  });

  // atualiza badge quando a store muda
  S&&S.onChange&&S.onChange(()=>paintBadge());
  setInterval(paintBadge, 15000);
})();
