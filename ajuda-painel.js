/* ===========================================================
   SBS Painel Gerencial — módulo "Central de Ajuda"
   Usa o renderizador compartilhado (docs-core.js) com o
   conteúdo de docs-data-painel.js (plataforma "gerencial").
   =========================================================== */
(function(){
  if(typeof PANEL === "undefined" || !PANEL.Modules) return;
  PANEL.Modules.ajuda = {
    label: "Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("gerencial")
      : `<div class="card">Documentação indisponível.</div>`; },
    mount(c){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(c, "gerencial"); }
  };
})();
