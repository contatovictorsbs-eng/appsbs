/* ===========================================================
   SBS — Documentação · Central de Atendimento
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.atendimento = {
  nome: "Central de Ajuda · Central de Atendimento",
  sub: "Caixa unificada de atendimento das 3 marcas (Nobre Brasil, SBS Green Seeds, SememBrás).",
  perfis: ["Administrador", "Supervisor", "Atendente"],
  grupos: [
    {
      nome: "Operacional",
      itens: [
        { id:"caixa", icon:"message-square", titulo:"Caixa de Atendimento", resumo:"Todas as conversas das marcas num só lugar.",
          oque:"Reúne as conversas de todos os canais (WhatsApp, e-mail, chat, redes) das três marcas. Cada atendente vê apenas as marcas atribuídas. As reclamações e chamados abertos no app do vendedor entram automaticamente aqui (marca SBS · canal App).",
          comoUsar:["Filtre por marca e por situação (pendente, em atendimento, resolvida) na coluna da esquerda.","Clique numa conversa para abrir.","Escreva e envie a resposta, atribua a você ou marque como resolvida.","Itens vindos do app podem ser marcados como resolvidos, atualizando o registro original."],
          quemAcessa:["Administrador", "Supervisor", "Atendente"],
          video:{ roteiro:"A Central de Atendimento junta tudo numa caixa só: WhatsApp, e-mail, chat e redes das três marcas — Nobre Brasil, SBS Green Seeds e SememBrás. Filtre por marca e situação, abra a conversa e responda na hora. E o melhor: as reclamações e chamados que chegam pelo app do vendedor caem aqui automaticamente, então nada se perde. Cada atendente vê só as marcas que atende." } },
      ]
    },
    {
      nome: "Gerencial",
      itens: [
        { id:"indicadores", icon:"bar-chart-3", titulo:"Indicadores", resumo:"Volume por marca, por canal e por situação.",
          oque:"Painel de números do atendimento: total de conversas, pendentes, em atendimento e resolvidas, com volume por marca e por canal.",
          comoUsar:["Abra a aba Gerencial → Indicadores.","Acompanhe os totais e o volume por marca/canal."],
          quemAcessa:["Administrador", "Supervisor"] },
        { id:"canais", icon:"plug", titulo:"Canais", resumo:"WhatsApp, e-mail, chat e redes por marca.",
          oque:"Lista e gerencia os canais conectados de cada marca, com status (conectado/pendente).",
          comoUsar:["Abra Gerencial → Canais.","Veja o status de cada canal.","Conecte/desconecte conforme necessário."],
          quemAcessa:["Administrador", "Supervisor"] },
        { id:"agentes", icon:"users", titulo:"Agentes", resumo:"Equipe e marcas que cada um atende.",
          oque:"Mostra a equipe de atendimento, o papel (admin, supervisor, atendente) e as marcas que cada um enxerga.",
          comoUsar:["Abra Gerencial → Agentes.","Confira papéis e escopo de marcas."],
          quemAcessa:["Administrador", "Supervisor"] },
        { id:"regras", icon:"route", titulo:"Regras de roteamento", resumo:"Encaminhamento automático por palavra-chave.",
          oque:"Define que ao conter uma palavra-chave (ex.: exportação, boleto), a conversa é encaminhada para a fila certa.",
          comoUsar:["Abra Gerencial → Regras de roteamento.","Ative/desative cada regra."],
          quemAcessa:["Administrador", "Supervisor"] },
      ]
    },
  ]
};
