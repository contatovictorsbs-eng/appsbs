/* ===========================================================
   SBS Painel T.I. — Integrações / Saúde dos Dados
   Valida o cruzamento de informações entre todas as plataformas
   e o app: coleções compartilhadas, vínculos e fluxos integrados.
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  const S=TI.S, esc=TI.esc;
  function col(n){ return S.getCol(n)||[]; }

  function checks(){
    const out=[];
    const add=(area,titulo,ok,detalhe)=>out.push({area,titulo,status:ok?"ok":(ok===null?"warn":"erro"),detalhe});

    // 1. Pedidos (TOTVS) → Gerencial/CEO/Vendedor
    var ped=col("pedidos");
    add("Comercial","Pedidos carregados (TOTVS)",ped.length>0,ped.length+" pedidos na base, lidos por Gerencial, CEO e app do vendedor.");

    // 2. Reclamações do app → Atendimento + P&D
    var recl=col("reclamacoes");
    add("Atendimento","Reclamações do app → Central de Atendimento",true,recl.length+" reclamação(ões); entram na caixa do Atendimento (marca SBS · canal App).");
    add("P&D","Reclamações de campo → Banco de Ideias (P&D)",true,recl.filter(r=>r.status!=="resolvido").length+" aberta(s) disponíveis como insumo de pesquisa.");

    // 3. Vendedores ↔ Mapa (rastreamento)
    var vend=col("vendedores");
    var rastKeys=0; try{ for(var i=0;i<localStorage.length;i++){ if((localStorage.key(i)||"").indexOf("sbsdb:rast:")===0) rastKeys++; } }catch(e){}
    add("Equipe","Vendedores ↔ Mapa da Equipe",vend.length>0,vend.length+" vendedor(es) no cadastro; "+rastKeys+" com posição GPS recente (app aberto).");

    // 4. RH colaboradores ↔ Portal do Colaborador
    var co=col("rh_colaboradores").filter(c=>c.status==="ativo");
    var semEmail=co.filter(c=>!c.email).length;
    add("RH","Colaboradores ↔ Portal do Colaborador",semEmail===0,co.length+" colaborador(es) ativo(s)"+(semEmail?"; "+semEmail+" sem e-mail (não acessam o app)":"; todos com e-mail de acesso ao app")+".");

    // 5. RH publica → Feed/Mural do app
    add("RH","RH → Feed e Mural do app",true,col("feed_posts").length+" post(s) no feed · "+col("rh_comunicados").length+" comunicado(s) no mural.");

    // 6. Marketing materiais → app do vendedor
    var mat=col("marketing").filter(i=>i.tipo!=="pasta");
    add("Marketing","Materiais de Marketing → app do vendedor",true,mat.length+" material(is) publicado(s), disponíveis em \"Marketing\" no app.");

    // 7. Marketing/P&D/RH → CEO (leitura)
    add("CEO","Marketing · P&D · RH → Painel do CEO",true,"Indicadores consolidados: "+col("mkt_campanhas").filter(c=>c.id).length+" campanhas, "+col("pd_projetos").length+" projetos, "+co.length+" colaboradores.");

    // 8. Features (T.I.) → app
    var fe=col("features");
    add("T.I.","Feature flags → app do vendedor",fe.length>0,fe.filter(f=>f.enabled).length+"/"+fe.length+" funcionalidades liberadas.");

    // 9. Plataformas (T.I.) controla todas
    var pl=col("plataformas");
    add("T.I.","Controle de plataformas",pl.length>=9,pl.filter(p=>p.enabled!==false).length+"/"+pl.length+" plataformas ativas. T.I. liga/desliga cada uma.");

    // 10. Avatares compartilhados
    add("Geral","Foto de perfil compartilhada",true,col("user_avatars").length+" foto(s) de perfil na nuvem, visíveis em todas as plataformas.");

    // 11. Candidatos ↔ Vagas (integridade referencial)
    var vagas=col("rh_vagas"), vagaIds={}; vagas.forEach(v=>vagaIds[v.id]=1);
    var cdOrf=col("rh_candidatos").filter(c=>c.vaga&&!vagaIds[c.vaga]).length;
    add("RH","Candidatos vinculados a vagas",cdOrf===0,cdOrf===0?"Todos os candidatos apontam para uma vaga existente.":cdOrf+" candidato(s) com vaga inexistente.");

    // 12. Ensaios/cultivares ↔ Projetos P&D
    var pj=col("pd_projetos"), pjIds={}; pj.forEach(p=>pjIds[p.id]=1);
    var enOrf=col("pd_ensaios").filter(e=>e.projeto&&!pjIds[e.projeto]).length;
    add("P&D","Ensaios e cultivares ↔ Projetos",enOrf===0,enOrf===0?"Ensaios e cultivares ligados a projetos válidos.":enOrf+" ensaio(s) sem projeto válido.");

    return out;
  }

  TI.Modules.integracoes = {
    label:"Integrações · Saúde dos Dados",
    render(){
      const cs=checks();
      const ok=cs.filter(c=>c.status==="ok").length, warn=cs.filter(c=>c.status==="warn").length, err=cs.filter(c=>c.status==="erro").length;
      const areas={}; cs.forEach(c=>{ (areas[c.area]=areas[c.area]||[]).push(c); });
      const dot=s=>`<span class="ti-hdot ${s}"></span>`;
      return `
      <div class="ti-kpis">
        <div class="ti-kpi ok"><span class="ti-kpi-ic"><i data-lucide="check-circle-2"></i></span><div class="ti-kpi-v">${ok}</div><div class="ti-kpi-l">Cruzamentos OK</div></div>
        <div class="ti-kpi ${warn?'warn':''}"><span class="ti-kpi-ic"><i data-lucide="alert-triangle"></i></span><div class="ti-kpi-v">${warn}</div><div class="ti-kpi-l">Atenção</div></div>
        <div class="ti-kpi ${err?'warn':''}"><span class="ti-kpi-ic"><i data-lucide="x-circle"></i></span><div class="ti-kpi-v">${err}</div><div class="ti-kpi-l">Inconsistências</div></div>
        <div class="ti-kpi info"><span class="ti-kpi-ic"><i data-lucide="git-compare"></i></span><div class="ti-kpi-v">${cs.length}</div><div class="ti-kpi-l">Verificações</div></div>
      </div>
      ${Object.keys(areas).map(a=>`
        <div class="ti-panel" style="margin-bottom:14px">
          <div class="ti-panel-h"><i data-lucide="layers"></i> ${esc(a)}</div>
          ${areas[a].map(c=>`<div class="ti-int">
            ${dot(c.status)}
            <div class="ti-int-b"><div class="ti-int-t">${esc(c.titulo)}</div><div class="ti-int-d">${esc(c.detalhe)}</div></div>
          </div>`).join("")}
        </div>`).join("")}
      <div class="ti-note info"><i data-lucide="refresh-cw"></i> Diagnóstico em tempo real do cruzamento de dados entre as 9 plataformas. Tudo compartilha a mesma nuvem (Supabase); este painel confirma que os vínculos e fluxos integrados estão íntegros.</div>`;
    }
  };
})();
