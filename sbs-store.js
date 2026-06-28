/* ===========================================================
   SBS — Camada de dados compartilhada (app ↔ painel)
   --------------------------------------------------------
   Protótipo: persiste em localStorage sob o namespace "sbsdb:".
   Os dois lados (app do vendedor e painel gerencial) leem e
   gravam aqui — então editar no painel reflete no app, e o que
   o app envia (reclamações, chamados, visitas) aparece no painel.

   ▶ Para produção: troque os métodos read()/write() por chamadas
     à API/banco real. A interface (getCol/setCol/add/update) é a
     mesma — o resto do código não muda.
   =========================================================== */
(function(){
  const NS = (window.SBS_ENV && window.SBS_ENV.ns) || "sbsdb:";
  const VERSION = "1";

  function read(key, fallback){
    try{ const v = localStorage.getItem(NS+key); return v?JSON.parse(v):fallback; }
    catch(e){ return fallback; }
  }
  function write(key, val){
    try{ localStorage.setItem(NS+key, JSON.stringify(val)); }catch(e){}
    // avisa outras telas abertas (app/painel) que o dado mudou
    try{ window.dispatchEvent(new CustomEvent("sbsdb-change",{detail:{key}})); }catch(e){}
  }
  const uid = (p)=> (p||"id")+"-"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);
  const today = ()=> new Date().toLocaleDateString("pt-BR");

  /* ---------- SEED (primeira execução) ---------- */
  const PEDIDOS_VERSION = "pedcar-d1f06911";
  function seed(){
    // Pedidos / Comissões do TOTVS (pedcar.xlsx) — atualiza mesmo já semeado
    if(window.PEDIDOS && read("__pedidos_src")!==PEDIDOS_VERSION){
      write("pedidos", window.PEDIDOS.map(p=>({ id:uid("ped"), ...p })));
      if(window.PEDIDOS_META) write("pedidos_meta", window.PEDIDOS_META);
      write("__pedidos_src", PEDIDOS_VERSION);
    }
    if(read("__seeded")===VERSION) return;
    const D = window.DATA||{};
    const P = window.PRECOS||{};

    // preços (catálogos completos)
    if(P.catalogos && read("precos")==null) write("precos", P);

    // campanhas
    if(D.campanhas && read("campanhas")==null){
      write("campanhas", D.campanhas.map((c,i)=>({ id:uid("cmp"), ordem:i, ativo:c.status!=="Encerrada", ...c })));
    }
    // materiais
    if(D.materiais && read("materiais")==null){
      write("materiais", D.materiais.map((m,i)=>({ id:uid("mat"), ordem:i, ...m })));
    }
    // treinamentos
    if(D.treinamentos && read("treinamentos")==null){
      write("treinamentos", D.treinamentos.map((t,i)=>({ id:uid("tre"), ordem:i, link:"https://", ...t })));
    }
    // usuários (governança)
    if(window.SBS_USERS && read("usuarios")==null){
      const ov = window.SBS_NAME_OVERRIDES||{};
      write("usuarios", window.SBS_USERS.map(email=>({
        id:uid("usr"), email,
        nome: ov[email] || email.split("@")[0].split(/[._]/).map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" "),
        perfil: email==="comercial@sbsgreen.com.br" ? "Administrador" : "Comercial / Coordenador",
        ativo:true, criado: today()
      })));
    }
    // visitas (vindas do app)
    if(D.visitas && read("visitas")==null){
      write("visitas", D.visitas.lista.map(v=>({ id:uid("vis"), vendedor:"Ricardo Alves", ...v })));
    }

    // reclamações (exemplos recebidos do app)
    if(read("reclamacoes")==null){
      write("reclamacoes", [
        { id:uid("rec"), protocolo:"RC-2041", cliente:"Fazenda Boa Vista", doc:"12.345.678/0001-90", produto:"SBS 7110 IPRO", lote:"L-2291", municipio:"Barreiras/BA", descricao:"Germinação abaixo do esperado em talhão de 40ha.", vendedor:"Ricardo Alves", data:"18/06", status:"aberto", responsavel:"", etapa:"Vendedor" },
        { id:uid("rec"), protocolo:"RC-2038", cliente:"Agro Vale", doc:"98.765.432/0001-10", produto:"Milho SBS 3400", lote:"L-3400", municipio:"L. E. Magalhães/BA", descricao:"Divergência na contagem de sacas recebidas.", vendedor:"Marina Souza", data:"15/06", status:"analise", responsavel:"Qualidade", etapa:"Qualidade" },
        { id:uid("rec"), protocolo:"RC-2030", cliente:"Grupo Cerrado", doc:"11.222.333/0001-44", produto:"Sorgo SBS S12", lote:"L-S12", municipio:"São Desidério/BA", descricao:"Embalagem danificada no transporte.", vendedor:"Carlos Lima", data:"11/06", status:"resolvido", responsavel:"Assistência Técnica", etapa:"Retorno ao cliente" },
      ]);
    }
    // chamados internos (vindos do app)
    if(read("chamados")==null){
      write("chamados", [
        { id:uid("cha"), protocolo:"CI-4821", area:"Faturamento", tipo:"Correção / Ajuste", prioridade:"Alta", assunto:"Nota com CFOP errado", cliente:"Pedido #10482", descricao:"Pedido faturado com CFOP incorreto, cliente solicitou correção.", solicitante:"Ricardo Alves", data:"19/06", status:"aberto", responsavel:"" },
        { id:uid("cha"), protocolo:"CI-4815", area:"Logística / Expedição", tipo:"Solicitação", prioridade:"Normal", assunto:"Antecipar entrega de carga", cliente:"Agro Vale", descricao:"Cliente pede antecipação da carga CG-2305.", solicitante:"Marina Souza", data:"18/06", status:"analise", responsavel:"Logística" },
        { id:uid("cha"), protocolo:"CI-4807", area:"TI / Sistemas", tipo:"Dúvida", prioridade:"Baixa", assunto:"Acesso ao portal", cliente:"", descricao:"Não consigo redefinir minha senha.", solicitante:"André Reis", data:"16/06", status:"resolvido", responsavel:"TI" },
      ]);
    }
    // pedidos / comissões
    if(read("pedidos")==null){
      write("pedidos", [
        { id:uid("ped"), num:"10482", cliente:"Fazenda Boa Vista", vendedor:"Ricardo Alves", valor:148000, desconto:4, status:"producao", data:"18/06", comissao:2072 },
        { id:uid("ped"), num:"10475", cliente:"Agro Vale", vendedor:"Marina Souza", valor:96500, desconto:2, status:"faturado", data:"17/06", comissao:1737 },
        { id:uid("ped"), num:"10468", cliente:"Grupo Cerrado", vendedor:"Carlos Lima", valor:210300, desconto:6, status:"transito", data:"16/06", comissao:3154 },
        { id:uid("ped"), num:"10455", cliente:"Sítio Três Irmãos", vendedor:"Ricardo Alves", valor:54200, desconto:0, status:"cotacao", data:"14/06", comissao:1626 },
        { id:uid("ped"), num:"10449", cliente:"Júlia Prado", vendedor:"Júlia Prado", valor:178900, desconto:5, status:"faturado", data:"13/06", comissao:2862 },
      ]);
    }

    write("__seeded", VERSION);
  }

  /* ---------- API pública ---------- */
  const Store = {
    seed,
    getCol(name){ return read(name, []); },
    setCol(name, arr){ write(name, arr); },
    get(name){ return read(name, null); },
    set(name, val){ write(name, val); },
    add(name, obj){ const a=read(name,[]); obj.id=obj.id||uid(name.slice(0,3)); a.unshift(obj); write(name,a); return obj; },
    update(name, id, patch){ const a=read(name,[]); const i=a.findIndex(x=>x.id===id); if(i>=0){ a[i]={...a[i],...patch}; write(name,a);} return a[i]; },
    remove(name, id){ const a=read(name,[]).filter(x=>x.id!==id); write(name,a); },
    uid, today,
    onChange(cb){ window.addEventListener("sbsdb-change", e=>cb(e.detail||{})); },
    reset(){ Object.keys(localStorage).filter(k=>k.startsWith(NS)).forEach(k=>localStorage.removeItem(k)); }
  };
  window.SBSStore = Store;
  // seed assim que os dados-fonte estiverem disponíveis
  if(window.DATA || window.PRECOS || window.SBS_USERS) seed();
})();
