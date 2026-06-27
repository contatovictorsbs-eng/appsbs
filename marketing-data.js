/* ===========================================================
   SBS — Marketing · base de dados (1 exemplo de cada)
   Estrutura limpa: um item-modelo por funcionalidade.
   =========================================================== */
window.MARKETING_DATA = (function(){
  var campanhas = [
    { id:"cmp1", nome:"Campanha exemplo", status:"ativa", canal:"App + WhatsApp", inicio:"2026-06-01", fim:"2026-08-31",
      publico:"Produtores", verba:30000, meta:"300 ton", responsavel:"Marketing",
      descricao:"Campanha de exemplo — edite ou crie novas.", cor:"brand" }
  ];
  var eventos = [
    { id:"ev1", nome:"Evento exemplo", tipo:"Feira", local:"Cidade, UF", inicio:"2026-07-18", fim:"2026-07-18", status:"planejado", custo:20000, leads:0, responsavel:"Marketing" }
  ];
  var conteudo = [
    { id:"ct1", titulo:"Conteúdo exemplo", canal:"Instagram", formato:"Reels", data:"2026-06-28", status:"ideia", responsavel:"Marketing" }
  ];
  var social = [
    { id:"sc1", canal:"Instagram", icon:"at-sign", seguidores:0, var:0, alcance:0, engaj:0 }
  ];
  return { campanhas:campanhas, eventos:eventos, conteudo:conteudo, social:social };
})();
