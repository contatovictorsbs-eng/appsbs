/* ===========================================================
   SBS — Onboarding de primeiro acesso (tour com caixas de texto)
   Mostra uma sequência de cards explicando o app e cada
   funcionalidade. Roda só no 1º acesso (por usuário); pode
   ser reaberto em Configurações.
   =========================================================== */
(function(){
function papel(){ return (window.DATA && window.DATA.user && window.DATA.user.papel) || "supervisor"; }
function nome(){ return (window.DATA && window.DATA.user && window.DATA.user.first) || ""; }
function key(){ return "sbs_onboard:"+((window.DATA&&window.DATA.user&&window.DATA.user.email)||"anon"); }
function seen(){ try{ return localStorage.getItem(key())==="1"; }catch(e){ return false; } }
function markSeen(){ try{ localStorage.setItem(key(),"1"); }catch(e){} }

function steps(){
  const gestor = ["regional","nacional","admin"].includes(papel());
  const base = [
    { ic:"hand-heart", t:"Bem-vindo, "+nome()+"! 👋", d:"Este é o Portal do Vendedor SBS Green Seeds — tudo o que você precisa em campo, num só lugar. Vamos dar uma volta rápida (30s)." },
    { ic:"layout-dashboard", t:"Home & Dashboard", d:"Na Home ficam seus atalhos e seu nível. No Dashboard você acompanha metas, faturamento e ranking comercial." },
    { ic:"route", t:"Clientes & Rotas", d:"Sua carteira com contato (ligar, e-mail, mapa). Marque clientes e monte uma rota otimizada — o app evita que dois vendedores visitem a mesma cidade no mesmo dia." },
    { ic:"map", t:"Minhas Rotas + Check-in", d:"Veja suas rotas salvas e, ao chegar no cliente, toque em \u2018Cheguei\u2019. Seu gerente é avisado automaticamente da sua presença em campo." },
    { ic:"target", t:"Plano de Ação BS \u00d7 SBS", d:"Foque nos clientes certos: quem compra a concorrência (BS) e ainda n\u00e3o compra SBS, e quem ficou sem comprar. Marque \u2018em a\u00e7\u00e3o\u2019 e \u2018atendido\u2019." },
    { ic:"map-pin", t:"Visitas autenticadas", d:"Registre a visita com foto (c\u00e2mera) e check-in por GPS — fica tudo comprovado com data, hora e localiza\u00e7\u00e3o." },
    { ic:"calendar-check", t:"Proje\u00e7\u00e3o de Trabalho", d:"Planeje sua semana: visitas, prospec\u00e7\u00f5es e meta. A gest\u00e3o acompanha as proje\u00e7\u00f5es de todo o time." },
    { ic:"trophy", t:"Gamifica\u00e7\u00e3o", d:"Cada a\u00e7\u00e3o no app vale pontos: visitas, rotas, check-ins, prospec\u00e7\u00e3o e mais. Suba de n\u00edvel e dispute o ranking da equipe!" },
    { ic:"bell", t:"Notifica\u00e7\u00f5es", d:"Campanhas, avisos e cobran\u00e7as da gest\u00e3o chegam no sino \ud83d\udd14 do topo. Fique de olho." },
  ];
  if(gestor){
    base.splice(3,0,{ ic:"users-round", t:"Minha Equipe", d:"Como gestor, voc\u00ea acompanha seus supervisores: visitas, prospec\u00e7\u00e3o e rotas. E pode notificar cada um direto pelo app." });
    base.push({ ic:"line-chart", t:"Acompanhamento", d:"Vis\u00e3o consolidada da equipe — visitas por regional/supervisor, prospec\u00e7\u00e3o e conflitos de rota." });
  }
  base.push({ ic:"rocket", t:"Pronto para come\u00e7ar! \ud83d\ude80", d:"Voc\u00ea pode rever este tour quando quiser em Configura\u00e7\u00f5es \u2192 Tour do app. Bom trabalho!" });
  return base;
}

let idx=0, list=[];
function render(){
  const s=list[idx];
  const el=document.getElementById("onb");
  el.querySelector(".onb-ic").innerHTML = `<i data-lucide="${s.ic}"></i>`;
  el.querySelector(".onb-t").textContent = s.t;
  el.querySelector(".onb-d").textContent = s.d;
  el.querySelector(".onb-step").textContent = (idx+1)+" / "+list.length;
  el.querySelector(".onb-dots").innerHTML = list.map((_,i)=>`<span class="${i===idx?'on':''}"></span>`).join("");
  el.querySelector("#onb-prev").style.visibility = idx===0?"hidden":"visible";
  el.querySelector("#onb-next").innerHTML = idx===list.length-1
    ? 'Come\u00e7ar <i data-lucide="check"></i>'
    : 'Pr\u00f3ximo <i data-lucide="arrow-right"></i>';
  window.lucide&&lucide.createIcons();
}
function close(){
  const el=document.getElementById("onb"); if(el) el.remove();
  markSeen();
}
function open(force){
  if(!force && seen()) return;
  idx=0; list=steps();
  const dev=document.getElementById("device"); if(!dev) return;
  const old=document.getElementById("onb"); if(old) old.remove();
  const el=document.createElement("div"); el.id="onb"; el.className="onb";
  el.innerHTML=`
    <div class="onb-card">
      <button class="onb-skip" id="onb-skip">Pular</button>
      <div class="onb-ic"></div>
      <div class="onb-step"></div>
      <div class="onb-t"></div>
      <div class="onb-d"></div>
      <div class="onb-dots"></div>
      <div class="onb-nav">
        <button class="btn outline" id="onb-prev"><i data-lucide="arrow-left"></i></button>
        <button class="btn" id="onb-next">Pr\u00f3ximo</button>
      </div>
    </div>`;
  dev.appendChild(el);
  el.querySelector("#onb-skip").onclick=close;
  el.querySelector("#onb-prev").onclick=()=>{ if(idx>0){ idx--; render(); } };
  el.querySelector("#onb-next").onclick=()=>{ if(idx<list.length-1){ idx++; render(); } else close(); };
  render();
}

window.SBS_ONBOARD = { open, seen, markSeen };
})();
