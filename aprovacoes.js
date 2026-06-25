/* ===========================================================
   SBS — Aprovação de Pedidos (régua de desconto)
   Supervisor até 15% · +Regional 18% · +Nacional 20% · >20% CEO
   App: vendedor cria solicitação; cada nível aprova/recusa.
   Coleção: "aprovacoes". Notifica o próximo aprovador.
   =========================================================== */
(function(){
const D = window.DATA, S = window.Screens, ORG = window.SBS_ORG;
const fmtK = n => { n=Number(n)||0; return n>=1e6?("R$ "+(n/1e6).toFixed(1)+" mi"):n>=1e3?("R$ "+(n/1e3).toFixed(0)+" mil"):("R$ "+n.toLocaleString("pt-BR")); };

// régua: nível exigido conforme desconto
function nivelExigido(desc){
  if(desc<=15) return "supervisor";
  if(desc<=18) return "regional";
  if(desc<=20) return "nacional";
  return "ceo";
}
const NIVEL_LABEL = { supervisor:"Supervisor (15%)", regional:"Gerente Regional (18%)", nacional:"Gerente Nacional (20%)", ceo:"CEO (acima de 20%)" };
const CADEIA = ["supervisor","regional","nacional","ceo"];

// quem é o aprovador de cada nível para um dado solicitante
function aprovadorDe(nivel, email){
  if(!ORG) return null;
  if(nivel==="supervisor") return email; // o próprio supervisor (auto) — ou o supervisor do vendedor
  if(nivel==="regional") return ORG.gerenteDe(email) || (ORG.gerenteDe(ORG.gerenteDe(email)));
  if(nivel==="nacional"){ const r=ORG.regionais()[0]; const nac=ORG.PEOPLE.find(p=>p.papel==="nacional"); return nac?nac.email:null; }
  if(nivel==="ceo"){ const c=ORG.PEOPLE.find(p=>p.papel==="ceo"); return c?c.email:"thiago.maschietto@sbsgreen.com.br"; }
  return null;
}

// níveis que precisam aprovar (do solicitante até o exigido)
function cadeiaNecessaria(papelSolicitante, descNivel){
  const start = CADEIA.indexOf(papelSolicitante==="supervisor"?"regional":papelSolicitante);
  const end = CADEIA.indexOf(descNivel);
  const out=[];
  for(let i=Math.max(1,CADEIA.indexOf("regional")); i<=end; i++){ if(i>CADEIA.indexOf(papelSolicitante)) out.push(CADEIA[i]); }
  // simplificação: aprovadores acima do solicitante até o nível exigido
  return out.length?out:[descNivel];
}

function notifica(email, titulo, texto){
  if(email && window.SBSStore) window.SBSStore.add("notificacoes",{ title:titulo, text:texto, tipo:"aviso", icon:"badge-dollar-sign", destino:email, data:window.SBSStore.today(), de:(D.user&&D.user.email)||"" });
}

function statusInfo(a){
  if(a.status==="aprovado") return ["b-good","Aprovado"];
  if(a.status==="recusado") return ["b-danger","Recusado"];
  return ["b-warn","Aguardando "+ (NIVEL_LABEL[a.aguardando]||a.aguardando)];
}

window.SBS_APROV = { nivelExigido, NIVEL_LABEL, aprovadorDe, statusInfo };

S.aprovacoes = {
  title: "Aprovação de Pedidos",
  render(){
    const u = D.user;
    let all = window.SBSStore ? window.SBSStore.getCol("aprovacoes") : [];
    // o que eu vejo: minhas solicitações + as que aguardam minha aprovação
    const mine = all.filter(a=>(a.email||"").toLowerCase()===(u.email||"").toLowerCase());
    const paraMim = all.filter(a=>a.status==="pendente" && podeAprovar(u,a));
    const pendentes = paraMim.length;
    return `
    <div class="hero" style="background:linear-gradient(150deg,#0B6B61,#10B0A0)">
      <div class="uname" style="font-size:18px">Aprovação de Pedidos</div>
      <div class="urole" style="opacity:.92">Régua de desconto · 15% → 18% → 20% → CEO</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hs-v">${pendentes}</div><div class="hs-l">aguardam você</div></div>
        <div class="hero-stat"><div class="hs-v">${mine.length}</div><div class="hs-l">suas solicitações</div></div>
      </div>
    </div>

    <button class="btn" id="ap-new" style="margin-top:14px"><i data-lucide="plus"></i> Nova solicitação de desconto</button>
    <form id="ap-form" class="card" style="margin-top:14px;display:none">
      <div style="font-weight:800;font-size:14.5px;margin-bottom:12px">Solicitar liberação de desconto</div>
      <div class="field"><label>Cliente</label><input id="ap-cli" placeholder="Nome do cliente"></div>
      <div class="field-2">
        <div class="field"><label>Valor do pedido (R$)</label><input id="ap-val" inputmode="numeric" placeholder="Ex.: 120000"></div>
        <div class="field"><label>Desconto pedido (%)</label><input id="ap-desc" inputmode="decimal" placeholder="Ex.: 17"></div>
      </div>
      <div id="ap-nivel" class="ap-nivel"></div>
      <div class="field"><label>Justificativa</label><textarea id="ap-just" placeholder="Por que esse desconto é necessário..."></textarea></div>
      <button class="btn" type="submit"><i data-lucide="send"></i> Enviar para aprovação</button>
    </form>

    ${paraMim.length?`<div class="section-title">Aguardando sua aprovação</div>
      ${paraMim.map(a=>cardAprov(a,true)).join("")}`:""}

    <div class="section-title">Suas solicitações</div>
    ${mine.length? mine.slice().reverse().map(a=>cardAprov(a,false)).join("") : `<div class="card" style="text-align:center;color:var(--muted)">Nenhuma solicitação ainda.</div>`}`;
  },
  mount(root){
    const u=D.user;
    const form=root.querySelector("#ap-form");
    const nb=root.querySelector("#ap-new");
    if(nb) nb.addEventListener("click",()=>{ form.style.display=form.style.display==="none"?"block":"none"; });
    const descInp=root.querySelector("#ap-desc");
    const nivelBox=root.querySelector("#ap-nivel");
    function showNivel(){
      const d=parseFloat((descInp.value||"0").replace(",","."))||0;
      const nv=nivelExigido(d);
      nivelBox.innerHTML = d? `<div class="ap-needs ap-${nv}"><i data-lucide="shield-check"></i> Precisa de aprovação: <b>${NIVEL_LABEL[nv]}</b></div>`:"";
      window.lucide&&lucide.createIcons();
    }
    if(descInp) descInp.addEventListener("input",showNivel);
    if(form) form.addEventListener("submit",e=>{
      e.preventDefault();
      const g=id=>{ const el=root.querySelector(id); return el?el.value.trim():""; };
      const desc=parseFloat((g("#ap-desc")||"0").replace(",","."))||0;
      const nv=nivelExigido(desc);
      // primeiro aprovador necessário acima do solicitante
      const prox = proximoAprovador(u, nv);
      if(window.SBSStore){
        const rec = window.SBSStore.add("aprovacoes",{
          cliente:g("#ap-cli"), valor:parseInt((g("#ap-val")||"0").replace(/\D/g,""),10)||0, desconto:desc,
          justificativa:g("#ap-just"), nivelExigido:nv, solicitante:u.name, email:u.email, papel:u.papel,
          status:"pendente", aguardando:prox.nivel, aprovadorEmail:prox.email, historico:[], data:window.SBSStore.today() });
        notifica(prox.email, "Aprovação de desconto", u.name+" pediu "+desc+"% para "+g("#ap-cli")+". Sua aprovação é necessária.");
      }
      window.SBS.toast("Solicitação enviada para "+(NIVEL_LABEL[prox.nivel]||prox.nivel));
      form.reset(); form.style.display="none";
      window.SBS.go("aprovacoes");
    });
    root.addEventListener("click",e=>{
      const ap=e.target.closest("[data-ap-approve]"); const rc=e.target.closest("[data-ap-reject]");
      if(ap){ abrirAprovacao(ap.dataset.apApprove); }
      if(rc){ decidir(rc.dataset.apReject, false); }
    });
    function abrirAprovacao(id){
      const a=window.SBSStore.getCol("aprovacoes").find(x=>x.id===id); if(!a) return;
      const box=document.createElement("div"); box.className="cl-modal";
      box.innerHTML=`<div class="cl-sheet">
        <div class="cl-sheet-h"><div style="font-weight:800;font-size:15px">Liberar ${a.desconto}% · ${a.cliente||""}</div><button class="iconbtn" id="apx"><i data-lucide="x"></i></button></div>
        <div class="field"><label>Descrição da liberação</label><textarea id="ap-note" placeholder="Observação, condição ou justificativa da aprovação..."></textarea></div>
        <div class="field"><label>Imagem / comprovante <span class="muted" style="font-weight:600">(opcional)</span></label>
          <label class="pp-btn" style="justify-content:flex-start"><i data-lucide="image"></i> Anexar imagem<input type="file" accept="image/*" id="ap-img" hidden></label>
          <div id="ap-img-prev" style="margin-top:8px"></div>
        </div>
        <button class="btn" id="ap-ok"><i data-lucide="check"></i> Confirmar aprovação</button>
      </div>`;
      document.getElementById("device").appendChild(box);
      window.lucide&&lucide.createIcons();
      let imgData=null;
      const close=()=>box.remove();
      box.addEventListener("click",e=>{ if(e.target===box) close(); });
      box.querySelector("#apx").onclick=close;
      box.querySelector("#ap-img").onchange=e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
        r.onload=()=>{ const img=new Image(); img.onload=()=>{ const max=1000,sc=Math.min(1,max/Math.max(img.width,img.height));
          const cv=document.createElement("canvas"); cv.width=img.width*sc; cv.height=img.height*sc; cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          imgData=cv.toDataURL("image/jpeg",0.8);
          box.querySelector("#ap-img-prev").innerHTML=`<img src="${imgData}" style="width:90px;height:90px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow)">`;
        }; img.src=r.result; }; r.readAsDataURL(f); };
      box.querySelector("#ap-ok").onclick=()=>{ const note=box.querySelector("#ap-note").value.trim(); close(); decidir(id, true, note, imgData); };
    }
    function decidir(id, ok, note, imgData){
      const a=window.SBSStore.getCol("aprovacoes").find(x=>x.id===id); if(!a) return;
      const hist=(a.historico||[]).concat([{ nivel:a.aguardando, por:u.name, email:u.email, ok, nota:note||"", img:imgData||null, data:window.SBSStore.today() }]);
      if(!ok){
        window.SBSStore.update("aprovacoes",id,{status:"recusado",historico:hist});
        notifica(a.email,"Desconto recusado", (u.name)+" recusou o desconto de "+a.desconto+"% para "+a.cliente+".");
        window.SBS.toast("Solicitação recusada");
      } else {
        // próximo nível na régua?
        const prox = proximoNivelAcima(a.aguardando, a.nivelExigido, a);
        if(prox){
          window.SBSStore.update("aprovacoes",id,{aguardando:prox.nivel, aprovadorEmail:prox.email, historico:hist});
          notifica(prox.email,"Aprovação de desconto", a.solicitante+" · "+a.desconto+"% para "+a.cliente+". Sua aprovação é necessária.");
          window.SBS.toast("Aprovado — encaminhado para "+(NIVEL_LABEL[prox.nivel]||prox.nivel));
        } else {
          window.SBSStore.update("aprovacoes",id,{status:"aprovado", liberacaoNota:note||"", liberacaoImg:imgData||null, historico:hist});
          notifica(a.email,"Desconto aprovado", "Seu desconto de "+a.desconto+"% para "+a.cliente+" foi aprovado!"+(note?" Obs: "+note:""));
          window.SBS.toast("Desconto aprovado");
        }
      }
      window.SBS.go("aprovacoes");
    }
  }
};

/* ---- helpers de cadeia ---- */
function papelRank(p){ return CADEIA_INDEX[p]!=null?CADEIA_INDEX[p]:0; }
const CADEIA_INDEX = { supervisor:0, regional:1, nacional:2, ceo:3, admin:2 };
function proximoAprovador(u, nivelExig){
  // primeiro nível ACIMA do solicitante, limitado ao exigido
  const order=["supervisor","regional","nacional","ceo"];
  const startIdx = Math.max(CADEIA_INDEX[u.papel]!=null?CADEIA_INDEX[u.papel]:0, 0)+1;
  const needIdx = order.indexOf(nivelExig);
  for(let i=startIdx;i<=needIdx;i++){
    const nv=order[i]; const em=aprovadorParaNivel(nv,u.email);
    if(em) return {nivel:nv, email:em};
  }
  // se solicitante já é o nível exigido (ou acima), aprova direto o próprio nível exigido
  const nv=order[Math.max(needIdx,startIdx-1)]; return {nivel:nv, email:aprovadorParaNivel(nv,u.email)};
}
function proximoNivelAcima(atual, exigido, a){
  const order=["supervisor","regional","nacional","ceo"];
  const ai=order.indexOf(atual), ei=order.indexOf(exigido);
  if(ai>=ei) return null;
  const nv=order[ai+1]; return {nivel:nv, email:aprovadorParaNivel(nv, a.email)};
}
function aprovadorParaNivel(nivel, solicitanteEmail){
  if(!ORG) return null;
  if(nivel==="regional") return ORG.gerenteDe(solicitanteEmail) || (ORG.regionais()[0]||{}).email;
  if(nivel==="nacional"){ const n=ORG.PEOPLE.find(p=>p.papel==="nacional"); return n?n.email:null; }
  if(nivel==="ceo"){ const c=ORG.PEOPLE.find(p=>p.papel==="ceo"); return c?c.email:"thiago.maschietto@sbsgreen.com.br"; }
  if(nivel==="supervisor") return solicitanteEmail;
  return null;
}
function podeAprovar(u, a){
  return (a.aprovadorEmail && (a.aprovadorEmail||"").toLowerCase()===(u.email||"").toLowerCase())
      || (u.papel==="ceo" && a.aguardando==="ceo")
      || (u.papel==="nacional" && a.aguardando==="nacional");
}
function cardAprov(a, acionavel){
  const si=window.SBS_APROV.statusInfo(a);
  return `<div class="card ap-card" style="margin-bottom:10px">
    <div class="row-between"><div style="font-weight:800;font-size:14.5px">${a.cliente||"Cliente"}</div><span class="badge ${si[0]}">${si[1]}</span></div>
    <div class="pl-meta" style="margin-top:7px">
      <span><i data-lucide="badge-percent"></i><b>${a.desconto}%</b> desc.</span>
      <span><i data-lucide="banknote"></i>${fmtK2(a.valor)}</span>
      <span><i data-lucide="user-round"></i>${a.solicitante||""}</span>
    </div>
    ${a.justificativa?`<div class="a-x" style="margin-top:8px">${a.justificativa}</div>`:""}
    ${a.status==="aprovado"&&(a.liberacaoNota||a.liberacaoImg)?`<div class="ap-lib"><div class="ap-lib-h"><i data-lucide="badge-check"></i> Liberação</div>${a.liberacaoNota?`<div class="a-x">${a.liberacaoNota}</div>`:""}${a.liberacaoImg?`<a href="${a.liberacaoImg}" target="_blank" rel="noopener"><img src="${a.liberacaoImg}" class="ap-lib-img"></a>`:""}</div>`:""}
    ${acionavel&&a.status==="pendente"?`<div class="ap-actions">
      <button class="btn" data-ap-approve="${a.id}" style="flex:1"><i data-lucide="check"></i> Aprovar</button>
      <button class="btn outline" data-ap-reject="${a.id}" style="flex:1;color:var(--danger)"><i data-lucide="x"></i> Recusar</button>
    </div>`:""}
  </div>`;
}
function fmtK2(n){ n=Number(n)||0; return n>=1e6?("R$ "+(n/1e6).toFixed(1)+" mi"):n>=1e3?("R$ "+(n/1e3).toFixed(0)+" mil"):("R$ "+n.toLocaleString("pt-BR")); }

})();
