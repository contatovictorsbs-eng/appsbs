/* SBS Painel do CEO — boot */
(function(){
  CEO.initLogin();
  document.getElementById("nav").addEventListener("click", e=>{ const it=e.target.closest("[data-nav]"); if(it) CEO.go(it.dataset.nav); });
  document.getElementById("logout").addEventListener("click", CEO.logout);

  const saved = (()=>{ try{ return (localStorage.getItem("sbs_ceo_user")||"").toLowerCase(); }catch(e){ return ""; } })();
  if(saved && CEO.canAccess(saved)) CEO.startSession(saved); else CEO.showLogin();

  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !d.remote || !CEO.session) return;
      const ae = document.activeElement;
      const typing = ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA"||ae.tagName==="SELECT");
      if(typing) return;
      if(CEO.current==="equipe") return; // o mapa se atualiza sozinho
      CEO.go(CEO.current);
    });
  }
  window.lucide && lucide.createIcons();
})();
