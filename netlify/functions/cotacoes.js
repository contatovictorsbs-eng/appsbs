/* ===========================================================
   SBS — Netlify Function: cotações de mercado (backend opcional)
   -----------------------------------------------------------
   Roda no SERVIDOR do Netlify (sem CORS), 1x por chamada. Serve para
   ligar fontes que o navegador não alcança: CEPEA (saca BR), B3, etc.

   Como ativar:
   1) Esta pasta já está no repositório: netlify/functions/cotacoes.js
   2) No Netlify > Site settings > Functions já é detectada automaticamente.
   3) O painel chama  /.netlify/functions/cotacoes  e usa os dados se existirem.
   4) (Opcional) Configure variáveis de ambiente no Netlify:
        ALPHAVANTAGE_KEY  — chave para commodities globais (servidor)
      e implemente o parser do CEPEA no bloco indicado abaixo.

   Sem implementação do CEPEA, retorna apenas câmbio (que já é gratuito)
   e deixa as commodities nacionais a cargo do cadastro manual.
   =========================================================== */
exports.handler = async function () {
  const out = { ts: Date.now(), fonte: "netlify-function", cambio: null, commodities: [], cepea: [] };

  // 1) Câmbio (server-side, sempre disponível)
  try {
    const r = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL");
    const j = await r.json();
    out.cambio = {
      usd: +j.USDBRL.bid, usdPct: +j.USDBRL.pctChange,
      eur: +j.EURBRL.bid, eurPct: +j.EURBRL.pctChange
    };
  } catch (e) { out.cambioErro = String(e); }

  // 2) Commodities globais (se a chave estiver nas env vars do Netlify)
  const KEY = process.env.ALPHAVANTAGE_KEY;
  if (KEY) {
    const fns = [["CORN","Milho (global)","US$/ton"],["WHEAT","Trigo (global)","US$/ton"],["COFFEE","Café (global)","US$/lb"]];
    for (const [fn, nome, un] of fns) {
      try {
        const r = await fetch(`https://www.alphavantage.co/query?function=${fn}&interval=monthly&apikey=${KEY}`);
        const j = await r.json();
        const d = (j.data || []).filter(x => x.value && x.value !== ".");
        if (d.length) { const v=+d[0].value, ant=d[1]?+d[1].value:v; out.commodities.push({ nome, unidade:un, v, pct: ant?((v-ant)/ant*100):0, date:d[0].date }); }
      } catch (e) { /* ignora item com erro */ }
    }
  }

  // 3) CEPEA — saca BR (soja, milho, boi gordo, café, trigo)
  //    O CEPEA publica os indicadores diários em páginas HTML públicas.
  //    Fazemos o parse server-side (sem CORS). Se a página mudar de layout,
  //    cada item falha sozinho e o painel mantém o valor manual.
  const CEPEA = [
    { produto:"Soja (saca 60kg)",  praca:"Paranaguá",     unidade:"R$/sc", fonte:"CEPEA/ESALQ", url:"https://www.cepea.esalq.usp.br/br/indicador/soja.aspx" },
    { produto:"Milho (saca 60kg)", praca:"Campinas (SP)", unidade:"R$/sc", fonte:"CEPEA/ESALQ", url:"https://www.cepea.esalq.usp.br/br/indicador/milho.aspx" },
    { produto:"Boi gordo (@)",     praca:"São Paulo",     unidade:"R$/@",  fonte:"CEPEA/B3",     url:"https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx" },
    { produto:"Café arábica (sc)", praca:"São Paulo",     unidade:"R$/sc", fonte:"CEPEA/ESALQ", url:"https://www.cepea.esalq.usp.br/br/indicador/cafe.aspx" },
    { produto:"Trigo (ton)",       praca:"Paraná",        unidade:"R$/ton",fonte:"CEPEA/ESALQ", url:"https://www.cepea.esalq.usp.br/br/indicador/trigo.aspx" }
  ];
  const numBR = s => { if(!s) return null; const n = parseFloat(String(s).replace(/\./g,"").replace(",",".")); return isNaN(n)?null:n; };
  function parseCepea(html){
    // Bloco padrão do CEPEA: "...Valor: R$ 128,50 ... Variação: 0,42% ... Data: 27/06/2026"
    const flat = html.replace(/\s+/g," ");
    let preco=null, pct=null, data=null;
    // valor
    let m = flat.match(/Valor[^R]*R\$\s*<\/?[^>]*>?\s*([\d.]+,\d{2})/i) || flat.match(/R\$\s*([\d.]+,\d{2})/);
    if(m) preco = numBR(m[1]);
    // variação (pode vir negativa)
    m = flat.match(/Varia[çc][aã]o[^-\d]*(-?\s*[\d.]+,\d+)\s*%/i);
    if(m) pct = numBR(m[1].replace(/\s/g,""));
    // data
    m = flat.match(/(\d{2}\/\d{2}\/\d{4})/);
    if(m) data = m[1];
    return { preco, pct, data };
  }
  await Promise.all(CEPEA.map(async c => {
    try {
      const r = await fetch(c.url, { headers:{ "User-Agent":"Mozilla/5.0 (compatible; SBS-Mercado/1.0)" } });
      if(!r.ok) return;
      const html = await r.text();
      const p = parseCepea(html);
      if(p.preco){
        out.cepea.push({ produto:c.produto, praca:c.praca, preco:p.preco, pct:(p.pct==null?0:p.pct), unidade:c.unidade, fonte:c.fonte, data:p.data||"" });
      }
    } catch(e){ /* item falha sozinho → mantém manual */ }
  }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=1800" },
    body: JSON.stringify(out)
  };
};
