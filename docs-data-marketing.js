/* ===========================================================
   SBS — Documentação · Painel de Marketing
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.marketing = {
  nome: "Central de Ajuda · Painel de Marketing",
  sub: "Campanhas, materiais, calendário de conteúdo, redes e eventos.",
  perfis: ["Marketing", "Administrador", "T.I.", "CEO (leitura)"],
  grupos: [
    {
      nome: "Marketing",
      itens: [
        { id:"visao", icon:"gauge", titulo:"Visão Geral", resumo:"Os principais números de marketing num relance.",
          oque:"Tela inicial: campanhas ativas, verba, seguidores e leads de eventos, além de atalhos para o que está pendente.",
          comoUsar:["Abra o painel — a Visão Geral é a primeira tela.","Acompanhe os KPIs e os destaques.","Use os atalhos para aprofundar."],
          quemAcessa:["Marketing", "Administrador"],
          video:{ roteiro:"O Painel de Marketing abre na Visão Geral: campanhas ativas, verba investida, seguidores nas redes e leads de eventos — tudo num relance. Daqui você navega para cada área. E o melhor: o que você publica aqui reflete direto no app do vendedor." } },
        { id:"campanhas", icon:"megaphone", titulo:"Campanhas", resumo:"Planeje e ative campanhas que aparecem no app.",
          oque:"Cria e gerencia campanhas com status, canal, período, verba, meta e responsável. As campanhas ativas aparecem para a equipe no app do vendedor.",
          comoUsar:["Abra Campanhas.","Clique em Nova campanha e preencha os dados.","Defina o status: rascunho, planejada, ativa ou encerrada.","Campanhas ativas aparecem automaticamente no app do vendedor."],
          quemAcessa:["Marketing", "Administrador"],
          video:{ roteiro:"Em Campanhas você planeja toda a comunicação comercial. Crie a campanha, defina canal, período, verba e meta. Quando marca como ativa, ela aparece na hora no app do vendedor, para todo o time usar com os clientes. Simples assim." } },
        { id:"materiais", icon:"image", titulo:"Materiais & Criativos", resumo:"Banco de artes disponível no app.",
          oque:"Gerencia o banco de imagens e artes. Tudo o que você publica aqui fica disponível em 'Marketing' no app do vendedor, pronto para compartilhar com clientes.",
          comoUsar:["Abra Materiais & Criativos.","Clique em Adicionar material; envie a imagem ou cole o link.","Defina título e categoria.","O material aparece no app para os vendedores compartilharem."],
          quemAcessa:["Marketing", "Administrador"],
          video:{ roteiro:"Materiais e Criativos é o banco de artes da empresa. Suba aqui as imagens das campanhas, e elas ficam disponíveis no app para o vendedor compartilhar com o cliente pelo WhatsApp num toque. Centralizado e sempre atualizado." } },
        { id:"conteudo", icon:"calendar-days", titulo:"Calendário de Conteúdo", resumo:"Pipeline editorial das redes.",
          oque:"Quadro (kanban) do conteúdo das redes: da ideia até o publicado, com canal, formato, data e responsável.",
          comoUsar:["Abra o Calendário de Conteúdo.","Crie itens e mova entre Ideia, Em produção, Agendado e Publicado.","Clique num card para editar."],
          quemAcessa:["Marketing", "Administrador"] },
        { id:"redes", icon:"share-2", titulo:"Redes & Canais", resumo:"Métricas das redes sociais.",
          oque:"Acompanha seguidores, alcance, variação e engajamento por canal. Atualização manual dos números.",
          comoUsar:["Abra Redes & Canais.","Veja o desempenho por canal.","Clique em Atualizar para lançar os números do mês."],
          quemAcessa:["Marketing", "Administrador"] },
        { id:"eventos", icon:"tent", titulo:"Eventos & Feiras", resumo:"Agenda de feiras e eventos próprios.",
          oque:"Planeja e acompanha feiras e eventos, com local, datas, custo, leads captados e responsável.",
          comoUsar:["Abra Eventos & Feiras.","Cadastre o evento e o investimento previsto.","Após o evento, registre os leads captados."],
          quemAcessa:["Marketing", "Administrador"] },
      ]
    },
  ]
};
