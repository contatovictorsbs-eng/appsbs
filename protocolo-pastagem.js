/* ===========================================================
   SBS — Protocolo de Atendimento a Reclamação
   Abertura / Renovação de Pastagem (formulário técnico completo)
   Registra na coleção "reclamacoes" com tipo + detalhes estruturados.
   Usa os helpers globais expostos por screens2.js:
     window.photoPicker / wirePhotoPicker / getPhotos / getFiles
   =========================================================== */
(function(){
  const S = window.Screens;

  /* ---- chip group (seleção única ou múltipla) ---- */
  function chips(name, options, multi){
    return `<div class="chips chipset" data-name="${name}" data-multi="${multi?1:0}">
      ${options.map(o=>`<button type="button" class="chip" data-v="${o}">${o}</button>`).join("")}
    </div>`;
  }
  function sec(title, inner){
    return `<div class="card proto-sec"><div class="proto-sec-t">${title}</div>${inner}</div>`;
  }
  const f  = (label, id, ph, attr) => `<div class="field"><label>${label}</label><input id="${id}" placeholder="${ph||""}" ${attr||""}></div>`;
  const f2 = (a,b) => `<div class="field-2">${a}${b}</div>`;
  const fdate = (label,id) => `<div class="field"><label>${label}</label><input id="${id}" type="date"></div>`;
  const fchips = (label, name, options, multi) => `<div class="field"><label>${label}</label>${chips(name,options,multi)}</div>`;

  S.protocoloPastagem = {
    title: "Protocolo · Renovação de Pastagem",
    render(){ return `
      <div class="note ok"><i data-lucide="sprout"></i><span>Protocolo de atendimento a reclamação — abertura de renovação de pastagem. Preencha o máximo de informações e anexe fotos/laudos para acelerar a análise técnica.</span></div>

      <form id="pg-form" autocomplete="off">

        ${sec("Informações básicas", `
          ${f("Nome do cliente","pg-cliente","Cliente / fazenda","required")}
          ${f2(f("CPF / CNPJ","pg-doc","000.000.000-00",'inputmode="numeric"'), f("Nº da NF","pg-nf","Nota fiscal"))}
          ${f2(f("Propriedade","pg-prop","Nome da propriedade"), f("Propriedade de plantio","pg-propplantio","Talhão / gleba"))}
          ${f("Município / UF","pg-municipio","Cidade / UF")}
          ${f2(f("Cultivar","pg-cultivar","Ex.: Xaraés, Zuri"), f("Lote","pg-lote","Nº do lote"))}
          ${f2(f("Peso da embalagem","pg-peso","Ex.: 10 kg"), f("VC (%)","pg-vc","Valor cultural"))}
          ${f2(f("Nº de sacos","pg-sacos","Quantidade",'inputmode="numeric"'), f("Validade","pg-validade","MM/AAAA"))}
          ${f("Representante","pg-rep","Nome do representante")}
          ${f2(fdate("Data da entrega das sementes","pg-dtentrega"), fdate("Data de plantio","pg-dtplantio"))}
          ${fdate("Data da reclamação","pg-dtreclamacao")}
          ${f2(f("Supervisor","pg-sup","Nome"), f("Gerente","pg-ger","Nome"))}
          ${fchips("Foi realizado Gerbox?","gerbox",["Sim","Não"])}
          ${fchips("Sobra de semente?","sobra",["Sim","Não"])}
          ${f("Local de armazenamento (se houve sobra)","pg-localarm","Ex.: Barracão")}
          ${fchips("Condição de armazenamento","condarm",["Boa","Ruim"])}
        `)}

        ${sec("Dados da área", `
          ${f2(f("Área total da reforma (ha)","pg-areatotal","Ex.: 1400",'inputmode="decimal"'), f("Área com problema (ha)","pg-areaproblema","Ex.: 546",'inputmode="decimal"'))}
          ${fchips("Preparo de solo","preparo",["Grade pesada","Grade intermediária","Grade niveladora"],true)}
          ${f2(f("Nº de passadas (geral)","pg-passadas","Ex.: 2",'inputmode="numeric"'), f("Dias entre preparo e plantio","pg-diasprep","Ex.: 7",'inputmode="numeric"'))}
          ${fchips("Método de plantio","metodo",["A lanço c/ incorporação","Em linha","A lanço s/ incorporação","Consórcio simultâneo","Aéreo"])}
          ${f2(f("Semente utilizada (kg/ha)","pg-kgha","Ex.: 20",'inputmode="decimal"'), "")}
          ${fchips("Tipo de área","tipoarea",["Abertura","Reforma"])}
          ${fchips("Problemas com insetos","insetos",["Cupim","Formigas","Cigarrinhas","Percevejo","Lagarta","Outras"],true)}
          ${f("Total de chuvas acumuladas — plantio → reclamação (mm)","pg-chuvas","Ex.: 320",'inputmode="decimal"')}
          ${fchips("Armazenamento das sementes","armzcond",["Sobre lonas","Livre do contato do solo","Livre do contato da parede","Boa ventilação"],true)}
          ${fchips("Ventilação do armazém","ventilacao",["Boa","Ruim"])}
          ${fchips("Cultura anterior","cultura",["Pastagem","Abertura","Lavoura"])}
          ${f("Espécie (se cultura anterior = pastagem)","pg-especie","Ex.: Brachiária")}
          ${fchips("Topografia da área","topografia",["Plana","Médio declive","Alto declive"])}
          ${fchips("Condições da plantadeira / semeadeira","plantadeira",["Boa","Razoável","Ruim"])}
          ${f("Implemento usado na incorporação","pg-implemento","Ex.: Grade niveladora")}
          ${fchips("Profundidade de plantio adequada?","profundidade",["Sim","Não"])}
          ${f("Stand atual (plantas/m²)","pg-stand","Ex.: 8",'inputmode="decimal"')}
          ${fchips("Utilizou herbicida p/ daninhas?","herbicida",["Sim","Não"])}
          ${f2(f("Dias após a emergência","pg-diasemerg","Ex.: 25",'inputmode="numeric"'), f("Ingrediente ativo","pg-ingrediente","Ex.: Glifosato"))}
        `)}

        ${sec("Outras informações", `
          <div class="field"><label>Observações / relato detalhado</label><textarea id="pg-obs" placeholder="Descreva a visita, áreas replantadas, percentual afetado, variedades com problema, amostras coletadas, sistema de plantio..."></textarea></div>
        `)}

        ${sec("Fotos e anexos", `
          <div class="proto-photos-hint">Recomendado: áreas baixas e altas, plantadeira/semeadeira, curvas de nível, próximo a árvores, cupins, formigueiros, solo e armazenamento. Anexe também laudos (PDF).</div>
          ${window.photoPicker("pgt",{files:true})}
        `)}

        <button class="btn" type="submit"><i data-lucide="send"></i> Abrir protocolo</button>
      </form>

      <div class="note" style="margin-top:14px"><i data-lucide="info"></i><span>O protocolo é registrado e segue o fluxo Vendedor → Assist. Técnica → Qualidade → Retorno. Você acompanha o andamento pelo painel.</span></div>
    `;
    },
    mount(root){
      window.wirePhotoPicker(root, "pgt");

      // chip groups (single / multi)
      root.querySelectorAll(".chipset").forEach(group=>{
        const multi = group.dataset.multi==="1";
        group.addEventListener("click", e=>{
          const b = e.target.closest(".chip"); if(!b) return;
          if(multi){ b.classList.toggle("on"); }
          else { group.querySelectorAll(".chip").forEach(c=>c.classList.remove("on")); b.classList.add("on"); }
        });
      });

      const val = id => { const el = root.querySelector("#"+id); return el ? el.value.trim() : ""; };
      const chipVal = name => {
        const g = root.querySelector('.chipset[data-name="'+name+'"]'); if(!g) return "";
        const on = g.querySelector(".chip.on"); return on ? on.dataset.v : "";
      };
      const chipMulti = name => {
        const g = root.querySelector('.chipset[data-name="'+name+'"]'); if(!g) return [];
        return [...g.querySelectorAll(".chip.on")].map(c=>c.dataset.v);
      };

      root.querySelector("#pg-form").addEventListener("submit", e=>{
        e.preventDefault();
        const u = (window.DATA && window.DATA.user) || {};
        const proto = "RP-"+Math.floor(1000+Math.random()*9000);

        const secoes = [
          { secao:"Informações básicas", itens:[
            ["Nº da NF", val("pg-nf")], ["Propriedade", val("pg-prop")], ["Propriedade de plantio", val("pg-propplantio")],
            ["Peso da embalagem", val("pg-peso")], ["VC (%)", val("pg-vc")], ["Nº de sacos", val("pg-sacos")], ["Validade", val("pg-validade")],
            ["Representante", val("pg-rep")], ["Data de entrega", val("pg-dtentrega")], ["Data de plantio", val("pg-dtplantio")],
            ["Data da reclamação", val("pg-dtreclamacao")], ["Supervisor", val("pg-sup")], ["Gerente", val("pg-ger")],
            ["Gerbox realizado", chipVal("gerbox")], ["Sobra de semente", chipVal("sobra")],
            ["Local de armazenamento", val("pg-localarm")], ["Condição de armazenamento", chipVal("condarm")],
          ]},
          { secao:"Dados da área", itens:[
            ["Área total da reforma (ha)", val("pg-areatotal")], ["Área com problema (ha)", val("pg-areaproblema")],
            ["Preparo de solo", chipMulti("preparo").join(", ")], ["Nº de passadas", val("pg-passadas")], ["Dias entre preparo e plantio", val("pg-diasprep")],
            ["Método de plantio", chipVal("metodo")], ["Semente utilizada (kg/ha)", val("pg-kgha")], ["Tipo de área", chipVal("tipoarea")],
            ["Problemas com insetos", chipMulti("insetos").join(", ")], ["Chuvas acumuladas (mm)", val("pg-chuvas")],
            ["Armazenamento das sementes", chipMulti("armzcond").join(", ")], ["Ventilação", chipVal("ventilacao")],
            ["Cultura anterior", chipVal("cultura")], ["Espécie anterior", val("pg-especie")],
            ["Topografia", chipVal("topografia")], ["Plantadeira / semeadeira", chipVal("plantadeira")],
            ["Implemento de incorporação", val("pg-implemento")], ["Profundidade adequada", chipVal("profundidade")],
            ["Stand atual (plantas/m²)", val("pg-stand")], ["Herbicida p/ daninhas", chipVal("herbicida")],
            ["Dias após a emergência", val("pg-diasemerg")], ["Ingrediente ativo", val("pg-ingrediente")],
          ]},
        ].map(s=>({ secao:s.secao, itens:s.itens.filter(([,v])=>v && v.length) }));

        const obs = val("pg-obs");
        const resumo = `Protocolo de Renovação de Pastagem · Cultivar ${val("pg-cultivar")||"—"} · Lote ${val("pg-lote")||"—"}.` + (obs?(" "+obs):"");

        if(window.SBSStore){
          window.SBSStore.add("reclamacoes", {
            protocolo: proto,
            tipo: "Renovação de Pastagem",
            cliente: val("pg-cliente"),
            doc: val("pg-doc"),
            produto: val("pg-cultivar") || "—",
            lote: val("pg-lote"),
            municipio: val("pg-municipio"),
            descricao: resumo,
            detalhes: secoes,
            fotos: window.getPhotos("pgt"),
            anexos: window.getFiles("pgt"),
            vendedor: u.name || "Vendedor",
            data: window.SBSStore.today(),
            status: "aberto",
            responsavel: "",
            etapa: "Vendedor",
          });
        }
        window.SBS.toast("Protocolo de pastagem aberto! #"+proto);
        window.Gam && window.Gam.award("reclamacao");
        setTimeout(()=>window.SBS.go("home"), 1100);
      });
    }
  };
})();
