/* ===========================================================
   SBS — P&D / Inovação · base de dados (1 exemplo de cada)
   =========================================================== */
window.PD_DATA = (function(){
  var FASES = ["ideacao","pesquisa","ensaio","validacao","registro","lancamento"];
  var projetos = [
    { id:"pj1", nome:"Projeto exemplo", cultura:"Forrageira", fase:"pesquisa", lider:"P&D", inicio:"2025-09", previsto:"2027-03", prioridade:"media",
      objetivo:"Projeto de exemplo — edite ou crie novos.", progresso:30 }
  ];
  var ensaios = [
    { id:"en1", projeto:"pj1", local:"Cidade, UF", safra:"2025/26", cultivar:"Exemplo-01", repeticoes:4, status:"andamento",
      variaveis:"Produtividade", resultado:"", responsavel:"P&D" }
  ];
  var cultivares = [
    { id:"cv1", codigo:"EX-01", nome:"Cultivar exemplo", cultura:"Forrageira", estagio:"Pesquisa", projeto:"pj1", destaque:"Exemplo", vc:"—" }
  ];
  var ideias = [
    { id:"id1", titulo:"Ideia exemplo", origem:"P&D", autor:"P&D", status:"nova", votos:1, data:"2026-06-10",
      descricao:"Ideia de exemplo — edite ou crie novas." }
  ];
  var marcos = [
    { id:"mk1", projeto:"pj1", titulo:"Marco exemplo", data:"2026-09-20", status:"pendente" }
  ];
  var docs = [
    { id:"dc1", titulo:"Documento exemplo", tipo:"Relatório", projeto:"pj1", data:"2026-05-12", autor:"P&D" }
  ];
  return { FASES:FASES, projetos:projetos, ensaios:ensaios, cultivares:cultivares, ideias:ideias, marcos:marcos, docs:docs };
})();
