/* ===========================================================
   SBS — Documentação · Painel de P&D / Inovação
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.pd = {
  nome: "Central de Ajuda · Painel de P&D / Inovação",
  sub: "Pipeline de projetos, ensaios, cultivares, ideias, cronograma e documentos.",
  perfis: ["P&D / Pesquisa", "Administrador", "T.I.", "CEO (leitura)"],
  grupos: [
    {
      nome: "Pesquisa & Desenvolvimento",
      itens: [
        { id:"visao", icon:"gauge", titulo:"Visão Geral", resumo:"O estado da pesquisa num relance.",
          oque:"Tela inicial: projetos em andamento, ensaios em campo, cultivares em desenvolvimento e ideias em avaliação, com a distribuição de projetos por fase.",
          comoUsar:["Abra o painel — a Visão Geral é a primeira tela.","Acompanhe os KPIs e o funil de fases.","Veja o insumo vindo do campo e o próximo marco."],
          quemAcessa:["P&D / Pesquisa", "Administrador"],
          video:{ roteiro:"O Painel de P&D abre na Visão Geral: quantos projetos estão em andamento, ensaios no campo, cultivares em desenvolvimento e ideias em avaliação. O funil mostra em que fase está cada projeto. É o mapa da inovação da empresa num relance." } },
        { id:"pipeline", icon:"git-branch", titulo:"Pipeline de Projetos", resumo:"Projetos por fase, da ideação ao lançamento.",
          oque:"Quadro dos projetos de pesquisa distribuídos pelas fases: ideação, pesquisa, ensaio, validação, registro e lançamento. Cada projeto tem líder, cultura, prioridade e progresso.",
          comoUsar:["Abra o Pipeline.","Veja os projetos organizados por fase.","Clique num projeto para detalhes, ensaios e marcos.","Crie ou edite projetos e atualize a fase conforme avançam."],
          quemAcessa:["P&D / Pesquisa", "Administrador"],
          video:{ roteiro:"O Pipeline de Projetos é o coração do P&D. Cada projeto caminha pelas fases — da ideação ao lançamento. Você vê o líder, a prioridade e o progresso de cada um, e move o projeto de fase conforme a pesquisa avança. Visão total do que vem por aí." } },
        { id:"ensaios", icon:"flask-conical", titulo:"Ensaios de Campo", resumo:"Experimentos por local, safra e cultivar.",
          oque:"Registra os ensaios de campo: local, safra, cultivar testada, repetições, variáveis e o resultado quando concluído.",
          comoUsar:["Abra Ensaios de Campo.","Cadastre o ensaio ligado a um projeto.","Acompanhe o status (planejado, em andamento, concluído).","Ao final, lance o resultado observado."],
          quemAcessa:["P&D / Pesquisa", "Administrador"],
          video:{ roteiro:"Em Ensaios de Campo fica o trabalho de verdade no solo. Cada experimento registra local, safra, cultivar e repetições. Conforme o ensaio anda, você atualiza o status e, no fim, lança o resultado. Assim a decisão sobre uma cultivar é baseada em dados de campo, não em achismo." } },
        { id:"cultivares", icon:"sprout", titulo:"Cultivares", resumo:"Catálogo das cultivares em desenvolvimento.",
          oque:"Lista as cultivares em desenvolvimento com código, cultura, estágio, destaque e valor cultural (VC), vinculadas ao projeto de origem.",
          comoUsar:["Abra Cultivares.","Veja o catálogo das que estão em desenvolvimento.","Cadastre/edite com código, estágio e destaque."],
          quemAcessa:["P&D / Pesquisa", "Administrador"] },
        { id:"ideias", icon:"lightbulb", titulo:"Banco de Ideias", resumo:"Inovação vinda da equipe e do campo.",
          oque:"Quadro de ideias de inovação (novas, em análise, aprovadas, arquivadas). As reclamações de campo abertas no app aparecem como insumo e podem virar ideias com um clique.",
          comoUsar:["Abra o Banco de Ideias.","Cadastre ideias e mova entre as colunas.","No painel lateral, transforme uma reclamação de campo em ideia de pesquisa."],
          quemAcessa:["P&D / Pesquisa", "Administrador"],
          video:{ roteiro:"O Banco de Ideias é onde a inovação nasce. A equipe registra sugestões, e o melhor: as reclamações que chegam do campo pelo app viram insumo de pesquisa com um clique. Quem está na lavoura ajuda a definir a próxima cultivar. A inovação começa no campo." } },
        { id:"cronograma", icon:"calendar-clock", titulo:"Cronograma & Marcos", resumo:"Datas e marcos dos projetos.",
          oque:"Linha do tempo com os marcos importantes (registros, decisões go/no-go, fechamento de safras) e seu status.",
          comoUsar:["Abra Cronograma & Marcos.","Acompanhe a linha do tempo.","Marque marcos como concluídos quando atingidos."],
          quemAcessa:["P&D / Pesquisa", "Administrador"] },
        { id:"documentos", icon:"file-text", titulo:"Documentos & Laudos", resumo:"Laudos, relatórios e protocolos.",
          oque:"Registro dos documentos técnicos: laudos, relatórios de ensaio, protocolos e dossiês, vinculados ao projeto.",
          comoUsar:["Abra Documentos & Laudos.","Cadastre o documento com tipo, data e projeto.","Use o link do Drive para anexar o arquivo."],
          quemAcessa:["P&D / Pesquisa", "Administrador"] },
      ]
    },
  ]
};
