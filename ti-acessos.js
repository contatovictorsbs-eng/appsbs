/* ===========================================================
   SBS Painel T.I. — Acessos & Senhas
   Gerencia senha individual dos usuários (reset p/ padrão).
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  const S=TI.S, esc=TI.esc;

  function people(){
    var org = (window.SBS_ORG && SBS_ORG.PEOPLE) || [];
    var col = (S.getCol("rh_colaboradores")||[]).filter(c=>c.email);
    var map={};
    org.forEach(p=>{ map[(p.email||"").toLowerCase()]={ email:p.email, nome:p.nome, papel:p.papel }; });
    col.forEach(c=>{ var e=(c.email||"").toLowerCase(); if(!map[e]) map[e]={ email:c.email, nome:c.nome, papel:(c.area||"colaborador") }; });
    return Object.values(map).sort((a,b)=>(a.nome>b.nome?1:-1));
  }
  function hasCustom(email){ return window.SBS_AUTH ? SBS_AUTH.hasCustom(email) : false; }

  TI.Modules.acessos = {
    label:"Acessos & Senhas",
    render(){
      var ppl=people();
      var custom=ppl.filter(p=>hasCustom(p.email)).length;
      var q=(TI.Modules.acessos._q||"").toLowerCase();
      var list=q?ppl.filter(p=>(p.nome||"").toLowerCase().includes(q)||(p.email||"").toLowerCase().includes(q)):ppl;
      return `
      <div class="ti-kpis">
        <div class="ti-kpi ok"><span class="ti-kpi-ic"><i data-lucide="shield-check"></i></span><div class="ti-kpi-v">${custom}</div><div class="ti-kpi-l">Com senha própria</div></div>
        <div class="ti-kpi ${ppl.length-custom?'warn':''}"><span class="ti-kpi-ic"><i data-lucide="key"></i></span><div class="ti-kpi-v">${ppl.length-custom}</div><div class="ti-kpi-l">Usando senha padrão</div></div>
        <div class="ti-kpi info"><span class="ti-kpi-ic"><i data-lucide="users"></i></span><div class="ti-kpi-v">${ppl.length}</div><div class="ti-kpi-l">Usuários</div></div>
      </div>
      <div class="ti-toolbar"><input id="ac-q" class="ti-search" placeholder="Buscar usuário..." value="${esc(TI.Modules.acessos._q||"")}"></div>
      <div class="ti-panel"><div class="ti-panel-h"><i data-lucide="lock"></i> Usuários e status de senha</div>
        ${list.map(p=>`<div class="ti-int">
          <span class="ti-hdot ${hasCustom(p.email)?'ok':'warn'}"></span>
          <div class="ti-int-b"><div class="ti-int-t">${esc(p.nome)} <span style="font-weight:500;color:var(--muted,#8a978f)">· ${esc(p.papel||"")}</span></div><div class="ti-int-d">${esc(p.email)} — ${hasCustom(p.email)?'senha pessoal definida':'usando senha padrão (troca no 1º acesso)'}</div></div>
          ${hasCustom(p.email)?`<button class="ti-btn" data-reset="${esc(p.email)}"><i data-lucide="rotate-ccw"></i> Resetar</button>`:''}
        </div>`).join("")}
      </div>
      <div class="ti-note info" style="margin-top:14px"><i data-lucide="info"></i> Cada usuário define a própria senha no 1º acesso (a partir da senha padrão). Resetar volta o usuário para a senha padrão, exigindo nova troca. As senhas ficam protegidas na nuvem (hash).</div>`;
    },
    mount(c){
      var qi=c.querySelector("#ac-q");
      if(qi) qi.addEventListener("input",function(){ TI.Modules.acessos._q=qi.value; var p=qi.selectionStart; TI.go("acessos"); var n=document.querySelector("#ac-q"); if(n){ n.focus(); try{n.setSelectionRange(p,p);}catch(e){} } });
      c.querySelectorAll("[data-reset]").forEach(b=>b.addEventListener("click",function(){
        if(confirm("Resetar a senha de "+b.dataset.reset+" para a padrão?")){ window.SBS_AUTH&&SBS_AUTH.reset(b.dataset.reset); TI.toast("Senha resetada"); TI.go("acessos"); }
      }));
    }
  };
})();
