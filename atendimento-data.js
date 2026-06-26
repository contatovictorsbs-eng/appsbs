/* ===========================================================
   SBS — Atendimento ao Cliente · base de dados (seed)
   Caixa unificada multimarca: Nobre Brasil, SBS Green Seeds,
   SememBrás. Semeado na store (coleções atend_*) e sincronizado
   pela nuvem. As reclamações/chamados do app entram na caixa em
   tempo de execução (integração — ver atend-inbox.js).
   =========================================================== */
window.ATEND_DATA = (function(){
  var now = Date.now(), MIN = 60000, H = 3600000;

  var BRANDS = {
    nobre:     { id:"nobre",     name:"Nobre Brasil",    color:"#8C2740", soft:"#F7ECEF", logo:"assets/atend/nobre-bag.png" },
    sbs:       { id:"sbs",       name:"SBS Green Seeds", color:"#0E9B8E", soft:"#E3F4F1", logo:"assets/atend/logo-sbs.png" },
    semenbras: { id:"semenbras", name:"SememBrás",       color:"#C07A12", soft:"#FBF0DF", logo:"assets/atend/logo-sememobras.png" }
  };
  var CHANNELS = {
    whatsapp:  { name:"WhatsApp",     icon:"message-circle" },
    email:     { name:"E-mail",       icon:"mail" },
    chat:      { name:"Chat do site", icon:"messages-square" },
    instagram: { name:"Instagram",    icon:"at-sign" },
    linkedin:  { name:"LinkedIn",     icon:"share-2" },
    app:       { name:"App SBS",      icon:"smartphone" }
  };

  var agentes = [
    { id:"diego", nome:"Diego Martins",  papel:"admin",      cor:"#8C2740", brands:["nobre","sbs","semenbras"], email:"diego.martins@grupo.com.br" },
    { id:"ana",   nome:"Ana Paula Reis", papel:"supervisor", cor:"#5B6470", brands:["nobre","sbs","semenbras"], email:"ana.paula@grupo.com.br" },
    { id:"bruno", nome:"Bruno Lima",     papel:"atendente",  cor:"#2F6BFF", brands:["nobre","sbs"],             email:"bruno.lima@grupo.com.br" },
    { id:"carla", nome:"Carla Souza",    papel:"atendente",  cor:"#C07A12", brands:["semenbras"],               email:"carla.souza@grupo.com.br" }
  ];

  var canais = [
    { id:"ch1", tipo:"whatsapp",  brand:"nobre",     identificador:"+55 67 99876-5432",            status:"connected", agentes:["ana","bruno"] },
    { id:"ch2", tipo:"email",     brand:"nobre",     identificador:"atendimento@nobrebrasil.com.br", status:"connected", agentes:["ana"] },
    { id:"ch3", tipo:"whatsapp",  brand:"sbs",       identificador:"+55 65 3030-1000",             status:"connected", agentes:["ana","bruno"] },
    { id:"ch4", tipo:"email",     brand:"sbs",       identificador:"comercial@sbsgreenseeds.com",  status:"connected", agentes:["bruno"] },
    { id:"ch5", tipo:"chat",      brand:"sbs",       identificador:"www.sbsgreenseeds.com",        status:"connected", agentes:["ana","bruno"] },
    { id:"ch6", tipo:"whatsapp",  brand:"semenbras", identificador:"+55 11 95000-2020",            status:"connected", agentes:["carla"] },
    { id:"ch7", tipo:"email",     brand:"semenbras", identificador:"contato@semenbras.com.br",     status:"connected", agentes:["carla"] },
    { id:"ch8", tipo:"linkedin",  brand:"semenbras", identificador:"Semenbras Sementes",           status:"pending",   agentes:[] }
  ];

  var regras = [
    { id:"rule1", palavra:"exportação",  rota:"SBS · Validar e encaminhar",        ativo:true },
    { id:"rule2", palavra:"certificado", rota:"SBS · Lote certificado",            ativo:true },
    { id:"rule3", palavra:"revenda",     rota:"SememBrás · Parcerias / Revenda",   ativo:true },
    { id:"rule4", palavra:"nota fiscal", rota:"Financeiro · 2ª via",               ativo:true },
    { id:"rule5", palavra:"boleto",      rota:"Financeiro · 2ª via",               ativo:true }
  ];

  function msg(de, texto, min){ return { de:de, texto:texto, hora:new Date(now-min*MIN).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) }; }

  var conversas = [
    { id:"c1", nome:"João Mendes", org:"Fazenda Santa Rita", brand:"nobre", channel:"whatsapp", status:"aberto", ts:now-18*MIN, unread:0, agente:"bruno",
      contato:{ fone:"+55 67 99876-5432", email:"joao@santarita.agr.br", local:"Dourados, MS", tipo:"Cliente" },
      tags:[{label:"VIP",tone:"gold"},{label:"Recompra",tone:"green"}],
      mensagens:[ msg("cliente","Bom dia! Vocês têm semente de Brachiaria Brizantha Marandu disponível?",31),
        msg("agente","Bom dia, João! Temos sim, com VC 80% e pureza 98%. Qual a quantidade?",29),
        msg("cliente","Vou reformar uns 40 hectares. 200 kg dá?",26),
        msg("agente","Dá tranquilo. Para 40 ha indicamos 5 kg/ha, então 200 kg fica perfeito. R$ 4.980,00 com frete para Dourados.",24),
        msg("cliente","Perfeito, pode fechar os 200 kg então.",18) ] },
    { id:"c2", nome:"Mariana Costa", org:"Agropecuária Vale Verde", brand:"sbs", channel:"email", status:"pendente", ts:now-8*MIN, unread:2, agente:"",
      contato:{ fone:"+55 65 3322-1180", email:"compras@valeverde.com.br", local:"Rondonópolis, MT", tipo:"Cliente" },
      tags:[{label:"Exportação",tone:"teal"}],
      mensagens:[ msg("cliente","Prezados, segue pedido de cotação para sementes premium de exportação (lote certificado).",10),
        msg("cliente","Precisamos do certificado fitossanitário junto.",9) ] },
    { id:"c3", nome:"Carlos Eduardo", org:"", brand:"semenbras", channel:"instagram", status:"pendente", ts:now-21*MIN, unread:1, agente:"",
      contato:{ fone:"—", email:"—", local:"Uberaba, MG", tipo:"Lead" },
      tags:[{label:"Lead",tone:"neutral"}],
      mensagens:[ msg("cliente","Oi! Vi o anúncio das sementes de milheto ADR 300, qual o valor do saco de 25 kg?",21) ] },
    { id:"c4", nome:"Coop. Agro Sul", org:"Cooperativa", brand:"sbs", channel:"chat", status:"pendente", ts:now-35*MIN, unread:1, agente:"",
      contato:{ fone:"+55 54 3045-2200", email:"contato@agrosul.coop.br", local:"Passo Fundo, RS", tipo:"Cliente" },
      tags:[{label:"Cliente",tone:"neutral"}],
      mensagens:[ msg("cliente","Boa tarde, preciso da 2ª via da nota fiscal da última compra (pedido SB-10790).",35) ] },
    { id:"c5", nome:"Marina Lopes", org:"", brand:"nobre", channel:"whatsapp", status:"aberto", ts:now-1*H, unread:0, agente:"ana",
      contato:{ fone:"+55 62 98123-4567", email:"marina.lopes@gmail.com", local:"Goiânia, GO", tipo:"Cliente" },
      tags:[{label:"Cliente",tone:"neutral"}],
      mensagens:[ msg("cliente","Qual o prazo de entrega para Goiânia?",70), msg("agente","Para Goiânia o prazo é de 4 dias úteis após a confirmação.",68) ] },
    { id:"c6", nome:"Ricardo Tavares", org:"", brand:"semenbras", channel:"linkedin", status:"pendente", ts:now-124*MIN, unread:1, agente:"",
      contato:{ fone:"—", email:"ricardo.t@empresa.com", local:"Londrina, PR", tipo:"Lead" },
      tags:[{label:"Parceria",tone:"gold"}],
      mensagens:[ msg("cliente","Tenho interesse em representar a marca na minha região. Como funciona a revenda?",124) ] },
    { id:"c7", nome:"Helena Prado", org:"Sítio Boa Esperança", brand:"sbs", channel:"whatsapp", status:"resolvido", ts:now-5*H, unread:0, agente:"bruno",
      contato:{ fone:"+55 64 99711-2299", email:"helena@boaesperanca.agr.br", local:"Rio Verde, GO", tipo:"Cliente" },
      tags:[{label:"Cliente",tone:"neutral"}],
      mensagens:[ msg("cliente","A entrega chegou certinha, obrigada!",300), msg("agente","Que ótimo, Helena! Qualquer coisa estamos à disposição. 🌱",298) ] }
  ];

  return { BRANDS:BRANDS, CHANNELS:CHANNELS, agentes:agentes, canais:canais, regras:regras, conversas:conversas };
})();
