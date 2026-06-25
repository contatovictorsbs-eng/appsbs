/* ===========================================================
   SBS Green Seeds — Portal do Vendedor
   Mock data (conteúdo de exemplo — textos reais serão enviados)
   =========================================================== */
window.DATA = {
  user: {
    name: "Ricardo Alves",
    first: "Ricardo",
    role: "Representante Comercial",
    region: "Oeste da Bahia",
    initials: "RA",
    safra: "Safra 25/26",
    supervisor: "Marcos Soares",
    metaSafra: "R$ 4,80 mi",
  },

  /* ---------- HOME shortcuts ---------- */
  shortcuts: [
    { id: "dashboard",   label: "Dashboard",        icon: "layout-dashboard", tag: "" },
    { id: "ranking",     label: "Ranking & Conquistas", icon: "trophy",        tag: "" },
    { id: "visitas",     label: "Relatório de Visitas", icon: "map-pinned",    tag: "" },
    { id: "comercial",   label: "Política Comercial", icon: "scroll-text",      tag: "" },
    { id: "credito",     label: "Política de Crédito", icon: "landmark",        tag: "" },
    { id: "comissao",    label: "Comissão",          icon: "percent",          tag: "" },
    { id: "precos",      label: "Tabela de Preços",  icon: "tags",             tag: "Atualizada" },
    { id: "campanhas",   label: "Campanhas",         icon: "megaphone",        tag: "3 ativas" },
    { id: "treinamentos",label: "Treinamentos",      icon: "graduation-cap",   tag: "" },
    { id: "materiais",   label: "Materiais Técnicos",icon: "folder-open",      tag: "" },
    { id: "marketing",   label: "Marketing",         icon: "image",            tag: "" },
    { id: "reclamacao",  label: "Reclamações",       icon: "message-square-warning", tag: "" },
    { id: "chamado",     label: "Chamado Interno",   icon: "life-buoy",        tag: "" },
    { id: "frete",       label: "Frete Fracionado", icon: "truck",            tag: "" },
    { id: "cargas",      label: "Consulta de Carga", icon: "package-search",   tag: "" },
  ],

  /* ---------- Hamburger menu ---------- */
  menu: [
    { id: "home",        label: "Home",                 icon: "house" },
    { id: "dashboard",   label: "Dashboard",            icon: "layout-dashboard" },
    { id: "ranking",     label: "Ranking & Conquistas", icon: "trophy" },
    { id: "visitas",     label: "Relatório de Visitas", icon: "map-pinned" },
    { id: "comercial",   label: "Política Comercial",   icon: "scroll-text" },
    { id: "credito",     label: "Política de Crédito",  icon: "landmark" },
    { id: "comissao",    label: "Comissão",             icon: "percent" },
    { id: "precos",      label: "Tabela de Preços",     icon: "tags" },
    { id: "campanhas",   label: "Campanhas",            icon: "megaphone" },
    { id: "treinamentos",label: "Treinamentos",         icon: "graduation-cap" },
    { id: "materiais",   label: "Materiais Técnicos",   icon: "folder-open" },
    { id: "marketing",   label: "Marketing",            icon: "image" },
    { id: "reclamacao",  label: "Reclamações",          icon: "message-square-warning" },
    { id: "chamado",     label: "Chamado Interno",      icon: "life-buoy" },
    { id: "notificacoes",label: "Notificações",          icon: "bell" },
    { id: "frete",       label: "Calculadora Frete Fracionado", icon: "truck" },
    { id: "cargas",      label: "Cargas",               icon: "package-search" },
    { id: "config",      label: "Configurações",        icon: "settings" },
  ],

  /* ---------- DASHBOARD ---------- */
  kpis: [
    { label: "Meta da Safra",      value: "R$ 4,80 mi", sub: "objetivo 25/26", icon: "target",        tone: "brand" },
    { label: "Faturado",           value: "R$ 3,12 mi", sub: "65% da meta",    icon: "circle-check",  tone: "good", delta: "+8,4%", up: true },
    { label: "Pedido em Carteira", value: "R$ 0,74 mi", sub: "a faturar",      icon: "clipboard-list",tone: "neutral" },
    { label: "Gap para Meta",      value: "R$ 0,94 mi", sub: "faltam 35%",     icon: "trending-down", tone: "warn", delta: "-19,6%", up: false },
    { label: "Clientes Ativos",    value: "128",        sub: "na carteira",    icon: "users",         tone: "neutral" },
    { label: "Novos Clientes",     value: "14",         sub: "no mês",         icon: "user-plus",     tone: "good", delta: "+4", up: true },
  ],
  metaPct: 65,
  funnel: [
    { stage: "Cotações",   value: 42, money: "R$ 1,90 mi" },
    { stage: "Propostas",  value: 31, money: "R$ 1,45 mi" },
    { stage: "Aprovados",  value: 22, money: "R$ 0,98 mi" },
    { stage: "Em produção",value: 12, money: "R$ 0,52 mi" },
    { stage: "Faturados",  value: 18, money: "R$ 0,74 mi" },
  ],
  ranking: [
    { pos: 1, name: "Marina Souza",  region: "Sul de MG",   value: "R$ 4,10 mi", pct: 92, you: false },
    { pos: 2, name: "Você (Ricardo)",region: "Oeste BA",    value: "R$ 3,12 mi", pct: 65, you: true },
    { pos: 3, name: "Carlos Lima",   region: "Norte MT",    value: "R$ 2,98 mi", pct: 71, you: false },
    { pos: 4, name: "Júlia Prado",   region: "Centro GO",   value: "R$ 2,55 mi", pct: 58, you: false },
    { pos: 5, name: "André Reis",    region: "Oeste PR",    value: "R$ 2,21 mi", pct: 49, you: false },
  ],
  alerts: [
    { type: "danger", icon: "alert-triangle", title: "Crédito vencendo",  text: "Fazenda Boa Vista: limite expira em 3 dias.", time: "há 2h" },
    { type: "warn",   icon: "clock",          title: "Pedido parado",     text: "Pedido #10482 aguardando aprovação financeira.", time: "há 5h" },
    { type: "good",   icon: "megaphone",      title: "Nova campanha",     text: "Campanha Soja Premium liberada para sua região.", time: "ontem" },
    { type: "info",   icon: "package-search", title: "Carga entregue",    text: "Carga #CG-2291 entregue ao cliente Agro Vale.", time: "ontem" },
  ],

  /* ---------- TABELA DE PREÇOS ---------- */
  filtros: {
    cultura:   ["Todas", "Soja", "Milho", "Sorgo", "Pastagem", "Feijão"],
    categoria: ["Todas", "Sementes", "Inoculante", "Tratamento"],
    marca:     ["Todas", "SBS Green", "SBS Pro", "Parceiros"],
  },
  precos: [
    { produto: "SBS 7110 IPRO",  cultura: "Soja",     marca: "SBS Green", categoria: "Sementes",   preco: "R$ 280,00 /sc", unidade: "saca 40kg", disp: "alta",  campanha: "Soja Premium" },
    { produto: "SBS 6620 RR",    cultura: "Soja",     marca: "SBS Pro",   categoria: "Sementes",   preco: "R$ 245,00 /sc", unidade: "saca 40kg", disp: "media", campanha: null },
    { produto: "Milho SBS 3400", cultura: "Milho",    marca: "SBS Green", categoria: "Sementes",   preco: "R$ 690,00 /sc", unidade: "saca 60k sem", disp: "alta", campanha: "Milho Verão" },
    { produto: "Sorgo SBS S12",  cultura: "Sorgo",    marca: "SBS Pro",   categoria: "Sementes",   preco: "R$ 410,00 /sc", unidade: "saca 25kg", disp: "baixa", campanha: null },
    { produto: "Inoculante Nodu+",cultura: "Soja",    marca: "Parceiros", categoria: "Inoculante", preco: "R$ 38,00 /dose",unidade: "dose 50ha", disp: "alta",  campanha: null },
    { produto: "Pastagem Brachiária BRS",cultura:"Pastagem",marca:"SBS Green",categoria:"Sementes",preco:"R$ 22,00 /kg", unidade:"kg", disp:"media", campanha:"Pasto Forte" },
    { produto: "Tratamento TS Max",cultura: "Soja",   marca: "Parceiros", categoria: "Tratamento", preco: "R$ 95,00 /dose",unidade: "dose", disp: "media", campanha: null },
    { produto: "Feijão SBS Carioca",cultura:"Feijão", marca: "SBS Pro",   categoria: "Sementes",   preco: "R$ 320,00 /sc", unidade: "saca 60kg", disp: "baixa", campanha: null },
  ],

  /* ---------- CAMPANHAS ---------- */
  campanhas: [
    { nome: "Soja Premium 25/26", vigencia: "01/06 a 31/08/2026", produtos: "Linha SBS Green IPRO", beneficio: "Desconto progressivo até 6%", bonus: "Bonificação 2% em volume > 500 sc", cor: "brand", status: "Ativa" },
    { nome: "Milho Verão", vigencia: "15/06 a 15/09/2026", produtos: "Híbridos SBS 3400 / 3600", beneficio: "Frete CIF para pedidos > 300 sc", bonus: "Brinde kit técnico de campo", cor: "green", status: "Ativa" },
    { nome: "Pasto Forte", vigencia: "01/05 a 30/07/2026", produtos: "Forrageiras Brachiária BRS", beneficio: "Preço fixo + 60 dias", bonus: "5% em compras combinadas", cor: "amber", status: "Ativa" },
    { nome: "Antecipa Safrinha", vigencia: "Encerrada 30/04/2026", produtos: "Sorgo e Milho 2ª safra", beneficio: "Condição entrega futura", bonus: "—", cor: "muted", status: "Encerrada" },
  ],

  /* ---------- TREINAMENTOS (plataforma externa - Green Mobile) ---------- */
  treinamentos: [
    { cat: "Comercial", icon: "briefcase",     itens: 8, done: 6, hr: "4h20" },
    { cat: "Crédito",   icon: "landmark",      itens: 5, done: 2, hr: "2h10" },
    { cat: "Logística", icon: "truck",         itens: 4, done: 4, hr: "1h40" },
    { cat: "Produtos",  icon: "sprout",        itens: 12, done: 7, hr: "6h00" },
    { cat: "Green Mobile", icon: "smartphone", itens: 6, done: 1, hr: "3h00" },
  ],

  /* ---------- MATERIAIS TÉCNICOS (arquivos reais) ---------- */
  materiais: [
    { nome: "Folder SBS 2025",            tipo: "Catálogo",        icon: "book-open",   meta: "PDF · 8 págs",  file: "materiais/folder-2025.pdf" },
    { nome: "Pecuária — Soluções SBS",    tipo: "Material técnico",icon: "file-text",   meta: "PDF · 3 págs",  file: "materiais/pecuaria.pdf" },
    { nome: "Milho — Tecnologia SBS",     tipo: "Material técnico",icon: "file-text",   meta: "PDF · 2 págs",  file: "materiais/milho.pdf" },
    { nome: "Rentabilidade na Lavoura",   tipo: "Resultados",      icon: "bar-chart-3", meta: "PDF · 2 págs",  file: "materiais/rentabilidade.pdf" },
    { nome: "Aumento de Produtividade",   tipo: "Resultados",      icon: "bar-chart-3", meta: "PDF · 2 págs",  file: "materiais/aumento.pdf" },
    { nome: "Poupando com SBS",           tipo: "Material comercial",icon: "piggy-bank",meta: "PDF · 2 págs",  file: "materiais/poupando.pdf" },
  ],

  /* ---------- COMISSÃO ---------- */
  comissao: {
    mesRef: "Junho/2026",
    aReceber: 18430.00,
    itens: [
      { label: "Comissão liberada", value: 12180.00, status: "liberado", sub: "faturado em jun" },
      { label: "A liberar", value: 4250.00, status: "previsto", sub: "vencimento 28 dias" },
      { label: "Retido", value: 2000.00, status: "retido", sub: "título do cliente em aberto" },
    ],
    // régua da política: desconto até X% → comissão Y%
    regua: [
      { ate: 0,   pct: 3.0, alcada: "Representante", nivel: "ok" },
      { ate: 3,   pct: 2.5, alcada: "Representante", nivel: "ok" },
      { ate: 6,   pct: 2.0, alcada: "Representante", nivel: "ok" },
      { ate: 10,  pct: 1.5, alcada: "Representante", nivel: "ok" },
      { ate: 15,  pct: 1.0, alcada: "Coordenador",  nivel: "aprova" },
      { ate: 100, pct: 0.5, alcada: "Diretor",      nivel: "diretor" },
    ],
  },

  /* ---------- RELATÓRIO DE VISITAS ---------- */
  visitas: {
    mes: 14, meta: 20,
    lista: [
      { cliente: "Fazenda Boa Vista", municipio: "Barreiras/BA", data: "18/06", objetivo: "Apresentação Soja Premium", resultado: "Proposta enviada", status: "proposta" },
      { cliente: "Agro Vale",          municipio: "Luís E. Magalhães/BA", data: "17/06", objetivo: "Pós-venda / acompanhamento", resultado: "Cliente satisfeito", status: "ok" },
      { cliente: "Grupo Cerrado",      municipio: "São Desidério/BA", data: "16/06", objetivo: "Negociação milho", resultado: "Aguardando crédito", status: "andamento" },
      { cliente: "Sítio Três Irmãos",  municipio: "Correntina/BA", data: "14/06", objetivo: "Prospecção", resultado: "Novo cadastro", status: "ok" },
    ],
  },

  /* ---------- NOTIFICAÇÕES ---------- */
  notificacoes: [
    { tipo: "campanha", icon: "megaphone", title: "Nova campanha liberada", text: "Soja Premium 25/26 disponível para sua região.", time: "há 1h", lida: false },
    { tipo: "comissao", icon: "wallet", title: "Comissão liberada", text: "R$ 12.180,00 referente a junho foram liberados.", time: "há 3h", lida: false },
    { tipo: "credito",  icon: "alert-triangle", title: "Crédito vencendo", text: "Fazenda Boa Vista: limite expira em 3 dias.", time: "há 5h", lida: true },
    { tipo: "geral",    icon: "info", title: "Comunicado da diretoria", text: "Nova tabela de preços VF02 já está no app.", time: "ontem", lida: true },
  ],

  /* ---------- CARGAS (consulta) ---------- */
  cargas: [
    { id: "CG-2291", cliente: "Agro Vale", produto: "240 sc SBS 7110", status: "entregue", eta: "Entregue 17/06", prog: 100,
      etapas: [["Pedido faturado","16/06"],["Carga em separação","16/06"],["Em trânsito","17/06"],["Entregue","17/06"]] },
    { id: "CG-2305", cliente: "Fazenda Boa Vista", produto: "120 sc Milho 3400", status: "transito", eta: "Previsão 20/06", prog: 70,
      etapas: [["Pedido faturado","18/06"],["Carga em separação","18/06"],["Em trânsito","19/06"],["Entregue","—"]] },
    { id: "CG-2310", cliente: "Grupo Cerrado", produto: "80 sc Sorgo S12", status: "producao", eta: "Previsão 24/06", prog: 35,
      etapas: [["Pedido faturado","19/06"],["Carga em separação","—"],["Em trânsito","—"],["Entregue","—"]] },
  ],
};
