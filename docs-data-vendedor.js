/* ===========================================================
   SBS — Documentação · Portal do Vendedor (app)
   Conteúdo da Central de Ajuda. Linguagem simples, de campo.
   Para cada funcionalidade nova, adicione um item aqui.
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.vendedor = {
  nome: "Central de Ajuda · Portal do Vendedor",
  sub: "Tudo que você faz no app, explicado passo a passo. Use a busca para achar rápido.",
  perfis: ["Vendedor", "Supervisor", "Gerente Regional", "Gerente Nacional"],
  grupos: [
    {
      nome: "Começando",
      itens: [
        { id:"login", icon:"log-in", titulo:"Entrar no app", resumo:"Acesso com seu nome e senha.",
          oque:"Dá acesso ao app com seu usuário. O app lembra do login no aparelho.",
          comoUsar:["Digite seu primeiro nome (ex.: ricardo) ou nome.sobrenome.","Digite a senha.","Toque em Entrar. Se errar, confira com a gestão se seu acesso está liberado."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"Olá! Bem-vindo ao Portal do Vendedor da SBS Green Seeds. Para entrar, digite seu primeiro nome no campo usuário e sua senha. Pronto: o app já abre na sua tela inicial, com suas metas e atalhos. O app lembra do seu acesso, então da próxima vez já entra direto." } },
        { id:"home", icon:"house", titulo:"Tela inicial", resumo:"Resumo do seu dia: metas, visitas e atalhos.",
          oque:"Mostra seu nível, o progresso da meta da safra, visitas do mês e os atalhos para as principais funções.",
          comoUsar:["Veja no topo seu nome, nível e pontos.","Toque nos cartões de meta/visitas para ver detalhes.","Use os atalhos coloridos para abrir cada função."],
          quemAcessa:["Todos os perfis"] },
        { id:"notificacoes", icon:"bell", titulo:"Notificações", resumo:"Avisos da empresa e da gestão.",
          oque:"Central de avisos: campanhas, aprovações, cobranças da gestão e mudanças do sistema. O sininho mostra quantas você ainda não leu.",
          comoUsar:["Toque no sino 🔔 no topo da tela.","Leia os avisos; os não lidos têm um ponto verde.","Em avisos direcionados a você, toque em Confirmar recebimento."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"As notificações ficam no sininho no topo do app. É por ali que chegam campanhas, aprovações de desconto, cobranças da gestão e avisos de atualização do sistema. Quando o aviso for direcionado a você, toque em Confirmar recebimento para a gestão saber que você viu." } },
        { id:"config", icon:"settings", titulo:"Configurações e foto", resumo:"Seus dados e foto de perfil.",
          oque:"Ajusta sua foto de perfil e preferências básicas do app.",
          comoUsar:["Abra o menu (☰) e toque em Configurações.","Toque no avatar para trocar sua foto.","Saia da conta pelo botão Sair quando precisar."],
          quemAcessa:["Todos os perfis"] },
        { id:"rastreamento", icon:"navigation", titulo:"Compartilhamento de Localização", resumo:"O app envia sua localização para a gestão durante o expediente.",
          oque:"Para apoiar a operação em campo, o app compartilha sua localização com a gestão enquanto está aberto. Um selo 'Localização ativa' aparece na tela quando isso está acontecendo. A posição é usada no Mapa da Equipe do painel.",
          comoUsar:["Ao abrir o app, permita o acesso à localização quando o aparelho pedir.","O selo 'Localização ativa' indica que está compartilhando.","O compartilhamento ocorre apenas com o app aberto — não há rastreio em segundo plano.","Em caso de dúvidas sobre privacidade, fale com a gestão."],
          quemAcessa:["Todos os perfis"] },
      ]
    },
    {
      nome: "Vendas & Pedidos",
      itens: [
        { id:"precos", icon:"tags", titulo:"Tabela de Preços", resumo:"Preços atualizados por cultura e produto.",
          oque:"Consulta a tabela oficial de preços, sempre atualizada pela empresa. Organizada por catálogo/cultura.",
          comoUsar:["Toque em Preços na barra inferior ou no atalho.","Escolha o catálogo/cultura.","Use a busca para achar o produto.","Confira preço, condição e observações."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"A Tabela de Preços traz os valores oficiais sempre atualizados pela empresa. Escolha a cultura, busque o produto e veja o preço e as condições na hora. Como a tabela vem da nuvem, qualquer atualização aparece automaticamente, sem precisar atualizar o app." } },
        { id:"comissao", icon:"percent", titulo:"Comissão", resumo:"Quanto você ganha em cada venda.",
          oque:"Mostra as regras e o cálculo da sua comissão sobre os pedidos.",
          comoUsar:["Abra Comissão no menu.","Veja o percentual por tipo de produto/condição.","Acompanhe o valor estimado das suas vendas."],
          quemAcessa:["Vendedor", "Supervisor"] },
        { id:"aprovacoes", icon:"badge-check", titulo:"Aprovações de Desconto", resumo:"Peça e acompanhe descontos acima do seu limite.",
          oque:"Quando o desconto passa do seu limite, você solicita aqui e a aprovação sobe pelos níveis (Supervisor, Regional, Nacional) conforme o percentual.",
          comoUsar:["Abra Aprovações e toque em Solicitar.","Informe cliente, produto e o desconto desejado.","Justifique o pedido e envie.","Acompanhe o status; você é avisado quando for aprovado ou recusado."],
          quemAcessa:["Vendedor", "Supervisor", "Gerente Regional", "Gerente Nacional"],
          video:{ roteiro:"Precisa dar um desconto acima do seu limite? Use Aprovações de Desconto. Toque em Solicitar, informe o cliente, o produto e o percentual, escreva uma justificativa e envie. O pedido sobe automaticamente para o nível certo de aprovação e você recebe um aviso assim que for aprovado ou recusado." } },
        { id:"projecao", icon:"calendar-check", titulo:"Projeção de Trabalho", resumo:"Planeje sua semana de visitas e metas.",
          oque:"Onde você planeja a semana: visitas, prospecções e metas. A gestão acompanha as projeções da equipe.",
          comoUsar:["Abra Projeção.","Lance as visitas e prospecções planejadas.","Defina a meta da semana e salve."],
          quemAcessa:["Vendedor", "Supervisor"] },
        { id:"plano", icon:"target", titulo:"Plano de Ação", resumo:"Suas metas e ações para bater o objetivo.",
          oque:"Registra o plano de ação para alcançar as metas: o que fazer, com quais clientes e até quando.",
          comoUsar:["Abra Plano de Ação.","Cadastre as ações e prazos.","Atualize o andamento conforme executa."],
          quemAcessa:["Vendedor", "Supervisor"] },
        { id:"perdas", icon:"trending-down", titulo:"Perdas de Pedidos", resumo:"Registre vendas que não fecharam e o motivo.",
          oque:"Registra pedidos/negociações perdidas e o motivo (preço, prazo, concorrência), ajudando a gestão a agir.",
          comoUsar:["Abra Perdas.","Toque em registrar e informe cliente e valor.","Selecione o motivo da perda e salve."],
          quemAcessa:["Vendedor", "Supervisor"] },
      ]
    },
    {
      nome: "Clientes & Rotas",
      itens: [
        { id:"clientes", icon:"route", titulo:"Clientes & Rotas", resumo:"Sua carteira de clientes e localização.",
          oque:"Lista seus clientes com dados e localização, base para montar rotas e visitas.",
          comoUsar:["Abra Clientes & Rotas.","Busque pelo nome do cliente.","Veja dados, histórico e localização no mapa."],
          quemAcessa:["Todos os perfis"] },
        { id:"rotas", icon:"map", titulo:"Rotas", resumo:"Organize o trajeto das suas visitas.",
          oque:"Monta e visualiza a rota das visitas, otimizando o deslocamento. Gestores veem as rotas da equipe.",
          comoUsar:["Abra Rotas.","Selecione os clientes a visitar.","Veja o trajeto sugerido no mapa."],
          quemAcessa:["Todos os perfis"] },
        { id:"visitas", icon:"map-pinned", titulo:"Relatório de Visitas", resumo:"Registre cada visita feita ao cliente.",
          oque:"Registra a visita com data, cliente, o que foi tratado e fotos. Conta para sua meta de visitas e a gestão acompanha.",
          comoUsar:["Abra Relatório de Visitas e toque em Nova visita.","Selecione o cliente e descreva o que foi tratado.","Anexe fotos se quiser e salve."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"Depois de cada visita, registre aqui. Toque em Nova visita, escolha o cliente, escreva rapidamente o que foi tratado e, se quiser, anexe fotos. A visita já conta para a sua meta do mês e fica visível para a gestão. Simples e rápido, direto do campo." } },
      ]
    },
    {
      nome: "Atendimento ao Cliente",
      itens: [
        { id:"reclamacao", icon:"message-square-warning", titulo:"Reclamações", resumo:"Abra um chamado de reclamação do cliente.",
          oque:"Abre o protocolo de reclamação do cliente. Você escolhe entre reclamação geral ou o protocolo técnico de Renovação de Pastagem. Permite anexar fotos e arquivos.",
          comoUsar:["Abra Reclamações.","Escolha o tipo: Reclamação geral ou Renovação de Pastagem.","Preencha os dados do cliente e a ocorrência.","Toque em Câmera/Galeria/Arquivo para anexar fotos e laudos.","Envie — o protocolo segue o fluxo Vendedor → Assistência → Qualidade → Retorno."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"Para registrar uma reclamação do cliente, abra Reclamações e escolha o tipo. Preencha os dados e descreva a ocorrência. O importante: use os botões Câmera, Galeria e Arquivo para anexar fotos e laudos — isso acelera muito a análise. Ao enviar, o chamado ganha um protocolo e segue automaticamente pelo fluxo de atendimento até o retorno ao cliente." } },
        { id:"protocoloPastagem", icon:"sprout", titulo:"Protocolo de Renovação de Pastagem", resumo:"Formulário técnico completo de reclamação de pastagem.",
          oque:"Protocolo técnico detalhado para reclamações de renovação de pastagem: dados do lote, área, plantio, clima, armazenamento e mais — com fotos e laudos anexados.",
          comoUsar:["Em Reclamações, escolha Renovação de Pastagem.","Preencha as seções: Informações básicas, Dados da área e Observações.","Use os seletores (Sim/Não, tipo de preparo etc.) para responder rápido.","Anexe fotos das áreas e laudos em PDF.","Toque em Abrir protocolo."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"O Protocolo de Renovação de Pastagem é o formulário técnico completo para esse tipo de reclamação. Ele tem seções para informações básicas, dados da área, plantio e clima — a maioria você responde tocando nas opções. Capriche nas fotos: áreas baixas e altas, plantadeira, cupins, solo e armazenamento. Quanto mais completo, mais rápido a análise técnica." } },
        { id:"chamado", icon:"life-buoy", titulo:"Chamado Interno", resumo:"Peça ajuda às áreas internas (faturamento, logística, TI).",
          oque:"Abre um chamado para áreas internas da SBS — faturamento, logística, TI — com prioridade e acompanhamento.",
          comoUsar:["Abra Chamado Interno.","Escolha a área e o tipo de solicitação.","Descreva o problema e defina a prioridade.","Envie e acompanhe o status."],
          quemAcessa:["Todos os perfis"] },
      ]
    },
    {
      nome: "Ferramentas",
      itens: [
        { id:"frete", icon:"truck", titulo:"Calculadora de Frete", resumo:"Estimativa de frete fracionado.",
          oque:"Estima o valor e o prazo do frete para o cliente. A cotação oficial é confirmada pela logística.",
          comoUsar:["Abra Frete.","Informe CEP de origem/destino e o volume.","Escolha a modalidade (CIF/FOB) e calcule.","Se precisar, abra um chamado para a cotação oficial."],
          quemAcessa:["Todos os perfis"] },
        { id:"cargas", icon:"package-search", titulo:"Consulta de Carga", resumo:"Acompanhe onde está a carga do cliente.",
          oque:"Consulta o status e a localização das cargas/entregas.",
          comoUsar:["Abra Consulta de Carga.","Busque pelo número da carga ou cliente.","Veja o status (em produção, em trânsito, entregue)."],
          quemAcessa:["Todos os perfis"] },
      ]
    },
    {
      nome: "Conteúdo & Treinamento",
      itens: [
        { id:"campanhas", icon:"megaphone", titulo:"Campanhas", resumo:"Campanhas comerciais ativas.",
          oque:"Lista as campanhas vigentes com regras e benefícios para usar na negociação.",
          comoUsar:["Abra Campanhas.","Veja as campanhas ativas e suas regras.","Use os argumentos na venda."],
          quemAcessa:["Todos os perfis"] },
        { id:"treinamentos", icon:"graduation-cap", titulo:"Treinamentos", resumo:"Conteúdos de capacitação.",
          oque:"Reúne treinamentos e materiais de capacitação técnica e comercial.",
          comoUsar:["Abra Treinamentos.","Escolha o conteúdo.","Assista/leia e aplique no dia a dia."],
          quemAcessa:["Todos os perfis"] },
        { id:"materiais", icon:"folder-open", titulo:"Materiais Técnicos", resumo:"Catálogos e PDFs para enviar ao cliente.",
          oque:"Biblioteca de materiais (catálogos, folders, resultados) em PDF para consultar e compartilhar.",
          comoUsar:["Abra Materiais Técnicos.","Toque no material para abrir o PDF.","Compartilhe direto com o cliente."],
          quemAcessa:["Todos os perfis"] },
        { id:"marketing", icon:"image", titulo:"Marketing", resumo:"Imagens e peças para divulgação.",
          oque:"Galeria de peças de marketing para baixar e compartilhar (WhatsApp).",
          comoUsar:["Abra Marketing.","Escolha a peça.","Baixe ou compartilhe."],
          quemAcessa:["Gerente Regional", "Supervisor"] },
        { id:"comercial", icon:"scroll-text", titulo:"Política Comercial", resumo:"Regras comerciais da SBS.",
          oque:"Documento oficial com as regras comerciais. Pode ser compartilhado e exportado em PDF.",
          comoUsar:["Abra Política Comercial.","Navegue pelas seções.","Compartilhe ou exporte em PDF se precisar."],
          quemAcessa:["Todos os perfis"] },
        { id:"credito", icon:"landmark", titulo:"Política de Crédito", resumo:"Regras de crédito e cobrança.",
          oque:"Documento oficial com as regras de crédito, condições e cobrança.",
          comoUsar:["Abra Política de Crédito.","Consulte as condições.","Compartilhe ou exporte em PDF."],
          quemAcessa:["Todos os perfis"] },
      ]
    },
    {
      nome: "Engajamento",
      itens: [
        { id:"ranking", icon:"trophy", titulo:"Ranking & Gamificação", resumo:"Pontos, níveis e conquistas.",
          oque:"Cada ação no app vale pontos (visitas, rotas, prospecção, etc.). Você sobe de nível e disputa o ranking da equipe.",
          comoUsar:["Abra Ranking & Conquistas.","Veja seus pontos, nível e posição.","Faça mais ações no app para subir."],
          quemAcessa:["Todos os perfis"],
          video:{ roteiro:"O app é gamificado: cada ação vale pontos — registrar visitas, montar rotas, fazer prospecção e muito mais. Os pontos sobem seu nível e sua posição no ranking da equipe. Acompanhe suas conquistas em Ranking & Conquistas e dispute o topo com os colegas." } },
      ]
    },
    {
      nome: "Gestão de Equipe (gestores)",
      itens: [
        { id:"equipe", icon:"users-round", titulo:"Minha Equipe", resumo:"Acompanhe seus supervisores e vendedores.",
          oque:"Visão do gestor sobre a equipe: visitas, prospecção e rotas de cada um, com opção de cobrar direto pelo app.",
          comoUsar:["Na home, toque em Minha Equipe.","Veja os indicadores de cada membro.","Use o botão de cobrança para enviar um aviso."],
          quemAcessa:["Supervisor", "Gerente Regional", "Gerente Nacional"] },
        { id:"acompanhamento", icon:"line-chart", titulo:"Acompanhamento", resumo:"Visão consolidada da equipe.",
          oque:"Consolida visitas por regional/supervisor, prospecção e conflitos de rota.",
          comoUsar:["Na home, toque em Acompanhar.","Filtre por regional/supervisor.","Analise os números do time."],
          quemAcessa:["Gerente Regional", "Gerente Nacional"] },
        { id:"pendencias", icon:"list-checks", titulo:"Pendências", resumo:"O que falta resolver na equipe.",
          oque:"Lista pendências do time para o gestor agir e cobrar.",
          comoUsar:["Na home, toque em Pendências.","Veja o que está em aberto por pessoa.","Cobre direto pelo app."],
          quemAcessa:["Supervisor", "Gerente Regional", "Gerente Nacional"] },
      ]
    },
  ]
};
