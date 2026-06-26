/* SBS Painel de Marketing — boot */
(function(){
  MKT.seed();
  document.getElementById("nav").addEventListener("click",e=>{ const it=e.target.closest("[data-nav]"); if(it) MKT.go(it.dataset.nav); });
  document.getElementById("logout").addEventListener("click",MKT.logout);
  document.getElementById("scrim").addEventListener("click",MKT.closeSide);
  document.getElementById("modal-x").addEventListener("click",MKT.closeModal);
  document.getElementById("modal-scrim").addEventListener("click",e=>{ if(e.target.id==="modal-scrim") MKT.closeModal(); });
  MKT.initLogin();

  const saved=(()=>{ try{ return (localStorage.getItem("sbs_mkt_user")||"").toLowerCase(); }catch(e){ return ""; } })();
  if(saved && MKT.canAccess(saved)) MKT.startSession(saved); else MKT.showLogin();

  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !d.remote || !MKT.session) return;
      const ae=document.activeElement;
      if(ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT")) return;
      if(document.getElementById("modal-scrim").classList.contains("show")) return;
      MKT.refresh();
    });
  }
  window.lucide && lucide.createIcons();
})();
