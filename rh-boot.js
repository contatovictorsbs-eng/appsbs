/* SBS Painel de RH — boot */
(function(){
  RH.seed();
  document.getElementById("nav").addEventListener("click",e=>{ const it=e.target.closest("[data-nav]"); if(it) RH.go(it.dataset.nav); });
  document.getElementById("logout").addEventListener("click",RH.logout);
  document.getElementById("scrim").addEventListener("click",RH.closeSide);
  document.getElementById("modal-x").addEventListener("click",RH.closeModal);
  document.getElementById("modal-scrim").addEventListener("click",e=>{ if(e.target.id==="modal-scrim") RH.closeModal(); });
  RH.initLogin();

  const saved=(()=>{ try{ return (localStorage.getItem("sbs_rh_user")||"").toLowerCase(); }catch(e){ return ""; } })();
  if(saved && RH.canAccess(saved)) RH.startSession(saved); else RH.showLogin();

  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !d.remote || !RH.session) return;
      const ae=document.activeElement;
      if(ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT")) return;
      if(document.getElementById("modal-scrim").classList.contains("show")) return;
      RH.refresh();
    });
  }
  window.lucide && lucide.createIcons();
})();
