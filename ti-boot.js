/* ===========================================================
   SBS Painel T.I. — boot
   =========================================================== */
(function(){
  TI.initLogin();

  // navegação
  document.getElementById("nav").addEventListener("click", e=>{
    const it = e.target.closest("[data-nav]"); if(it) TI.go(it.dataset.nav);
  });
  document.getElementById("logout").addEventListener("click", TI.logout);

  // fechar side / modal
  document.getElementById("scrim").addEventListener("click", ()=>{ TI.closeSide(); });
  document.getElementById("modal-x").addEventListener("click", TI.closeModal);
  document.getElementById("modal-scrim").addEventListener("click", e=>{ if(e.target.id==="modal-scrim") TI.closeModal(); });

  // sessão salva
  const saved = (()=>{ try{ return (localStorage.getItem("sbs_ti_user")||"").toLowerCase(); }catch(e){ return ""; } })();
  if(saved && TI.canAccess(saved)) TI.startSession(saved);
  else TI.showLogin();

  // re-render ao vivo quando chega dado da nuvem
  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !d.remote) return;
      if(!TI.session) return;
      const ae = document.activeElement;
      const typing = ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT");
      const modalOpen = document.getElementById("modal-scrim").classList.contains("show");
      if(typing || modalOpen) return;
      TI.go(TI.current);
    });
  }

  window.lucide && lucide.createIcons();
})();
