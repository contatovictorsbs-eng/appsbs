/* ===========================================================
   SBS — Controle de acesso (governança)
   Lista de e-mails autorizados. No futuro, será gerenciada
   pelo painel administrativo (criar/remover acessos e definir
   permissões por usuário).
   ⚠️ Protótipo: validação no cliente. A autenticação real
   (senha, tokens, permissões) será feita no back-end do painel.
   =========================================================== */
window.SBS_PASSWORD = "12345678";

/* Admins MASTER — enxergam todos os painéis e apps */
window.SBS_MASTER = [
  "victor.hugo@sbsgreen.com.br",
  "natalia.yamasaki@sbsgreen.com.br",
  "thiago.maschietto@sbsgreen.com.br",
  "leandro.carvalho@sbsgreen.com.br",
];

/* Credenciais iniciais (senha individual de fábrica).
   O usuário pode trocar a qualquer momento (vira senha pessoal na nuvem). */
window.SBS_DEFAULT_CREDS = {};

window.SBS_USERS = [
  "alexandre.oliveira@sbsgreen.com.br",
  "ana.luisa@sbsgreen.com.br",
  "aryana.andrade@sbsgreen.com.br",
  "caio.simoes@sbsgreen.com.br",
  "cesar.miranda@sbsgreen.com.br",
  "comercial@sbsgreen.com.br",
  "diego.torrezan@sbsgreen.com.br",
  "edson.neves@sbsgreen.com.br",
  "eduardo.feitosa@sbsgreen.com.br",
  "eduardo.freitas@sbsgreen.com.br",
  "fabio.fernandes@sbsgreen.com.br",
  "fabio.laurir@sbsgreen.com.br",
  "franz.ferg@sbsgreen.com.br",
  "marcela.marketing@sbsgreen.com.br",
  "lara.inovacao@sbsgreen.com.br",
  "rony.rh@sbsgreen.com.br",
  "ana.rh@sbsgreen.com.br",
  "fernando.oshiro@sbsgreen.com.br",
  "giovana.righetti@sbsgreen.com.br",
  "green.mobile@sbsgreen.com.br",
  "guilherme.lavagnini@sbsgreen.com.br",
  "hemython.bandeira@sbsgreen.com.br",
  "joao.fonesi@sbsgreen.com.br",
  "joaquinesio@sbsgreen.com.br",
  "jose.airton@sbsgreen.com.br",
  "lara.moura@sbsgreen.com.br",
  "lucas.faria@sbsgreen.com.br",
  "lucas.goncalves@sbsgreen.com.br",
  "luis.tertuliano@sbsgreen.com.br",
  "marcos.roberto@sbsgreen.com.br",
  "marketing@sbsgreen.com.br",
  "marcos.soares@sbsgreen.com.br",
  "mateus.cavalcante@sbsgreen.com.br",
  "natalia.yamasaki@sbsgreen.com.br",
  "nicacio.deguchi@sbsgreen.com.br",
  "pedidos@sbsgreen.com.br",
  "rafael.populin@sbsgreen.com.br",
  "rodrigo.medina@sbsgreen.com.br",
  "rodrigo.pires@sbsgreen.com.br",
  "setoragronomico@sbsgreen.com.br",
  "thiago.candido@sbsgreen.com.br",
  "thiago.maschietto@sbsgreen.com.br",
  "thiago.munhoz@sbsgreen.com.br",
  "victor.hugo@sbsgreen.com.br",
  "leandro.carvalho@sbsgreen.com.br",
  "wemerson.rodrigues@sbsgreen.com.br",
  "william.moura@sbsgreen.com.br",
];

/* nomes "amigáveis" para contas genéricas */
window.SBS_NAME_OVERRIDES = {
  "comercial@sbsgreen.com.br": "Comercial",
  "marketing@sbsgreen.com.br": "Marketing",
  "pedidos@sbsgreen.com.br": "Pedidos",
  "green.mobile@sbsgreen.com.br": "Green Mobile",
  "setoragronomico@sbsgreen.com.br": "Setor Agronômico",
};

window.SBS_AVATARS = {
  "franz.ferg@sbsgreen.com.br": "data:image/jpeg;base64,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",
};
