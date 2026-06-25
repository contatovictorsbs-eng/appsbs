/* ===========================================================
   SBS — Perdas de Pedidos (app)
   Registrar pedido perdido: motivo, valor, concorrente + análise SWOT.
   Painel agrega indicadores. Coleção: "perdas".
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;
const fmtK = n => { n=Number(n)||0; return n>=1e6?("R$ "+(n/1e6).toFixed(1)+" mi"):n>=1e3?("R$ "+(n/1e3).toFixed(0)+" mil"):("R$ "+n); };

const MOTIVOS = ["Preço","Prazo de pagamento","Prazo de entrega","Disponibilidade de produto","Relacionamento concorrente","Assistência técnica","Crédito não aprovado","Logística / frete","Outro"];

S.perdas = {
  title: "Perdas de Pedidos",
  render(){
    const u = D.user;
    let all = window.SBSStore ? window.SBSStore.getCol("perdas") : [];
    // escopo
    if(window.SBS_ORG && u.email){
      if(u.papel==="supervisor") all = all.filter(p=>(p.email||"").toLowerCase()===u.email.toLowerCase());
      else if(u.papel==="regional"){ const esc=window.SBS_ORG.escopo(u.email).map(e=>e.toLowerCase()); all=all.filter(p=>esc.includes((p.email||"").toLowerCase())); }
    }
    const total = all.reduce((s,p)=>s+(+p.valor||0),0);
    const porMotivo={}; all.forEach(p=>porMotivo[p.motivo]=(porMotivo[p.motivo]||0)+1);
    const topMotivo = Object.entries(porMotivo).sort((a,b)=>b[1]-a[1])[0];
    return `
    <div class="hero" style="background:linear-gradient(150deg,oklch(0.5 0.16 25),oklch(0.62 0.17 35))">
      <div class="uname" style="font-size:18px">Perdas de Pedidos</div>
      <div class="urole" style="opacity:.92">Entenda por que perdemos e tome ação</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${all.length}</div><div class="hs-l">pedidos perdidos</div></div>
        <div class="hero-stat"><div class="hs-v">${fmtK(total)}</div><div class="hs-l">valor perdido</div></div>
        <div class="hero-stat"><div class="hs-v" style="font-size:13px">${topMotivo?topMotivo[0]:"—"}</div><div class="hs-l">motivo nº1</div></div>
      </div>
    </div>
    <button class="btn" id="pd-new" style="margin-top:14px"><i data-lucide="plus"></i> Registrar perda</button>
    <form id="pd-form" class="card" style="margin-top:14px;display:none">
      <div style="font-weight:800;font-size:14.5px;margin-bottom:12px">Registrar pedido perdido</div>
      <div class="field"><label>Cliente</label><input id="pd-cli" placeholder="Nome do cliente"></div>
      <div class="field-2">
        <div class="field"><label>Valor estimado (R$)</label><input id="pd-val" inputmode="numeric" placeholder="Ex.: 80000"></div>
        <div class="field"><label>Concorrente</label><input id="pd-conc" placeholder="Ex.: BS, outro"></div>
      </div>
      <div class="field"><label>Motivo da perda</label><select id="pd-mot">${MOTIVOS.map(m=>`<option>${m}</option>`).join("")}</select></div>
      <div class="field"><label>O que aconteceu</label><textarea id="pd-desc" placeholder="Descreva o contexto da perda..."></textarea></div>
      <div class="swot">
        <div class="swot-c s-f"><label>Forças (nossas)</label><textarea id="pd-f" placeholder="O que jogou a favor"></textarea></div>
        <div class="swot-c s-o"><label>Fraquezas</label><textarea id="pd-o" placeholder="Onde perdemos"></textarea></div>
        <div class="swot-c s-op"><label>Oportunidades</label><textarea id="pd-op" placeholder="Como reverter"></textarea></div>
        <div class="swot-c s-t"><label>Ameaças</label><textarea id="pd-t" placeholder="Riscos / concorrência"></textarea></div>
      </div>
      <button class="btn" type="submit" style="margin-top:12px"><i data-lucide="check"></i> Registrar perda</button>
    </form>

    <div class="section-title">Perdas registradas</div>
    ${all.length? all.slice().reverse().map(p=>`
      <div class="card" style="margin-bottom:10px">
        <div class="row-between"><div style="font-weight:800;font-size:14.5px">${p.cliente||"Cliente"}</div><span class="badge b-danger">${fmtK(p.valor||0)}</span></div>
        <div class="pl-meta" style="margin-top:7px"><span><i data-lucide="tag"></i>${p.motivo}</span>${p.concorrente?`<span><i data-lucide="swords"></i>${p.concorrente}</span>`:""}<span><i data-lucide="user-round"></i>${p.vendedor||""}</span></div>
        ${p.desc?`<div class="a-x" style="margin-top:8px">${p.desc}</div>`:""}
      </div>`).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma perda registrada.</div>`}`;
  },
  mount(root){
    const u=D.user;
    const form=root.querySelector("#pd-form");
    root.querySelector("#pd-new").addEventListener("click",()=>{ form.style.display=form.style.display==="none"?"block":"none"; });
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const g=id=>{ const el=root.querySelector(id); return el?el.value.trim():""; };
      if(window.SBSStore){ window.SBSStore.add("perdas",{
        cliente:g("#pd-cli"), valor:parseInt((g("#pd-val")||"0").replace(/\D/g,""),10)||0,
        concorrente:g("#pd-conc"), motivo:g("#pd-mot"), desc:g("#pd-desc"),
        swot:{ f:g("#pd-f"), o:g("#pd-o"), op:g("#pd-op"), t:g("#pd-t") },
        vendedor:u.name||"", email:u.email||"", papel:u.papel||"", data:window.SBSStore.today() }); }
      window.SBS.toast("Perda registrada");
      form.reset(); form.style.display="none";
      window.SBS.go("perdas");
    });
  }
};

})();
