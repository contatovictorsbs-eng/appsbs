/* ===========================================================
   SBS — P&D / Inovação · base de dados (seed)
   Coleções: pd_projetos, pd_ensaios, pd_cultivares, pd_ideias,
   pd_marcos, pd_docs. Semeado na store e sincronizado pela nuvem.
   Integração: reclamações de campo (coleção "reclamacoes") viram
   insumo de pesquisa; ideias podem vir do app.
   =========================================================== */
window.PD_DATA = (function(){
  // Pipeline de projetos (fases)
  var FASES = ["ideacao","pesquisa","ensaio","validacao","registro","lancamento"];
  var projetos = [
    { id:"pj1", nome:"Brachiaria tolerante à seca", cultura:"Forrageira", fase:"ensaio", lider:"Dr. Henrique Salles", inicio:"2024-09", previsto:"2027-03", prioridade:"alta",
      objetivo:"Cultivar de Brachiaria com maior tolerância a veranicos, foco no Cerrado.", progresso:55 },
    { id:"pj2", nome:"Soja IPRO ciclo precoce", cultura:"Soja", fase:"validacao", lider:"Dra. Camila Reis", inicio:"2023-05", previsto:"2026-10", prioridade:"alta",
      objetivo:"Reduzir ciclo em 8 dias mantendo produtividade para janela de safrinha.", progresso:78 },
    { id:"pj3", nome:"Milho alta densidade", cultura:"Milho", fase:"pesquisa", lider:"Dr. Henrique Salles", inicio:"2025-02", previsto:"2028-01", prioridade:"media",
      objetivo:"Híbrido adaptado a stand mais adensado, ganho de produtividade por hectare.", progresso:32 },
    { id:"pj4", nome:"Tratamento biológico de sementes", cultura:"Multi", fase:"ideacao", lider:"Dra. Camila Reis", inicio:"2026-04", previsto:"2029-01", prioridade:"media",
      objetivo:"Bioinsumo de tratamento on seed para vigor inicial e proteção radicular.", progresso:12 },
    { id:"pj5", nome:"Capim Zuri II", cultura:"Forrageira", fase:"registro", lider:"Dr. Henrique Salles", inicio:"2022-08", previsto:"2026-09", prioridade:"alta",
      objetivo:"Evolução do Zuri com mais folhas e resistência a cigarrinha. Em registro no MAPA.", progresso:92 }
  ];

  // Ensaios de campo
  var ensaios = [
    { id:"en1", projeto:"pj1", local:"Rondonópolis, MT", safra:"2025/26", cultivar:"BR-Seca-03", repeticoes:4, status:"andamento",
      variaveis:"Produção de MS, sobrevivência pós-veranico", resultado:"", responsavel:"Eng. Paulo Tavares" },
    { id:"en2", projeto:"pj1", local:"Barreiras, BA", safra:"2025/26", cultivar:"BR-Seca-03", repeticoes:4, status:"andamento",
      variaveis:"Produção de MS, cobertura de solo", resultado:"", responsavel:"Eng. Paulo Tavares" },
    { id:"en3", projeto:"pj2", local:"Sorriso, MT", safra:"2025/26", cultivar:"SBS-Prec-12", repeticoes:6, status:"concluido",
      variaveis:"Ciclo, produtividade (sc/ha)", resultado:"Ciclo -7 dias; 62 sc/ha (test. 60).", responsavel:"Eng. Larissa Mota" },
    { id:"en4", projeto:"pj5", local:"Campo Grande, MS", safra:"2025/26", cultivar:"Zuri II", repeticoes:5, status:"concluido",
      variaveis:"MS, resistência cigarrinha", resultado:"+14% MS; baixa infestação.", responsavel:"Eng. Paulo Tavares" },
    { id:"en5", projeto:"pj3", local:"Rio Verde, GO", safra:"2025/26", cultivar:"MD-Alta-07", repeticoes:4, status:"planejado",
      variaveis:"Stand x produtividade", resultado:"", responsavel:"Eng. Larissa Mota" }
  ];

  // Catálogo de cultivares em desenvolvimento
  var cultivares = [
    { id:"cv1", codigo:"BR-Seca-03", nome:"Brachiaria Resiliente", cultura:"Forrageira", estagio:"Ensaio multilocal", projeto:"pj1", destaque:"Tolerância a veranico", vc:"—" },
    { id:"cv2", codigo:"SBS-Prec-12", nome:"Soja Precoce 12", cultura:"Soja", estagio:"Validação final", projeto:"pj2", destaque:"Ciclo precoce -7d", vc:"82%" },
    { id:"cv3", codigo:"Zuri II", nome:"Capim Zuri II", cultura:"Forrageira", estagio:"Registro MAPA", projeto:"pj5", destaque:"+14% massa seca", vc:"80%" },
    { id:"cv4", codigo:"MD-Alta-07", nome:"Milho Densidade 07", cultura:"Milho", estagio:"Pesquisa", projeto:"pj3", destaque:"Alta densidade", vc:"—" }
  ];

  // Banco de ideias / inovação (origem: equipe ou app)
  var ideias = [
    { id:"id1", titulo:"App avisar janela ideal de plantio por região", origem:"Campo (vendedor)", autor:"Willian Luque", status:"em_analise", votos:12, data:"2026-06-10",
      descricao:"Produtores perguntam muito a melhor data. Cruzar cultivar + região + clima." },
    { id:"id2", titulo:"Cultivar de milheto resistente a seca extrema", origem:"P&D", autor:"Dra. Camila Reis", status:"aprovada", votos:8, data:"2026-05-22",
      descricao:"Demanda crescente do semiárido. Virou projeto de ideação." },
    { id:"id3", titulo:"Embalagem com QR de rastreabilidade do lote", origem:"Qualidade", autor:"Equipe Qualidade", status:"em_analise", votos:15, data:"2026-06-01",
      descricao:"QR no saco leva a laudo de germinação e pureza do lote." },
    { id:"id4", titulo:"Tratamento contra cigarrinha em forrageiras", origem:"Campo (vendedor)", autor:"Bruno Lima", status:"nova", votos:5, data:"2026-06-18",
      descricao:"Muitas reclamações de cigarrinha em pastagem. Linha de pesquisa." }
  ];

  // Marcos / cronograma
  var marcos = [
    { id:"mk1", projeto:"pj5", titulo:"Submissão registro Zuri II ao MAPA", data:"2026-07-15", status:"pendente" },
    { id:"mk2", projeto:"pj2", titulo:"Decisão go/no-go Soja Precoce", data:"2026-08-30", status:"pendente" },
    { id:"mk3", projeto:"pj1", titulo:"Fechar 2ª safra de ensaios Brachiaria", data:"2026-09-20", status:"pendente" },
    { id:"mk4", projeto:"pj5", titulo:"Aprovação interna do dossiê Zuri II", data:"2026-05-30", status:"concluido" }
  ];

  // Documentos técnicos / laudos
  var docs = [
    { id:"dc1", titulo:"Laudo germinação lote Zuri II", tipo:"Laudo", projeto:"pj5", data:"2026-05-12", autor:"Lab. Sementes" },
    { id:"dc2", titulo:"Relatório ensaio Soja Precoce — Sorriso", tipo:"Relatório", projeto:"pj2", data:"2026-04-28", autor:"Eng. Larissa Mota" },
    { id:"dc3", titulo:"Protocolo experimental Brachiaria seca", tipo:"Protocolo", projeto:"pj1", data:"2025-09-15", autor:"Dr. Henrique Salles" },
    { id:"dc4", titulo:"Dossiê de registro Zuri II (MAPA)", tipo:"Dossiê", projeto:"pj5", data:"2026-05-30", autor:"P&D" }
  ];

  return { FASES:FASES, projetos:projetos, ensaios:ensaios, cultivares:cultivares, ideias:ideias, marcos:marcos, docs:docs };
})();
