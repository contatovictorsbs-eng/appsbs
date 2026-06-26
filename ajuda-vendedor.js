/* ===========================================================
   SBS — Tela "Central de Ajuda" do app do vendedor
   Usa o renderizador compartilhado (docs-core.js) com o
   conteúdo de docs-data-vendedor.js (plataforma "vendedor").
   =========================================================== */
(function(){
  const S = window.Screens;
  S.ajuda = {
    title: "Central de Ajuda",
    render(){ return window.SBS_DOCS_HELP ? window.SBS_DOCS_HELP.html("vendedor")
      : `<div class="card" style="text-align:center;color:var(--muted)">Documentação indisponível.</div>`; },
    mount(root){ window.SBS_DOCS_HELP && window.SBS_DOCS_HELP.mount(root, "vendedor"); }
  };
})();
