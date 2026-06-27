/* ===========================================================
   SBS — Documentação · Painel de Inteligência de Mercado
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.mercado = {
  nome: "Central de Ajuda · Inteligência de Mercado",
  sub: "Cotações, concorrentes, regiões e tendências do agronegócio de sementes.",
  perfis: ["Inteligência de Mercado", "Comercial", "Administrador", "CEO (leitura)"],
  grupos: [
    {
      nome: "Inteligência de Mercado",
      itens: [
        { id:"visao", icon:"gauge", titulo:"Visão Geral", resumo:"O mercado num relance.",
          oque:"Tela inicial com os principais indicadores: cotações-chave, concorrentes monitorados, tendências de alto impacto e participação por região.",
          comoUsar:["Abra o painel — a Visão Geral é a primeira tela.","Acompanhe os destaques.","Use os atalhos para aprofundar."],
          quemAcessa:["Inteligência de Mercado", "Comercial", "Administrador"],
          video:{ roteiro:"O Painel de Inteligência de Mercado reúne tudo que a SBS precisa saber sobre o mercado de sementes e o agro. Na Visão Geral você vê as cotações que importam, os concorrentes que estamos de olho e as tendências que podem virar oportunidade. É o radar do negócio." } },
        { id:"cotacoes", icon:"trending-up", titulo:"Cotações & Commodities", resumo:"Preços de soja, milho, sementes e mais.",
          oque:"Acompanha os preços das principais commodities e insumos. O CÂMBIO (dólar/euro) e os INDICADORES GLOBAIS (milho, trigo, café, açúcar, algodão, petróleo) são atualizados AO VIVO automaticamente. As cotações nacionais em saca (soja/milho CEPEA, boi) são atualizadas manualmente ou pelo backend, quando configurado.",
          comoUsar:["Abra Cotações & Commodities.","O câmbio ao vivo aparece no topo (Visão Geral) e os indicadores globais aqui.","Para ligar as commodities globais, clique em 'Fontes ao vivo' e cole uma chave gratuita da Alpha Vantage.","Cadastre/atualize manualmente as cotações nacionais em saca (CEPEA/B3).","A variação (alta/baixa) é calculada automaticamente."],
          quemAcessa:["Inteligência de Mercado", "Comercial", "Administrador"],
          video:{ roteiro:"Em Cotações você acompanha o mercado em tempo real: o dólar e o euro atualizam sozinhos, e os indicadores globais de grãos também, com uma chave gratuita. A soja e o boi em saca, do CEPEA, entram pelo cadastro ou pela integração de backend. Saber para onde o preço está indo ajuda o comercial a posicionar a venda — informação que vira margem." } },
        { id:"clima", icon:"cloud-sun", titulo:"Clima & Safra", resumo:"Previsão por praça agrícola, ao vivo.",
          oque:"Mostra o clima ao vivo (temperatura, umidade, vento e previsão de 7 dias) das principais praças agrícolas, com a chuva acumulada da semana. O painel sinaliza CHUVA BAIXA (risco de seca) ou EXCESSO DE CHUVA por praça — e esses sinais alimentam as automações de alerta.",
          comoUsar:["Abra Clima & Safra.","Cadastre as praças com latitude e longitude (pegue no Google Maps).","Acompanhe a previsão e o risco de cada região.","Ajuste os limites de risco em 'Limites de risco' (mm de chuva em 7 dias)."],
          quemAcessa:["Inteligência de Mercado", "Comercial", "Administrador"],
          video:{ roteiro:"Clima é decisão no agro. Aqui a SBS vê, ao vivo e de graça, como está o tempo nas praças que importam: temperatura, vento, umidade e a chuva dos próximos 7 dias. Quando uma região fica seca demais ou chove demais, o painel avisa — e esse aviso vira alerta automático para o comercial e o P&D se anteciparem." } },
        { id:"alertas", icon:"bell-ring", titulo:"Alertas & Automações", resumo:"Regras que geram alertas sozinhas.",
          oque:"Motor de automações: você cria regras que observam as cotações, o câmbio ao vivo e o clima das praças. Quando uma condição é atingida (ex.: soja sobe mais de 5%, dólar acima de R$ 5,50, chuva baixa numa praça), o painel gera um ALERTA automaticamente. Regras marcadas podem virar uma Tendência sozinhas.",
          comoUsar:["Abra Alertas & Automações.","Clique em 'Nova automação' e escolha o gatilho (cotação, câmbio ou clima).","Defina o limite e o impacto; marque 'gerar tendência' se quiser.","Ative/pause cada automação pelo botão.","Use 'Rodar agora' para reavaliar na hora."],
          quemAcessa:["Inteligência de Mercado", "Administrador"],
          video:{ roteiro:"Em vez de ficar olhando o mercado o tempo todo, deixe o painel vigiar por você. As automações observam preço, dólar e clima e disparam um alerta quando algo muda de verdade. Você só decide o que fazer com a informação — e as mais importantes viram tendência automaticamente." } },
        { id:"estudos", icon:"presentation", titulo:"Estudos & Apresentações", resumo:"Monte um estudo e apresente em PDF.",
          oque:"Ferramenta para montar um estudo de mercado escolhendo blocos prontos (objetivo, câmbio, cotações, clima, concorrentes, regiões, tendências, alertas e textos livres) e gerar uma APRESENTAÇÃO navegável — pronta para projetar numa reunião ou exportar em PDF.",
          comoUsar:["Abra Estudos & Apresentações e clique em 'Novo estudo'.","Preencha título, objetivo e autor.","Adicione os blocos que quiser e ordene com as setas.","Clique em 'Pré-visualizar' para ver os slides; use ← → para navegar.","Clique em PDF para imprimir/exportar.","Salve o estudo para reusar depois (os dados atualizam sozinhos)."],
          quemAcessa:["Inteligência de Mercado", "Comercial", "Administrador"],
          video:{ roteiro:"Toda a inteligência do painel vira apresentação em poucos cliques. Você escolhe os blocos — câmbio, cotações, clima, concorrência, tendências — monta o estudo e gera os slides na hora, já com os dados ao vivo. Dá para projetar na reunião ou salvar em PDF. Conhecimento que estava espalhado vira uma história pronta para contar." } },
        { id:"concorrentes", icon:"swords", titulo:"Concorrentes", resumo:"Monitoramento da concorrência.",
          oque:"Registra os concorrentes monitorados: segmento, região, posição no mercado, forças, fraquezas e movimentos recentes.",
          comoUsar:["Abra Concorrentes.","Cadastre cada concorrente e marque para monitorar.","Anote forças, fraquezas e movimentos (lançamentos, preços)."],
          quemAcessa:["Inteligência de Mercado", "Administrador"],
          video:{ roteiro:"Conhecer o concorrente é meio caminho para vencer. Aqui você mapeia quem disputa o mercado com a SBS: onde são fortes, onde são fracos e o que andam lançando. Com isso o comercial e o P&D jogam na frente, não atrás." } },
        { id:"regioes", icon:"map", titulo:"Regiões & Mercado", resumo:"Potencial e participação por região.",
          oque:"Análise por região/estado: cultura predominante, potencial, participação da SBS e tendência de mercado.",
          comoUsar:["Abra Regiões & Mercado.","Cadastre as regiões com potencial e participação.","Acompanhe a tendência (alta/estável/baixa) de cada uma."],
          quemAcessa:["Inteligência de Mercado", "Comercial", "Administrador"] },
        { id:"tendencias", icon:"radar", titulo:"Tendências & Alertas", resumo:"Movimentos do mercado que viram decisão.",
          oque:"Registro de tendências e alertas de mercado, classificados por categoria, impacto e horizonte de tempo.",
          comoUsar:["Abra Tendências & Alertas.","Cadastre a tendência com categoria, impacto e horizonte.","Use as de alto impacto para orientar P&D e comercial."],
          quemAcessa:["Inteligência de Mercado", "Administrador"],
          video:{ roteiro:"Tendências é onde o mercado avisa o que vem por aí — uma demanda nova, uma alta de custo, uma mudança de comportamento do produtor. Marcando o impacto e o horizonte, a SBS antecipa o movimento e transforma tendência em estratégia." } },
      ]
    },
  ]
};
