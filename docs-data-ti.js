/* ===========================================================
   SBS — Documentação · Painel de T.I.
   Central de Ajuda do setor de Tecnologia (features, GMud, versões).
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.ti = {
  nome: "Central de Ajuda · Painel de T.I.",
  sub: "Como liberar funcionalidades, registrar mudanças (GMud) e controlar as versões do sistema.",
  perfis: ["Tecnologia / T.I.", "Administrador"],
  grupos: [
    {
      nome: "Conceitos (leia primeiro)",
      itens: [
        { id:"conceito-camadas", icon:"layers", titulo:"As 3 camadas de atualização", resumo:"O que muda sozinho e o que precisa republicar.",
          oque:"O sistema tem 3 camadas independentes: DADOS (pedidos, preços, reclamações — mudam pela nuvem, em tempo real), FEATURES (ligar/desligar funcionalidades pelo Painel de T.I., em tempo real) e CÓDIGO (telas e visual — exige subir o código novo no GitHub, e o Netlify republica sozinho).",
          comoUsar:["Mudou um dado? Use o Painel Gerencial — sem republicar.","Quer ligar/desligar função? Use Liberação de Features — sem republicar.","Mudou o código? Suba no GitHub; o Netlify publica em ~1 min."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"],
          video:{ roteiro:"Antes de tudo, entenda as três camadas do sistema SBS. Primeira: dados, como pedidos e preços, que mudam pela nuvem em tempo real. Segunda: features, que a T.I. liga e desliga aqui no painel, também na hora. Terceira: o código em si, que quando muda precisa ser enviado ao GitHub — e aí o Netlify publica sozinho. Saber em qual camada está a mudança define o caminho certo." } },
        { id:"conceito-publicacao", icon:"rocket", titulo:"Como o sistema é publicado", resumo:"GitHub + Netlify automático.",
          oque:"O código fica no repositório GitHub (appsbs). O Netlify está ligado a esse repositório e republica automaticamente a cada alteração enviada. O link público não muda.",
          comoUsar:["Receba os arquivos alterados.","Suba no GitHub: Add file → Upload files → Commit.","O Netlify detecta e republica em ~1 min.","Confira no link .netlify.app."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"] },
      ]
    },
    {
      nome: "Funcionalidades do Painel de T.I.",
      itens: [
        { id:"overview", icon:"layout-dashboard", titulo:"Visão Geral", resumo:"Resumo de features, GMuds e versão.",
          oque:"Tela inicial do painel: quantas features estão liberadas/desligadas, GMuds em aberto, mudanças em execução e a versão atual do sistema.",
          comoUsar:["Abra o Painel de T.I. — a Visão Geral é a primeira tela.","Veja os KPIs no topo.","Use os atalhos para gerenciar features ou abrir uma GMud."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"] },
        { id:"features", icon:"toggle-right", titulo:"Liberação de Features", resumo:"Ligue/desligue funcionalidades sem republicar.",
          oque:"Lista todas as funcionalidades com uma chave liga/desliga. Desligar remove o item do menu e da home do app de todos os usuários, na hora, sem republicar.",
          comoUsar:["Abra Liberação de Features.","Encontre a funcionalidade (estão agrupadas).","Toque na chave para ligar ou desligar.","Pronto — reflete no app em tempo real.","Registre a mudança em GMud para notificar a equipe."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"],
          video:{ roteiro:"A Liberação de Features é o coração do Painel de T.I. Cada funcionalidade do app tem uma chave. Desligou? Ela some do menu e da home de todos os vendedores na mesma hora, pela nuvem, sem republicar o app. Ligou de novo? Volta na hora. Sempre que fizer isso, registre uma GMud para a equipe ficar sabendo da mudança." } },
        { id:"gmud", icon:"git-pull-request-arrow", titulo:"GMud · Gestão de Mudanças", resumo:"Registre e controle cada mudança do sistema.",
          oque:"Registra cada mudança com tipo, risco, janela, responsável, features impactadas, plano de rollback e versão. A mudança segue um fluxo de status e, ao concluir, notifica a equipe e atualiza a versão do sistema.",
          comoUsar:["Abra GMud e toque em Nova GMud.","Preencha título, descrição, tipo e risco.","Defina a janela de execução e o responsável.","Marque as features impactadas e o plano de rollback.","Salve. Avance o status: Rascunho → Agendada → Em execução → Concluída.","Ao concluir, a equipe é notificada e a versão é atualizada."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"],
          video:{ roteiro:"GMud é a gestão de mudanças do sistema. Para cada alteração relevante, abra uma nova GMud: descreva o que muda, o tipo, o risco, quando vai acontecer, quem é responsável, quais features são afetadas e o plano de rollback caso algo dê errado. A mudança caminha por um fluxo — rascunho, agendada, em execução e concluída. Ao concluir, todos os usuários são notificados automaticamente e a versão do sistema é atualizada." } },
        { id:"changelog", icon:"history", titulo:"Versões / Changelog", resumo:"Histórico de versões do sistema.",
          oque:"Mostra a versão atual em produção e a linha do tempo de todas as mudanças concluídas (geradas a partir das GMuds).",
          comoUsar:["Abra Versões / Changelog.","Veja no topo a versão atual.","Role a linha do tempo para o histórico de mudanças."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"],
          video:{ roteiro:"O Changelog é a memória do sistema. No topo, a versão atual em produção. Abaixo, a linha do tempo de tudo que já foi entregue — cada item nasce de uma GMud concluída. É a forma simples de saber o que mudou, quando e por quem." } },
        { id:"plataformas", icon:"layout-grid", titulo:"Plataformas do Sistema", resumo:"Ligue/desligue cada painel ou o app.",
          oque:"A T.I. gerencia todas as plataformas. Desligar uma plataforma a coloca em 'manutenção' para todos os usuários, em tempo real, sem republicar. O Painel de T.I. nunca pode se desligar.",
          comoUsar:["Abra Plataformas.","Use a chave para ativar ou colocar em manutenção cada plataforma.","A mudança vale na hora para todos os usuários.","Registre a mudança em GMud."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"],
          video:{ roteiro:"Em Plataformas, a T.I. controla o sistema inteiro. Cada plataforma tem uma chave; ao desligar, entra em manutenção para todos na hora, sem republicar. O Painel de T.I. fica travado ligado. É o disjuntor geral do sistema SBS." } },
        { id:"integracoes", icon:"git-compare", titulo:"Integrações · Saúde dos Dados", resumo:"Valida o cruzamento de dados entre tudo.",
          oque:"Diagnóstico em tempo real que verifica se as informações cruzam corretamente entre as 9 plataformas: pedidos, reclamações, equipe/mapa, RH/app do colaborador, materiais de marketing, indicadores do CEO, features e integridade referencial.",
          comoUsar:["Abra Integrações.","Veja o resumo (OK / atenção / inconsistências).","Cada área lista o que está integrado e o detalhe."],
          quemAcessa:["Tecnologia / T.I.", "Administrador"],
          video:{ roteiro:"Integrações é o raio-x do sistema. Em tempo real, ele confere se os dados cruzam certo entre todas as plataformas — pedidos, reclamações, equipe no mapa, RH ligado ao app do colaborador, tudo. Verde é integração saudável. É a garantia de que o sistema todo fala a mesma língua." } },
      ]
    },
  ]
};
