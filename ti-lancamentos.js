/* ===========================================================
   SBS Painel T.I. — Lançamentos (Liberação por Ambiente)
   Controla o anel Homologação → Produção (window.SBS_RELEASE).
   A T.I. valida em homologação e libera para produção com 1 clique.
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  const S=TI.S, esc=TI.esc;
  const R=()=>window.SBS_RELEASE;

  function who(){ return (TI.session&&TI.session.nome)||"T.I."; }
  function items(){ return R()? R().list() : []; }

  function grupos(){
    const g={};
    items().forEach(r=>{ (g[r.grupo||"Geral"]=g[r.grupo||"Geral"]||[]).push(r); });
    return g;
  }

  function badge(st){
    return st==="prod"
      ? '<span class="ti-badge s-done">Em produção</span>'
      : '<span class="ti-badge s-sched">Em homologação</span>';
  }

  TI.Modules.lancamentos = {
    label:"Lançamentos",
    render(){
      const all=items();
      const emH=all.filter(r=>r.stage==="homolog").length;
      const emP=all.filter(r=>r.stage==="prod").length;
      const G=grupos();
      const gk=Object.keys(G).sort();

      const tabela = gk.length ? gk.map(k=>`
        <div class="ti-block">
          <div class="ti-block-h">${esc(k)}</div>
          <table class="ti-table">
            <thead><tr><th>Funcionalidade</th><th>ID</th><th>Ambiente</th><th>Liberada em</th><th></th></tr></thead>
            <tbody>
            ${G[k].map(r=>`
              <tr>
                <td><b>${esc(r.label||r.id)}</b></td>
                <td><code class="lc-code">${esc(r.id)}</code></td>
                <td>${badge(r.stage)}</td>
                <td class="lc-dim">${r.stage==="prod" ? (esc(r.liberadoEm||"—")+(r.liberadoPor?(" · "+esc(r.liberadoPor)):"")) : "—"}</td>
                <td class="lc-acts">
                  ${r.stage==="homolog"
                    ? `<button class="ti-btn primary" data-soltar="${esc(r.id)}"><i data-lucide="rocket"></i> Liberar p/ produção</button>`
                    : `<button class="ti-btn" data-recolher="${esc(r.id)}"><i data-lucide="undo-2"></i> Voltar p/ teste</button>`}
                  <button class="ti-btn ghost" data-remover="${esc(r.id)}" title="Remover do controle"><i data-lucide="x"></i></button>
                </td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>`).join("")
      : `<div class="ti-empty big"><i data-lucide="rocket"></i><p>Nenhuma funcionalidade sob controle de ambiente ainda.<br>Cadastre abaixo a primeira para validar em homologação antes de soltar.</p></div>`;

      return `
      <div class="ti-toolbar">
        <div><div class="ti-sub">Construa, valide em <b>homologação</b> e solte para <b>produção</b> com 1 clique. Em produção, o que estiver “em homologação” fica oculto.</div></div>
      </div>

      <div class="ti-kpis">
        <div class="ti-kpi"><div class="ti-kpi-v">${all.length}</div><div class="ti-kpi-l">Controladas</div></div>
        <div class="ti-kpi"><div class="ti-kpi-v" style="color:#b9791e">${emH}</div><div class="ti-kpi-l">Em homologação</div></div>
        <div class="ti-kpi"><div class="ti-kpi-v" style="color:#1f8a5b">${emP}</div><div class="ti-kpi-l">Em produção</div></div>
      </div>

      <div class="ti-card">
        <div class="ti-block-h">Nova liberação</div>
        <div class="ti-form">
          <div class="ti-fld">
            <label>Nome da funcionalidade</label>
            <input id="lc-label" class="ti-input" placeholder="Ex.: Carteira inteligente">
          </div>
          <div class="ti-fld">
            <label>ID técnico (casa com a tela/menu)</label>
            <input id="lc-id" class="ti-input" placeholder="Ex.: carteira">
          </div>
          <div class="ti-fld">
            <label>Grupo</label>
            <input id="lc-grupo" class="ti-input" placeholder="Ex.: Vendas, Inteligência de Mercado…" value="Geral">
          </div>
          <div class="ti-fld" style="justify-content:flex-end">
            <button id="lc-add" class="ti-btn primary"><i data-lucide="plus"></i> Cadastrar em homologação</button>
          </div>
        </div>
        <div class="ti-note info"><i data-lucide="info"></i> A funcionalidade nasce visível só em homologação. Quando estiver validada, clique em <b>Liberar p/ produção</b>. O <b>ID</b> deve ser o mesmo do menu/tela (ex.: o <code>data-nav</code> ou <code>data-go</code>) para o sistema esconder/mostrar automaticamente.</div>
      </div>

      ${tabela}
      `;
    },
    mount(c){
      const add=()=>{
        const label=(c.querySelector("#lc-label").value||"").trim();
        const id=(c.querySelector("#lc-id").value||"").trim().toLowerCase().replace(/\s+/g,"-");
        const grupo=(c.querySelector("#lc-grupo").value||"Geral").trim()||"Geral";
        if(!id){ TI.toast("Informe o ID técnico"); return; }
        if(R().find(id)){ TI.toast("Esse ID já está no controle"); return; }
        R().ensure(id, { label: label||id, grupo });
        TI.toast("Cadastrada em homologação");
        TI.go("lancamentos");
      };
      c.querySelector("#lc-add").addEventListener("click", add);

      c.querySelectorAll("[data-soltar]").forEach(b=>b.addEventListener("click",()=>{
        const id=b.dataset.soltar; const r=R().find(id);
        if(confirm('Liberar "'+((r&&r.label)||id)+'" para PRODUÇÃO?\n\nA partir de agora todos os usuários passam a ver esta funcionalidade.')){
          R().setStage(id,"prod",who()); TI.toast("Liberada para produção 🚀"); TI.go("lancamentos");
        }
      }));
      c.querySelectorAll("[data-recolher]").forEach(b=>b.addEventListener("click",()=>{
        const id=b.dataset.recolher; const r=R().find(id);
        if(confirm('Voltar "'+((r&&r.label)||id)+'" para HOMOLOGAÇÃO?\n\nEla deixa de aparecer em produção e volta a ser só de testes.')){
          R().setStage(id,"homolog",who()); TI.toast("Recolhida para teste"); TI.go("lancamentos");
        }
      }));
      c.querySelectorAll("[data-remover]").forEach(b=>b.addEventListener("click",()=>{
        const id=b.dataset.remover;
        if(confirm("Remover do controle de ambiente?\n\nA funcionalidade deixa de ser gerida aqui (passa a aparecer normalmente).")){
          R().remove(id); TI.toast("Removida do controle"); TI.go("lancamentos");
        }
      }));
    }
  };
})();
