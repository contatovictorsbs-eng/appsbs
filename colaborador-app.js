/* ===========================================================
   SBS Portal do Colaborador — app mobile (todos os funcionários)
   Lê o que o RH publica (coleções rh_*) pela mesma nuvem/store.
   v1: Início, Mural, Agenda, Vagas internas, Aniversariantes, Eu.
   =========================================================== */
const COL = (function(){
  const S = window.SBSStore;
  let me = null, current = "inicio";

  function feedPosts(){ return (S.getCol("feed_posts")||[]).slice().sort((a,b)=>(b.ts||0)-(a.ts||0)); }
  function seedFeed(){
    if((S.getCol("feed_posts")||[]).length) return;
    const now=Date.now(), H=3600000, D=86400000;
    S.setCol("feed_posts",[
      { id:"fp1", autor:"Victor Hugo", email:"victor.hugo@sbsgreen.com.br", texto:"Bem-vindos ao Feed SBS! Compartilhe novidades e conquistas com o time.", foto:"", ts:now-2*H, likes:[], comentarios:[] }
    ]);
  }

  function comunicados(){ return (S.getCol("rh_comunicados")||[]).slice().sort((a,b)=>(a.data<b.data?1:-1)); }
  function eventos(){ return (S.getCol("rh_eventos")||[]).slice().sort((a,b)=>(a.data>b.data?1:-1)); }
  function colaboradores(){ return S.getCol("rh_colaboradores")||[]; }
  function vagas(){ return (S.getCol("rh_vagas")||[]).filter(v=>v.status!=="fechada"); }
  function notifs(){ return (S.getCol("rh_notificacoes")||[]).slice().sort((a,b)=>(b.ts||0)-(a.ts||0)); }
  function unread(){ if(!me) return 0; return notifs().filter(n=>(n.lidos||[]).indexOf(me.email)<0).length; }
  function markAllRead(){ if(!me) return; const arr=(S.getCol("rh_notificacoes")||[]).map(n=>{ if((n.lidos||[]).indexOf(me.email)<0){ return Object.assign({},n,{lidos:(n.lidos||[]).concat([me.email])}); } return n; }); S.setCol("rh_notificacoes",arr); }
  function seedNotifs(){
    if((S.getCol("rh_notificacoes")||[]).length) return;
    const now=Date.now(),H=3600000,D=86400000;
    S.setCol("rh_notificacoes",[
      { id:"rn1", titulo:"Notificação exemplo", texto:"Esta é uma notificação de exemplo enviada pelo RH.", tipo:"rh", icon:"bell", ts:now-3*H, lidos:[] }
    ]);
  }

  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function icons(){ window.lucide && lucide.createIcons(); }
  function dateBR(s){ if(!s) return "—"; const p=String(s).split("-"); return p.length===3?(p[2]+"/"+p[1]+"/"+p[0]):(p.length===2?(p[1]+"/"+p[0]):s); }
  function ini(n){ return (n||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
  function avHtml(nome, email, cls){
    const u = email&&window.SBS_AVATAR&&SBS_AVATAR.url(email);
    if(u) return `<span class="co-av ${cls||''} has-photo" style="background-image:url('${u}')"></span>`;
    return `<span class="co-av ${cls||''}">${ini(nome)}</span>`;
  }
  let toastT;
  function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2200); }

  function meRec(){
    if(!me) return null;
    return colaboradores().find(c=>(c.email||"").toLowerCase()===me.email.toLowerCase()) || null;
  }
  function firstName(){ const r=meRec(); const n=(r&&r.nome)||(me&&me.nome)||"Colaborador"; return n.split(" ")[0]; }
  function anivMes(){
    const mes=new Date().toISOString().slice(5,7);
    return colaboradores().filter(c=>(c.aniversario||"").slice(0,2)===mes && c.status==="ativo")
      .sort((a,b)=>((a.aniversario||"").slice(3)<(b.aniversario||"").slice(3)?-1:1));
  }

  /* ---------------- telas ---------------- */
  const Screens = {};

  Screens.inicio = { title:"", render(){
    const r=meRec();
    const destaque=comunicados().find(c=>c.destaque);
    const aniv=anivMes();
    const prox=eventos().filter(e=>e.status!=="realizado").slice(0,2);
    return `
    <div class="co-hero">
      <div class="co-hero-top"><div class="co-greet">Olá, ${esc(firstName())} 👋</div><div class="co-sub">${r?esc(r.cargo||"")+" · "+esc(r.area||""):"Bem-vindo ao Portal do Colaborador"}</div></div>
    </div>
    ${destaque?`<div class="co-card co-pin" data-go="mural">
      <div class="co-pin-tag"><i data-lucide="pin"></i> ${esc(destaque.categoria||"Comunicado")}</div>
      <div class="co-pin-t">${esc(destaque.titulo)}</div>
      <div class="co-pin-x">${esc((destaque.texto||"").slice(0,120))}${(destaque.texto||"").length>120?"…":""}</div>
    </div>`:""}
    <div class="co-quick">
      <button class="co-q" data-go="feed"><span class="co-q-ic" style="background:#FBE9EE;color:#E1306C"><i data-lucide="newspaper"></i></span>Feed</button>
      <button class="co-q" data-go="mural"><span class="co-q-ic" style="background:#E9F3EF;color:#0B6B61"><i data-lucide="megaphone"></i></span>Mural</button>
      <button class="co-q" data-go="agenda"><span class="co-q-ic" style="background:#E5F0FB;color:#1E73C2"><i data-lucide="calendar-days"></i></span>Agenda</button>
      <button class="co-q" data-go="vagas"><span class="co-q-ic" style="background:#FBF0DF;color:#C0710F"><i data-lucide="briefcase"></i></span>Vagas</button>
    </div>
    ${aniv.length?`<div class="co-sec">Aniversariantes do mês</div>
      <div class="co-aniv-row">${aniv.slice(0,6).map(a=>`<div class="co-aniv"><span class="co-av">${ini(a.nome)}</span><div class="co-aniv-n">${esc(a.nome.split(" ")[0])}</div><div class="co-aniv-d">${esc((a.aniversario||"").slice(3,5))}/${esc((a.aniversario||"").slice(0,2))}</div></div>`).join("")}</div>`:""}
    ${prox.length?`<div class="co-sec">Próximos eventos</div>
      ${prox.map(e=>eventoCard(e)).join("")}`:""}`;
  }, mount(root){ root.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go))); } };

  /* ---- FEED (rede social corporativa) ---- */
  let _foto = "";
  Screens.feed = { title:"Feed SBS", render(){
    const posts=feedPosts();
    const r=meRec();
    return `
    <div class="co-composer">
      <div class="co-comp-top">${avHtml((r&&r.nome)||(me&&me.nome), me&&me.email, "sm")}
        <textarea id="fd-txt" placeholder="Compartilhe algo com o time SBS..."></textarea></div>
      <div class="co-comp-prev" id="fd-prev"></div>
      <div class="co-comp-acts">
        <div class="co-comp-add">
          <label class="co-comp-photo"><i data-lucide="camera"></i> Câmera<input type="file" accept="image/*" capture="environment" id="fd-cam" hidden></label>
          <label class="co-comp-photo"><i data-lucide="image"></i> Galeria<input type="file" accept="image/*" id="fd-file" hidden></label>
        </div>
        <button class="co-btn co-comp-send" id="fd-send"><i data-lucide="send"></i> Publicar</button>
      </div>
    </div>
    <div id="fd-list">${posts.map(postCard).join("")||`<div class="co-empty"><i data-lucide="image"></i><div>Seja o primeiro a publicar!</div></div>`}</div>`;
  }, mount(root){
    _foto="";
    function handleFile(f){
      if(!f) return;
      const rd=new FileReader(); rd.onload=()=>{ const img=new Image(); img.onload=()=>{
        const mx=1200,sc=Math.min(1,mx/Math.max(img.width,img.height));
        const cv=document.createElement("canvas"); cv.width=img.width*sc; cv.height=img.height*sc;
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        _foto=cv.toDataURL("image/jpeg",0.82);
        root.querySelector("#fd-prev").innerHTML=`<div class="co-prevwrap"><img src="${_foto}" alt=""><button type="button" id="fd-rmphoto">×</button></div>`;
        const rm=root.querySelector("#fd-rmphoto"); if(rm) rm.addEventListener("click",()=>{ _foto=""; root.querySelector("#fd-prev").innerHTML=""; });
      }; img.src=rd.result; }; rd.readAsDataURL(f);
    }
    const cam=root.querySelector("#fd-cam"); if(cam) cam.addEventListener("change",e=>handleFile(e.target.files[0]));
    root.querySelector("#fd-file").addEventListener("change",e=>handleFile(e.target.files[0]));
    root.querySelector("#fd-send").addEventListener("click",()=>{
      const txt=(root.querySelector("#fd-txt").value||"").trim();
      if(!txt && !_foto){ toast("Escreva algo ou adicione uma foto"); return; }
      S.add("feed_posts",{ id:"fp"+Date.now(), autor:(meRec()&&meRec().nome)||(me&&me.nome)||"Colaborador", email:me?me.email:"", texto:txt, foto:_foto, ts:Date.now(), likes:[], comentarios:[] });
      _foto=""; toast("Publicado no feed!"); refresh();
    });
    wireFeed(root);
  } };

  function postCard(p){
    const liked = me && (p.likes||[]).indexOf(me.email)>=0;
    const nlikes=(p.likes||[]).length, ncom=(p.comentarios||[]).length;
    const mine = me && p.email===me.email;
    return `<div class="co-card co-post ${p.oficial?'co-post-of':''}" data-post="${p.id}">
      <div class="co-post-h">${avHtml(p.autor, p.email)}
        <div class="co-post-meta"><div class="co-post-n">${esc(p.autor)}${p.oficial?' <span class="co-oficial"><i data-lucide="badge-check"></i> SBS</span>':''}</div><div class="co-post-t">${timeAgo(p.ts)}</div></div>
        ${mine?`<button class="co-post-del" data-del="${p.id}"><i data-lucide="trash-2"></i></button>`:""}</div>
      ${p.texto?`<div class="co-post-x">${esc(p.texto)}</div>`:""}
      ${p.foto?`<div class="co-post-img"><img src="${p.foto}" alt="" loading="lazy"></div>`:""}
      ${nlikes?`<div class="co-post-stats">${nlikes} curtida${nlikes>1?'s':''}${ncom?' · '+ncom+' coment.':''}</div>`:""}
      <div class="co-post-acts">
        <button class="co-pa ${liked?'on':''}" data-like="${p.id}"><i data-lucide="heart"></i> Curtir</button>
        <button class="co-pa" data-cmt="${p.id}"><i data-lucide="message-circle"></i> Comentar</button>
      </div>
      <div class="co-comments ${ncom?'':'hide'}" id="cm-${p.id}">
        ${(p.comentarios||[]).map(c=>`<div class="co-cmt"><span class="co-av xs">${ini(c.autor)}</span><div class="co-cmt-b"><b>${esc(c.autor)}</b> ${esc(c.texto)}</div></div>`).join("")}
      </div>
      <div class="co-cmt-box hide" id="cb-${p.id}">
        <input type="text" placeholder="Escreva um comentário..." data-cmtinput="${p.id}">
        <button data-cmtsend="${p.id}"><i data-lucide="send"></i></button>
      </div>
    </div>`;
  }

  function wireFeed(root){
    root.querySelectorAll("[data-like]").forEach(b=>b.addEventListener("click",()=>{
      const p=(S.getCol("feed_posts")||[]).find(x=>x.id===b.dataset.like); if(!p||!me) return;
      const likes=(p.likes||[]).slice(); const i=likes.indexOf(me.email);
      if(i>=0) likes.splice(i,1); else likes.push(me.email);
      S.update("feed_posts",p.id,{likes:likes}); refresh();
    }));
    root.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{ if(confirm("Apagar esta publicação?")){ S.remove("feed_posts",b.dataset.del); toast("Publicação removida"); refresh(); } }));
    root.querySelectorAll("[data-cmt]").forEach(b=>b.addEventListener("click",()=>{
      const box=root.querySelector("#cb-"+b.dataset.cmt); if(box){ box.classList.toggle("hide"); const inp=box.querySelector("input"); if(inp && !box.classList.contains("hide")) inp.focus(); }
    }));
    root.querySelectorAll("[data-cmtsend]").forEach(b=>b.addEventListener("click",()=>sendComment(b.dataset.cmtsend,root)));
    root.querySelectorAll("[data-cmtinput]").forEach(inp=>inp.addEventListener("keydown",e=>{ if(e.key==="Enter") sendComment(inp.dataset.cmtinput,root); }));
  }
  function sendComment(id,root){
    const inp=root.querySelector('[data-cmtinput="'+id+'"]'); if(!inp) return;
    const txt=(inp.value||"").trim(); if(!txt) return;
    const p=(S.getCol("feed_posts")||[]).find(x=>x.id===id); if(!p) return;
    const coms=(p.comentarios||[]).concat([{ autor:(meRec()&&meRec().nome)||(me&&me.nome)||"Colaborador", texto:txt, ts:Date.now() }]);
    S.update("feed_posts",id,{comentarios:coms}); refresh();
  }
  function timeAgo(ts){ if(!ts) return ""; const s=Math.floor((Date.now()-ts)/1000); if(s<60) return "agora"; const m=Math.floor(s/60); if(m<60) return "há "+m+" min"; const h=Math.floor(m/60); if(h<24) return "há "+h+"h"; const d=Math.floor(h/24); return d===1?"ontem":"há "+d+" dias"; }

  function eventoCard(e){
    const ST={planejado:["Planejado","#69756f","#EEF1F0"],agendado:["Agendado","#1E73C2","#E5F0FB"],realizado:["Realizado","#0B8A5E","#E4F5EC"]};
    const s=ST[e.status]||ST.agendado;
    return `<div class="co-card co-ev">
      <div class="co-ev-date"><b>${dateBR(e.data).slice(0,2)}</b><span>${dateBR(e.data).slice(3,5)}</span></div>
      <div class="co-ev-b"><div class="co-ev-t">${esc(e.titulo)}</div><div class="co-ev-s">${esc(e.tipo||"")} · ${esc(e.local||"")}</div></div>
      <span class="co-badge" style="color:${s[1]};background:${s[2]}">${s[0]}</span>
    </div>`;
  }

  Screens.mural = { title:"Mural", render(){
    const cm=comunicados();
    return cm.length? cm.map(c=>`
      <div class="co-card co-com ${c.destaque?'hot':''}">
        <div class="co-com-top"><span class="co-com-cat">${esc(c.categoria||"")}</span><span class="co-com-date">${dateBR(c.data)}</span></div>
        <div class="co-com-t">${c.destaque?'<i data-lucide="pin" class="co-pinicon"></i> ':''}${esc(c.titulo)}</div>
        <div class="co-com-x">${esc(c.texto||"")}</div>
        <div class="co-com-by">— ${esc(c.autor||"RH")}</div>
      </div>`).join("") : `<div class="co-empty"><i data-lucide="megaphone"></i><div>Nenhum comunicado por enquanto.</div></div>`;
  } };

  Screens.agenda = { title:"Agenda", render(){
    const ev=eventos();
    const fut=ev.filter(e=>e.status!=="realizado"), pas=ev.filter(e=>e.status==="realizado");
    return `${fut.length?`<div class="co-sec">Próximos</div>${fut.map(eventoCard).join("")}`:`<div class="co-empty"><i data-lucide="calendar-days"></i><div>Nenhum evento agendado.</div></div>`}
      ${pas.length?`<div class="co-sec">Realizados</div>${pas.map(eventoCard).join("")}`:""}`;
  } };

  Screens.vagas = { title:"Vagas internas", render(){
    const vg=vagas();
    return `<div class="co-vagas-intro"><i data-lucide="sparkles"></i> Cresça com a gente. Veja as vagas abertas e indique talentos.</div>
      ${vg.length? vg.map(v=>`
      <div class="co-card co-vaga">
        <div class="co-vaga-t">${esc(v.titulo)}</div>
        <div class="co-vaga-m"><span><i data-lucide="building-2"></i> ${esc(v.area||"")}</span><span><i data-lucide="map-pin"></i> ${esc(v.local||"")}</span><span><i data-lucide="briefcase"></i> ${esc(v.tipo||"")}</span></div>
        <div class="co-vaga-d">${esc(v.descricao||"")}</div>
        <button class="co-btn" data-indicar="${esc(v.titulo)}"><i data-lucide="user-plus"></i> Indicar alguém</button>
      </div>`).join("") : `<div class="co-empty"><i data-lucide="briefcase"></i><div>Nenhuma vaga aberta agora.</div></div>`}`;
  }, mount(root){ root.querySelectorAll("[data-indicar]").forEach(b=>b.addEventListener("click",()=>toast("Indicação registrada para: "+b.dataset.indicar))); } };

  Screens.aniversarios = { title:"Aniversariantes", render(){
    const aniv=anivMes();
    const mesNome=new Date().toLocaleDateString("pt-BR",{month:"long"});
    return `<div class="co-sec" style="text-transform:capitalize">${mesNome}</div>
      ${aniv.length? aniv.map(a=>`<div class="co-card co-anivrow"><span class="co-av lg">${ini(a.nome)}</span><div class="co-anivrow-b"><div class="co-anivrow-n">${esc(a.nome)}</div><div class="co-anivrow-s">${esc(a.cargo||"")} · ${esc(a.area||"")}</div></div><div class="co-anivrow-d"><i data-lucide="cake"></i> ${esc((a.aniversario||"").slice(3,5))}/${esc((a.aniversario||"").slice(0,2))}</div></div>`).join("") : `<div class="co-empty"><i data-lucide="cake"></i><div>Nenhum aniversariante este mês.</div></div>`}`;
  } };

  Screens.notificacoes = { title:"Notificações", render(){
    const ns=notifs();
    return ns.length? ns.map(n=>{
      const isU=me&&(n.lidos||[]).indexOf(me.email)<0;
      return `<div class="co-notif ${isU?'unread':''}">
        <span class="co-notif-ic"><i data-lucide="${esc(n.icon||'bell')}"></i></span>
        <div class="co-notif-b"><div class="co-notif-t">${esc(n.titulo)}</div><div class="co-notif-x">${esc(n.texto||"")}</div><div class="co-notif-d">${timeAgo(n.ts)} · RH</div></div>
      </div>`;
    }).join("") : `<div class="co-empty"><i data-lucide="bell-off"></i><div>Nenhuma notificação por enquanto.</div></div>`;
  }, mount(){ markAllRead(); paintBell(); } };

  Screens.parami = { title:"Para mim", render(){
    const mine=(S.getCol("rh_envios")||[]).filter(e=>me&&(e.email||"").toLowerCase()===me.email.toLowerCase()).sort((a,b)=>(b.ts||0)-(a.ts||0));
    const TIP={teste:["Teste","brain"],documento:["Documento","file-text"],epi:["Termo EPI","hard-hat"]};
    if(!mine.length) return `<div class="co-empty"><i data-lucide="inbox"></i><div>Nada do RH por enquanto.</div></div>`;
    return mine.map(e=>{
      const t=TIP[e.tipo]||TIP.documento; const done=e.status==="respondido"||e.status==="assinado";
      return `<div class="co-card co-env" data-env="${e.id}">
        <div class="co-env-h"><span class="co-env-ic"><i data-lucide="${t[1]}"></i></span><div><div class="co-env-t">${esc(e.titulo)}</div><div class="co-env-s">${t[0]} · do RH</div></div>${done?'<span class="co-env-ok"><i data-lucide="check-circle-2"></i></span>':'<span class="co-env-new">novo</span>'}</div>
        ${e.mensagem?`<div class="co-env-m">${esc(e.mensagem)}</div>`:""}
        ${done?`<div class="co-env-done">${e.tipo==="epi"?"Assinado":"Respondido"} ✓</div>`:`<button class="co-btn" data-resp="${e.id}"><i data-lucide="pen-line"></i> ${e.tipo==="epi"?"Assinar aceite":e.tipo==="teste"?"Responder":"Confirmar leitura"}</button>`}
      </div>`;
    }).join("");
  }, mount(root){
    root.querySelectorAll("[data-resp]").forEach(b=>b.addEventListener("click",()=>respond(b.dataset.resp)));
  } };
  function respond(id){
    const e=(S.getCol("rh_envios")||[]).find(x=>x.id===id); if(!e) return;
    if(e.tipo==="epi"){
      if(!confirm("Declaro ter recebido e estar ciente do uso obrigatório dos EPIs descritos. Confirmar assinatura de aceite?")) return;
      S.update("rh_envios",id,{status:"assinado",assinatura:{nome:(meRec()&&meRec().nome)||(me&&me.nome),quando:new Date().toLocaleString("pt-BR")}});
      toast("Aceite assinado!");
    } else if(e.tipo==="teste"){
      // DISC simplificado: 4 perguntas rápidas
      const d={D:0,I:0,S:0,C:0}; const Q=[["Sou direto e foco em resultado","D"],["Sou comunicativo e animado","I"],["Sou paciente e bom ouvinte","S"],["Sou analítico e detalhista","C"]];
      let ok=true;
      Q.forEach(q=>{ const v=prompt(q[0]+"\n\nDê uma nota de 0 a 100:","50"); if(v===null){ok=false;return;} d[q[1]]=Math.max(0,Math.min(100,parseInt(v)||0)); });
      if(!ok) return;
      S.update("rh_envios",id,{status:"respondido",disc:d});
      toast("Teste enviado ao RH!");
    } else {
      const r=prompt("Confirmar leitura. Comentário (opcional):","Li e estou ciente.");
      if(r===null) return;
      S.update("rh_envios",id,{status:"respondido",respostaTexto:r});
      toast("Confirmado!");
    }
    refresh();
  }

  Screens.eu = { title:"Meus dados", render(){
    const r=meRec();
    const instBtn=`<button class="co-btn ghost" id="co-install" style="margin-top:10px"><i data-lucide="download"></i> Baixar o app SBS Colaborador</button>`;
    if(!r) return `<div class="co-empty" style="padding-bottom:24px"><i data-lucide="user"></i><div>Seu cadastro ainda não foi vinculado.<br>Fale com o RH para atualizar seus dados.</div></div>${instBtn}<button class="co-btn ghost" id="co-logout"><i data-lucide="log-out"></i> Sair</button>`;
    const kv=(k,v)=>v?`<div class="co-kv"><div class="co-k">${k}</div><div class="co-v">${v}</div></div>`:"";
    return `<div class="co-profile">
      <span class="co-av xl" id="co-myav">${ini(r.nome)}</span>
      <div class="co-profile-n">${esc(r.nome)}</div>
      <div class="co-profile-c">${esc(r.cargo||"")}</div>
    </div>
    <div class="co-card">
      ${kv("Área",esc(r.area))}
      ${kv("Local",esc(r.local))}
      ${kv("Admissão",dateBR(r.admissao))}
      ${kv("Aniversário",(r.aniversario||"").slice(3,5)+"/"+(r.aniversario||"").slice(0,2))}
      ${kv("E-mail",esc(r.email))}
    </div>
    ${instBtn}
    <button class="co-btn ghost" id="co-logout"><i data-lucide="log-out"></i> Sair</button>`;
  }, mount(root){ const b=root.querySelector("#co-logout"); if(b) b.addEventListener("click",logout);
    const inst=root.querySelector("#co-install"); if(inst) inst.addEventListener("click",function(){ window.SBS_INSTALL && window.SBS_INSTALL.prompt(); });
    const av=root.querySelector("#co-myav"); if(av&&window.SBS_AVATAR&&me) SBS_AVATAR.bind(av, me.email, {editable:true}); } };

  /* ---------------- navegação ---------------- */
  const NAV=[["inicio","Início","home"],["feed","Feed","newspaper"],["parami","Para mim","inbox"],["mural","Mural","megaphone"],["agenda","Agenda","calendar-days"],["vagas","Vagas","briefcase"],["eu","Eu","user"]];
  function go(id){
    if(!Screens[id]) id="inicio";
    current=id;
    const sc=Screens[id];
    document.getElementById("appbar-title").textContent=sc.title||"SBS";
    document.getElementById("appbar").style.display="flex";
    const c=document.getElementById("screen");
    c.innerHTML=sc.render(); c.scrollTop=0; icons(); sc.mount&&sc.mount(c);
    document.querySelectorAll(".co-tab").forEach(t=>t.classList.toggle("on",t.dataset.tab===id));
    paintBell();
  }
  function paintBell(){ const b=document.getElementById("co-bell-n"); if(!b) return; const u=unread(); b.textContent=u; b.classList.toggle("show",u>0); }
  function refresh(){ go(current); }

  /* ---------------- login ---------------- */
  function showLogin(){ document.getElementById("login").classList.remove("hidden"); document.getElementById("app").classList.add("hidden"); }
  function startSession(email){
    const org=window.SBS_ORG&&window.SBS_ORG.get(email);
    const r=colaboradores().find(c=>(c.email||"").toLowerCase()===email.toLowerCase());
    const nome=(r&&r.nome)||(org&&org.nome)||email.split("@")[0].split(/[._]/).map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" ");
    me={email,nome};
    seedFeed();
    seedNotifs();
    document.getElementById("login").classList.add("hidden"); document.getElementById("app").classList.remove("hidden");
    go("inicio"); try{ localStorage.setItem("sbs_col_user",email); }catch(e){}
  }
  function logout(){ try{ localStorage.removeItem("sbs_col_user"); }catch(e){} me=null; const p=document.getElementById("lg-pass"); if(p)p.value=""; showLogin(); }
  function initLogin(){
    const form=document.getElementById("login-form"), err=document.getElementById("lg-err");
    form.addEventListener("submit",e=>{
      e.preventDefault();
      let email=(document.getElementById("lg-email").value||"").trim().toLowerCase();
      const pass=document.getElementById("lg-pass").value||"";
      if(!email){ err.textContent="Informe seu usuário."; err.classList.add("show"); return; }
      if(window.SBS_ORG){ const rr=window.SBS_ORG.resolveLogin(email); if(rr.ok) email=rr.email; else if(rr.ambiguous){ err.textContent="Há mais de um \""+email+"\". Use nome.sobrenome."; err.classList.add("show"); return; } else if(!email.includes("@")) email=email.replace(/\s+/g,".")+"@sbsgreen.com.br"; }
      else if(!email.includes("@")) email=email.replace(/\s+/g,".")+"@sbsgreen.com.br";
      var _a=window.SBS_AUTH?SBS_AUTH.check(email,pass):{ok:!window.SBS_PASSWORD||pass===window.SBS_PASSWORD}; if(!_a.ok){ err.textContent="Senha incorreta."; err.classList.add("show"); return; } if(_a.mustChange&&_a.isDefault&&window.SBS_AUTH) setTimeout(function(){SBS_AUTH.promptChange((email||"").toLowerCase());},700);
      err.classList.remove("show");
      startSession(email);
    });
  }

  return { go, refresh, initLogin, showLogin, startSession, logout, icons,
    get me(){ return me; }, get current(){ return current; } };
})();
window.COL = COL;
