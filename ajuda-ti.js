/* ===========================================================
   SBS Painel de T.I. — módulo "Central de Ajuda"
   Usa o renderizador compartilhado (docs-core.js) com o
   conteúdo de docs-data-ti.js (plataforma "ti").
   =========================================================== */
(function(){
  if(typeof TI === "undefined" || !TI.Modules) return;
  TI.Modules.ajuda = {
    label: "Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("ti")
      : `<div class="ti-empty">Documentação indisponível.</div>`; },
    mount(c){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(c, "ti"); }
  };
})();
