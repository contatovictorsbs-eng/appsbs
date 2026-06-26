/* ===========================================================
   SBS — Documentação · Painel de RH
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.rh = {
  nome: "Central de Ajuda · Painel de RH",
  sub: "Recrutamento & Seleção e Endomarketing: vagas, candidatos, pessoas e comunicação interna.",
  perfis: ["RH", "Administrador", "T.I.", "CEO (leitura)"],
  grupos: [
    {
      nome: "Recrutamento & Seleção",
      itens: [
        { id:"visao", icon:"gauge", titulo:"Visão Geral", resumo:"O estado do RH num relance.",
          oque:"Tela inicial: vagas abertas, candidatos em processo, colaboradores ativos, aniversariantes do mês e próximos eventos.",
          comoUsar:["Abra o painel — a Visão Geral é a primeira tela.","Acompanhe os KPIs e os destaques.","Use os atalhos para aprofundar."],
          quemAcessa:["RH", "Administrador"],
          video:{ roteiro:"O Painel de RH reúne recrutamento e endomarketing num só lugar. Na Visão Geral você vê as vagas abertas, os candidatos em processo, o time ativo, os aniversariantes do mês e a agenda. Tudo o que o RH precisa para começar o dia." } },
        { id:"vagas", icon:"briefcase", titulo:"Vagas", resumo:"Abertura e acompanhamento de vagas.",
          oque:"Cria e gerencia as vagas com área, local, tipo, senioridade, número de posições e recrutador responsável.",
          comoUsar:["Abra Vagas.","Clique em Nova vaga e preencha os dados.","Acompanhe os candidatos vinculados a cada vaga.","Feche a vaga quando preenchida."],
          quemAcessa:["RH", "Administrador"],
          video:{ roteiro:"Em Vagas você abre e acompanha cada posição da empresa. Defina área, local, senioridade e quantas posições. Cada vaga mostra quantos candidatos estão concorrendo, e você fecha quando o processo termina. Organização total do recrutamento." } },
        { id:"candidatos", icon:"user-search", titulo:"Candidatos", resumo:"Funil de seleção, da triagem à contratação.",
          oque:"Quadro (pipeline) dos candidatos por etapa: triagem, entrevista, teste, proposta e contratado. Com avaliação por estrelas, perfil DISC, origem e observações.",
          comoUsar:["Abra Candidatos.","Filtre por vaga, se quiser.","Clique num candidato para ver detalhes, avançar de etapa e registrar o DISC.","Registre a avaliação e as observações."],
          quemAcessa:["RH", "Administrador"],
          video:{ roteiro:"Candidatos é o funil de seleção. Cada pessoa caminha da triagem até a contratação. Você avalia com estrelas, registra o perfil DISC e avança o candidato com um clique. Nenhum talento se perde no caminho." } },
        { id:"canais", icon:"share-2", titulo:"Canais & LinkedIn", resumo:"Conecte vários LinkedIn para receber currículos.",
          oque:"Cadastro dos canais de recrutamento — várias contas/páginas do LinkedIn, e-mail e outros — com o volume de currículos recebidos por canal.",
          comoUsar:["Abra Canais & LinkedIn.","Clique em Conectar canal e informe a conta/página.","Adicione quantas contas LinkedIn precisar.","Acompanhe os currículos recebidos por canal."],
          quemAcessa:["RH", "Administrador"],
          video:{ roteiro:"Em Canais e LinkedIn você conecta vários perfis e páginas do LinkedIn, além de e-mail, para receber currículos num lugar só. Cada canal mostra quantos candidatos trouxe. Mais alcance, mais talento chegando." } },
        { id:"disc", icon:"brain", titulo:"Avaliação DISC", resumo:"Perfil comportamental do candidato.",
          oque:"Registra o perfil DISC (Dominância, Influência, Estabilidade, Conformidade) de cada candidato, com pontuação e perfil dominante destacado no funil.",
          comoUsar:["Abra um candidato em Candidatos.","Clique em DISC.","Ajuste a pontuação de cada fator (0–100).","O perfil dominante aparece no card e no detalhe."],
          quemAcessa:["RH", "Administrador"] },
      ]
    },
    {
      nome: "Pessoas",
      itens: [
        { id:"colaboradores", icon:"users", titulo:"Colaboradores", resumo:"Cadastro do time ativo.",
          oque:"Lista os colaboradores com cargo, área, local, data de admissão, aniversário e situação.",
          comoUsar:["Abra Colaboradores.","Cadastre/edite as pessoas do time.","Use os dados de aniversário para o endomarketing."],
          quemAcessa:["RH", "Administrador"] },
        { id:"endomarketing", icon:"party-popper", titulo:"Endomarketing", resumo:"Comunicação interna e agenda do time.",
          oque:"Mural de comunicados internos (com destaque/fixar) e agenda de eventos internos: onboarding, treinamentos e confraternizações.",
          comoUsar:["Abra Endomarketing.","Publique comunicados para o time e fixe os importantes.","Cadastre os eventos internos na agenda."],
          quemAcessa:["RH", "Administrador"],
          video:{ roteiro:"Endomarketing é o canal do RH com o time. Publique comunicados — benefícios, campanhas, avisos — e fixe os mais importantes no topo. Na agenda interna, organize onboardings, treinamentos e confraternizações. É assim que se mantém todo mundo conectado e engajado." } },
      ]
    },
  ]
};
