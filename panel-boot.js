/* ===========================================================
   SBS Painel — boot: wiring de eventos globais + auto-login
   =========================================================== */
(function(){
  const P = PANEL;
  P.S.seed();
  P.initLogin();

  // navegação (sidebar)
  document.getElementById("nav").addEventListener("click", e=>{
    const n = e.target.closest("[data-nav]"); if(!n) return;
    P.go(n.dataset.nav);
  });
  document.getElementById("logout").addEventListener("click", P.logout);

  // fechar drawer / modal
  document.getElementById("scrim").addEventListener("click", P.closeSide);
  document.getElementById("modal-x").addEventListener("click", P.closeModal);
  document.getElementById("modal-scrim").addEventListener("click", e=>{ if(e.target.id==="modal-scrim") P.closeModal(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ P.closeSide(); P.closeModal(); } });

  // busca topo → delega ao módulo atual (se implementar window.__panelSearch)
  document.getElementById("top-search").addEventListener("input", e=>{
    if(window.__panelSearch) window.__panelSearch(e.target.value);
  });

  // re-render quando a store muda (nuvem); evita interromper quem digita
  P.S.onChange((d)=>{
    if(!P.session) return;
    P.buildNav();
    if(d && d.remote){
      const ae = document.activeElement;
      const typing = ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT");
      const overlay = document.getElementById("modal-scrim").classList.contains("show") || document.getElementById("side").classList.contains("open");
      if(!typing && !overlay) P.go(P.current || "overview");
    }
  });

  // auto-login se já logado
  let saved=""; try{ saved=(localStorage.getItem("sbs_panel_user")||"").toLowerCase(); }catch(e){}
  const users=(window.SBS_USERS||[]).map(x=>x.toLowerCase());
  if(saved && users.includes(saved)){ P.startSession(saved); }
  else { P.showLogin(); }

  P.icons();
})();
