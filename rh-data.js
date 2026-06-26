/* ===========================================================
   SBS — RH · base de dados (seed)
   Coleções: rh_vagas, rh_candidatos, rh_colaboradores,
   rh_comunicados, rh_eventos. Recrutamento & Seleção + Endomarketing.
   =========================================================== */
window.RH_DATA = (function(){
  var hoje = new Date().toISOString().slice(0,10);

  var vagas = [
    { id:"vg1", titulo:"Representante Comercial — MT", area:"Comercial", local:"Rondonópolis, MT", tipo:"CLT", status:"aberta",
      senioridade:"Pleno", abertura:"2026-05-20", recrutador:"Paula Andrade", descricao:"Vendas de sementes para grandes produtores no MT.", vagas:2 },
    { id:"vg2", titulo:"Analista de Marketing", area:"Marketing", local:"Cuiabá, MT", tipo:"CLT", status:"aberta",
      senioridade:"Júnior", abertura:"2026-06-05", recrutador:"Paula Andrade", descricao:"Conteúdo, redes e apoio a campanhas.", vagas:1 },
    { id:"vg3", titulo:"Pesquisador de Campo (P&D)", area:"P&D", local:"Campo Grande, MS", tipo:"CLT", status:"triagem",
      senioridade:"Sênior", abertura:"2026-04-12", recrutador:"Carlos Bento", descricao:"Condução de ensaios de cultivares forrageiras.", vagas:1 },
    { id:"vg4", titulo:"Assistente Administrativo", area:"Administrativo", local:"Cuiabá, MT", tipo:"CLT", status:"fechada",
      senioridade:"Júnior", abertura:"2026-03-01", recrutador:"Paula Andrade", descricao:"Rotinas administrativas e financeiras.", vagas:1 },
    { id:"vg5", titulo:"Estágio em Agronomia", area:"P&D", local:"Rondonópolis, MT", tipo:"Estágio", status:"aberta",
      senioridade:"Estágio", abertura:"2026-06-18", recrutador:"Carlos Bento", descricao:"Apoio aos ensaios e coleta de dados de campo.", vagas:3 }
  ];

  var candidatos = [
    { id:"cd1", nome:"Lucas Pereira", vaga:"vg1", etapa:"entrevista", origem:"LinkedIn", data:"2026-06-10", nota:4, email:"lucas.p@email.com", fone:"+55 66 99888-1122", obs:"Boa experiência em sementes." },
    { id:"cd2", nome:"Fernanda Rocha", vaga:"vg1", etapa:"triagem", origem:"Indicação", data:"2026-06-15", nota:0, email:"fe.rocha@email.com", fone:"+55 66 99777-3344", obs:"" },
    { id:"cd3", nome:"Diego Santos", vaga:"vg2", etapa:"teste", origem:"Gupy", data:"2026-06-12", nota:5, email:"diego.s@email.com", fone:"+55 65 99666-5566", obs:"Portfólio forte de social." },
    { id:"cd4", nome:"Aline Martins", vaga:"vg3", etapa:"proposta", origem:"LinkedIn", data:"2026-05-28", nota:5, email:"aline.m@email.com", fone:"+55 67 99555-7788", obs:"Doutora em fitotecnia." },
    { id:"cd5", nome:"Rafael Gomes", vaga:"vg2", etapa:"triagem", origem:"Site", data:"2026-06-20", nota:0, email:"rafael.g@email.com", fone:"+55 65 99444-9900", obs:"" },
    { id:"cd6", nome:"Beatriz Lima", vaga:"vg5", etapa:"entrevista", origem:"Universidade", data:"2026-06-19", nota:4, email:"bia.lima@email.com", fone:"+55 66 99333-1212", obs:"Cursando 8º semestre." },
    { id:"cd7", nome:"Marcos Vieira", vaga:"vg1", etapa:"contratado", origem:"Indicação", data:"2026-05-15", nota:5, email:"marcos.v@email.com", fone:"+55 66 99222-3434", obs:"Admitido em 01/06." }
  ];

  var colaboradores = [
    { id:"co1", nome:"Paula Andrade", cargo:"Coordenadora de RH", area:"RH", admissao:"2021-03-01", local:"Cuiabá, MT", aniversario:"06-28", email:"paula.andrade@sbsgreen.com.br", status:"ativo" },
    { id:"co2", nome:"Carlos Bento", cargo:"Analista de RH", area:"RH", admissao:"2022-08-15", local:"Cuiabá, MT", aniversario:"07-03", email:"carlos.bento@sbsgreen.com.br", status:"ativo" },
    { id:"co3", nome:"Willian Luque", cargo:"Representante Comercial", area:"Comercial", admissao:"2020-02-10", local:"Sinop, MT", aniversario:"06-30", email:"willian.luque@sbsgreen.com.br", status:"ativo" },
    { id:"co4", nome:"Marina Alves", cargo:"Analista de Marketing", area:"Marketing", admissao:"2023-01-09", local:"Cuiabá, MT", aniversario:"09-12", email:"marina.alves@sbsgreen.com.br", status:"ativo" },
    { id:"co5", nome:"Henrique Salles", cargo:"Líder de P&D", area:"P&D", admissao:"2019-06-20", local:"Campo Grande, MS", aniversario:"07-15", email:"henrique.salles@sbsgreen.com.br", status:"ativo" },
    { id:"co6", nome:"Marcos Vieira", cargo:"Representante Comercial", area:"Comercial", admissao:"2026-06-01", local:"Rondonópolis, MT", aniversario:"11-22", email:"marcos.vieira@sbsgreen.com.br", status:"ativo" }
  ];

  var comunicados = [
    { id:"cm1", titulo:"Novo plano de saúde a partir de julho", categoria:"Benefícios", data:"2026-06-22", autor:"RH", destaque:true,
      texto:"A partir de julho, todos os colaboradores CLT passam a contar com o novo plano de saúde com cobertura nacional." },
    { id:"cm2", titulo:"Programa de Indicação — ganhe bônus", categoria:"Recrutamento", data:"2026-06-18", autor:"RH", destaque:false,
      texto:"Indique profissionais para nossas vagas abertas e ganhe bônus por contratação efetivada." },
    { id:"cm3", titulo:"Campanha do Agasalho SBS", categoria:"Endomarketing", data:"2026-06-10", autor:"RH", destaque:false,
      texto:"Participe da arrecadação de agasalhos. Pontos de coleta em todas as unidades até 30/06." }
  ];

  var eventos = [
    { id:"ev1", titulo:"Integração de novos colaboradores", tipo:"Onboarding", data:"2026-07-01", local:"Sede Cuiabá", status:"agendado" },
    { id:"ev2", titulo:"Treinamento NR — Segurança", tipo:"Treinamento", data:"2026-07-09", local:"Online", status:"agendado" },
    { id:"ev3", titulo:"Confraternização de meio de ano", tipo:"Confraternização", data:"2026-07-25", local:"Cuiabá", status:"planejado" },
    { id:"ev4", titulo:"Café com o RH", tipo:"Roda de conversa", data:"2026-06-13", local:"Sede Cuiabá", status:"realizado" }
  ];

  return { vagas:vagas, candidatos:candidatos, colaboradores:colaboradores, comunicados:comunicados, eventos:eventos };
})();
