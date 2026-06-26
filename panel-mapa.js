/* ===========================================================
   SBS Painel Gerencial — Mapa da Equipe
   Usa o motor compartilhado SBS_MAPA (sbs-mapa.js).
   =========================================================== */
(function(){
  if(typeof PANEL === "undefined" || !PANEL.Modules) return;
  PANEL.Modules.mapa = {
    label: "Mapa da Equipe",
    render: function(){ return window.SBS_MAPA ? window.SBS_MAPA.html() : '<div class="card">Mapa indisponível.</div>'; },
    mount: function(c){
      if(!window.SBS_MAPA) return;
      window.SBS_MAPA.mount(c, {
        toast: PANEL.toast,
        isActive: function(){ return PANEL.current==="mapa"; },
        readOnly: false
      });
    }
  };
})();
