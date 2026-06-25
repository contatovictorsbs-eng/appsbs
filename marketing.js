/* ===========================================================
   SBS — Marketing (galeria de materiais/imagens do Drive)
   App: gerente regional e supervisor veem, compartilham (WhatsApp)
        e baixam/abrem os arquivos cadastrados no painel.
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens;
const DR = window.SBS_DRIVE;

S.marketing = {
  title: "Marketing",
  render(){
    const itens = window.SBSStore ? window.SBSStore.getCol("marketing") : [];
    const cats = ["Todas", ...Array.from(new Set(itens.map(i=>i.categoria).filter(Boolean)))];
    const folder = itens.find(i=>i.tipo==="pasta");
    return `
    <div class="hero" style="background:linear-gradient(150deg,#0B6B61,#10B0A0)">
      <div class="uname" style="font-size:18px">Materiais de Marketing</div>
      <div class="urole" style="opacity:.92">Imagens e artes para compartilhar com seus clientes</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${itens.filter(i=>i.tipo!=="pasta").length}</div><div class="hs-l">arquivos</div></div>
        <div class="hero-stat"><div class="hs-v">${cats.length-1}</div><div class="hs-l">categorias</div></div>
      </div>
    </div>

    ${folder?`<a class="btn ghost" href="${folder.url}" target="_blank" rel="noopener" style="margin-top:14px"><i data-lucide="folder-open"></i> Abrir pasta completa no Drive</a>`:""}

    ${cats.length>2?`<div class="chips" id="mk-cats" style="margin-top:14px">${cats.map((c,i)=>`<button class="chip ${i===0?'on':''}" data-v="${c}">${c}</button>`).join("")}</div>`:""}

    <div class="section-title">Galeria</div>
    <div id="mk-grid" class="mk-grid"></div>`;
  },
  mount(root){
    const all = (window.SBSStore ? window.SBSStore.getCol("marketing") : []).filter(i=>i.tipo!=="pasta");
    let cat = "Todas";
    function draw(){
      const list = all.filter(i=>cat==="Todas"||i.categoria===cat);
      root.querySelector("#mk-grid").innerHTML = list.length ? list.map(i=>{
        const th = i.thumb || (DR&&DR.thumb(i.url,800));
        const isData = /^data:/.test(i.url||"");
        const dl = isData ? i.url : (DR?DR.downloadUrl(i.url):i.url);
        const fname = (i.titulo||"material").replace(/[^\w\-]+/g,"_")+".jpg";
        return `<div class="mk-card">
          <div class="mk-thumb">${th?`<img src="${th}" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg')">`:""}<span class="mk-fallback"><i data-lucide="image"></i></span></div>
          <div class="mk-body">
            <div class="mk-name">${i.titulo||"Material"}</div>
            ${i.categoria?`<div class="mk-cat">${i.categoria}</div>`:""}
            <div class="mk-acts">
              <button class="mk-b share" data-share="${encodeURIComponent(i.titulo||"Material SBS")}" data-url="${encodeURIComponent(isData?i.url:(DR?DR.viewUrl(i.url):i.url))}" data-data="${isData?'1':'0'}"><i data-lucide="share-2"></i>WhatsApp</button>
              <a class="mk-b" href="${dl}" ${isData?`download="${fname}"`:'target="_blank" rel="noopener"'}><i data-lucide="download"></i>Baixar</a>
            </div>
          </div>
        </div>`;
      }).join("") : `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">Nenhum material nesta categoria.</div>`;
      window.lucide&&lucide.createIcons();
    }
    const catsEl = root.querySelector("#mk-cats");
    if(catsEl) catsEl.addEventListener("click",e=>{ const b=e.target.closest(".chip"); if(!b)return;
      catsEl.querySelectorAll(".chip").forEach(x=>x.classList.remove("on")); b.classList.add("on"); cat=b.dataset.v; draw(); });
    root.querySelector("#mk-grid").addEventListener("click",e=>{
      const sb=e.target.closest("[data-share]"); if(!sb)return;
      const titulo=decodeURIComponent(sb.dataset.share), url=decodeURIComponent(sb.dataset.url);
      const isData = sb.dataset.data==="1";
      // foto importada (dataURL): tenta compartilhar o arquivo nativamente
      if(isData && navigator.canShare){
        try{
          fetch(url).then(r=>r.blob()).then(blob=>{
            const file=new File([blob], (titulo||"material").replace(/[^\w\-]+/g,"_")+".jpg", {type:"image/jpeg"});
            if(navigator.canShare({files:[file]})){
              navigator.share({files:[file], title:titulo, text:"SBS Green Seeds — "+titulo}).then(()=>{window.Gam&&window.Gam.award("share");}).catch(()=>{});
            } else { window.SBS.toast("Use \u2018Baixar\u2019 e anexe no WhatsApp"); }
          });
        }catch(err){ window.SBS.toast("Use \u2018Baixar\u2019 e anexe no WhatsApp"); }
        return;
      }
      const msg=`*SBS Green Seeds — ${titulo}*\n${url}\n\n_Material enviado pelo Portal do Vendedor._`;
      if(navigator.share){ navigator.share({title:titulo, text:msg, url}).then(()=>{window.Gam&&window.Gam.award("share");}).catch(()=>{}); }
      else { const a=document.createElement("a"); a.href="https://wa.me/?text="+encodeURIComponent(msg); a.target="_blank"; a.rel="noopener"; document.body.appendChild(a); a.click(); setTimeout(()=>a.remove(),0); window.SBS.toast("Abrindo WhatsApp…"); window.Gam&&window.Gam.award("share"); }
    });
    draw();
  }
};

})();
