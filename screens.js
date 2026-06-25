/* ===========================================================
   SBS — screen renderers.  window.Screens[id] = {title, render, mount?}
   =========================================================== */
(function(){
const D = window.DATA;
const S = window.Screens = {};
const esc = s => String(s);

/* ---------------- HOME ---------------- */
S.home = {
  title: "SBS Green Seeds",
  appbarLeft: true,
  render(){
    const u = D.user;
    const g = window.Gam ? window.Gam.load() : null;
    const lv = window.Gam ? window.Gam.levelOf(g.points) : null;
    return `
    <div class="hero">
      <div class="row-between" style="align-items:flex-start">
        <div><div class="greet">Olá, bom dia 👋</div>
        <div class="uname">${u.first}</div>
        <div class="urole">${u.role} · ${u.region}</div></div>
        ${lv?`<button class="hero-lvl" data-go="ranking" style="--lc:${lv.cor}"><i data-lucide="award"></i><span><b>${lv.n}</b>${g.points} pts</span></button>`:""}
      </div>
      <div class="hero-stats">
        <div class="hero-stat" data-go="dashboard"><div class="hs-v">${D.metaPct}%</div><div class="hs-l">da meta da safra</div></div>
        <div class="hero-stat" data-go="visitas"><div class="hs-v">${D.visitas.mes}/${D.visitas.meta}</div><div class="hs-l">visitas no mês</div></div>
        <div class="hero-stat" data-go="ranking"><div class="hs-v">${lv?lv.n:"—"}</div><div class="hs-l">seu nível</div></div>
      </div>
    </div>

    <div class="section-title">Atalhos</div>
    <div class="shortcuts">
      ${(["regional","nacional","admin"].includes(u.papel)?`
        <button class="sc" data-go="equipe">
          <span class="sc-ic" style="background:var(--brand);color:#fff"><i data-lucide="users-round"></i></span>
          <span class="sc-l">Minha Equipe</span>
        </button>
        <button class="sc" data-go="acompanhamento">
          <span class="sc-ic" style="background:var(--brand);color:#fff"><i data-lucide="line-chart"></i></span>
          <span class="sc-l">Acompanhar</span>
        </button>
        <button class="sc" data-go="pendencias">
          <span class="sc-ic" style="background:oklch(0.55 0.14 50);color:#fff"><i data-lucide="list-checks"></i></span>
          <span class="sc-l">Pendências</span>
        </button>`:"")}
      <button class="sc" data-go="projecao">
        <span class="sc-ic" style="background:var(--accent);color:#fff"><i data-lucide="calendar-check"></i></span>
        <span class="sc-l">Projeção</span>
      </button>
      <button class="sc" data-go="plano">
        <span class="sc-ic" style="background:var(--accent);color:#fff"><i data-lucide="target"></i></span>
        <span class="sc-l">Plano de Ação</span>
      </button>
      <button class="sc" data-go="perdas">
        <span class="sc-ic" style="background:oklch(0.55 0.16 28);color:#fff"><i data-lucide="trending-down"></i></span>
        <span class="sc-l">Perdas</span>
      </button>
      <button class="sc" data-go="aprovacoes">
        <span class="sc-ic" style="background:var(--brand);color:#fff"><i data-lucide="badge-check"></i></span>
        <span class="sc-l">Aprovações</span>
      </button>
      <button class="sc" data-go="clientes">
        <span class="sc-ic" style="background:var(--accent);color:#fff"><i data-lucide="route"></i></span>
        <span class="sc-l">Clientes & Rotas</span>
      </button>
      <button class="sc" data-go="rotas">
        <span class="sc-ic" style="background:var(--accent);color:#fff"><i data-lucide="map"></i></span>
        <span class="sc-l">${["regional","nacional","admin"].includes(u.papel)?"Rotas da Equipe":"Minhas Rotas"}</span>
      </button>
      ${D.shortcuts.map(s=>`
        <button class="sc" data-go="${s.id}">
          <span class="sc-ic"><i data-lucide="${s.icon}"></i>${s.tag?`<span class="dot">${s.tag.match(/\\d+/)?s.tag.match(/\\d+/)[0]:"•"}</span>`:""}</span>
          <span class="sc-l">${s.label}</span>
        </button>`).join("")}
    </div>`;
  }
};

/* ---------------- DASHBOARD ---------------- */
S.dashboard = {
  title: "Dashboard",
  render(){
    const u = D.user;
    return `
    <div class="dash-ctx">
      <div class="dctx-row">
        <span class="dctx-ic"><i data-lucide="user-round"></i></span>
        <div class="dctx-info"><div class="dctx-l">Supervisor</div><div class="dctx-v">${u.supervisor}</div></div>
      </div>
      <div class="dctx-sep"></div>
      <div class="dctx-row">
        <span class="dctx-ic"><i data-lucide="target"></i></span>
        <div class="dctx-info"><div class="dctx-l">Sua meta · ${u.safra}</div><div class="dctx-v">${u.metaSafra}</div></div>
      </div>
    </div>
    <div class="section-title">Meus indicadores</div>
    <div class="kpi-grid">
      ${D.kpis.map(k=>`
        <div class="kpi ${k.tone==='brand'?'brand':''}">
          <div class="row-between">
            <span class="kic"><i data-lucide="${k.icon}"></i></span>
            ${k.delta?`<span class="delta ${k.up?'up':'down'}"><i data-lucide="${k.up?'arrow-up-right':'arrow-down-right'}"></i>${k.delta}</span>`:""}
          </div>
          <div><div class="kv">${k.value}</div><div class="kl">${k.label}</div></div>
          <div class="ksub">${k.sub}</div>
        </div>`).join("")}
    </div>

    <div class="section-title">Atingimento da meta</div>
    <div class="card">
      <div class="metarow">
        <div class="ring" style="--p:${D.metaPct}"><div class="ring-in"><b>${D.metaPct}%</b><span>da meta</span></div></div>
        <div class="stack" style="gap:9px;flex:1">
          <div><div class="muted" style="font-size:12px;font-weight:700">Faturado</div><div style="font-size:18px;font-weight:800">R$ 3,12 mi</div></div>
          <div><div class="muted" style="font-size:12px;font-weight:700">Gap para meta</div><div style="font-size:18px;font-weight:800;color:var(--danger)">R$ 0,94 mi</div></div>
        </div>
      </div>
    </div>

    <div class="row-between" style="margin:22px 4px 10px">
      <span class="section-title" style="margin:0">Ciclo do Pedido</span>
      <span class="link" data-go="ciclo">Ver validações →</span>
    </div>
    <div class="card funnel">
      ${D.funnel.map(f=>`
        <div class="fn">
          <div class="fn-bar" style="width:${30+f.value*1.5}%">${f.value}</div>
          <div class="fn-meta">${f.stage} · ${f.money}</div>
        </div>`).join("")}
    </div>

    <div class="section-title">Ranking comercial</div>
    <div class="card" style="padding:6px 14px">
      ${D.ranking.map(r=>`
        <div class="rank ${r.you?'you':''}">
          <span class="rpos">${r.pos}º</span>
          <div class="rinfo"><div class="rname">${r.name}</div><div class="rreg">${r.region}</div></div>
          <div><div class="rval">${r.value}</div><div class="progress" style="width:64px;margin-top:5px"><span style="width:${r.pct}%"></span></div></div>
        </div>`).join("")}
    </div>

    <div class="section-title">Alertas comerciais</div>
    ${D.alerts.map(a=>`
      <div class="alert ${a.type}">
        <span class="a-ic"><i data-lucide="${a.icon}"></i></span>
        <div style="flex:1"><div class="a-t">${a.title}</div><div class="a-x">${a.text}</div><div class="a-time">${a.time}</div></div>
      </div>`).join("")}
    `;
  }
};

/* ---------------- helper for doc screens ---------------- */
function docBlock(icon, title, body, list){
  return `<div class="doc-block">
    <div class="db-head"><span class="db-ic"><i data-lucide="${icon}"></i></span><h4>${title}</h4></div>
    ${body?`<p>${body}</p>`:""}
    ${list?`<ul class="doc-list">${list.map(l=>`<li><i data-lucide="check"></i><span>${l}</span></li>`).join("")}</ul>`:""}
  </div>`;
}
const sampleNote = `<div class="note"><i data-lucide="info"></i><span>Conteúdo de exemplo. Os textos oficiais serão inseridos pela área comercial.</span></div>`;

/* accordion builder: items = [{icon,title,html,open}] */
function acc(items){
  return `<div class="acc-group">` + items.map((it,i)=>`
    <div class="acc ${it.open||i===0?'open':''}">
      <button class="acc-head" type="button">
        <span class="acc-ic"><i data-lucide="${it.icon}"></i></span>
        <span class="acc-t">${it.title}</span>
        <i data-lucide="chevron-down" class="acc-chev"></i>
      </button>
      <div class="acc-body"><div class="acc-inner">${it.html}</div></div>
    </div>`).join("") + `</div>`;
}
const ul = arr => `<ul class="doc-list">${arr.map(l=>`<li><i data-lucide="check"></i><span>${l}</span></li>`).join("")}</ul>`;
const officialNote = `<div class="note ok"><i data-lucide="file-check-2"></i><span>Documento oficial assinado eletronicamente (ZapSign · ICP-Brasil).</span></div>`;

/* role list (estrutura comercial) */
function roleList(rows){
  return `<div class="roles">` + rows.map(r=>`
    <div class="role"><div class="role-name">${r[0]}</div><div class="role-desc">${r[1]}</div></div>`).join("") + `</div>`;
}
/* accordion mount: toggle open on header click */
function accMount(root){
  root.querySelectorAll(".acc-head").forEach(h=>{
    h.addEventListener("click",()=>{
      const a = h.closest(".acc");
      a.classList.toggle("open");
    });
  });
}

/* ---------------- POLÍTICA COMERCIAL (conteúdo oficial v1.0) ---------------- */
S.comercial = {
  title: "Política Comercial",
  render(){ return `<div class="doc">
    <div class="doc-actions">
      <button class="btn ghost sm" data-share-doc="comercial"><i data-lucide="share-2"></i> WhatsApp</button>
      <button class="btn outline sm" data-export-doc="comercial"><i data-lucide="file-down"></i> Exportar PDF</button>
    </div>
    <div class="doc-hero">
      <div class="dh-tag">Política Comercial · PL.12 · v01</div>
      <div class="dh-title">Diretrizes comerciais nacionais</div>
      <div class="dh-sub">Aplica-se às vendas do time comercial SBS Green Seeds em nível nacional. Publicação 01/05/2026.</div>
    </div>
    ${acc([
      { icon:"target", title:"1. Objetivo", open:true, html:
        `<p>Estabelecer as diretrizes, condições e procedimentos que regem as transações comerciais da SBS Green Seeds, assegurando <b>transparência, padronização e eficiência</b> para todos os envolvidos.</p>` },

      { icon:"globe", title:"2. Abrangência", html:
        `<p>Aplica-se às vendas realizadas pelo time comercial SBS a nível nacional.</p>` },

      { icon:"users", title:"3. Responsabilidades", html:
        roleList([
          ["Gerente Nacional","Define diretrizes comerciais, desdobra metas e garante recursos aos gerentes regionais."],
          ["Gerente Regional","Lidera a equipe, garantindo competitividade, margem, metas e gestão de pessoas."],
          ["Supervisor Comercial","Contrato exclusivo com a SBS; responsável pela emissão de todos os pedidos de venda."],
          ["Especialista Comercial","Contrato exclusivo; emite seus pedidos para o mercado de especialidades."],
          ["Agente Comercial","Autônomo com contrato formal e não exclusivo; participa das vendas, não emite pedido."],
          ["Corretor Comercial","Autônomo sem contrato; participação esporádica, não emite pedido."],
          ["Parceiro Comercial","Parceiros de venda do grupo Boa Safra; não emite pedido diretamente."],
          ["Departamento Técnico","Pesquisa, desenvolvimento e posicionamento de produtos; treina a equipe."],
          ["Adm de Vendas","Acompanha a aplicação das diretrizes na emissão e libera os pedidos em sistema."],
        ]) },

      { icon:"badge-percent", title:"4.2.2 Margem de Desconto", html:
        `<p>O valor cadastrado é o preço <b>à vista</b>. A grade de comissionamento varia conforme o desconto aplicado:</p>
         <div class="atab">
           <div class="atab-h">Desconto × Grade de comissionamento</div>
           ${[["-5%","10%"],["-6%","9%"],["-7%","8%"],["-8%","7%"],["-9%","6%"],["-10%","5%"],["-11%","4%"],["-12%","3%"],["-13%","2%"],["-14%","1%"],["-15%","0%"]].map(r=>`<div class="atab-r"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}
         </div>
         <div class="atab">
           <div class="atab-h">Alçada de aprovação de desconto</div>
           <div class="atab-r"><span>Supervisor(a)</span><b>até 15%</b></div>
           <div class="atab-r"><span>Gerente Regional</span><b>15% a 18%</b></div>
           <div class="atab-r"><span>Gerente Nacional</span><b>18% a 20%</b></div>
         </div>
         <div class="note"><i data-lucide="info"></i><span>Desconto total de até <b>20%</b> sobre a Tabela vigente. Antecipação de pagamento: até 1,5% de desconto adicional.</span></div>` },

      { icon:"tags", title:"4.2.1 Tabela de Preço", html:
        `${ul(["Elaborada com base em custos de produção e beneficiamento, corrigida conforme o mercado","Incidência de <b>1,90%</b> sobre o preço conforme aumento das parcelas (máx. 7 parcelas)","Antecipação de pagamento: até 1,5% de desconto","A Tabela vigente anula automaticamente as versões anteriores","Reajustes comunicados com antecedência razoável"])}` },

      { icon:"truck", title:"4.2.3 Modalidades de Frete", html:
        `${ul(["<b>CIF</b>: a partir da expedição, a SBS assume custos e riscos até o destino","<b>FOB</b>: a partir da expedição, o cliente assume custos e riscos até o destino"])}
         <div class="sub-block"><div class="sb-t">Volume mínimo para frete CIF</div>
           ${ul(["3.000 kg ou R$ 30.000,00 de valor total do pedido","Formação de carga por região: mínimo de 15.000 kg","Mix, milheto e plantas de cobertura: cálculo e informação do frete são <b>obrigatórios</b>"])}</div>
         <div class="note"><i data-lucide="info"></i><span>FOB com retirada em CD da SBS deve ser sinalizado na emissão, com agendamento prévio junto à Adm. de Vendas.</span></div>` },

      { icon:"wallet", title:"4.2.4 Condições de Pagamento", html:
        `<div class="sub-block"><div class="sb-t">À vista</div><p>Pagamento no ato do fechamento (chave PIX da empresa), liberando a programação de entrega.</p></div>
         <div class="sub-block"><div class="sb-t">Parcelado</div><p>Vencimentos a contar da emissão ou do faturamento, conforme condição selecionada no Green. Notificados via pedido, promissórias e/ou boletos.</p></div>
         <div class="sub-block"><div class="sb-t">Entrega Futura (Plano Safra)</div>
           ${ul(["Nota fiscal emitida na negociação; entrega física em data posterior","Antecipação de 10% a 15% no ato do pedido","100% do saldo confirmado até novembro","Multa em caso de cancelamento sem aviso após novembro"])}</div>` },

      { icon:"clipboard-list", title:"4.3 Pedido de Venda", html:
        `<p>Todo pedido é cadastrado no <b>Green Mobile</b>. Informações obrigatórias:</p>` +
        roleList([
          ["Cliente","Dados cadastrais de faturamento."],
          ["Data de entrega","Imediata: até 10 dias após aprovação de crédito. Futura: informar o mês limite."],
          ["Item e volume","Produtos SEMEMBRAS e BOA SAFRA em portfólio (cadastrados em sistema)."],
          ["Preço","Conforme tabela vigente, respeitando a margem de desconto."],
          ["Tipo de pedido","Normal (entrega única), Pai (entregas fracionadas) ou Entrega Futura (>30 dias)."],
          ["Marca","Semembrás, Boa Safra, Nobre ou do cliente."],
        ]) +
        `<div class="note"><i data-lucide="info"></i><span>SEMEMBRAS/NOBRE em kg · BOA SAFRA em sacaria (unidade).</span></div>` },

      { icon:"git-branch", title:"4.4 Status do Pedido", html:
        roleList([
          ["Liberação Comercial","Adm de Vendas — aprovação de preços, prazos e condições; cadastros em andamento."],
          ["Liberação Financeira","Financeiro — análise de crédito ou documentação financeira pendente."],
          ["Em Produção","PCP/Produção — liberado para programação; com lote definido segue para faturar."],
          ["Liberado para Faturar","Faturamento — produto disponível, apto a movimentação e logística."],
        ]) },

      { icon:"file-text", title:"4.5 Faturamento", html:
        roleList([
          ["Simples","Pedido faturado de uma vez, gerando contas a receber."],
          ["Parcial","Múltiplas notas de entregas fracionadas (Pedido Pai)."],
          ["Entrega Futura","NF sem movimentação de mercadoria, sem destaque de ICMS."],
          ["Remessa","Mercadoria circulada via NF de remessa (não gera contas a receber)."],
          ["Operação Triangular","NF de venda + remessa por ordem; o fornecedor entrega ao cliente."],
        ]) },

      { icon:"alert-triangle", title:"4.7 Inadimplência e Cancelamento", html:
        `<div class="atab">
           <div class="atab-r"><span>Multa de cancelamento</span><b>30% do total</b></div>
           <div class="atab-r"><span>Sinal</span><b>não devolvido</b></div>
         </div>
         <div class="note"><i data-lucide="info"></i><span>Esses valores fazem parte do contrato de venda e têm força de título executivo extrajudicial.</span></div>` },

      { icon:"shield-check", title:"4.8 Garantias e Reclamações", html:
        `<p>Sementes comercializadas com laudos oficiais conforme legislação do <b>MAPA</b>. A SBS garante a conformidade do lote com as especificações declaradas — não se responsabiliza por resultados agronômicos (clima, manejo, densidade, armazenamento).</p>` },

      { icon:"message-square-warning", title:"4.9 Não Conformidades", html:
        `<div class="sub-block"><div class="sb-t">Qualidade do produto</div>
          ${ul(["Cliente contata o vendedor responsável","Vendedor preenche o Protocolo de Reclamação e envia a <b>pedidos@sbsgreen.com.br</b>","Análise laboratorial — se reprovado, troca liberada conforme padrões MAPA","Adm de Vendas alinha substituição e/ou abatimento de boleto","NF de devolução gera o crédito em sistema","Sendo substituição, programação logística"])}</div>
         <div class="note"><i data-lucide="ban"></i><span>Não são aceitas devoluções com sacaria rasgada ou em mau estado. Troca por mesmo cultivar e valor cultural.</span></div>` },

      { icon:"percent", title:"4.10 Comissionamento", html:
        `<div class="atab">
           <div class="atab-h">Comissão por cargo</div>
           <div class="atab-r"><span>Gerente Regional</span><b>0,5%</b></div>
           <div class="atab-r"><span>Supervisor</span><b>até 2%</b></div>
           <div class="atab-r"><span>Agente</span><b>0% a 10%</b></div>
           <div class="atab-r"><span>Cana, Café e Fumageira</span><b>1%</b></div>
           <div class="atab-r"><span>Parceiros Boa Safra</span><b>1,5%</b></div>
           <div class="atab-r"><span>Corretor</span><b>0% a 10%</b></div>
         </div>
         <div class="note"><i data-lucide="info"></i><span>Supervisor: 2% com desconto de 15%; 1% acima de 15% ou vendas compartilhadas. Percentuais individuais definidos em contrato.</span></div>` },

      { icon:"receipt", title:"4.13 Despesas e Reembolso", html:
        `<p>Cartão corporativo (Flash) é a forma padrão. Registro em até 48h, com cupom/NF em nome da empresa.</p>` +
        roleList([
          ["Alimentação","R$ 60,00 por ocorrência, até 2 ao dia (almoço e jantar)."],
          ["Hospedagem","Até R$ 250,00 a diária. Frigobar não reembolsado."],
          ["Combustível e pedágios","Com comprovantes fiscais e registro de trajeto."],
          ["Limpeza de veículo","Até 2x/mês, limite de R$ 150,00 por ocorrência."],
          ["Limite do cartão","Padrão até R$ 6.000,00; reposições a partir de R$ 3.000,00."],
        ]) +
        `<div class="note"><i data-lucide="ban"></i><span>Não reembolsáveis: despesas pessoais, multas, bebidas alcoólicas e patrocínios sem autorização prévia.</span></div>` },

      { icon:"badge-check", title:"4.11 Uso da Marca", html:
        `${ul(["Consistência visual conforme o manual de identidade","Proibido distorcer, alterar ou usar o logotipo em fundos inadequados","Comunicação alinhada aos valores e posicionamento da SBS","Respeito às normas de propriedade intelectual","Materiais promocionais aprovados previamente"])}` },

      { icon:"file-check", title:"5. Disposições Finais", html:
        `<p>Vigência de <b>6 meses</b> a partir da publicação (01/05/2026), com revisão antes do vencimento. Exceções só têm efeito se aprovadas por escrito pela Diretoria.</p>` },
    ])}
    ${officialNote}
  </div>`; },
  mount: accMount
};

/* ---------------- POLÍTICA DE CRÉDITO (PL.04 v01 — oficial assinada) ---------------- */
S.credito = {
  title: "Política de Crédito",
  render(){ return `<div class="doc">
    <div class="doc-actions">
      <button class="btn ghost sm" data-share-doc="credito"><i data-lucide="share-2"></i> WhatsApp</button>
      <button class="btn outline sm" data-export-doc="credito"><i data-lucide="file-down"></i> Exportar PDF</button>
    </div>
    <div class="doc-hero">
      <div class="dh-tag">Política de Crédito · PL.04 · v01</div>
      <div class="dh-title">Concessão responsável de crédito</div>
      <div class="dh-sub">Garante que os créditos sejam concedidos de forma responsável, mantendo o risco de inadimplência em níveis aceitáveis. Vigência 6 meses.</div>
    </div>
    ${acc([
      { icon:"target", title:"1. Objetivo e Abrangência", open:true, html:
        `<p>Estabelecer diretrizes que garantam crédito concedido de forma responsável, com risco de inadimplência em níveis aceitáveis.</p>
         <div class="note"><i data-lucide="info"></i><span>Abrange Comercial, Operações, Financeiro, Jurídico e todos os clientes PF e PJ da SBS.</span></div>` },

      { icon:"users", title:"3. Responsabilidades", html:
        roleList([
          ["Diretoria","Define políticas globais de crédito e diretrizes de risco; aprovação final em casos de alto valor."],
          ["Gerente de Crédito","Parecer técnico e decisão dentro de sua alçada; negocia condições com clientes estratégicos."],
          ["Cliente","Fornece documentação verídica e completa; assina contratos e formalizações nos prazos."],
          ["Time Comercial","Capta a documentação conforme checklist e mantém o relacionamento com o proponente."],
          ["Adm de Vendas","Recepção, organização e triagem inicial da documentação antes da análise."],
        ]) },

      { icon:"shield-check", title:"4.1 Concessão e Consentimento (LGPD)", html:
        `<p>Além do pedido de compra, é obrigatório o <b>consentimento documentado</b> do cliente para que a SBS realize a análise de crédito. Isso garante:</p>
         ${ul(["<b>Proteção de dados</b>: consulta a histórico financeiro e bureaus (Serasa, SPC, Boa Vista) exige autorização (LGPD)","<b>Transparência</b>: o cliente sabe quais dados são acessados e para qual finalidade","<b>Conformidade legal</b>: sem consentimento, há risco de responsabilização","<b>Confiança</b>: fortalece a relação, mostrando processo ético e seguro"])}` },

      { icon:"building-2", title:"4.2.1 Documentação — Pessoa Jurídica", html:
        ul(["Ficha cadastral preenchida e assinada","Contrato social e/ou última alteração consolidada","Associações/Cooperativas: estatuto social e ata de eleição/posse","Certidão simplificada atualizada","Balanço e DRE dos últimos 3 anos","Demonstrativo de Fluxo de Caixa dos últimos 3 anos","Imposto de Renda dos últimos 3 anos","Declaração de faturamento dos últimos 12 meses","Documentos dos sócios e cônjuges (CPF, RG, certidão de estado civil)","Comprovante de endereço dos sócios e do CNPJ com CEP","Curva ABC dos clientes","Agropecuárias: CAR da propriedade beneficiada"]) },

      { icon:"user", title:"4.2.2 Documentação — Pessoa Física", html:
        ul(["Ficha cadastral preenchida e assinada","Documentos do proponente e cônjuge (CPF, RG, certidão de estado civil)","Imposto de Renda dos últimos 3 anos","Comprovante de endereço atualizado com CEP","CAR, contrato de arrendamento/comodato/parceria ou certidão do imóvel"]) },

      { icon:"user-check", title:"4.2.3 Avalista", html:
        ul(["Dados pessoais: nome completo, telefone e e-mail","CPF, RG e certidão de estado civil","Comprovante de endereço"]) },

      { icon:"banknote", title:"4.3 Vendas à Vista", html:
        `<p>Operações com pagamento antecipado. A liberação para carregamento só ocorre após a <b>compensação financeira total</b> ou análise de crédito aprovada com garantias formalizadas.</p>
         <div class="note"><i data-lucide="info"></i><span>O pagamento à vista não dispensa a assinatura do contrato e do pedido.</span></div>` },

      { icon:"search-check", title:"4.4 Vendas a Prazo — Critérios", html:
        ul(["<b>Contrato assinado</b>: Termo e Condições de Compra em até 5 dias corridos (senão o pedido é cancelado)","<b>Score de crédito</b> (Serasa, SPC, Boa Vista)","<b>Histórico financeiro</b>: atrasos, inadimplência e restrições","<b>Renda comprovada</b> e <b>comprometimento</b> da renda","<b>Estabilidade profissional</b> e <b>garantias</b> oferecidas","<b>Relacionamento</b> com a instituição","Compatibilidade entre valor e prazo; reavaliação em prorrogações"]) },

      { icon:"timer", title:"4.4.3 Resultado", html:
        `<p>A documentação segue as regras de motor da plataforma <b>Tarken</b>, e a área de crédito define resultado favorável ou não. Prazo de <b>3 a 5 dias úteis</b>, conforme a suficiência da documentação.</p>` },

      { icon:"file-signature", title:"4.4.4 Formalização do Crédito", html:
        `<div class="atab">
           <div class="atab-h">Garantia por faixa de valor</div>
           <div class="atab-r"><span>Até R$ 150.000</span><b>NP · 1 avalista</b></div>
           <div class="atab-r"><span>R$ 150.001 a R$ 500.000</span><b>NP/CD · 2 avalistas</b></div>
           <div class="atab-r"><span>Acima de R$ 500.001</span><b>Garantia real · 2 avalistas</b></div>
         </div>
         <div class="note"><i data-lucide="info"></i><span>NP = Nota Promissória · CD = Confissão de Dívida ou CPR. Pedidos acima de R$ 1.000.000 vão ao Comitê de Diretoria.</span></div>` },

      { icon:"git-branch", title:"Fluxo da Análise", html:
        roleList([
          ["Recepção do Pedido","Validação inicial da proposta e registro sistêmico (protocolo)."],
          ["Assinatura do Contrato","Envio e coleta de assinaturas — prazo de até 5 dias."],
          ["Envio da Documentação","Triagem e validação em conformidade — prazo de até 15 dias."],
          ["Análise de Crédito","Consultas a bureau, análise de balanços e cálculo de risco — 3 a 5 dias."],
          ["Resultado & Formalização","Aprovação (NF e garantias) ou reprovação (feedback ao representante)."],
        ]) },

      { icon:"file-check", title:"5. Disposições Finais", html:
        `<p>Vigência de <b>6 meses</b> a partir da publicação, com revisão antes do vencimento. Exceções só têm efeito se aprovadas por escrito pela Diretoria da SBS Green Seeds.</p>
         <div class="note"><i data-lucide="book"></i><span>Referência: Lei nº 4.595/1964. Penápolis, 04/05/2026.</span></div>` },
    ])}
    ${officialNote}
  </div>`; },
  mount: accMount
};

/* ---------------- CONDIÇÕES DE PAGAMENTO ---------------- */
S.pagamento = {
  title: "Condições de Pagamento",
  render(){ return `<div class="doc">
    ${docBlock("banknote","À vista","Pagamento na emissão do pedido com desconto financeiro adicional conforme tabela.",
      ["Desconto de até 3% à vista","PIX, TED ou boleto D+0"])}
    ${docBlock("calendar-clock","Parcelado","Condições parceladas mediante aprovação de crédito.",
      ["30/60/90 dias","Até 6x com entrada","Juros conforme tabela vigente"])}
    ${docBlock("sprout","Entrega futura / Barter","Pagamento atrelado à colheita ou troca por produto (barter).",
      ["Vencimento na safra (ex.: pós-colheita)","Troca-produto via parceiros","Trava de preço na contratação"])}
    ${docBlock("scale","Regras financeiras",null,
      ["Multa de 2% + juros de 1% a.m. em atraso","Reajuste por variação cambial quando aplicável","Bloqueio de novos pedidos com título vencido"])}
    ${sampleNote}
  </div>`; }
};

/* ---------------- registra módulos extras ---------------- */
window.__screensCore = true;
})();
