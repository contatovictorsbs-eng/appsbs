/* ===========================================================
   SBS Painel T.I. — Painéis & Apps (acesso master)
   Acesso rápido a todas as plataformas e seus módulos.
   A T.I. é o super-admin: abre qualquer painel/app direto.
   =========================================================== */
(function(){
  if(typeof TI==="undefined"||!TI.Modules) return;
  const S=TI.S, esc=TI.esc;

  const PLATS=[
    { id:"gerencial", nome:"Painel Gerencial", arq:"SBS Painel Gerencial.html", cor:"#0B6B61", icon:"layout-dashboard",
      mods:["Dashboard","Pedidos / Comissões","Aprovações","Vendedores","Mapa da Equipe","Reclamações","Chamados","Conteúdo do app","Central de Ajuda"] },
    { id:"ceo", nome:"Painel do CEO", arq:"SBS Painel CEO.html", cor:"#13241F", icon:"line-chart",
      mods:["Panorama","Comercial","Equipe em Campo","Atendimento","Adoção do App","Áreas (Mkt·P&D·RH)","Estado do Sistema"] },
    { id:"atendimento", nome:"Central de Atendimento", arq:"SBS Painel Atendimento.html", cor:"#15171A", icon:"headset",
      mods:["Caixa (operacional)","Indicadores","Canais","Agentes","Regras de roteamento"] },
    { id:"marketing", nome:"Painel de Marketing", arq:"SBS Painel Marketing.html", cor:"#6FA331", icon:"megaphone",
      mods:["Visão Geral","Campanhas","Materiais & Criativos","Calendário de Conteúdo","Redes & Canais","Eventos & Feiras"] },
    { id:"pd", nome:"Painel de P&D / Inovação", arq:"SBS Painel PD.html", cor:"#0E7E72", icon:"flask-conical",
      mods:["Visão Geral","Pipeline de Projetos","Ensaios de Campo","Cultivares","Banco de Ideias","Cronograma","Documentos"] },
    { id:"rh", nome:"Painel de RH", arq:"SBS Painel RH.html", cor:"#174D2F", icon:"users",
      mods:["Visão Geral","Vagas","Candidatos (DISC)","Canais & LinkedIn","Colaboradores","Endomarketing"] },
    { id:"vendedor", nome:"Portal do Vendedor", arq:"SBS Portal do Vendedor.html", cor:"#0B6B61", icon:"smartphone",
      mods:["Dashboard","Pedidos","Preços","Comissão","Frete","Clientes & Rotas","Campanhas","Materiais","Reclamações","Marketing"] },
    { id:"colaborador", nome:"Portal do Colaborador", arq:"SBS Portal do Colaborador.html", cor:"#0E9B8E", icon:"id-card",
      mods:["Início","Feed (rede social)","Mural","Agenda","Vagas internas","Notificações","Meus dados"] }
  ];

  function platOn(id){ if(!window.SBS_PLAT) return true; return SBS_PLAT.isEnabled(id); }

  TI.Modules.painres = {
    label:"Painéis & Apps",
    render(){
      return `
      <div class="ti-note info" style="margin-bottom:18px"><i data-lucide="key-round"></i> Acesso master da T.I. — abra qualquer painel ou app e todos os seus módulos. A T.I. enxerga e gerencia o sistema inteiro.</div>
      <div class="ti-launch">
        ${PLATS.map(p=>{
          const on=platOn(p.id);
          return `<div class="ti-lcard" style="--c:${p.cor}">
            <div class="ti-lc-h"><span class="ti-lc-ic" style="background:${p.cor}"><i data-lucide="${p.icon}"></i></span>
              <div class="ti-lc-t"><div class="ti-lc-n">${esc(p.nome)}</div><div class="ti-lc-s ${on?'on':'off'}">${on?'Ativa':'Em manutenção'}</div></div>
              <a class="ti-lc-go" href="${encodeURI(p.arq)}" target="_blank" rel="noopener" title="Abrir"><i data-lucide="external-link"></i></a>
            </div>
            <div class="ti-lc-mods">${p.mods.map(m=>`<span class="ti-lc-mod">${esc(m)}</span>`).join("")}</div>
          </div>`;
        }).join("")}
      </div>`;
    }
  };
})();
