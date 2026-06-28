/* ===========================================================
   SBS Painel T.I. — Migração & Ambiente (Homologação)
   Controles das melhorias de base, SEMPRE seguros:
   • Mostra o ambiente atual (Produção × Homologação)
   • Liga/desliga a Gravação por linha (anti-conflito) — só homolog
   • Orienta a sequência Auth + RLS (fase 1/2) sem risco em produção
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  const esc=TI.esc;
  const ENV=window.SBS_ENV||{ isHomolog:false, label:"PRODUÇÃO" };

  function rowOn(){ try{ return localStorage.getItem("sbs_rowsync")==="1"; }catch(e){ return false; } }
  function cloudMode(){
    const c=window.SBS_CLOUD||{};
    if(!c.on) return {t:"local",l:"Modo local (sem nuvem)",s:"warn"};
    if(c.mode==="row") return {t:"row",l:"Gravação por LINHA (anti-conflito)",s:"ok"};
    return {t:"col",l:"Gravação por COLEÇÃO (padrão)",s:"info"};
  }

  TI.Modules.migracao = {
    label:"Migração · Ambiente",
    render(){
      const isH=ENV.isHomolog, cm=cloudMode(), ron=rowOn();
      const card=(ic,v,l,t)=>`<div class="ti-kpi ${t||''}"><span class="ti-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="ti-kpi-v">${v}</div><div class="ti-kpi-l">${l}</div></div></div>`;

      const ambienteCard = `
      <div class="ti-panel" style="margin-bottom:16px">
        <div class="ti-panel-h"><i data-lucide="layers"></i> Ambiente atual</div>
        <div class="sd-row">
          <span class="sd-ic ${isH?'warn':'ok'}"><i data-lucide="${isH?'flask-conical':'badge-check'}"></i></span>
          <div class="sd-main">
            <div class="sd-t">${isH?'HOMOLOGAÇÃO':'PRODUÇÃO'} <span class="ti-badge ${isH?'s-sched':'s-done'}">${isH?'ambiente de testes':'ambiente real'}</span></div>
            <div class="sd-d">${isH?'Os dados aqui NÃO afetam a produção. É seguro testar tudo.':'Você está nos dados reais. As mudanças de base abaixo só podem ser ligadas em homologação.'}</div>
          </div>
          <div class="sd-side">
            ${isH
              ? '<button class="ti-btn sm" data-act="sair"><i data-lucide="log-out"></i> Sair da homolog.</button>'
              : '<button class="ti-btn sm primary" data-act="entrar"><i data-lucide="flask-conical"></i> Entrar na Homologação</button>'}
          </div>
        </div>
      </div>`;

      const rowCard = `
      <div class="ti-panel" style="margin-bottom:16px">
        <div class="ti-panel-h"><i data-lucide="git-commit-horizontal"></i> Fase 2 · Gravação por linha (anti-conflito)</div>
        <div class="sd-row">
          <span class="sd-ic ${ron?'ok':'info'}"><i data-lucide="rows-3"></i></span>
          <div class="sd-main">
            <div class="sd-t">Gravar só o registro alterado ${ron?'<span class="ti-badge s-done">ligada</span>':'<span class="ti-badge s-sched">desligada</span>'}</div>
            <div class="sd-d">Em vez de regravar a coleção inteira, envia apenas o item editado. Evita que dois usuários se sobrescrevam ao editar registros diferentes ao mesmo tempo.</div>
          </div>
          <div class="sd-side">
            ${isH
              ? `<button class="ti-btn sm ${ron?'':'primary'}" data-act="toggle-row">${ron?'<i data-lucide="toggle-right"></i> Desligar':'<i data-lucide="toggle-left"></i> Ligar e testar'}</button>`
              : '<span class="sd-extra">só em homologação</span>'}
          </div>
        </div>
        <div class="ti-note ${cm.s==='ok'?'ok':'info'}" style="margin-top:12px"><i data-lucide="cloud"></i> Estado da nuvem agora: <b>${esc(cm.l)}</b>.</div>
      </div>`;

      const authCard = `
      <div class="ti-panel" style="margin-bottom:16px">
        <div class="ti-panel-h"><i data-lucide="shield-check"></i> Fase 1 · Login seguro (Auth) + Regras no banco (RLS)</div>
        <div class="sd-row">
          <span class="sd-ic info"><i data-lucide="key-round"></i></span>
          <div class="sd-main">
            <div class="sd-t">Autenticação no Supabase + RLS na tabela <code>sbs_kv</code></div>
            <div class="sd-d">Move o login para o Supabase Auth (com papel por usuário) e liga as regras de segurança do banco. <b>Ordem obrigatória:</b> Auth em homologação → RLS em homologação → validar → produção.</div>
          </div>
        </div>
        <ol class="mig-steps">
          <li>Criar os usuários no Supabase (Auth) com o papel em <code>app_metadata.role</code>.</li>
          <li>Rodar <code>db/rls-policies.sql</code> no Supabase de <b>homologação</b>.</li>
          <li>Validar todos os perfis pelo checklist do guia.</li>
          <li>Só então replicar em produção.</li>
        </ol>
        <div class="ti-note warn" style="margin-top:8px"><i data-lucide="alert-triangle"></i> Ligar RLS sem o login pronto bloqueia o acesso de todos. Por isso esta fase é manual e validada antes. Reversão: <code>alter table public.sbs_kv disable row level security;</code></div>
      </div>`;

      return `
      <div class="ti-kpis">
        ${card(isH?'flask-conical':'badge-check', isH?'Homolog.':'Produção', "Ambiente atual", isH?'warn':'ok')}
        ${card("cloud", cm.t==='row'?'Por linha':(cm.t==='col'?'Por coleção':'Local'), "Modo de gravação", cm.s)}
        ${card("git-pull-request-arrow", ron?'2 ligada':'2 pronta', "Fase anti-conflito", ron?'ok':'info')}
        ${card("book-open", "Guia", "Validação", "info")}
      </div>
      ${ambienteCard}
      ${rowCard}
      ${authCard}
      <div class="ti-note info"><i data-lucide="info"></i> Tudo aqui é construído sem afetar a produção. As fases só entram no ar depois de validadas em homologação. Veja o passo a passo em <a href="Homologação - Guia.html" target="_blank" style="color:#2A4A7F;font-weight:700">Guia de Homologação</a>.</div>`;
    },
    mount(c){
      c.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>{
        const a=b.dataset.act;
        if(a==="entrar"){ ENV.entrarHomolog ? ENV.entrarHomolog() : (localStorage.setItem("sbs_env","homolog"), location.reload()); }
        else if(a==="sair"){ ENV.sairHomolog ? ENV.sairHomolog() : (localStorage.removeItem("sbs_env"), location.reload()); }
        else if(a==="toggle-row"){
          const on=rowOn();
          try{ on ? localStorage.removeItem("sbs_rowsync") : localStorage.setItem("sbs_rowsync","1"); }catch(e){}
          TI.toast(on?"Gravação por linha desligada":"Gravação por linha ligada — recarregando…");
          setTimeout(()=>location.reload(), 700);
        }
      }));
    }
  };
})();
