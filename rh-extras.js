/* ===========================================================
   SBS Painel de RH — extensões
   Canais & LinkedIn (recebimento de currículos) · DISC ·
   Publicar no Feed do app do colaborador.
   =========================================================== */
(function(){
  if(typeof RH==="undefined"||!RH.Modules) return;
  const M=RH.Modules, S=RH.S, esc=RH.esc, dateBR=RH.dateBR;
  function who(){ return (RH.session&&RH.session.nome)||"RH"; }

  /* =================== CANAIS & LINKEDIN =================== */
  function canais(){ return S.getCol("rh_canais")||[]; }
  function seedCanais(){
    if(canais().length) return;
    S.setCol("rh_canais",[
      { id:"ln1", tipo:"linkedin", nome:"SBS Green Seeds (oficial)", conta:"company/sbs-green-seeds", status:"conectado", recebidos:34 },
      { id:"ln2", tipo:"linkedin", nome:"RH SBS — Vagas", conta:"in/rh-sbs-recrutamento", status:"conectado", recebidos:12 },
      { id:"ln3", tipo:"email", nome:"Currículos (e-mail)", conta:"vagas@sbsgreen.com.br", status:"conectado", recebidos:21 }
    ]);
  }
  M.canais = {
    label:"Canais & LinkedIn",
    render(){
      seedCanais();
      const cs=canais();
      const ln=cs.filter(c=>c.tipo==="linkedin");
      const tot=cs.reduce((s,c)=>s+(+c.recebidos||0),0);
      return `
      <div class="mc-kpis">
        ${kpi("linkedin", ln.length, "Contas LinkedIn conectadas", "ok")}
        ${kpi("inbox", tot, "Currículos recebidos", "")}
        ${kpi("plug", cs.filter(c=>c.status==="conectado").length, "Canais ativos", "")}
      </div>
      <div class="mc-toolbar"><div class="mc-sub">Conecte vários perfis/páginas do LinkedIn e outros canais para receber currículos</div>
        <button class="mc-btn primary" id="cn-new"><i data-lucide="plus"></i> Conectar canal</button></div>
      <div class="mc-card"><div class="mc-table">
        <div class="rh-cnrow head"><span>Canal</span><span>Conta</span><span class="r">Recebidos</span><span>Status</span><span></span></div>
        ${cs.map(c=>`<div class="rh-cnrow" data-cn="${c.id}">
          <span class="mc-tch"><i data-lucide="${c.tipo==='linkedin'?'share-2':(c.tipo==='email'?'mail':'globe')}" class="mc-ic"></i> ${esc(c.nome)}</span>
          <span class="rh-dim">${esc(c.conta||"")}</span>
          <span class="r strong">${c.recebidos||0}</span>
          <span><span class="mc-badge" style="color:${c.status==='conectado'?'#0B8A5E':'#C0710F'};background:${c.status==='conectado'?'#E4F5EC':'#FBEFE0'}">${c.status==='conectado'?'Conectado':'Pendente'}</span></span>
          <span class="r"><button class="mc-link danger" data-del-cn="${c.id}">Remover</button></span>
        </div>`).join("")}
      </div></div>
      <div class="mc-note"><i data-lucide="info"></i> Demonstração do cadastro de canais. A captura automática de currículos do LinkedIn exige a conta LinkedIn Recruiter / API de parceria — aqui você registra as contas e acompanha o volume; os candidatos recebidos entram em <b>Candidatos</b> com a origem do canal.</div>`;
    },
    mount(c){
      c.querySelector("#cn-new").addEventListener("click",()=>formCanal());
      c.querySelectorAll("[data-del-cn]").forEach(b=>b.addEventListener("click",e=>{ e.stopPropagation(); if(confirm("Remover este canal?")){ S.remove("rh_canais",b.dataset.delCn); RH.toast("Canal removido"); RH.refresh(); } }));
      c.querySelectorAll("[data-cn]").forEach(r=>r.addEventListener("click",()=>formCanal(canais().find(x=>x.id===r.dataset.cn))));
    }
  };
  function kpi(ic,v,l,tone){ return `<div class="mc-kpi ${tone||''}"><span class="mc-kpi-ic"><i data-lucide="${ic}"></i></span><div><div class="mc-kpi-v">${v}</div><div class="mc-kpi-l">${l}</div></div></div>`; }
  function formCanal(ed){
    ed=ed||{};
    const topt=[["linkedin","LinkedIn"],["email","E-mail"],["site","Site/Outro"]].map(k=>`<option value="${k[0]}" ${ed.tipo===k[0]?"selected":""}>${k[1]}</option>`).join("");
    RH.modal(ed.id?"Editar canal":"Conectar canal de recrutamento",`
      <div class="fld"><label>Tipo</label><select id="kn-tipo">${topt}</select></div>
      <div class="fld"><label>Nome do canal</label><input id="kn-nome" value="${esc(ed.nome||'')}" placeholder="Ex.: LinkedIn — Página SBS"></div>
      <div class="fld"><label>Conta / URL / e-mail</label><input id="kn-conta" value="${esc(ed.conta||'')}" placeholder="company/sbs-green-seeds ou vagas@..."></div>
      <div class="fld"><label>Currículos recebidos</label><input id="kn-rec" type="number" value="${ed.recebidos||0}"></div>
      ${ed.id?'':'<div class="mc-note" style="margin:0"><i data-lucide="linkedin"></i> Para LinkedIn, autorize a página/conta no LinkedIn Recruiter. Você pode conectar quantas contas precisar.</div>'}`,
      `<button class="mc-btn ghost" id="kn-cancel">Cancelar</button><button class="mc-btn primary" id="kn-save"><i data-lucide="${ed.id?'save':'link'}"></i> ${ed.id?'Salvar':'Conectar'}</button>`);
    document.getElementById("kn-cancel").addEventListener("click",RH.closeModal);
    document.getElementById("kn-save").addEventListener("click",()=>{
      const v=id=>{ const e=document.getElementById(id); return e?e.value.trim():""; };
      const nome=v("kn-nome"); if(!nome){ RH.toast("Informe o nome"); return; }
      const data={ tipo:v("kn-tipo"), nome, conta:v("kn-conta"), recebidos:+v("kn-rec")||0, status:"conectado" };
      if(ed.id) S.update("rh_canais",ed.id,data); else S.add("rh_canais",Object.assign({id:"cn"+Date.now()},data));
      RH.toast(ed.id?"Canal salvo":"Canal conectado"); RH.closeModal(); RH.refresh();
    });
  }

  /* =================== DISC (avaliação comportamental) =================== */
  const DISC = {
    D:{ nome:"Dominância", cor:"#C0392B", desc:"Direto, focado em resultado, decisivo." },
    I:{ nome:"Influência", cor:"#E5A019", desc:"Comunicativo, entusiasmado, sociável." },
    S:{ nome:"Estabilidade", cor:"#0B8A5E", desc:"Paciente, leal, bom ouvinte." },
    C:{ nome:"Conformidade", cor:"#2A4A7F", desc:"Analítico, preciso, cauteloso." }
  };
  RH._DISC = DISC;
  RH.discPerfil = function(d){
    if(!d) return null;
    const ks=["D","I","S","C"].sort((a,b)=>(d[b]||0)-(d[a]||0));
    return { dom:ks[0], sec:ks[1], label:DISC[ks[0]].nome+(d[ks[1]]>=Math.max(d[ks[0]]-15,0)?" / "+DISC[ks[1]].nome:"") };
  };
  RH.discBadge = function(d){
    if(!d || !(d.D||d.I||d.S||d.C)) return "";
    const p=RH.discPerfil(d);
    return `<span class="rh-disc-badge" style="background:${DISC[p.dom].cor}">${p.dom}</span>`;
  };
  RH.discBars = function(d){
    d=d||{};
    return `<div class="rh-disc">${["D","I","S","C"].map(k=>`
      <div class="rh-disc-row"><span class="rh-disc-k" style="color:${DISC[k].cor}">${k}</span>
        <div class="rh-disc-bar"><span style="width:${Math.max(2,+d[k]||0)}%;background:${DISC[k].cor}"></span></div>
        <span class="rh-disc-v">${+d[k]||0}</span></div>`).join("")}</div>`;
  };
  RH.openDisc = function(candId, onSave){
    const c=(S.getCol("rh_candidatos")||[]).find(x=>x.id===candId); if(!c) return;
    const d=c.disc||{D:0,I:0,S:0,C:0};
    RH.modal("Avaliação DISC · "+esc(c.nome),`
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">Informe a pontuação (0–100) de cada fator. O perfil dominante é calculado automaticamente.</p>
      ${["D","I","S","C"].map(k=>`
        <div class="fld"><label style="color:${DISC[k].cor}">${k} · ${DISC[k].nome} <span style="font-weight:500;color:var(--muted)">— ${DISC[k].desc}</span></label>
        <input id="ds-${k}" type="range" min="0" max="100" value="${d[k]||0}" oninput="this.nextElementSibling.textContent=this.value">
        <span class="rh-disc-out">${d[k]||0}</span></div>`).join("")}`,
      `<button class="mc-btn ghost" id="ds-cancel">Cancelar</button><button class="mc-btn primary" id="ds-save"><i data-lucide="save"></i> Salvar DISC</button>`);
    document.getElementById("ds-cancel").addEventListener("click",RH.closeModal);
    document.getElementById("ds-save").addEventListener("click",()=>{
      const nd={ D:+document.getElementById("ds-D").value, I:+document.getElementById("ds-I").value, S:+document.getElementById("ds-S").value, C:+document.getElementById("ds-C").value };
      S.update("rh_candidatos",candId,{disc:nd});
      RH.toast("DISC salvo"); RH.closeModal(); onSave&&onSave();
    });
  };

  /* =================== PUBLICAR NO FEED DO APP =================== */
  RH.openFeedPost = function(){
    RH.modal("Publicar no Feed do app",`
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">A publicação aparece no <b>Feed</b> do Portal do Colaborador para todos os funcionários, com selo oficial SBS.</p>
      <div class="fld"><label>Mensagem</label><textarea id="fp-txt" placeholder="Ex.: Parabéns ao time pela meta batida! 🎉"></textarea></div>
      <div class="fld"><label>Foto (opcional)</label><input type="file" accept="image/*" id="fp-file"></div>
      <div class="mc-prev" id="fp-prev"></div>`,
      `<button class="mc-btn ghost" id="fp-cancel">Cancelar</button><button class="mc-btn primary" id="fp-pub"><i data-lucide="send"></i> Publicar no Feed</button>`);
    let foto="";
    document.getElementById("fp-file").addEventListener("change",e=>{
      const f=e.target.files[0]; if(!f) return;
      const r=new FileReader(); r.onload=()=>{ const img=new Image(); img.onload=()=>{
        const mx=1200,sc=Math.min(1,mx/Math.max(img.width,img.height));
        const cv=document.createElement("canvas"); cv.width=img.width*sc; cv.height=img.height*sc;
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        foto=cv.toDataURL("image/jpeg",0.82);
        document.getElementById("fp-prev").innerHTML=`<img src="${foto}" style="max-width:100%;border-radius:10px;max-height:200px">`;
      }; img.src=r.result; }; r.readAsDataURL(f);
    });
    document.getElementById("fp-cancel").addEventListener("click",RH.closeModal);
    document.getElementById("fp-pub").addEventListener("click",()=>{
      const txt=(document.getElementById("fp-txt").value||"").trim();
      if(!txt && !foto){ RH.toast("Escreva algo ou adicione uma foto"); return; }
      S.add("feed_posts",{ id:"fp"+Date.now(), autor:"RH · "+who(), email:(RH.session&&RH.session.email)||"rh@sbsgreen.com.br", texto:txt, foto:foto, ts:Date.now(), likes:[], comentarios:[], oficial:true });
      RH.toast("Publicado no Feed do app!"); RH.closeModal();
    });
  };
  /* =================== ENVIAR NOTIFICAÇÃO AO APP =================== */
  RH.openNotif = function(){
    const ICONS=[["bell","Geral"],["heart-pulse","Benefício"],["party-popper","Evento"],["megaphone","Aviso"],["graduation-cap","Treinamento"],["calendar-clock","Lembrete"]];
    RH.modal("Enviar notificação ao app",`
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">Chega como <b>notificação no sino</b> do Portal do Colaborador para todos os funcionários.</p>
      <div class="fld"><label>Título</label><input id="nt-tit" placeholder="Ex.: Reunião geral amanhã"></div>
      <div class="fld"><label>Mensagem</label><textarea id="nt-txt" placeholder="Detalhe a notificação..."></textarea></div>
      <div class="fld"><label>Ícone</label><select id="nt-icon">${ICONS.map(i=>`<option value="${i[0]}">${i[1]}</option>`).join("")}</select></div>`,
      `<button class="mc-btn ghost" id="nt-cancel">Cancelar</button><button class="mc-btn primary" id="nt-send"><i data-lucide="send"></i> Enviar notificação</button>`);
    document.getElementById("nt-cancel").addEventListener("click",RH.closeModal);
    document.getElementById("nt-send").addEventListener("click",()=>{
      const tit=(document.getElementById("nt-tit").value||"").trim();
      if(!tit){ RH.toast("Informe o título"); return; }
      S.add("rh_notificacoes",{ id:"rn"+Date.now(), titulo:tit, texto:(document.getElementById("nt-txt").value||"").trim(), icon:document.getElementById("nt-icon").value, tipo:"rh", ts:Date.now(), lidos:[], de:who() });
      RH.toast("Notificação enviada ao app!"); RH.closeModal();
    });
  };
})();
