/* ===========================================================
   SBS — screens part 2 (interactive: preços, comissão, forms…)
   =========================================================== */
(function(){
const D = window.DATA;
const S = window.Screens;
// lê uma coleção da store compartilhada (painel ↔ app), com fallback ao DATA
const col = (name, fb)=> (window.SBSStore && window.SBSStore.getCol(name) || []).length ? window.SBSStore.getCol(name) : (fb||[]);
const sampleNote = `<div class="note"><i data-lucide="info"></i><span>Conteúdo de exemplo. Os dados oficiais serão integrados ao ERP da SBS.</span></div>`;

/* ---- photo picker (câmera + galeria + arquivos + carrossel de miniaturas) ---- */
const _photos = {};
const _files = {};
function photoPicker(id, opts){
  opts = opts || {};
  return `<div class="photopick" data-pp="${id}">
    <div class="pp-thumbs" id="${id}-thumbs"></div>
    ${opts.files?`<div class="pp-files" id="${id}-files"></div>`:""}
    <div class="pp-actions">
      <label class="pp-btn"><i data-lucide="camera"></i> Câmera<input type="file" accept="image/*" capture="environment" hidden></label>
      <label class="pp-btn"><i data-lucide="image"></i> Galeria<input type="file" accept="image/*" multiple hidden></label>
      ${opts.files?`<label class="pp-btn"><i data-lucide="paperclip"></i> Arquivo<input type="file" data-any multiple hidden></label>`:""}
    </div></div>`;
}
function wirePhotoPicker(root, id){
  _photos[id] = [];
  _files[id] = [];
  const wrap = root.querySelector('[data-pp="'+id+'"]'); if(!wrap) return;
  const thumbs = root.querySelector('#'+id+'-thumbs');
  const filesEl = root.querySelector('#'+id+'-files');
  function render(){
    thumbs.innerHTML = _photos[id].map((u,i)=>`<div class="pp-th"><img src="${u}" alt=""><button type="button" class="pp-x" data-i="${i}" aria-label="Remover">×</button></div>`).join("");
    window.lucide&&lucide.createIcons();
  }
  function renderFiles(){
    if(!filesEl) return;
    filesEl.innerHTML = _files[id].map((f,i)=>`<div class="pp-file"><i data-lucide="file-text"></i><span class="pp-file-n">${f.name}</span><span class="pp-file-s">${(f.size/1024).toFixed(0)} KB</span><button type="button" class="pp-fx" data-i="${i}" aria-label="Remover">×</button></div>`).join("");
    window.lucide&&lucide.createIcons();
  }
  wrap.querySelectorAll('input[type=file]').forEach(inp=>inp.addEventListener('change',e=>{
    const any = e.target.hasAttribute('data-any');
    [...e.target.files].forEach(f=>{
      // anexos que não são imagem entram como arquivo
      if(any && !/^image\//.test(f.type)){
        const r=new FileReader(); r.onload=()=>{ _files[id].push({name:f.name,type:f.type||"arquivo",size:f.size,data:r.result}); renderFiles(); }; r.readAsDataURL(f); return;
      }
      if(!/^image\//.test(f.type)) return;
      const r=new FileReader(); r.onload=()=>{
        const img=new Image(); img.onload=()=>{
          const max=1000, sc=Math.min(1,max/Math.max(img.width,img.height));
          const cv=document.createElement('canvas'); cv.width=img.width*sc; cv.height=img.height*sc;
          cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
          _photos[id].push(cv.toDataURL('image/jpeg',0.8)); render();
        }; img.src=r.result;
      }; r.readAsDataURL(f);
    });
    e.target.value="";
  }));
  thumbs.addEventListener('click',e=>{ const b=e.target.closest('.pp-x'); if(!b)return; _photos[id].splice(+b.dataset.i,1); render(); });
  filesEl && filesEl.addEventListener('click',e=>{ const b=e.target.closest('.pp-fx'); if(!b)return; _files[id].splice(+b.dataset.i,1); renderFiles(); });
}
function getPhotos(id){ return _photos[id]||[]; }
function getFiles(id){ return _files[id]||[]; }
// expõe os helpers para telas em arquivos separados (ex.: protocolo-pastagem.js)
window.photoPicker = photoPicker; window.wirePhotoPicker = wirePhotoPicker;
window.getPhotos = getPhotos; window.getFiles = getFiles;

/* ---------------- TABELA DE PREÇOS (dados oficiais VF02) ---------------- */
S.precos = {
  title: "Tabela de Preços",
  render(){
    const P = window.SBSStore ? (window.SBSStore.get("precos")||window.PRECOS) : window.PRECOS;
    return `
    <div class="px-hero">
      <div class="px-hero-top">
        <div>
          <div class="px-versao">${P.meta.versao}</div>
          <div class="px-safra">${P.meta.safra}</div>
        </div>
        <div class="px-data"><i data-lucide="calendar"></i> ${P.meta.data}</div>
      </div>
      <div class="px-tabs" id="px-tabs">
        ${P.catalogos.map((c,i)=>`<button class="px-tab ${i===0?'on':''}" data-cat="${c.id}"><i data-lucide="${c.icon}"></i>${c.nome}</button>`).join("")}
      </div>
    </div>
    <div class="search"><i data-lucide="search"></i><input id="px-q" placeholder="Buscar cultivar ou espécie..."></div>
    <div id="px-cond-legend" class="px-legend"></div>
    <div class="row-between" style="margin:6px 4px 10px"><span class="section-title" style="margin:0">Produtos</span><span class="muted" id="px-count" style="font-size:12px;font-weight:700"></span></div>
    <div id="px-list" class="stack"></div>
    <div id="px-obs"></div>`;
  },
  mount(root){
    const P = window.SBSStore ? (window.SBSStore.get("precos")||window.PRECOS) : window.PRECOS;
    window.Gam && window.Gam.awardOnce("precos");
    let catId = P.catalogos[0].id;

    function priceCard(name, sub, saco, precos, conds, foto){
      const kg = saco ? parseInt(saco,10) : 0;
      const num = p => parseFloat(String(p).replace(/\./g,"").replace(",","."))||0;
      const scVal = p => (num(p)*kg).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
      const lastIdx = precos.length-1;
      // interpreta cada condição em algo legível: nº de parcelas + prazo
      function condInfo(c){
        const s=(c.s||""), f=(c.f||"");
        if(/vista/i.test(s)){
          const d=f.replace(/à\s*vista/i,"").replace(/^[\s—-]+/,"").trim();
          return {nome:"À vista", desc:d||"pagamento imediato"};
        }
        if(/^parcelado$/i.test(s)) return {nome:"Parcelado", desc:f};
        if(/entrada|50%/i.test(s)) return {nome:"50% entrada + saldo", desc:f.replace(/^50%\s*/i,"")};
        if(/^direto$/i.test(s)) return {nome:"A prazo (direto)", desc:f};
        const mx=s.match(/(\d+)\s*x/i);
        if(mx) return {nome:mx[1]+"x", desc:"parcelas mensais"};
        const src=/\d/.test(f)?f:s;
        const days=(src.match(/\d+/g)||[]).map(Number).filter(n=>n>=20);
        if(days.length){
          const n=days.length;
          let desc;
          if(n===1) desc="em "+days[0]+" dias";
          else if(n<=3) desc=days.join(" / ")+" dias";
          else desc="28 a "+days[days.length-1]+" dias";
          return {nome:n+"x", desc};
        }
        return {nome:s, desc:f};
      }
      function opt(cls,label,idx){
        const price = precos[idx];
        const big = kg ? `R$ ${scVal(price)}` : `R$ ${price}`;
        const small = kg ? `R$ ${price}/kg · saca ${kg}kg` : "";
        return `<div class="pc-opt ${cls}">
          <div class="pc-opt-l">${label}</div>
          <div class="pc-opt-v">${big}</div>
          ${small?`<div class="pc-opt-u">${small}</div>`:""}
        </div>`;
      }
      const allRows = conds.map((c,i)=>{
        const info = condInfo(c);
        return `<div class="pc-allrow">
          <span class="pc-allc"><b>${info.nome}</b><small>${info.desc}</small></span>
          <span class="pc-allp"><b>R$ ${kg?scVal(precos[i]):precos[i]}</b>${kg?`<small>R$ ${precos[i]}/kg</small>`:""}</span>
        </div>`;
      }).join("");
      const prazoLabel = "A prazo · "+condInfo(conds[lastIdx]).nome;
      return `<div class="pcard" data-search="${(name+' '+(sub||'')).toLowerCase()}">
        <div class="pc-head">
          ${foto?`<img class="pc-foto" src="${foto}" alt="">`:""}
          <div class="pc-id"><div class="pc-name">${name}</div>${sub?`<div class="pc-sub">${sub}</div>`:""}</div>
          ${saco?`<span class="pc-saco"><i data-lucide="package"></i>${saco}</span>`:""}
        </div>
        <div class="pc-twin">
          ${opt("avista","À vista", 0)}
          ${opt("prazo",prazoLabel, lastIdx)}
        </div>
        ${conds.length>2?`
        <button class="pc-toggle" type="button"><span class="pct-show">Ver todas as ${conds.length} condições</span><span class="pct-hide">Ocultar condições</span><i data-lucide="chevron-down"></i></button>
        <div class="pc-all"><div class="pc-allhead"><span>Condição de pagamento</span><span>Preço${kg?" / saca":""}</span></div>${allRows}</div>`:""}
      </div>`;
    }

    function draw(){
      const cat = P.catalogos.find(c=>c.id===catId);
      const q = (root.querySelector("#px-q").value||"").toLowerCase();
      const conds = cat.condicoes;
      // legend
      root.querySelector("#px-cond-legend").innerHTML = conds.map(c=>`<span class="px-leg"><b>${c.s}</b>${c.f!==c.s?" "+c.f:""}</span>`).join("");
      // body
      let html="", count=0;
      const matches = s => !q || s.toLowerCase().includes(q);
      if(cat.grupos){
        cat.grupos.forEach(g=>{
          const items = g.itens.filter(it=>matches((g.nome+' '+(it.cultivar||'')+' '+it.padrao)));
          if(!items.length) return;
          count += items.length;
          html += `<div class="px-group-h ${g.cor||''}">${g.nome}</div>`;
          html += items.map(it=>priceCard(it.cultivar||g.nome, it.padrao, cat.hasSaco?(it.saco?it.saco+" kg":cat.sacoFixo):"", it.precos, conds, it.foto)).join("");
        });
      } else {
        const items = cat.itens.filter(it=>matches(it.nome+' '+(it.comp||'')));
        count = items.length;
        html = items.map(it=>priceCard(it.nome, it.comp, cat.hasSaco?(cat.sacoFixo||""):"", it.precos, conds, it.foto)).join("");
      }
      root.querySelector("#px-list").innerHTML = html || `<div class="card" style="text-align:center;color:var(--muted)">Nenhum produto encontrado.</div>`;
      root.querySelector("#px-count").textContent = count+" itens";
      // obs
      root.querySelector("#px-obs").innerHTML = `
        <div class="section-title">Observações</div>
        <div class="card" style="padding:14px">
          <ul class="doc-list">${cat.obs.map(o=>`<li><i data-lucide="check"></i><span>${o}</span></li>`).join("")}</ul>
        </div>
        <div class="note"><i data-lucide="refresh-cw"></i><span>Os preços mudam constantemente. Em breve serão gerenciados pelo painel administrativo do app.</span></div>`;
      window.lucide&&lucide.createIcons();
    }

    root.querySelector("#px-tabs").addEventListener("click",e=>{
      const b=e.target.closest(".px-tab"); if(!b)return;
      root.querySelectorAll(".px-tab").forEach(t=>t.classList.remove("on"));
      b.classList.add("on"); catId=b.dataset.cat;
      root.querySelector("#px-list").scrollTop=0; draw();
    });
    root.querySelector("#px-list").addEventListener("click",e=>{
      const t=e.target.closest(".pc-toggle"); if(!t)return;
      t.closest(".pcard").classList.toggle("open");
    });
    root.querySelector("#px-q").addEventListener("input",draw);
    draw();
  }
};

/* ---------------- CAMPANHAS ---------------- */
S.campanhas = {
  title: "Campanhas Vigentes",
  render(){
    const camps = col("campanhas", D.campanhas).filter(c=>c.ativo!==false && c.status!=="Encerrada");
    return `
    <div class="section-title" style="margin-top:6px">${camps.length} ${camps.length===1?'campanha ativa':'campanhas ativas'}</div>
    ${camps.map(c=>`
      <div class="camp">
        ${c.boost?`<div class="camp-boost"><i data-lucide="rocket"></i><div><b>Impulso ${c.boostMult?c.boostMult+'x':''}${c.boostPeriodo?' · '+c.boostPeriodo:''}</b><span>${c.boostMsg||'Premiação multiplicada neste período!'}</span></div></div>`:""}
        <div class="camp-top ${c.cor}">
          <div class="row-between"><div class="camp-name">${c.nome}</div>
            <span class="badge ${c.status==='Ativa'?'b-good':'b-muted'}" style="background:rgba(255,255,255,.2);color:#fff">${c.status}</span></div>
          <div class="camp-vig"><i data-lucide="calendar" style="width:13px;height:13px;vertical-align:-2px"></i> ${c.vigencia}</div>
        </div>
        <div class="camp-body">
          <div class="cb-row"><i data-lucide="package"></i><div><div class="cbl">Produtos</div><div class="cbv">${c.produtos}</div></div></div>
          <div class="cb-row"><i data-lucide="gift"></i><div><div class="cbl">Benefício</div><div class="cbv">${c.beneficio}</div></div></div>
          <div class="cb-row"><i data-lucide="trophy"></i><div><div class="cbl">Bonificação</div><div class="cbv">${c.bonus}</div></div></div>
          ${c.premio?`<div class="cb-row"><i data-lucide="award"></i><div><div class="cbl">Prêmios</div><div class="cbv">${c.premio}</div></div></div>`:""}
          ${c.tipoPremio?`<div class="cb-row"><i data-lucide="banknote"></i><div><div class="cbl">Premiação</div><div class="cbv">${c.tipoPremio}</div></div></div>`:""}
        </div>
      </div>`).join("")}
    ${sampleNote}`;
  }
};

/* ---------------- TREINAMENTOS ---------------- */
S.treinamentos = {
  title: "Treinamentos",
  render(){ return `
    <div class="card" style="background:linear-gradient(150deg,var(--green-800),var(--green-600));color:#fff">
      <div class="row-between"><div><div style="font-weight:800;font-size:16px">Plataforma Green Mobile</div>
        <div style="font-size:12.5px;opacity:.88;margin-top:3px">Sua trilha de capacitação SBS</div></div>
        <span class="kic" style="background:rgba(255,255,255,.18);color:#fff"><i data-lucide="graduation-cap"></i></span></div>
      <div class="progress" style="margin-top:14px;background:rgba(255,255,255,.25)"><span style="width:54%;background:#fff"></span></div>
      <div style="font-size:12px;opacity:.9;margin-top:8px">20 de 35 módulos concluídos · 54%</div>
    </div>
    <div class="section-title">Categorias</div>
    ${col("treinamentos", D.treinamentos).map(t=>`
      <div class="train">
        <span class="t-ic"><i data-lucide="${t.icon}"></i></span>
        <div class="t-info">
          <div class="t-name">${t.cat}</div>
          <div class="t-meta">${t.done}/${t.itens} módulos · ${t.hr}</div>
          <div class="progress"><span style="width:${Math.round(t.done/t.itens*100)}%"></span></div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--muted);width:20px"></i>
      </div>`).join("")}
    <button class="btn ghost" data-toast="Abrindo a plataforma Green Mobile..." style="margin-top:6px"><i data-lucide="external-link"></i> Abrir plataforma de treinamentos</button>
    <div class="note" style="margin-top:12px"><i data-lucide="info"></i><span>A medição de treinamentos é integrada a uma plataforma externa (Green Mobile / LMS).</span></div>`;
  }
};

/* ---------------- MATERIAIS TÉCNICOS ---------------- */
S.materiais = {
  title: "Materiais Técnicos",
  render(){
    const mats = col("materiais", D.materiais);
    return `
    <div class="search"><i data-lucide="search"></i><input id="mt-q" placeholder="Buscar catálogos, fichas..."></div>
    <div class="section-title" style="margin-top:6px">Biblioteca</div>
    <div id="mt-list" class="stack">
    ${mats.map(m=>{ const src=m.dataUrl||m.file||"";
      return `
      <div class="mat" data-search="${(m.nome+' '+m.tipo).toLowerCase()}">
        <span class="m-ic" data-doc="${src}" data-title="${m.nome}"><i data-lucide="${m.icon||'file-text'}"></i></span>
        <div class="m-info" data-doc="${src}" data-title="${m.nome}"><div class="m-name">${m.nome}</div><div class="m-meta">${m.tipo} · ${m.meta||'PDF'}</div></div>
        <div class="m-actions">
          <button class="m-act share" data-share="material" data-title="${m.nome}" aria-label="Compartilhar"><i data-lucide="share-2"></i></button>
          <button class="m-act" data-doc="${src}" data-title="${m.nome}" aria-label="Visualizar"><i data-lucide="eye"></i></button>
        </div>
      </div>`;}).join("")}
    </div>`;
  },
  mount(root){
    root.querySelector("#mt-q").addEventListener("input",e=>{
      const q=(e.target.value||"").toLowerCase();
      root.querySelectorAll("#mt-list .mat").forEach(el=>{
        el.style.display = el.dataset.search.includes(q) ? "" : "none";
      });
    });
  }
};

/* ---------------- COMISSÃO (simulador) ---------------- */
S.comissao = {
  title: "Comissão",
  render(){
    const C = D.comissao;
    const hidden = (()=>{ try{ return localStorage.getItem("sbs_hide_comm")==="1"; }catch(e){ return false; } })();
    const fmt = n => "R$ "+n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
    const statusBadge = {liberado:"b-good", previsto:"b-info", retido:"b-warn"};
    const statusLbl = {liberado:"Liberado", previsto:"Previsto", retido:"Retido"};
    return `
    <!-- saldo estilo banco -->
    <div class="bank ${hidden?'hide':''}" id="cm-bank">
      <div class="bank-top">
        <span class="bank-l"><i data-lucide="wallet"></i> Comissões a receber · ${C.mesRef}</span>
        <button class="bank-eye" id="cm-eye" aria-label="Ocultar valor"><i data-lucide="${hidden?'eye-off':'eye'}"></i></button>
      </div>
      <div class="bank-val"><span class="bank-real" data-val="${fmt(C.aReceber)}">${hidden?'R$ ••••••':fmt(C.aReceber)}</span></div>
      <div class="bank-rows">
        ${C.itens.map(it=>`
          <div class="bank-row">
            <div class="br-info"><span class="br-l">${it.label}</span><span class="br-s">${it.sub}</span></div>
            <div class="br-right"><span class="br-v" data-val="${fmt(it.value)}">${hidden?'••••':fmt(it.value)}</span><span class="badge ${statusBadge[it.status]}">${statusLbl[it.status]}</span></div>
          </div>`).join("")}
      </div>
    </div>

    <!-- relatório individual -->
    <div class="card" style="margin-top:14px">
      <div class="row-between" style="gap:10px">
        <div><div style="font-weight:800;font-size:14.5px">Meu relatório de comissão</div>
          <div class="muted" style="font-size:12px;margin-top:2px">${C.mesRef} · individual</div></div>
        <span class="kic" style="flex:0 0 auto"><i data-lucide="file-spreadsheet"></i></span>
      </div>
      <div style="display:flex;gap:9px;margin-top:13px">
        <button class="btn" style="flex:1" data-toast="Gerando seu relatório em PDF..."><i data-lucide="download"></i> Baixar</button>
        <button class="btn outline" style="flex:1" data-toast="Relatório enviado para ${D.user.email||'seu e-mail'}"><i data-lucide="mail"></i> Enviar</button>
      </div>
      <div class="note" style="margin-top:12px"><i data-lucide="shield-check"></i><span>Relatório individual — cada vendedor recebe apenas a sua comissão.</span></div>
    </div>

    <!-- simulador seguindo régua da política -->
    <div class="section-title">Simulador de comissão</div>
    <div class="field">
      <label>Valor do pedido</label>
      <input id="cm-val" inputmode="numeric" value="150.000">
      <div class="hint">Valor total da nota (R$)</div>
    </div>
    <div class="field">
      <label>Desconto aplicado: <span id="cm-dlabel" style="color:var(--accent)">0%</span></label>
      <input id="cm-desc" class="range" type="range" min="0" max="20" step="0.5" value="0">
      <div class="row-between"><span class="hint" style="margin:0">0%</span><span class="hint" style="margin:0">20%</span></div>
      <div id="cm-alcada" class="alcada-tag"></div>
    </div>
    <div class="sim-result">
      <div style="font-weight:800;font-size:15px">Comissão prevista</div>
      <div class="sr-grid">
        <div class="sr-box"><div class="sr-l">% de comissão</div><div class="sr-v" id="cm-pct">3,00%</div></div>
        <div class="sr-box"><div class="sr-l">Valor estimado</div><div class="sr-v" id="cm-money">R$ 4.500</div></div>
      </div>
      <div class="sr-big" id="cm-base" style="margin-top:12px"></div>
    </div>

    <div class="section-title">Régua da política</div>
    <div class="card" style="padding:6px 0">
      <div class="regua-h"><span>Desconto</span><span>Alçada</span><span>Comissão</span></div>
      ${C.regua.map((r,i)=>{
        const prev = i===0?0:C.regua[i-1].ate;
        const faixa = r.ate>=100 ? `acima de ${prev}%` : (i===0?`0%`:`até ${r.ate}%`);
        return `<div class="regua-r" data-i="${i}">
          <span class="rq-f">${faixa}</span>
          <span class="rq-a">${r.alcada}</span>
          <span class="rq-p">${r.pct.toLocaleString("pt-BR",{minimumFractionDigits:1})}%</span>
        </div>`;
      }).join("")}
    </div>
    <div class="note" style="margin-top:12px"><i data-lucide="info"></i><span>Percentuais de comissão conforme a régua da Política Comercial. Confirme os valores oficiais com o Comercial.</span></div>`;
  },
  mount(root){
    const C = D.comissao;
    window.Gam && window.Gam.awardOnce("comissao");
    const parseV = s => parseFloat(String(s).replace(/\./g,"").replace(",","."))||0;
    const fmt = n => n.toLocaleString("pt-BR",{maximumFractionDigits:0});

    /* olho — ocultar/mostrar valores (estilo banco) */
    const bank = root.querySelector("#cm-bank");
    root.querySelector("#cm-eye").addEventListener("click",()=>{
      const hidden = !bank.classList.contains("hide");
      bank.classList.toggle("hide", hidden);
      try{ localStorage.setItem("sbs_hide_comm", hidden?"1":"0"); }catch(e){}
      root.querySelector("#cm-eye i").setAttribute("data-lucide", hidden?"eye-off":"eye");
      root.querySelector(".bank-real").textContent = hidden ? "R$ ••••••" : root.querySelector(".bank-real").dataset.val;
      root.querySelectorAll(".br-v").forEach(el=>{ el.textContent = hidden ? "••••" : el.dataset.val; });
      window.lucide&&lucide.createIcons();
    });

    /* simulador seguindo a régua */
    function tier(desc){
      for(const r of C.regua){ if(desc<=r.ate) return r; }
      return C.regua[C.regua.length-1];
    }
    function calc(){
      const val = parseV(root.querySelector("#cm-val").value);
      const desc = parseFloat(root.querySelector("#cm-desc").value);
      const t = tier(desc);
      root.querySelector("#cm-dlabel").textContent = desc.toLocaleString("pt-BR")+"%";
      const liquido = val*(1-desc/100);
      const money = liquido*t.pct/100;
      root.querySelector("#cm-pct").textContent = t.pct.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
      root.querySelector("#cm-money").textContent = "R$ "+fmt(money);
      root.querySelector("#cm-base").textContent = `Base líquida: R$ ${fmt(liquido)} · desconto de ${desc.toLocaleString("pt-BR")}%`;
      // alçada tag
      const tag = root.querySelector("#cm-alcada");
      const cls = t.nivel==="ok" ? "ok" : (t.nivel==="aprova" ? "warn" : "danger");
      const txt = t.nivel==="ok" ? "Dentro da sua alçada" : (t.nivel==="aprova" ? "Requer aprovação do Coordenador" : "Requer aprovação da Diretoria");
      const ic = t.nivel==="ok" ? "check-circle-2" : (t.nivel==="aprova" ? "alert-triangle" : "shield-alert");
      tag.className = "alcada-tag "+cls;
      tag.innerHTML = `<i data-lucide="${ic}"></i><span>${txt}</span>`;
      // highlight régua row
      root.querySelectorAll(".regua-r").forEach(rr=>rr.classList.remove("on"));
      const idx = C.regua.indexOf(t);
      const rEl = root.querySelector(`.regua-r[data-i="${idx}"]`); if(rEl) rEl.classList.add("on");
      window.lucide&&lucide.createIcons();
    }
    const inp = root.querySelector("#cm-val");
    inp.addEventListener("input",()=>{ const n=parseV(inp.value); inp.value=n?n.toLocaleString("pt-BR"):""; calc(); });
    root.querySelector("#cm-desc").addEventListener("input",calc);
    calc();
  }
};

/* ---------------- RECLAMAÇÃO DE CLIENTE ---------------- */
S.reclamacao = {
  title: "Reclamação de Cliente",
  render(){ return `
    <div class="proto-pick">
      <button type="button" class="proto-card on" data-proto="geral">
        <i data-lucide="message-square-warning"></i>
        <div class="pc-t">Reclamação geral</div>
        <div class="pc-d">Produto, lote e ocorrência</div>
      </button>
      <button type="button" class="proto-card" data-proto="pastagem">
        <i data-lucide="sprout"></i>
        <div class="pc-t">Renovação de Pastagem</div>
        <div class="pc-d">Protocolo técnico completo</div>
      </button>
    </div>
    <div class="card" style="margin-bottom:14px">
      <div style="font-weight:800;font-size:14px;margin-bottom:4px">Fluxo de atendimento</div>
      <div class="flow">
        <span class="fstep">Vendedor</span><i data-lucide="chevron-right"></i>
        <span class="fstep">Assist. Técnica</span><i data-lucide="chevron-right"></i>
        <span class="fstep">Qualidade</span><i data-lucide="chevron-right"></i>
        <span class="fstep">Retorno</span>
      </div>
    </div>
    <form id="rc-form" autocomplete="off">
      <div class="field"><label>Cliente</label><input id="rc-cliente" required placeholder="Nome do cliente / fazenda"></div>
      <div class="field"><label>CPF / CNPJ</label><input id="rc-doc" inputmode="numeric" placeholder="000.000.000-00"></div>
      <div class="field-2">
        <div class="field"><label>Produto</label><input id="rc-produto" placeholder="Ex.: SBS 7110"></div>
        <div class="field"><label>Lote</label><input id="rc-lote" placeholder="Nº do lote"></div>
      </div>
      <div class="field"><label>Município</label><input id="rc-municipio" placeholder="Cidade / UF"></div>
      <div class="field"><label>Descrição da ocorrência</label><textarea id="rc-desc" required placeholder="Descreva o problema relatado pelo cliente..."></textarea></div>
      <div class="field"><label>Fotos e anexos</label>
        ${photoPicker("rc",{files:true})}
      </div>
      <button class="btn" type="submit"><i data-lucide="send"></i> Abrir chamado</button>
    </form>`;
  },
  mount(root){
    wirePhotoPicker(root, "rc");
    const pick = root.querySelector(".proto-pick");
    pick && pick.addEventListener("click", e=>{
      const b = e.target.closest(".proto-card"); if(!b) return;
      if(b.dataset.proto==="pastagem"){ window.SBS.go("protocoloPastagem"); }
    });
    root.querySelector("#rc-form").addEventListener("submit",e=>{
      e.preventDefault();
      const proto = "RC-"+Math.floor(1000+Math.random()*9000);
      const u = (window.DATA&&window.DATA.user)||{};
      const g = id=>{ const el=root.querySelector(id); return el?el.value.trim():""; };
      if(window.SBSStore){ window.SBSStore.add("reclamacoes", {
        protocolo:proto, tipo:"Reclamação geral", cliente:g("#rc-cliente"), doc:g("#rc-doc"), produto:g("#rc-produto")||"—",
        lote:g("#rc-lote"), municipio:g("#rc-municipio"), descricao:g("#rc-desc"), fotos:getPhotos("rc"), anexos:getFiles("rc"),
        vendedor:u.name||"Vendedor", data:window.SBSStore.today(), status:"aberto", responsavel:"", etapa:"Vendedor" }); }
      window.SBS.toast("Reclamação aberta! Protocolo #"+proto);
      window.Gam && window.Gam.award("reclamacao");
      setTimeout(()=>window.SBS.go("home"),1000);
    });
  }
};

/* ---------------- CHAMADO INTERNO (consultor → áreas internas) ---------------- */
S.chamado = {
  title: "Chamado Interno",
  render(){ return `
    <div class="card" style="margin-bottom:14px">
      <div style="font-weight:800;font-size:14px;margin-bottom:8px">Abertura de chamado interno</div>
      <p class="muted" style="font-size:12.5px;line-height:1.45;margin:0">Solicite apoio às áreas internas da SBS. O chamado é registrado e encaminhado para o setor responsável.</p>
    </div>
    <form id="ch-form" autocomplete="off">
      <div class="field"><label>Área de destino</label>
        <select id="ch-area" required>
          <option value="">Selecione a área...</option>
          <option>Comercial</option>
          <option>Crédito e Cobrança</option>
          <option>Faturamento</option>
          <option>Logística / Expedição</option>
          <option>Assistência Técnica</option>
          <option>Qualidade</option>
          <option>Marketing</option>
          <option>TI / Sistemas</option>
          <option>Administrativo / RH</option>
        </select>
      </div>
      <div class="field"><label>Tipo de solicitação</label>
        <select id="ch-tipo" required>
          <option value="">Selecione...</option>
          <option>Dúvida</option>
          <option>Solicitação</option>
          <option>Correção / Ajuste</option>
          <option>Reclamação interna</option>
          <option>Outro</option>
        </select>
      </div>
      <div class="field"><label>Prioridade</label>
        <div class="chips" id="ch-prio">
          <button type="button" class="chip" data-v="Baixa">Baixa</button>
          <button type="button" class="chip on" data-v="Normal">Normal</button>
          <button type="button" class="chip" data-v="Alta">Alta</button>
          <button type="button" class="chip" data-v="Urgente">Urgente</button>
        </div>
      </div>
      <div class="field"><label>Assunto</label><input id="ch-assunto" required placeholder="Resumo do chamado"></div>
      <div class="field"><label>Cliente / Pedido relacionado <span class="muted" style="font-weight:600">(opcional)</span></label><input id="ch-cliente" placeholder="Ex.: Fazenda Boa Vista / Pedido #10482"></div>
      <div class="field"><label>Descrição</label><textarea id="ch-desc" required placeholder="Descreva sua solicitação com o máximo de detalhes..."></textarea></div>
      <div class="field"><label>Anexos <span class="muted" style="font-weight:600">(opcional)</span></label>
        ${photoPicker("ch")}
      </div>
      <button class="btn" type="submit"><i data-lucide="send"></i> Abrir chamado</button>
    </form>
    <div class="note" style="margin-top:14px"><i data-lucide="info"></i><span>Você acompanha o andamento dos seus chamados e recebe o retorno da área responsável.</span></div>`;
  },
  mount(root){
    wirePhotoPicker(root, "ch");
    root.querySelector("#ch-prio").addEventListener("click",e=>{
      const b=e.target.closest(".chip"); if(!b)return;
      root.querySelectorAll("#ch-prio .chip").forEach(c=>c.classList.remove("on"));
      b.classList.add("on");
    });
    root.querySelector("#ch-form").addEventListener("submit",e=>{
      e.preventDefault();
      const area=root.querySelector("#ch-area").value;
      const proto = "CI-"+Math.floor(1000+Math.random()*9000);
      const u = (window.DATA&&window.DATA.user)||{};
      const g = id=>{ const el=root.querySelector(id); return el?el.value.trim():""; };
      const prioEl = root.querySelector("#ch-prio .chip.on");
      if(window.SBSStore){ window.SBSStore.add("chamados", {
        protocolo:proto, area:area||"—", tipo:g("#ch-tipo")||"—", prioridade:prioEl?prioEl.dataset.v:"Normal",
        assunto:g("#ch-assunto"), cliente:g("#ch-cliente"), descricao:g("#ch-desc"), fotos:getPhotos("ch"),
        solicitante:u.name||"Vendedor", data:window.SBSStore.today(), status:"aberto", responsavel:"" }); }
      window.SBS.toast("Chamado aberto"+(area?" · "+area:"")+"! Protocolo #"+proto);
      window.Gam && window.Gam.award("chamado");
      setTimeout(()=>window.SBS.go("home"),1000);
    });
  }
};

/* ---------------- RELATÓRIO DE VISITAS ---------------- */
S.visitas = {
  title: "Relatório de Visitas",
  render(){
    const V = D.visitas;
    const u = D.user;
    let all = (window.SBSStore && window.SBSStore.getCol("visitas").length) ? window.SBSStore.getCol("visitas") : V.lista;
    // escopo: supervisor vê só as suas; regional vê seu time; nacional/admin vê tudo
    let lista = all, escopoLabel = "";
    if(window.SBS_ORG && u.email){
      const papel = u.papel;
      if(papel==="supervisor"){
        lista = all.filter(v=>!v.email || v.email.toLowerCase()===u.email.toLowerCase() || (v.vendedor||"").toUpperCase()===(u.name||"").toUpperCase());
      } else if(papel==="regional"){
        const eq = window.SBS_ORG.escopo(u.email).map(e=>e.toLowerCase());
        lista = all.filter(v=>!v.email || eq.includes(v.email.toLowerCase()));
        escopoLabel = "Equipe — "+u.first;
      } else { escopoLabel = "Visão nacional"; }
    }
    const mes = lista.length || V.mes;
    const pct = Math.min(100, Math.round(mes/V.meta*100));
    const stLbl = {ok:["b-good","Concluída"], andamento:["b-info","Em andamento"], proposta:["b-warn","Proposta"]};
    return `
    ${escopoLabel?`<div class="badge b-brand" style="margin:2px 2px 12px">${escopoLabel}</div>`:""}
    <div class="card" style="background:linear-gradient(150deg,var(--green-800),var(--green-600));color:#fff">
      <div class="row-between"><div><div style="font-weight:800;font-size:16px">Visitas ${escopoLabel?"da equipe":"do mês"}</div>
        <div style="font-size:12.5px;opacity:.88;margin-top:3px">Meta de ${V.meta} visitas</div></div>
        <div style="text-align:right"><div style="font-size:30px;font-weight:800;line-height:1">${mes}</div><div style="font-size:11px;opacity:.85">de ${V.meta}</div></div></div>
      <div class="progress" style="margin-top:14px;background:rgba(255,255,255,.25)"><span style="width:${pct}%;background:#fff"></span></div>
      <div style="font-size:12px;opacity:.9;margin-top:8px">${pct}% da meta mensal</div>
    </div>

    <button class="btn" id="vs-new" style="margin-top:14px"><i data-lucide="plus"></i> Registrar nova visita</button>

    <form id="vs-form" class="card" style="margin-top:14px;display:none">
      <div style="font-weight:800;font-size:14.5px;margin-bottom:12px">Nova visita</div>
      <div class="field"><label>Cliente</label><input id="vs-cliente" required placeholder="Nome do cliente / fazenda"></div>
      <div class="field-2">
        <div class="field"><label>Município</label><input id="vs-municipio" placeholder="Cidade / UF"></div>
        <div class="field"><label>Data</label><input id="vs-data" type="date"></div>
      </div>
      <label class="vs-novo"><input type="checkbox" id="vs-novo"><span><b>Cliente novo</b> — cadastrar na base de prospecção</span></label>
      <div id="vs-novo-fields" style="display:none">
        <div class="field-2">
          <div class="field"><label>Contato</label><input id="vs-contato" placeholder="Nome do responsável"></div>
          <div class="field"><label>Telefone</label><input id="vs-fone" inputmode="tel" placeholder="(00) 00000-0000"></div>
        </div>
        <div class="field"><label>Cultura / atividade</label><input id="vs-cultura" placeholder="Ex.: Soja, Pecuária, Milho"></div>
      </div>
      <div class="field"><label>Objetivo da visita</label>
        <select id="vs-objetivo"><option>Prospecção</option><option>Apresentação de produto</option><option>Negociação</option><option>Pós-venda / acompanhamento</option><option>Cobrança</option><option>Assistência técnica</option></select>
      </div>
      <div class="field"><label>Resultado / observações</label><textarea id="vs-resultado" required placeholder="O que foi tratado e o desfecho da visita..."></textarea></div>
      <div class="field"><label>Próximos passos</label><input placeholder="Ex.: enviar proposta até sexta"></div>
      <div class="field"><label>Fotos da visita</label>
        ${photoPicker("vs")}
      </div>
      <div class="field"><label>Autenticação da visita</label>
        <button type="button" class="btn outline" id="vs-geo"><i data-lucide="map-pin"></i> Registrar localização (check-in)</button>
        <div id="vs-geo-out" class="geo-out"></div>
      </div>
      <button class="btn" type="submit"><i data-lucide="check"></i> Salvar visita</button>
    </form>

    <div class="section-title">Visitas recentes</div>
    ${lista.map(v=>`
      <div class="visit">
        <div class="vz-date"><span>${v.data.split("/")[0]}</span><small>${["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"][parseInt(v.data.split("/")[1])-1]||""}</small></div>
        <div class="vz-info">
          <div class="row-between" style="gap:8px"><div class="vz-name">${v.cliente}</div><span class="badge ${stLbl[v.status][0]}">${stLbl[v.status][1]}</span></div>
          ${(escopoLabel&&v.vendedor)?`<div class="vz-by"><i data-lucide="user-round"></i>${v.vendedor}</div>`:""}
          <div class="vz-muni"><i data-lucide="map-pin"></i>${v.municipio}</div>
          <div class="vz-obj">${v.objetivo}</div>
          <div class="vz-res"><i data-lucide="corner-down-right"></i>${v.resultado}</div>
          ${v.autenticada?`<div class="vz-auth"><i data-lucide="shield-check"></i>Visita autenticada${v.hora?' · '+v.hora:''}${v.gps?' · '+v.gps.lat.toFixed(4)+','+v.gps.lng.toFixed(4):''}</div>`:""}
          ${(v.fotos&&v.fotos.length)?`<div class="vz-fotos">${v.fotos.map(f=>`<a href="${f}" target="_blank" rel="noopener"><img src="${f}" alt=""></a>`).join("")}</div>`:""}
        </div>
      </div>`).join("")}`;
  },
  mount(root){
    const form = root.querySelector("#vs-form");
    wirePhotoPicker(root, "vs");
    const novoChk = root.querySelector("#vs-novo");
    if(novoChk) novoChk.addEventListener("change",()=>{ root.querySelector("#vs-novo-fields").style.display = novoChk.checked?"block":"none"; });
    let geo = null; // {lat,lng,acc,ts}
    const geoBtn = root.querySelector("#vs-geo");
    const geoOut = root.querySelector("#vs-geo-out");
    geoBtn.addEventListener("click",()=>{
      if(!navigator.geolocation){ geoOut.innerHTML='<span class="geo-err">GPS não disponível neste dispositivo.</span>'; return; }
      geoOut.innerHTML='<span class="geo-load">Obtendo localização…</span>';
      navigator.geolocation.getCurrentPosition(p=>{
        geo = { lat:p.coords.latitude, lng:p.coords.longitude, acc:Math.round(p.coords.accuracy), ts:new Date().toISOString() };
        const now=new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
        geoOut.innerHTML='<div class="geo-ok"><i data-lucide="shield-check"></i><div><b>Visita autenticada</b><span>'+geo.lat.toFixed(5)+', '+geo.lng.toFixed(5)+' · ±'+geo.acc+'m · '+now+'</span></div></div>';
        geoBtn.style.display="none"; window.lucide&&lucide.createIcons();
      }, err=>{
        geoOut.innerHTML='<span class="geo-err">Não foi possível obter a localização ('+(err.code===1?"permissão negada":"tente novamente")+').</span>';
      }, { enableHighAccuracy:true, timeout:10000, maximumAge:0 });
    });
    root.querySelector("#vs-new").addEventListener("click",()=>{
      const open = form.style.display!=="none";
      form.style.display = open ? "none" : "block";
    });
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const g = id=>{ const el=root.querySelector(id); return el?el.value.trim():""; };
      const u = (window.DATA&&window.DATA.user)||{};
      let dataStr = g("#vs-data");
      if(dataStr){ const p=dataStr.split("-"); dataStr = p[2]+"/"+p[1]; } else dataStr = window.SBSStore?window.SBSStore.today().slice(0,5):"";
      const hora = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
      const novoCli = root.querySelector("#vs-novo") && root.querySelector("#vs-novo").checked;
      if(window.SBSStore){
        window.SBSStore.add("visitas", {
        cliente:g("#vs-cliente"), municipio:g("#vs-municipio")||"—", data:dataStr, hora:hora,
        objetivo:g("#vs-objetivo"), resultado:g("#vs-resultado"), status:"ok",
        vendedor:u.name||"Vendedor", email:u.email||"", papel:u.papel||"",
        fotos:getPhotos("vs"), gps: geo, autenticada: !!geo, novoCliente: !!novoCli });
        if(novoCli){ window.SBSStore.add("novos_clientes", {
          nome:g("#vs-cliente"), municipio:g("#vs-municipio")||"", contato:g("#vs-contato"),
          telefone:g("#vs-fone"), cultura:g("#vs-cultura"), origem:"Visita",
          vendedor:u.name||"", email:u.email||"", data:dataStr, status:"novo" }); }
      }
      window.SBS.toast((novoCli?"Cliente novo cadastrado! ":"")+(geo?"Visita autenticada!":"Visita registrada!"));
      window.Gam && window.Gam.award("visita");
      form.reset(); form.style.display="none"; geo=null;
      const nf=root.querySelector("#vs-novo-fields"); if(nf) nf.style.display="none";
      window.SBS.go("visitas");
    });
  }
};

/* ---------------- NOTIFICAÇÕES ---------------- */
function notifEmail(){ return (D.user&&D.user.email)||""; }
function notifAll(){
  const fromStore = window.SBSStore ? window.SBSStore.getCol("notificacoes") : [];
  const base = fromStore.length ? fromStore : (D.notificacoes||[]).map((n,i)=>({id:"seed"+i, ...n, destino:"todos"}));
  const email = notifEmail();
  return base.filter(n=>!n.destino || n.destino==="todos" || n.destino===email);
}
function notifReadSet(){ try{ return JSON.parse(localStorage.getItem("sbs_notif_read:"+notifEmail())||"[]"); }catch(e){ return []; } }
function notifMarkRead(ids){ const s=new Set(notifReadSet()); ids.forEach(i=>s.add(i)); try{ localStorage.setItem("sbs_notif_read:"+notifEmail(), JSON.stringify([...s])); }catch(e){} }
function notifConfirmado(id){
  return (window.SBSStore?window.SBSStore.getCol("notif_confirmacoes"):[]).some(c=>c.notifId===id && (c.email||"").toLowerCase()===notifEmail().toLowerCase());
}
function notifConfirmar(id){
  if(!window.SBSStore) return;
  if(notifConfirmado(id)) return;
  window.SBSStore.add("notif_confirmacoes", { notifId:id, email:notifEmail(), nome:(D.user&&D.user.name)||"", data:window.SBSStore.today(), hora:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) });
  // avisa o remetente que o destinatário visualizou
  const orig = notifAll().find(n=>n.id===id) || (window.SBSStore.getCol("notificacoes").find(n=>n.id===id));
  if(orig && orig.de && orig.de.toLowerCase()!==notifEmail().toLowerCase()){
    const hora=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    window.SBSStore.add("notificacoes", {
      title:"Recebimento confirmado",
      text:((D.user&&D.user.name)||"O destinatário")+' visualizou: "'+(orig.title||"sua notificação")+'" às '+hora+".",
      tipo:"geral", icon:"check-check", destino:orig.de, data:window.SBSStore.today(), de:notifEmail(), leituraDe:id });
  }
}
window.SBS_notifUnread = function(){ const r=new Set(notifReadSet()); return notifAll().filter(n=>!r.has(n.id)).length; };

S.notificacoes = {
  title: "Notificações",
  render(){
    const tone = {campanha:"good", comissao:"info", credito:"danger", geral:"info", aviso:"warn"};
    const list = notifAll();
    const read = new Set(notifReadSet());
    const unread = list.filter(n=>!read.has(n.id)).length;
    return `
    <div class="row-between" style="margin:4px 4px 12px">
      <span class="muted" id="nt-count" style="font-size:12.5px;font-weight:700">${unread} não lidas</span>
      ${unread?`<a class="link" id="nt-read">Marcar todas como lidas</a>`:""}
    </div>
    <div id="nt-list">
    ${list.length? list.map(n=>{
      const isRead = read.has(n.id);
      const confirmado = notifConfirmado(n.id);
      const direcionada = n.destino && n.destino!=="todos"; // notificação individual
      return `
      <div class="alert ${tone[n.tipo]||'info'} ${isRead?'read':''}">
        <span class="a-ic"><i data-lucide="${n.icon||'bell'}"></i></span>
        <div style="flex:1"><div class="a-t">${n.title} ${!isRead?'<span class="ndot"></span>':''}</div><div class="a-x">${n.text}</div>
          ${(n.link||n.anexo)?`<div class="nt-actions">
            ${n.link?`<a class="nt-btn" href="${n.link}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Abrir link</a>`:""}
            ${n.anexo?`<a class="nt-btn" href="${n.anexo.dataUrl||'#'}" target="_blank" rel="noopener" download="${n.anexo.name||'anexo'}"><i data-lucide="paperclip"></i> ${n.anexo.name||'Anexo'}</a>`:""}
          </div>`:""}
          <div class="a-time">${n.data||n.time||''}${n.de?' · de '+(n.de.split('@')[0]):''}</div>
          ${direcionada?(confirmado
            ? `<div class="nt-confirmado"><i data-lucide="check-check"></i> Recebimento confirmado</div>`
            : `<button class="nt-confirm" data-confirm="${n.id}"><i data-lucide="badge-check"></i> Confirmar recebimento</button>`):""}
        </div>
      </div>`; }).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma notificação.</div>`}
    </div>
    <div class="note" style="margin-top:14px"><i data-lucide="send"></i><span>As notificações são enviadas pela equipe SBS através do painel gerencial.</span></div>`;
  },
  mount(root){
    const list = notifAll();
    root.querySelectorAll("[data-confirm]").forEach(b=>b.addEventListener("click",()=>{
      notifConfirmar(b.dataset.confirm);
      window.SBS_sound && window.SBS_sound("confirm");
      window.SBS.toast("Recebimento confirmado");
      window.SBS.go("notificacoes");
    }));
    const btn = root.querySelector("#nt-read");
    if(btn) btn.addEventListener("click",()=>{
      notifMarkRead(list.map(n=>n.id));
      window.SBS.go("notificacoes");
    });
    // ao abrir, marca como lidas (limpa o sino) após um instante
    setTimeout(()=>{ notifMarkRead(list.map(n=>n.id)); window.SBS.updateBell(); }, 1200);
  }
};

/* ---------------- FRETE ---------------- */
S.frete = {
  title: "Cálculo de Frete",
  render(){ return `
    <div class="field-2">
      <div class="field"><label>CEP origem</label><input value="47800-000" inputmode="numeric"></div>
      <div class="field"><label>CEP destino</label><input placeholder="00000-000" inputmode="numeric"></div>
    </div>
    <div class="field-2">
      <div class="field"><label>Volume (sacas)</label><input placeholder="Ex.: 300" inputmode="numeric"></div>
      <div class="field"><label>Modalidade</label><select><option>CIF (por conta SBS)</option><option>FOB (por conta cliente)</option></select></div>
    </div>
    <button class="btn" id="fr-calc"><i data-lucide="calculator"></i> Estimar frete</button>
    <div id="fr-out" style="margin-top:14px"></div>
    <div class="note" style="margin-top:14px"><i data-lucide="info"></i><span>Estimativa simulada. A cotação oficial é gerada via chamado para a logística.</span></div>
    <button class="btn outline" data-toast="Abrindo chamado de frete na logística..." style="margin-top:12px"><i data-lucide="headset"></i> Abrir chamado de frete</button>`;
  },
  mount(root){
    root.querySelector("#fr-calc").addEventListener("click",()=>{
      window.Gam&&window.Gam.award("frete");
      root.querySelector("#fr-out").innerHTML = `
        <div class="sim-result">
          <div style="font-weight:800;font-size:15px">Frete estimado</div>
          <div class="sr-grid"><div class="sr-box"><div class="sr-l">Valor total</div><div class="sr-v">R$ 4.180</div></div>
          <div class="sr-box"><div class="sr-l">Por saca</div><div class="sr-v">R$ 13,93</div></div></div>
          <div class="sr-big" style="margin-top:12px">Prazo estimado: 3 a 5 dias úteis</div>
        </div>`;
      window.lucide&&lucide.createIcons();
    });
  }
};

/* ---------------- CARGAS ---------------- */
S.cargas = {
  title: "Consulta de Carga",
  render(){ return `
    <div class="search"><i data-lucide="search"></i><input id="cg-q" placeholder="Buscar por nº da carga ou cliente"></div>
    <div id="cg-list" class="stack"></div>`;
  },
  mount(root){
    window.Gam&&window.Gam.awardOnce("carga");
    const statusMap = {entregue:["b-good","Entregue"], transito:["b-info","Em trânsito"], producao:["b-warn","Em produção"]};
    function draw(){
      const q=(root.querySelector("#cg-q").value||"").toLowerCase();
      const res=D.cargas.filter(c=>!q||c.id.toLowerCase().includes(q)||c.cliente.toLowerCase().includes(q));
      root.querySelector("#cg-list").innerHTML = res.map(c=>`
        <div class="card" style="margin-bottom:12px">
          <div class="row-between"><div><div style="font-weight:800;font-size:15px">${c.id}</div>
            <div class="muted" style="font-size:12.5px;margin-top:2px">${c.cliente} · ${c.produto}</div></div>
            <span class="badge ${statusMap[c.status][0]}">${statusMap[c.status][1]}</span></div>
          <div class="progress" style="margin:12px 0 4px"><span style="width:${c.prog}%"></span></div>
          <div class="muted" style="font-size:11.5px;font-weight:700">${c.eta}</div>
          <div class="track" style="margin-top:14px">
            ${c.etapas.map((e,i)=>`<div class="tstep ${e[1]!=="—"?'done':''}"><div class="ts-t">${e[0]}</div><div class="ts-d">${e[1]}</div></div>`).join("")}
          </div>
        </div>`).join("") || `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma carga encontrada.</div>`;
      window.lucide&&lucide.createIcons();
    }
    root.querySelector("#cg-q").addEventListener("input",draw);
    draw();
  }
};

/* ---------------- CONFIGURAÇÕES ---------------- */
S.config = {
  title: "Configurações",
  render(){ const u=D.user; return `
    <div class="profile-head">
      <label class="avatar-edit">
        <div class="avatar">${u.initials}</div>
        <span class="avatar-cam"><i data-lucide="camera"></i></span>
        <input type="file" accept="image/*" hidden id="cfg-avatar-input">
      </label>
      <div style="min-width:0;flex:1"><div style="font-weight:800;font-size:17px">${u.name}</div>
        <div class="muted" style="font-size:12.5px">${u.role}</div>
        <div class="muted" style="font-size:12.5px;word-break:break-all">${u.email||u.region}</div>
        <div style="display:flex;gap:14px;margin-top:7px">
          <span class="link" id="cfg-avatar-pick">Alterar foto</span>
          <span class="link" id="cfg-avatar-remove" style="color:var(--muted)">Remover</span>
        </div>
      </div>
    </div>
    <div class="section-title" style="margin-top:4px">Preferências</div>
    <div class="set-group">
      <div class="set-row"><span class="s-ic"><i data-lucide="bell"></i></span><div class="s-info"><div class="s-t">Notificações push</div><div class="s-s">Alertas comerciais e cargas</div></div><div class="toggle on" data-toggle></div></div>
      <div class="set-row"><span class="s-ic"><i data-lucide="wifi-off"></i></span><div class="s-info"><div class="s-t">Modo offline</div><div class="s-s">Salvar conteúdo para uso em campo</div></div><div class="toggle on" data-toggle></div></div>
      <div class="set-row"><span class="s-ic"><i data-lucide="fingerprint"></i></span><div class="s-info"><div class="s-t">Login por biometria</div><div class="s-s">Face ID / digital</div></div><div class="toggle" data-toggle></div></div>
    </div>
    <div class="section-title">Conta</div>
    <div class="set-group">
      <div class="set-row" data-toast="Sincronizando dados..."><span class="s-ic"><i data-lucide="refresh-cw"></i></span><div class="s-info"><div class="s-t">Sincronizar dados</div><div class="s-s">Última: hoje 08:12</div></div><i data-lucide="chevron-right" style="color:var(--muted)"></i></div>
      <div class="set-row" data-toast="Abrindo suporte..."><span class="s-ic"><i data-lucide="life-buoy"></i></span><div class="s-info"><div class="s-t">Ajuda e suporte</div></div><i data-lucide="chevron-right" style="color:var(--muted)"></i></div>
      <div class="set-row" data-action="tour"><span class="s-ic"><i data-lucide="graduation-cap"></i></span><div class="s-info"><div class="s-t">Tour do app</div><div class="s-s">Rever a apresentação inicial</div></div><i data-lucide="chevron-right" style="color:var(--muted)"></i></div>
      <div class="set-row" data-action="logout"><span class="s-ic" style="background:var(--danger-bg);color:var(--danger)"><i data-lucide="log-out"></i></span><div class="s-info"><div class="s-t" style="color:var(--danger)">Sair</div></div></div>
    </div>
    <div class="muted" style="text-align:center;font-size:11px;margin-top:8px">SBS Green Seeds · Portal do Vendedor v1.0</div>`;
  },
  mount(root){
    root.querySelectorAll("[data-toggle]").forEach(t=>t.addEventListener("click",()=>t.classList.toggle("on")));
    /* foto do vendedor (avatar editável) */
    const inp = root.querySelector("#cfg-avatar-input");
    root.querySelector("#cfg-avatar-pick") && root.querySelector("#cfg-avatar-pick").addEventListener("click",()=>inp&&inp.click());
    inp && inp.addEventListener("change",e=>{
      const f = e.target.files && e.target.files[0]; if(!f) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        const img = new Image();
        img.onload = ()=>{
          const size=256, c=document.createElement("canvas"); c.width=size; c.height=size;
          const ctx=c.getContext("2d");
          const min=Math.min(img.width,img.height), sx=(img.width-min)/2, sy=(img.height-min)/2;
          ctx.drawImage(img,sx,sy,min,min,0,0,size,size);
          try{ localStorage.setItem("sbs_avatar:"+(D.user.email||""), c.toDataURL("image/jpeg",0.85)); }catch(err){}
          window.SBS_avatar && window.SBS_avatar();
          window.SBS.toast("Foto atualizada");
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(f);
    });
    root.querySelector("#cfg-avatar-remove") && root.querySelector("#cfg-avatar-remove").addEventListener("click",()=>{
      try{ localStorage.removeItem("sbs_avatar:"+(D.user.email||"")); }catch(err){}
      window.SBS_avatar && window.SBS_avatar();
      window.SBS.toast("Foto removida");
    });
  }
};

/* ---------------- MINHA EQUIPE (supervisão — regional/nacional) ---------------- */
S.equipe = {
  title: "Minha Equipe",
  render(){
    const u = D.user, ORG = window.SBS_ORG;
    if(!ORG || !["regional","nacional","admin"].includes(u.papel))
      return `<div class="card" style="text-align:center;color:var(--muted)">Acesso exclusivo de gestores.</div>`;
    const visitas = window.SBSStore ? window.SBSStore.getCol("visitas") : [];
    const mes = (window.SBSStore?window.SBSStore.today():"").slice(3,5);
    function statsDe(p){
      const vs = visitas.filter(v=>(v.email&&v.email.toLowerCase()===p.email.toLowerCase()) || (v.vendedor&&v.vendedor.toUpperCase()===p.nome.toUpperCase()));
      const noMes = vs.filter(v=>(v.data||"").slice(3,5)===mes).length;
      const ult = vs[0] ? vs[0].data : "—";
      return { total:vs.length, noMes, ult };
    }
    function card(p){
      const s = statsDe(p);
      const parts = p.nome.split(" ");
      const ini = ((parts[0]&&parts[0][0])||"")+((parts[1]&&parts[1][0])||"");
      return `<div class="team-row">
        <span class="team-av">${ini.toUpperCase()}</span>
        <div class="team-info">
          <div class="team-name">${p.nome}</div>
          <div class="team-meta">${s.noMes} visitas no mês · ${s.total} no total · última ${s.ult}</div>
        </div>
        <button class="team-bell" data-notify="${p.email}" title="Notificar"><i data-lucide="send"></i></button>
      </div>`;
    }
    let blocks = "";
    if(u.papel==="regional"){
      const time = ORG.supervisoresDe(u.email);
      blocks = `<div class="section-title">Meus supervisores · ${time.length}</div>
        <div class="card" style="padding:6px 14px">${time.map(card).join("")||'<div class="muted" style="padding:14px;text-align:center">Sem supervisores vinculados.</div>'}</div>`;
    } else {
      ORG.regionais().forEach(r=>{
        const time = ORG.supervisoresDe(r.email);
        blocks += `<div class="section-title">${r.nome} · ${time.length}</div>
          <div class="card" style="padding:6px 14px">${time.map(card).join("")}</div>`;
      });
    }
    const totVis = visitas.length;
    return `
    <div class="hero" style="background:linear-gradient(150deg,var(--green-800),var(--green-600))">
      <div class="uname" style="font-size:18px">Supervisão de equipe</div>
      <div class="urole" style="opacity:.9">${u.papel==="regional"?"Acompanhe seus supervisores":"Visão nacional — todas as regionais"}</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${totVis}</div><div class="hs-l">visitas da equipe</div></div>
        <div class="hero-stat"><div class="hs-v">${visitas.filter(v=>v.autenticada).length}</div><div class="hs-l">autenticadas</div></div>
        <div class="hero-stat"><div class="hs-v">${u.papel==="regional"?ORG.supervisoresDe(u.email).length:ORG.todosSupervisores().length}</div><div class="hs-l">na equipe</div></div>
      </div>
    </div>
    ${blocks}
    <div id="eq-notify"></div>`;
  },
  mount(root){
    root.querySelectorAll("[data-notify]").forEach(b=>b.addEventListener("click",()=>{
      const email=b.dataset.notify;
      const nome=(window.SBS_ORG.get(email)||{}).nome||email;
      const box=root.querySelector("#eq-notify");
      box.innerHTML=`<div class="card" style="margin-top:14px">
        <div style="font-weight:800;font-size:14.5px;margin-bottom:4px">Notificar ${nome}</div>
        <div class="muted" style="font-size:12px;margin-bottom:12px">Chega no app do supervisor, no sino.</div>
        <div class="field"><label>Tipo</label><select id="eqn-tipo"><option value="aviso">Cobrança / aviso</option><option value="geral">Comunicado</option><option value="campanha">Oportunidade</option></select></div>
        <div class="field"><label>Mensagem</label><textarea id="eqn-msg" placeholder="Ex.: Precisamos das visitas da semana lançadas até sexta."></textarea></div>
        <button class="btn" id="eqn-send"><i data-lucide="send"></i> Enviar para ${nome.split(" ")[0]}</button>
      </div>`;
      window.lucide&&lucide.createIcons();
      root.querySelector("#eqn-send").addEventListener("click",()=>{
        const msg=root.querySelector("#eqn-msg").value.trim();
        const tipo=root.querySelector("#eqn-tipo").value;
        if(!msg){ window.SBS.toast("Escreva a mensagem"); return; }
        if(window.SBSStore){ window.SBSStore.add("notificacoes",{
          title:(D.user.role||"Gestão")+": "+D.user.name, text:msg, tipo:tipo, icon:tipo==="aviso"?"alert-triangle":"bell",
          destino:email, data:window.SBSStore.today(), de:D.user.email }); }
        window.SBS.toast("Notificação enviada para "+nome.split(" ")[0]);
        box.innerHTML="";
      });
    }));
  }
};

/* ---------------- CICLO DO PEDIDO (validações p/ consulta) ---------------- */
S.ciclo = {
  title: "Ciclo do Pedido",
  render(){
    const etapas = [
      { ic:"file-edit",     t:"1. Cotação / Pedido",      d:"Vendedor monta o pedido no sistema com produtos, volume e condição.", val:["Cadastro do cliente completo","Produtos e quantidades conferidos"] },
      { ic:"pen-line",      t:"2. Assinatura do pedido",  d:"Pedido assinado pelo cliente (física ou digital) antes de seguir.", val:["Assinatura do cliente obrigatória","Validação do responsável legal"], crit:true },
      { ic:"folder-check",  t:"3. Documentação",          d:"Documentos de cadastro e crédito anexados e validados.", val:["CPF/CNPJ e contrato social","Comprovantes e garantias (quando aplicável)"], crit:true },
      { ic:"landmark",      t:"4. Aprovação de crédito",  d:"Análise de crédito e liberação do limite.", val:["Sem títulos vencidos","Limite disponível para o pedido"] },
      { ic:"factory",       t:"5. Produção / Separação",  d:"Pedido entra em produção e separação no CD.", val:["Estoque confirmado","Lote reservado"] },
      { ic:"truck",         t:"6. Faturamento e entrega", d:"Emissão da NF e expedição da carga ao cliente.", val:["NF emitida em até 48h","Prazo de entrega acordado"] },
    ];
    const prazos = [
      { ic:"clock",        t:"Tempo de resposta",       v:"até 24h", d:"Retorno ao cliente após a solicitação do pedido." },
      { ic:"pen-line",     t:"Assinatura do pedido",    v:"obrigatória", d:"Sem assinatura, o pedido não avança para crédito." },
      { ic:"calendar-days",t:"Dias para entrega",       v:"5 a 10 dias", d:"Contados a partir do faturamento, conforme região." },
      { ic:"file-check",   t:"Faturamento",             v:"até 48h", d:"Após aprovação de crédito e confirmação de estoque." },
    ];
    return `
    <div class="note" style="margin:2px 2px 16px"><i data-lucide="info"></i><span>Referência de consulta: etapas, validações e prazos do pedido SBS.</span></div>

    <div class="section-title" style="margin-top:0">Etapas e validações</div>
    <div class="ciclo">
      ${etapas.map((e)=>`
        <div class="ciclo-step ${e.crit?'crit':''}">
          <span class="cs-ic"><i data-lucide="${e.ic}"></i></span>
          <div class="cs-body">
            <div class="cs-t">${e.t} ${e.crit?'<span class="badge b-warn" style="font-size:9px">validação crítica</span>':''}</div>
            <div class="cs-d">${e.d}</div>
            <ul class="cs-val">${e.val.map(v=>`<li><i data-lucide="check"></i>${v}</li>`).join("")}</ul>
          </div>
        </div>`).join("")}
    </div>

    <div class="section-title">Prazos e regras</div>
    <div class="kpi-grid">
      ${prazos.map(p=>`
        <div class="kpi">
          <div class="top"><span class="kic"><i data-lucide="${p.ic}"></i></span></div>
          <div><div class="kv" style="font-size:16px">${p.v}</div><div class="kl">${p.t}</div></div>
          <div class="ksub">${p.d}</div>
        </div>`).join("")}
    </div>

    <div class="section-title">Atenção — efeito negativo</div>
    <div class="card" style="border-left:4px solid var(--danger)">
      <div style="font-weight:800;font-size:14px;margin-bottom:8px;color:var(--danger)"><i data-lucide="alert-triangle" style="width:16px;height:16px;vertical-align:-3px"></i> O que trava ou atrasa o pedido</div>
      <ul class="doc-list">
        <li><i data-lucide="x" style="color:var(--danger)"></i><span>Pedido <b>sem assinatura</b> do cliente — não avança para crédito.</span></li>
        <li><i data-lucide="x" style="color:var(--danger)"></i><span><b>Documentação incompleta</b> — suspende a análise de crédito.</span></li>
        <li><i data-lucide="x" style="color:var(--danger)"></i><span>Cliente com <b>título vencido</b> — bloqueia novos pedidos.</span></li>
        <li><i data-lucide="x" style="color:var(--danger)"></i><span><b>Estoque não confirmado</b> — atrasa produção e entrega.</span></li>
      </ul>
    </div>`;
  }
};

})();
