/* ===========================================================
   SBS — Central de Ajuda (documentação viva)
   -----------------------------------------------------------
   Renderizador único usado pelas 3 plataformas (app do vendedor,
   painel gerencial e painel de T.I.). O conteúdo vem dos arquivos
   docs-data-*.js (window.SBS_DOCS.plataformas[...]).

   "Documentação viva": a lista e o status de cada funcionalidade
   são cruzados com o registro de features (window.SBS_FEATURES) —
   então quando uma feature é ligada/desligada ou adicionada, a
   estrutura da doc reflete sozinha. O texto de cada item é mantido
   nos docs-data-*.js.

   Cada funcionalidade pode ter um vídeo: { url, roteiro }.
   • url    → embed (YouTube/Vimeo/HeyGen/Synthesia/D-ID) aparece no card
   • roteiro→ texto pronto para gerar o vídeo em ferramenta de avatar
   =========================================================== */
(function(){
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  /* injeta o CSS uma única vez (funciona em qualquer um dos apps) */
  function ensureCss(){
    if(document.getElementById("sbs-docs-css")) return;
    const css = `
    .helpc{ max-width:880px; margin:0 auto; }
    .helpc-head{ margin-bottom:16px; }
    .helpc-title{ font-size:19px; font-weight:800; color:var(--ink,#16201a); }
    .helpc-sub{ font-size:13px; color:var(--muted,#6b7a74); margin-top:3px; line-height:1.45; }
    .helpc-roles{ display:flex; flex-wrap:wrap; gap:6px; margin-top:11px; }
    .helpc-role{ font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; background:var(--green-50,#e9f6f1); color:var(--brand,#0B6B61); }
    .helpc-search{ display:flex; align-items:center; gap:9px; border:1.5px solid var(--line,#dce3e0); border-radius:12px; padding:11px 13px; margin:14px 0 18px; background:var(--card,#fff); }
    .helpc-search input{ border:0; outline:0; flex:1; font-family:inherit; font-size:14px; background:transparent; color:var(--ink,#16201a); }
    .helpc-search i{ width:17px; height:17px; color:var(--muted,#8b968f); }
    .helpc-group{ margin-bottom:20px; }
    .helpc-group-h{ font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--brand,#0B6B61); margin:0 2px 9px; }
    .helpc-item{ border:1px solid var(--line,#e6ebe9); border-radius:14px; background:var(--card,#fff); margin-bottom:10px; overflow:hidden; }
    .helpc-bar{ display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; }
    .helpc-ic{ width:38px; height:38px; border-radius:10px; background:var(--green-50,#e9f6f1); color:var(--brand,#0B6B61); display:grid; place-items:center; flex:0 0 auto; }
    .helpc-ic i{ width:18px; height:18px; }
    .helpc-bar-main{ flex:1; min-width:0; }
    .helpc-bar-t{ font-size:14.5px; font-weight:700; color:var(--ink,#16201a); }
    .helpc-bar-s{ font-size:12px; color:var(--muted,#6b7a74); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .helpc-chev{ width:18px; height:18px; color:var(--muted,#9aa6a1); transition:transform .18s; flex:0 0 auto; }
    .helpc-item.open .helpc-chev{ transform:rotate(180deg); }
    .helpc-off{ font-size:10px; font-weight:800; padding:3px 8px; border-radius:20px; background:#fde8e6; color:#b3261e; flex:0 0 auto; }
    .helpc-body{ display:none; padding:0 16px 16px; border-top:1px solid var(--line,#eef1f0); }
    .helpc-item.open .helpc-body{ display:block; }
    .helpc-sec{ margin-top:14px; }
    .helpc-sec-h{ font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; color:var(--muted,#8b968f); margin-bottom:6px; }
    .helpc-p{ font-size:13.5px; color:var(--ink,#2a352f); line-height:1.55; }
    .helpc-steps{ margin:0; padding-left:20px; }
    .helpc-steps li{ font-size:13.5px; color:var(--ink,#2a352f); line-height:1.5; margin:5px 0; }
    .helpc-tags{ display:flex; flex-wrap:wrap; gap:6px; }
    .helpc-tag{ font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:20px; background:#eef2f0; color:#46554d; }
    .helpc-video{ margin-top:14px; }
    .helpc-embed{ position:relative; width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; background:#0d1714; }
    .helpc-embed iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
    .helpc-vph{ display:flex; align-items:center; gap:12px; background:linear-gradient(135deg,#0B6B61,#0d4f48); color:#fff; border-radius:12px; padding:16px; }
    .helpc-vph .pv{ width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,.16); display:grid; place-items:center; flex:0 0 auto; }
    .helpc-vph .pv i{ width:20px; height:20px; }
    .helpc-vph-t{ font-size:13.5px; font-weight:800; }
    .helpc-vph-s{ font-size:11.5px; opacity:.85; margin-top:2px; }
    .helpc-empty{ text-align:center; color:var(--muted,#8b968f); font-size:13px; padding:30px; }
    `;
    const st = document.createElement("style");
    st.id = "sbs-docs-css"; st.textContent = css;
    document.head.appendChild(st);
  }

  function featOff(id){
    if(!window.SBS_FEATURES) return false;
    const f = window.SBS_FEATURES.find && window.SBS_FEATURES.find(id);
    return f ? !f.enabled : false;
  }

  function itemHtml(it){
    const off = featOff(it.id);
    const steps = (it.comoUsar||[]).map(s=>`<li>${esc(s)}</li>`).join("");
    const quem = (it.quemAcessa||[]).map(q=>`<span class="helpc-tag">${esc(q)}</span>`).join("");
    let video = "";
    if(it.video && it.video.url){
      video = `<div class="helpc-video"><div class="helpc-embed"><iframe src="${esc(it.video.url)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div>`;
    } else if(it.video && it.video.roteiro){
      video = `<div class="helpc-video"><div class="helpc-vph"><span class="pv"><i data-lucide="play"></i></span><div><div class="helpc-vph-t">Vídeo tutorial em breve</div><div class="helpc-vph-s">Roteiro pronto — aguardando gravação do avatar.</div></div></div></div>`;
    }
    const hay = (it.titulo+" "+(it.resumo||"")+" "+(it.oque||"")).toLowerCase();
    return `<div class="helpc-item" data-hay="${esc(hay)}">
      <div class="helpc-bar">
        <span class="helpc-ic"><i data-lucide="${it.icon||'book-open'}"></i></span>
        <div class="helpc-bar-main">
          <div class="helpc-bar-t">${esc(it.titulo)}</div>
          <div class="helpc-bar-s">${esc(it.resumo||"")}</div>
        </div>
        ${off?`<span class="helpc-off">Desativada</span>`:""}
        <i class="helpc-chev" data-lucide="chevron-down"></i>
      </div>
      <div class="helpc-body">
        ${it.oque?`<div class="helpc-sec"><div class="helpc-sec-h">O que faz</div><div class="helpc-p">${esc(it.oque)}</div></div>`:""}
        ${steps?`<div class="helpc-sec"><div class="helpc-sec-h">Como usar</div><ol class="helpc-steps">${steps}</ol></div>`:""}
        ${quem?`<div class="helpc-sec"><div class="helpc-sec-h">Quem acessa</div><div class="helpc-tags">${quem}</div></div>`:""}
        ${video}
      </div>
    </div>`;
  }

  function html(platform){
    ensureCss();
    const p = (window.SBS_DOCS && window.SBS_DOCS.plataformas && window.SBS_DOCS.plataformas[platform]);
    if(!p) return `<div class="helpc"><div class="helpc-empty">Documentação não encontrada.</div></div>`;
    const roles = (p.perfis||[]).map(r=>`<span class="helpc-role">${esc(r)}</span>`).join("");
    const groups = (p.grupos||[]).map(g=>`
      <div class="helpc-group">
        <div class="helpc-group-h">${esc(g.nome)}</div>
        ${(g.itens||[]).map(itemHtml).join("")}
      </div>`).join("");
    return `<div class="helpc">
      <div class="helpc-head">
        <div class="helpc-title">${esc(p.nome)}</div>
        <div class="helpc-sub">${esc(p.sub||"")}</div>
        ${roles?`<div class="helpc-roles">${roles}</div>`:""}
      </div>
      <div class="helpc-search"><i data-lucide="search"></i><input id="helpc-q" placeholder="Buscar funcionalidade..."></div>
      <div id="helpc-list">${groups}</div>
      <div class="helpc-empty" id="helpc-none" style="display:none">Nada encontrado para sua busca.</div>
    </div>`;
  }

  function mount(root, platform){
    if(window.lucide) lucide.createIcons();
    // acordeão
    root.querySelectorAll(".helpc-bar").forEach(bar=>bar.addEventListener("click",()=>{
      bar.parentElement.classList.toggle("open");
    }));
    // busca
    const q = root.querySelector("#helpc-q");
    if(q) q.addEventListener("input",()=>{
      const term = q.value.trim().toLowerCase();
      let visible = 0;
      root.querySelectorAll(".helpc-item").forEach(it=>{
        const hit = !term || (it.dataset.hay||"").includes(term);
        it.style.display = hit ? "" : "none";
        if(hit) visible++;
        if(hit && term) it.classList.add("open"); else if(term) it.classList.remove("open");
      });
      root.querySelectorAll(".helpc-group").forEach(g=>{
        const any = [...g.querySelectorAll(".helpc-item")].some(i=>i.style.display!=="none");
        g.style.display = any ? "" : "none";
      });
      const none = root.querySelector("#helpc-none");
      if(none) none.style.display = visible ? "none" : "block";
    });
  }

  window.SBS_DOCS_HELP = { html, mount };
})();
