/* SBS Painel de P&D / Inovação — boot */
(function(){
  PD.seed();
  document.getElementById("nav").addEventListener("click",e=>{ const it=e.target.closest("[data-nav]"); if(it) PD.go(it.dataset.nav); });
  document.getElementById("logout").addEventListener("click",PD.logout);
  document.getElementById("scrim").addEventListener("click",PD.closeSide);
  document.getElementById("modal-x").addEventListener("click",PD.closeModal);
  document.getElementById("modal-scrim").addEventListener("click",e=>{ if(e.target.id==="modal-scrim") PD.closeModal(); });
  PD.initLogin();

  const saved=(()=>{ try{ return (localStorage.getItem("sbs_pd_user")||"").toLowerCase(); }catch(e){ return ""; } })();
  if(saved && PD.canAccess(saved)) PD.startSession(saved); else PD.showLogin();

  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !d.remote || !PD.session) return;
      const ae=document.activeElement;
      if(ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT")) return;
      if(document.getElementById("modal-scrim").classList.contains("show")) return;
      PD.refresh();
    });
  }
  window.lucide && lucide.createIcons();
})();
