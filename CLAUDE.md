# SBS Green Seeds — instruções do projeto

## Sistema
Dez plataformas que compartilham a mesma nuvem (Supabase) e a mesma camada de dados (`sbs-store.js` + `sbs-cloud.js`):
- **SBS Portal do Vendedor.html** — app da força de vendas (router `window.Screens` / `go()`).
- **SBS Painel Gerencial.html** — gestão comercial (`PANEL.Modules`, nav/perms em `panel-core.js`).
- **SBS Painel T.I.html** — features + GMud + versões + **plataformas** (`TI.Modules`, `ti-core.js`). **Gerencia todas as outras plataformas** (libera features, liga/desliga plataformas, controla versões).
- **SBS Painel CEO.html** — visão executiva consolidada SOMENTE LEITURA (`CEO.Modules`, `ceo-core.js`). Tema grafite/dourado. Tem módulo "Marketing & P&D".
- **SBS Painel Atendimento.html** — caixa unificada multimarca (Nobre Brasil/SBS/SememBrás). `window.ATEND` + `ATEND_VIEWS` (operacional/gerencial), coleções `atend_*`. Estilo HUD escuro, fonte Public Sans. Integra reclamações/chamados do app (coleções `reclamacoes`/`chamados`).
- **SBS Painel Marketing.html** — campanhas, materiais (coleção `marketing` do app), conteúdo, redes, eventos (`window.MKT`, `MKT.Modules`, coleções `mkt_*`).
- **SBS Painel PD.html** — P&D/Inovação: pipeline, ensaios, cultivares, ideias, marcos, docs (`window.PD`, `PD.Modules`, coleções `pd_*`). Banco de ideias puxa `reclamacoes` como insumo.
- **SBS Painel RH.html** — Recrutamento & Seleção + Endomarketing: vagas, candidatos, colaboradores, comunicados, eventos (`window.RH`, `RH.Modules`, coleções `rh_*`).
- **SBS Portal do Colaborador.html** — app mobile de TODOS os funcionários (`window.COL`). Lê o que o RH publica (`rh_comunicados`/`rh_eventos`/`rh_colaboradores`/`rh_vagas`): mural, agenda, vagas internas, aniversariantes, meus dados. Verde SBS, bottom-nav.
- **SBS Painel Inteligencia Mercado.html** — Inteligência de Mercado: cotações/commodities, concorrentes, regiões, tendências (`window.MI`, `MI.Modules`, coleções `mi_*`). Verde SBS.
- **index.html** — hub que linka todas. Painéis Marketing/P&D/RH herdam `panel.css` + estilos `mc-*`/`pd-*`/`rh-*` inline; cada um tem core/modules/boot próprios e seguem o mesmo padrão (login SBS_ORG, seed em coleções, onChange).
- **index.html** — hub que linka as dez.

Controle de plataformas: `sbs-plataformas.js` (`window.SBS_PLAT`, coleção `plataformas`) — a T.I. liga/desliga cada plataforma; cada página declara `<meta name="sbs-platform" content="...">` e exibe tela de manutenção quando desligada. O Painel de T.I. nunca se desliga.

Mapa da equipe (rastreamento ao vivo): motor compartilhado `sbs-mapa.js` (`window.SBS_MAPA`), usado pelo Gerencial (`panel-mapa.js`) e pelo CEO. Roster = coleção `vendedores`, cruzada com chaves `rast:<email>` (enviadas pelo app via `rastreamento.js`). GPS só com o app aberto (web).

Publicação: GitHub `contatovictorsbs-eng/appsbs` → Netlify (auto-deploy). Pasta `deploy/` espelha o que vai pro hosting. Link: https://saas-sbs-green.netlify.app

## Feature flags
`sbs-features.js` controla quais funcionalidades aparecem no app (coleção de nuvem `features`, editada pelo Painel de T.I.). Itens não listados = liberados por padrão.

## REGRA — Documentação viva (sempre seguir)
Toda funcionalidade NOVA ou alterada DEVE ganhar/atualizar sua entrada na Central de Ajuda:
- App do vendedor → `docs-data-vendedor.js`
- Painel gerencial → `docs-data-painel.js`
- Painel de T.I. → `docs-data-ti.js`
- Painel do CEO → `docs-data-ceo.js`
- Central de Atendimento → `docs-data-atendimento.js`
- Painel de Marketing → `docs-data-marketing.js`
- Painel de P&D → `docs-data-pd.js`
- Painel de RH → `docs-data-rh.js`
- Portal do Colaborador → `docs-data-colaborador.js`
- Painel de Inteligência de Mercado → `docs-data-mercado.js`

Cada item segue o formato: `{ id, icon, titulo, resumo, oque, comoUsar:[passos], quemAcessa:[perfis], video:{ roteiro, url } }`.
- `id` deve casar com o id da feature/tela (para cruzar com `sbs-features.js` e mostrar status).
- Funcionalidades PRINCIPAIS ganham `video.roteiro` (roteiro pronto p/ ferramenta de avatar). Quando o vídeo for gerado, preencher `video.url` com o embed.
- Tom: simples e direto, linguagem de campo.
O renderizador é `docs-core.js` (compartilhado por todas as plataformas). Nunca duplicar a doc; só editar os `docs-data-*.js`.

## Ao entregar mudanças de código
Listar para o usuário exatamente quais arquivos subir no GitHub (ele faz Upload files → Commit; o Netlify republica sozinho). Dados e feature-flags NÃO exigem republicação.

## Estilo
Marca: verde SBS (`#0B6B61` / `#174D2F`), acento `#6FA331`. Painel de T.I. usa azul tecnologia (`#2A4A7F`); Painel do CEO usa grafite/dourado (`#13241F` / `#C7A24A`). Fonte Plus Jakarta Sans. Sem emojis fora do que já existe. Português (pt-BR).
