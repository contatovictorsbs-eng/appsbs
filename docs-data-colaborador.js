/* ===========================================================
   SBS — Documentação · Portal do Colaborador
   =========================================================== */
window.SBS_DOCS = window.SBS_DOCS || { plataformas:{} };

window.SBS_DOCS.plataformas.colaborador = {
  nome: "Central de Ajuda · Portal do Colaborador",
  sub: "App de todos os funcionários: mural, agenda, vagas internas, aniversários e meus dados.",
  perfis: ["Todos os colaboradores"],
  grupos: [
    {
      nome: "App do Colaborador",
      itens: [
        { id:"feed", icon:"newspaper", titulo:"Feed SBS (rede social)", resumo:"Publique fotos, curta e comente.",
          oque:"Rede social corporativa da SBS. Qualquer colaborador publica uma foto (da galeria ou tirada na hora pela câmera) ou texto, curte e comenta as publicações dos colegas. O RH também publica avisos oficiais (com selo SBS).",
          comoUsar:["Toque em Feed.","Escreva algo e/ou adicione uma foto pela Câmera ou Galeria, depois Publicar.","Curta tocando no coração e comente.","Apague suas próprias publicações pelo ícone de lixeira."],
          quemAcessa:["Todos os colaboradores"],
          video:{ roteiro:"O Feed SBS é a nossa rede social interna. Tirou uma foto boa no campo ou no stand da feira? Publica aqui — direto da câmera ou da galeria. Todo mundo curte, comenta e celebra junto. E os avisos oficiais do RH aparecem com o selo SBS. É o jeito SBS de manter o time conectado." } },
        { id:"inicio", icon:"home", titulo:"Início", resumo:"Tudo do time num só lugar.",
          oque:"Tela inicial com saudação, comunicado em destaque, aniversariantes do mês, próximos eventos e atalhos.",
          comoUsar:["Abra o app e faça login com seu usuário.","Veja o destaque do RH e os atalhos.","Toque num atalho para abrir a seção."],
          quemAcessa:["Todos os colaboradores"],
          video:{ roteiro:"O Portal do Colaborador é o app de todo mundo na SBS. Logo na tela inicial você vê o recado em destaque do RH, quem faz aniversário no mês e os próximos eventos. É o seu canal direto com a empresa, no bolso." } },
        { id:"mural", icon:"megaphone", titulo:"Mural", resumo:"Comunicados internos do RH.",
          oque:"Lista os comunicados publicados pelo RH (benefícios, campanhas, avisos). Os fixados aparecem primeiro.",
          comoUsar:["Toque em Mural.","Leia os comunicados, do mais recente ao mais antigo."],
          quemAcessa:["Todos os colaboradores"] },
        { id:"agenda", icon:"calendar-days", titulo:"Agenda", resumo:"Eventos e treinamentos.",
          oque:"Mostra os eventos internos: onboarding, treinamentos e confraternizações, separados entre próximos e realizados.",
          comoUsar:["Toque em Agenda.","Veja os próximos eventos e a data de cada um."],
          quemAcessa:["Todos os colaboradores"] },
        { id:"vagas", icon:"briefcase", titulo:"Vagas internas", resumo:"Oportunidades e indicações.",
          oque:"Lista as vagas abertas na empresa. Você pode indicar alguém para uma vaga.",
          comoUsar:["Toque em Vagas.","Veja as oportunidades abertas.","Use 'Indicar alguém' para recomendar um talento."],
          quemAcessa:["Todos os colaboradores"],
          video:{ roteiro:"Em Vagas, todo colaborador vê as oportunidades abertas na SBS antes de qualquer um. Quer crescer? Candidate-se. Conhece alguém bom? Indique com um toque. O recrutamento começa dentro de casa." } },
        { id:"aniversarios", icon:"cake", titulo:"Aniversários", resumo:"Quem comemora no mês.",
          oque:"Lista os aniversariantes do mês para o time celebrar junto.",
          comoUsar:["Toque em Aniversários (ou no atalho da home).","Veja quem comemora e a data."],
          quemAcessa:["Todos os colaboradores"] },
        { id:"notificacoes", icon:"bell", titulo:"Notificações", resumo:"Avisos do RH chegam no sino.",
          oque:"O RH envia notificações pelo painel e elas aparecem no sino do app, com contador de não lidas. Tocar abre a lista e marca como lidas.",
          comoUsar:["Toque no sino, no topo do app.","Leia as notificações enviadas pelo RH.","O contador some quando você abre."],
          quemAcessa:["Todos os colaboradores"],
          video:{ roteiro:"O sino no topo do app avisa quando o RH manda algo novo — um comunicado, um lembrete de evento, um benefício. O número mostra quantas você ainda não viu. É a empresa falando direto com você, sem depender de e-mail." } },
        { id:"eu", icon:"user", titulo:"Meus dados", resumo:"Seu perfil na empresa.",
          oque:"Mostra seus dados de cadastro: cargo, área, local, admissão, aniversário e e-mail. Para alterar, fale com o RH.",
          comoUsar:["Toque em Eu.","Confira seus dados.","Use Sair para encerrar a sessão."],
          quemAcessa:["Todos os colaboradores"] },
      ]
    },
  ]
};
