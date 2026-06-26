/* ===========================================================
   SBS — Marketing · base de dados (seed)
   Coleções: campanhas (compartilhada c/ o app), marketing
   (materiais/artes do app), mkt_eventos, mkt_conteudo, mkt_social.
   Semeado na store e sincronizado pela nuvem.
   =========================================================== */
window.MARKETING_DATA = (function(){
  var hoje = "2026-06";

  // Campanhas (mesma coleção que o app do vendedor exibe em "Campanhas")
  var campanhas = [
    { id:"cmp1", nome:"Soja Premium 25/26", status:"ativa", canal:"App + WhatsApp", inicio:"2026-06-01", fim:"2026-08-31",
      publico:"Produtores de soja", verba:48000, meta:"500 ton", responsavel:"Marina Alves",
      descricao:"Desconto progressivo até 6% na linha SBS Green IPRO + bonificação por volume.", cor:"brand" },
    { id:"cmp2", nome:"Milho Verão", status:"ativa", canal:"App + Feiras", inicio:"2026-06-15", fim:"2026-09-15",
      publico:"Pecuaristas e agricultores", verba:32000, meta:"300 ton", responsavel:"Rafael Dias",
      descricao:"Frete CIF para pedidos acima de 300 sc + kit técnico de campo.", cor:"green" },
    { id:"cmp3", nome:"Pastagem Renovada", status:"planejada", canal:"Instagram + E-mail", inicio:"2026-07-10", fim:"2026-10-10",
      publico:"Pecuária de corte", verba:21000, meta:"180 ton", responsavel:"Marina Alves",
      descricao:"Conteúdo educativo sobre renovação + condição especial para cultivares forrageiras.", cor:"gold" },
    { id:"cmp4", nome:"Black Friday do Agro", status:"rascunho", canal:"App + Redes", inicio:"2026-11-20", fim:"2026-11-30",
      publico:"Toda a base", verba:60000, meta:"700 ton", responsavel:"Rafael Dias",
      descricao:"Campanha relâmpago de fim de ano, descontos por 10 dias.", cor:"brand" },
    { id:"cmp5", nome:"Safrinha 26", status:"encerrada", canal:"App", inicio:"2026-01-10", fim:"2026-03-31",
      publico:"Milho 2ª safra", verba:28000, meta:"260 ton", resultado:"291 ton", responsavel:"Marina Alves",
      descricao:"Campanha de safrinha encerrada com 112% da meta.", cor:"green" }
  ];

  // Eventos / feiras
  var eventos = [
    { id:"ev1", nome:"Show Rural Coopavel", tipo:"Feira", local:"Cascavel, PR", inicio:"2026-02-09", fim:"2026-02-13", status:"realizado", custo:45000, leads:128, responsavel:"Equipe MKT" },
    { id:"ev2", nome:"Agrishow", tipo:"Feira", local:"Ribeirão Preto, SP", inicio:"2026-04-27", fim:"2026-05-01", status:"realizado", custo:78000, leads:210, responsavel:"Equipe MKT" },
    { id:"ev3", nome:"Dia de Campo SBS", tipo:"Evento próprio", local:"Rondonópolis, MT", inicio:"2026-07-18", fim:"2026-07-18", status:"confirmado", custo:22000, leads:0, responsavel:"Marina Alves" },
    { id:"ev4", nome:"Bahia Farm Show", tipo:"Feira", local:"Luís Eduardo Magalhães, BA", inicio:"2026-08-04", fim:"2026-08-08", status:"planejado", custo:54000, leads:0, responsavel:"Rafael Dias" }
  ];

  // Calendário de conteúdo
  var conteudo = [
    { id:"ct1", titulo:"Vídeo: como escolher a cultivar certa", canal:"Instagram", formato:"Reels", data:"2026-06-28", status:"agendado", responsavel:"Bia Nunes" },
    { id:"ct2", titulo:"Post: resultados Soja Premium", canal:"Instagram", formato:"Carrossel", data:"2026-06-30", status:"producao", responsavel:"Bia Nunes" },
    { id:"ct3", titulo:"E-mail: convite Dia de Campo", canal:"E-mail", formato:"Newsletter", data:"2026-07-05", status:"ideia", responsavel:"Marina Alves" },
    { id:"ct4", titulo:"Depoimento de produtor — Milho Verão", canal:"YouTube", formato:"Vídeo", data:"2026-07-12", status:"ideia", responsavel:"Bia Nunes" },
    { id:"ct5", titulo:"Card: dica de plantio direto", canal:"LinkedIn", formato:"Imagem", data:"2026-06-26", status:"publicado", responsavel:"Bia Nunes" }
  ];

  // Métricas de redes/canais (mês corrente)
  var social = [
    { id:"sc1", canal:"Instagram", icon:"at-sign", seguidores:18400, var:4.2, alcance:142000, engaj:5.8 },
    { id:"sc2", canal:"WhatsApp (listas)", icon:"message-circle", seguidores:6200, var:7.1, alcance:6200, engaj:38 },
    { id:"sc3", canal:"YouTube", icon:"youtube", seguidores:3100, var:2.4, alcance:21000, engaj:3.1 },
    { id:"sc4", canal:"LinkedIn", icon:"linkedin", seguidores:2450, var:6.0, alcance:9800, engaj:4.4 }
  ];

  return { campanhas:campanhas, eventos:eventos, conteudo:conteudo, social:social };
})();
