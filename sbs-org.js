/* ===========================================================
   SBS — Estrutura organizacional e níveis de acesso
   Hierarquia: Nacional → Regional → Supervisor
   Login por primeiro nome (quando único) ou nome.sobrenome.
   =========================================================== */
(function(){
const D = "@sbsgreen.com.br";

// papéis: nacional | regional | supervisor | admin
const PEOPLE = [
  // Gerente Nacional — vê tudo
  { email:"rodrigo.medina"+D,   nome:"Rodrigo Medina",     papel:"nacional",   gerente:null },

  // Gerentes Regionais
  { email:"caio.simoes"+D,      nome:"Caio Simões",        papel:"regional",   gerente:"rodrigo.medina"+D },
  { email:"eduardo.feitosa"+D,  nome:"Eduardo Feitosa",    papel:"regional",   gerente:"rodrigo.medina"+D },
  { email:"fabio.fernandes"+D,  nome:"Fabio Fernandes",    papel:"regional",   gerente:"rodrigo.medina"+D },
  { email:"fernando.oshiro"+D,  nome:"Fernando Oshiro",    papel:"regional",   gerente:"rodrigo.medina"+D },

  // Supervisores — Caio
  { email:"lucas.moreira"+D,     nome:"Lucas Moreira",      papel:"supervisor", gerente:"caio.simoes"+D },
  { email:"alexandre.goncalves"+D,nome:"Alexandre Gonçalves",papel:"supervisor",gerente:"caio.simoes"+D },
  { email:"ana.luisa"+D,         nome:"Ana Luísa",          papel:"supervisor", gerente:"caio.simoes"+D },
  { email:"mateus.cavalcante"+D, nome:"Mateus Cavalcante",  papel:"supervisor", gerente:"caio.simoes"+D },
  { email:"jose.airton"+D,       nome:"José Airton",        papel:"supervisor", gerente:"caio.simoes"+D },
  { email:"jorge.eduardo"+D,     nome:"Jorge Eduardo",      papel:"supervisor", gerente:"caio.simoes"+D },

  // Supervisores — Eduardo Feitosa
  { email:"diego.torrezan"+D,    nome:"Diego Torrezan",     papel:"supervisor", gerente:"eduardo.feitosa"+D },
  { email:"fabio.laurir"+D,      nome:"Fabio Laurir",       papel:"supervisor", gerente:"eduardo.feitosa"+D },
  { email:"rodrigo.pires"+D,     nome:"Rodrigo Pires",      papel:"supervisor", gerente:"eduardo.feitosa"+D },
  { email:"thiago.candido"+D,    nome:"Thiago Cândido",     papel:"supervisor", gerente:"eduardo.feitosa"+D },
  { email:"wemerson.rodrigues"+D,nome:"Wemerson Rodrigues", papel:"supervisor", gerente:"eduardo.feitosa"+D },
  { email:"aryana.lima"+D,       nome:"Aryana Lima",        papel:"supervisor", gerente:"eduardo.feitosa"+D },
  { email:"nicacio.correa"+D,    nome:"Nicácio Correa",     papel:"supervisor", gerente:"eduardo.feitosa"+D },

  // Supervisores — Fabio Fernandes
  { email:"cesar.miranda"+D,     nome:"Cesar Miranda",      papel:"supervisor", gerente:"fabio.fernandes"+D },
  { email:"joaquinesio.junior"+D,nome:"Joaquinésio Júnior", papel:"supervisor", gerente:"fabio.fernandes"+D },
  { email:"eduardo.freitas"+D,   nome:"Eduardo Freitas",    papel:"supervisor", gerente:"fabio.fernandes"+D },
  { email:"cassio.cuissi"+D,     nome:"Cássio Cuissi",      papel:"supervisor", gerente:"fabio.fernandes"+D },
  { email:"henrique.martins"+D,  nome:"Henrique Martins",   papel:"supervisor", gerente:"fabio.fernandes"+D },
  { email:"antonio.carlos"+D,    nome:"Antonio Carlos",     papel:"supervisor", gerente:"fabio.fernandes"+D },
  { email:"henrique.neto"+D,     nome:"Henrique Neto",      papel:"supervisor", gerente:"fabio.fernandes"+D },

  // Supervisores — Fernando Oshiro
  { email:"celso.guilherme"+D,   nome:"Celso Guilherme",    papel:"supervisor", gerente:"fernando.oshiro"+D },
  { email:"thiago.angelo"+D,     nome:"Thiago Ângelo",      papel:"supervisor", gerente:"fernando.oshiro"+D },
  { email:"rafael.populin"+D,    nome:"Rafael Populin",     papel:"supervisor", gerente:"fernando.oshiro"+D },
  { email:"joao.paulo"+D,        nome:"João Paulo",         papel:"supervisor", gerente:"fernando.oshiro"+D },
  { email:"jonas.dalmagro"+D,    nome:"Jonas Dalmagro",     papel:"supervisor", gerente:"fernando.oshiro"+D },
  { email:"marcos.roberto"+D,    nome:"Marcos Roberto",     papel:"supervisor", gerente:"fernando.oshiro"+D },
  { email:"william.moura"+D,     nome:"William Moura",      papel:"supervisor", gerente:"fernando.oshiro"+D },

  // Acessos administrativos / extras
  { email:"comercial"+D,         nome:"Comercial",          papel:"admin",      gerente:null },
  { email:"thiago.maschietto"+D, nome:"Thiago Maschietto",  papel:"ceo",        gerente:null },
  { email:"ceo"+D,               nome:"CEO",                papel:"ceo",        gerente:null },
  { email:"marketing"+D,         nome:"Marketing",          papel:"admin",      gerente:null },
  { email:"victor.hugo"+D,       nome:"Victor Hugo",        papel:"admin",      gerente:null },
  { email:"natalia.yamasaki"+D,  nome:"Natália Yamasaki",   papel:"admin",      gerente:null },
  { email:"miriam.santos"+D,     nome:"Miriam Santos",      papel:"admin",      gerente:null },
  { email:"leandro.silva"+D,     nome:"Leandro Silva",      papel:"admin",      gerente:null },
  { email:"lara.moura"+D,        nome:"Lara Moura",         papel:"supervisor", gerente:"caio.simoes"+D },
];

const byEmail = {};
PEOPLE.forEach(p=>byEmail[p.email.toLowerCase()]=p);

// índice de primeiro nome → lista de emails (para login por 1º nome)
const byFirst = {};
PEOPLE.forEach(p=>{
  const f = p.email.split("@")[0].split(".")[0];
  (byFirst[f] = byFirst[f] || []).push(p.email.toLowerCase());
});

function norm(s){
  return (s||"").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")  // tira acentos
    .replace(/\s+/g,".")                               // "fabio laurir" → "fabio.laurir"
    .replace(/@sbsgreen\.com\.br$/,"");
}

// resolve o que o usuário digitou → email canônico (ou null/ambíguo)
function resolveLogin(input){
  const k = norm(input);
  if(!k) return { ok:false };
  // 1) bateu email/local-part completo
  if(byEmail[k+"@sbsgreen.com.br"]) return { ok:true, email:k+"@sbsgreen.com.br" };
  // 2) primeiro nome único
  const list = byFirst[k];
  if(list && list.length===1) return { ok:true, email:list[0] };
  if(list && list.length>1)  return { ok:false, ambiguous:true, options:list };
  return { ok:false };
}

function get(email){ return byEmail[(email||"").toLowerCase()] || null; }
function papel(email){ const p=get(email); return p?p.papel:"supervisor"; }
function nome(email){ const p=get(email); return p?p.nome:null; }
function gerenteDe(email){ const p=get(email); return p?p.gerente:null; }
function supervisoresDe(email){ // supervisores cuja gerência é este email
  const e=(email||"").toLowerCase();
  return PEOPLE.filter(p=>p.gerente && p.gerente.toLowerCase()===e);
}
function regionais(){ return PEOPLE.filter(p=>p.papel==="regional"); }
function todosSupervisores(){ return PEOPLE.filter(p=>p.papel==="supervisor"); }

// quem este usuário PODE ver (inclui ele mesmo)
function escopo(email){
  const p = get(email);
  if(!p) return [email];
  if(p.papel==="nacional" || p.papel==="admin") return PEOPLE.map(x=>x.email);
  if(p.papel==="regional"){
    const time = supervisoresDe(p.email).map(x=>x.email);
    return [p.email, ...time];
  }
  return [p.email]; // supervisor: só ele
}

window.SBS_ORG = {
  PEOPLE, get, papel, nome, gerenteDe, supervisoresDe,
  regionais, todosSupervisores, escopo, resolveLogin, norm,
  emails: PEOPLE.map(p=>p.email),
};
})();
