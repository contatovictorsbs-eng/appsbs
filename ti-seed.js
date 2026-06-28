/* ===========================================================
   SBS Painel T.I. — Dados de Exemplo (limpar + semear "Teste")
   Zera as coleções operacionais e semeia 1 exemplo "Teste" por
   funcionalidade, para a equipe entender como cada parte funciona.
   ⚠️ Afeta o ambiente ATUAL (rode em Homologação primeiro).
   Não mexe em: features, releases, user_creds, plataformas.
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  const S=TI.S, esc=TI.esc;
  const hoje=()=> (S.today&&S.today())||new Date().toISOString().slice(0,10);
  const VEND="rodrigo.medina@sbsgreen.com.br";

  // 1 exemplo por funcionalidade
  function SAMPLES(){
    const d=hoje(), ts=Date.now();
    return {
      // ---- Comercial / app do vendedor ----
      clientes:   [{ id:"cli-teste", nome:"Cliente Teste", fantasia:"Fazenda Teste", cidade:"Cidade Teste", uf:"BA", vendedor:VEND, cultura:"Soja", status:"ativo" }],
      pedidos:    [{ id:"ped-teste", num:"TESTE-001", cliente:"Cliente Teste", vendedor:VEND, valor:50000, comissao:1500, data:d, status:"faturado", itens:[{produto:"Semente Teste", qtd:10, valor:5000}] }],
      visitas:    [{ id:"vis-teste", cliente:"Cliente Teste", email:VEND, data:d, municipio:"Cidade Teste", obs:"Visita de exemplo", status:"realizada" }],
      rotas:      [{ id:"rota-teste", email:VEND, data:d, paradas:[{municipio:"Cidade Teste", cliente:"Cliente Teste"}] }],
      plano_acao: [{ id:"pa-teste", email:VEND, titulo:"Ação Teste", meta:"Exemplo de plano de ação", prazo:d, status:"andamento" }],
      projecoes:  [{ id:"proj-teste", email:VEND, visitas:5, pedidos:2, valor:50000, periodo:"Safra Teste" }],
      aprovacoes: [{ id:"apr-teste", cliente:"Cliente Teste", vendedor:VEND, desconto:5, valor:50000, status:"pendente", nivel:"regional", data:d, ts }],
      reclamacoes:[{ id:"rec-teste", cliente:"Cliente Teste", assunto:"Reclamação Teste", descricao:"Exemplo de reclamação para entender o fluxo.", status:"aberta", data:d, ts, email:VEND }],
      chamados:   [{ id:"cha-teste", titulo:"Chamado Teste", area:"T.I.", descricao:"Exemplo de chamado interno.", status:"aberto", data:d, ts, email:VEND }],
      // ---- Inteligência de Mercado ----
      mi_cotacoes:    [{ id:"mc-teste", produto:"Soja (Teste)", praca:"Cidade Teste", valor:130, unidade:"R$/sc", data:d, variacao:1.5 }],
      mi_concorrentes:[{ id:"cc-teste", nome:"Concorrente Teste", segmento:"Sementes", regiao:"BA", posicao:"Regional", forca:"Exemplo", movimentos:[] }],
      mi_regioes:     [{ id:"reg-teste", nome:"Região Teste", uf:"BA", cultura:"Soja", potencial:"alto" }],
      mi_tendencias:  [{ id:"tn-teste", titulo:"Tendência Teste", resumo:"Exemplo de tendência de mercado.", data:d, fonte:"Exemplo" }],
      mi_estudos:     [{ id:"est-teste", titulo:"Estudo Teste", status:"rascunho", data:d, blocos:[{tipo:"texto", html:"<p>Conteúdo de exemplo do estudo.</p>"}] }],
      mi_fontes:      [{ id:"ft-teste", nome:"Concorrente Teste", canais:[{tipo:"site", url:"https://exemplo.com.br", nome:"Site"}] }],
      // ---- Marketing ----
      mkt_campanhas: [{ id:"cmp-teste", titulo:"Campanha Teste", canal:"Instagram", status:"planejada", inicio:d, publico:"Produtores" }],
      mkt_materiais: [{ id:"mat-teste", titulo:"Material Teste", tipo:"Folder", status:"publicado", data:d }],
      mkt_conteudo:  [{ id:"con-teste", titulo:"Conteúdo Teste", formato:"Post", status:"ideia", data:d }],
      mkt_redes:     [{ id:"red-teste", rede:"Instagram", handle:"@teste", seguidores:1000, data:d }],
      mkt_eventos:   [{ id:"evt-teste", titulo:"Evento Teste", local:"Cidade Teste", data:d, status:"planejado" }],
      // ---- P&D ----
      pd_pipeline:   [{ id:"pp-teste", titulo:"Projeto Teste", fase:"ideacao", responsavel:"Lara", status:"andamento" }],
      pd_ensaios:    [{ id:"en-teste", titulo:"Ensaio Teste", cultura:"Soja", local:"Cidade Teste", status:"andamento", data:d }],
      pd_cultivares: [{ id:"cv-teste", nome:"Cultivar Teste", cultura:"Soja", ciclo:"Médio", status:"avaliacao" }],
      pd_ideias:     [{ id:"id-teste", titulo:"Ideia Teste", origem:"Interna", votos:1, status:"nova", data:d }],
      pd_marcos:     [{ id:"mk-teste", titulo:"Marco Teste", data:d, status:"previsto" }],
      pd_docs:       [{ id:"doc-teste", titulo:"Documento Teste", tipo:"Protocolo", data:d }],
      // ---- RH ----
      rh_vagas:        [{ id:"vg-teste", titulo:"Vaga Teste", area:"Comercial", tipo:"CLT", status:"aberta", data:d }],
      rh_candidatos:   [{ id:"ca-teste", nome:"Candidato Teste", vaga:"Vaga Teste", etapa:"triagem", data:d }],
      rh_colaboradores:[{ id:"col-teste", nome:"Colaborador Teste", email:"teste@sbsgreen.com.br", cargo:"Analista", setor:"Comercial", admissao:d, nascimento:d }],
      rh_comunicados:  [{ id:"cm-teste", titulo:"Comunicado Teste", texto:"Mensagem de exemplo para o mural.", data:d, destaque:true }],
      rh_eventos:      [{ id:"re-teste", titulo:"Evento Teste", data:d, local:"Sede" }],
      // ---- Atendimento ----
      atend_conversas: [{ id:"ax-teste", marca:"SBS Green Seeds", cliente:"Cliente Teste", canal:"WhatsApp", status:"pendente", assunto:"Atendimento Teste", ts, mensagens:[{de:"cliente", texto:"Mensagem de exemplo", ts}] }],
      // ---- T.I. ----
      gmuds:    [{ id:"gm-teste", numero:"GM-TESTE", titulo:"Mudança Teste", tipo:"evolutiva", risco:"baixo", status:"rascunho", criadoEm:d, criadoPor:"T.I." }],
      demandas: [{ id:"dm-teste", titulo:"Demanda Teste", setor:"Marketing", solicitante:"marcela.marketing@sbsgreen.com.br", prioridade:"media", tipo:"ajuste", status:"aberta", data:d, ts, historico:[] }],
      // ---- Geral ----
      notificacoes: [{ id:"nt-teste", title:"Bem-vindo ao SBS Green", text:"Este é um aviso de exemplo. Explore o sistema!", tipo:"aviso", icon:"sparkles", destino:"todos", data:d, ts }]
    };
  }
  // coleções a ZERAR mesmo sem exemplo
  const EXTRA_CLEAR = ["mi_movimentos","mi_alertas","mi_robo_sinais","mi_calendario","mi_coletor_log",
    "comissoes","cargas","perdas","erros"];

  TI.Modules.dados = {
    label:"Dados de Exemplo",
    render(){
      const env = (window.SBS_ENV&&SBS_ENV.label)||"PRODUÇÃO";
      const isH = !!(window.SBS_ENV&&SBS_ENV.isHomolog);
      const map=SAMPLES(); const n=Object.keys(map).length;
      return `
      <div class="ti-toolbar"><div><div class="ti-sub">Zera as coleções operacionais e cria <b>1 exemplo “Teste”</b> por funcionalidade, para a equipe entender como tudo funciona.</div></div></div>
      <div class="ti-note ${isH?'ok':'warn'}"><i data-lucide="${isH?'flask-conical':'alert-triangle'}"></i>
        Ambiente atual: <b>${esc(env)}</b>. ${isH? "Você está em homologação — seguro testar." : "Você está em PRODUÇÃO — isso apaga os dados reais. Recomendo entrar na Homologação antes (seletor no canto inferior esquerdo)."}</div>
      <div class="ti-card">
        <div class="ti-block-h">O que esta ação faz</div>
        <ul class="mig-steps">
          <li>Apaga os registros das ${n}+ coleções operacionais (clientes, pedidos, campanhas, ideias, vagas, conversas, etc.).</li>
          <li>Cria <b>um</b> registro de exemplo em cada, com nome “Teste”.</li>
          <li><b>Não</b> mexe em: liberação de features, lançamentos, senhas e plataformas.</li>
        </ul>
        <div class="ti-fld" style="max-width:320px;margin-top:14px">
          <label>Para confirmar, digite <b>LIMPAR</b></label>
          <input id="sd-confirm" class="ti-input" placeholder="LIMPAR" autocomplete="off">
        </div>
        <div class="ti-quick">
          <button class="ti-btn primary" id="sd-run"><i data-lucide="rotate-ccw"></i> Limpar e semear exemplos</button>
        </div>
      </div>`;
    },
    mount(c){
      const run=c.querySelector("#sd-run");
      run && (run.onclick=()=>{
        const v=(c.querySelector("#sd-confirm").value||"").trim().toUpperCase();
        if(v!=="LIMPAR"){ TI.toast('Digite LIMPAR para confirmar'); return; }
        const isH=!!(window.SBS_ENV&&SBS_ENV.isHomolog);
        if(!isH && !confirm("Você está em PRODUÇÃO. Apagar os dados reais e semear exemplos?")) return;
        const map=SAMPLES();
        Object.keys(map).forEach(col=> S.setCol(col, map[col]));
        EXTRA_CLEAR.forEach(col=> S.setCol(col, []));
        TI.toast("Dados de exemplo carregados");
        TI.go("dados");
      });
    }
  };
})();
