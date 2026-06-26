/* SBS Portal do Colaborador — boot */
(function(){
  COL.initLogin();
  document.querySelectorAll(".co-tab").forEach(t=>t.addEventListener("click",()=>COL.go(t.dataset.tab)));
  var bell=document.getElementById("co-bell"); if(bell) bell.addEventListener("click",()=>COL.go("notificacoes"));
  const saved=(()=>{ try{ return (localStorage.getItem("sbs_col_user")||"").toLowerCase(); }catch(e){ return ""; } })();
  if(saved) COL.startSession(saved); else COL.showLogin();
  if(window.SBSStore){
    window.SBSStore.onChange(function(d){
      if(!d || !d.remote || !COL.me) return;
      const ae=document.activeElement;
      if(ae && (ae.tagName==="INPUT"||ae.tagName==="TEXTAREA")) return;
      COL.refresh();
    });
  }
  window.lucide && lucide.createIcons();
})();
