/* SBS Painel do CEO — módulo "Central de Ajuda" */
(function(){
  if(typeof CEO === "undefined" || !CEO.Modules) return;
  CEO.Modules.ajuda = {
    label: "Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("ceo") : '<div class="ceo-card">Documentação indisponível.</div>'; },
    mount(c){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(c, "ceo"); }
  };
})();
