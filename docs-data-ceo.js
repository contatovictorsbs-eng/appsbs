/* ===========================================================
   SBS — Documentação · Painel do CEO
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.ceo = {
  nome: "Central de Ajuda · Painel do CEO",
  sub: "Visão executiva consolidada, somente leitura. Tudo o que o sistema reúne, num só lugar.",
  perfis: ["Diretoria / CEO", "Gerente Nacional", "Administrador"],
  grupos: [
    {
      nome: "Executivo",
      itens: [
        { id:"panorama", icon:"gauge", titulo:"Panorama Geral", resumo:"Os principais números do negócio num relance.",
          oque:"Tela inicial com os indicadores-chave: faturado, carteira, pedidos, comissões previstas, vendedores ativos e reclamações abertas — além de destaques de equipe ao vivo, atendimento e versão do sistema.",
          comoUsar:["Abra o painel — o Panorama é a primeira tela.","Leia os KPIs no topo.","Use os atalhos dos destaques para aprofundar."],
          quemAcessa:["Diretoria / CEO", "Gerente Nacional", "Administrador"],
          video:{ roteiro:"O Painel do CEO abre no Panorama Geral: faturado, carteira, pedidos, comissões, equipe ativa e atendimento — os números essenciais do negócio num relance. Tudo em tempo real e somente leitura, para a diretoria acompanhar sem risco de alterar nada." } },
        { id:"comercial", icon:"trending-up", titulo:"Comercial", resumo:"Ranking de vendedores e pedidos.",
          oque:"Visão de vendas: faturado, carteira, total e comissões; ranking de vendedores por volume e os pedidos recentes.",
          comoUsar:["Abra Comercial.","Veja o ranking por volume.","Acompanhe os pedidos recentes e seus status."],
          quemAcessa:["Diretoria / CEO", "Gerente Nacional", "Administrador"] },
        { id:"equipe", icon:"map-pinned", titulo:"Equipe em Campo", resumo:"Mapa ao vivo da força de vendas.",
          oque:"Mapa interativo com a localização ao vivo dos vendedores cadastrados que estão com o app aberto. Mesmo mapa do Painel Gerencial, em modo leitura.",
          comoUsar:["Abra Equipe em Campo.","Veja quem está ao vivo, recente ou sem sinal.","Clique num pino para ver detalhes e criar rota."],
          quemAcessa:["Diretoria / CEO", "Gerente Nacional", "Administrador"],
          video:{ roteiro:"Em Equipe em Campo, a diretoria vê no mapa, em tempo real, onde está cada vendedor que está com o app aberto. Verde é quem está ao vivo agora. É a visão de comando do time em campo, direto do painel do CEO." } },
        { id:"atendimento", icon:"headset", titulo:"Atendimento", resumo:"Reclamações e chamados em números.",
          oque:"Consolida reclamações e chamados internos por status (abertos, em análise, resolvidos) com as ocorrências recentes.",
          comoUsar:["Abra Atendimento.","Veja os totais por status.","Acompanhe as ocorrências recentes."],
          quemAcessa:["Diretoria / CEO", "Gerente Nacional", "Administrador"] },
        { id:"adocao", icon:"smartphone", titulo:"Adoção do App", resumo:"Quem usa o app e quanto.",
          oque:"Mostra a adoção do app: usuários ativos, ações registradas, cobertura da equipe e uso por pessoa.",
          comoUsar:["Abra Adoção do App.","Veja a cobertura da equipe.","Identifique quem usa mais e quem usa menos."],
          quemAcessa:["Diretoria / CEO", "Gerente Nacional", "Administrador"] },
      ]
    },
    {
      nome: "Sistema",
      itens: [
        { id:"sistema", icon:"server", titulo:"Estado do Sistema", resumo:"Versão, funcionalidades e entregas.",
          oque:"Mostra a versão em produção, quais funcionalidades estão liberadas/desligadas e as últimas entregas (GMuds). Tudo isso é controlado pelo Painel de T.I.; aqui é apenas leitura.",
          comoUsar:["Abra Estado do Sistema.","Veja a versão atual e o resumo de features.","Acompanhe as últimas entregas concluídas."],
          quemAcessa:["Diretoria / CEO", "Gerente Nacional", "Administrador"],
          video:{ roteiro:"Estado do Sistema dá à diretoria a visão de tecnologia: a versão em produção, quais funcionalidades estão ligadas ou desligadas e as últimas entregas concluídas. Lembrando que quem gerencia tudo isso é o Painel de T.I.; aqui é só acompanhamento." } },
      ]
    },
  ]
};
