-- ===========================================================
-- SBS Green Seeds — Segurança no banco (Supabase / Postgres)
-- RLS + papéis para a tabela sbs_kv
-- -----------------------------------------------------------
-- RODE PRIMEIRO NO PROJETO DE HOMOLOGAÇÃO. Só replique em
-- produção depois que os testes passarem.
--
-- Supabase → SQL Editor → cole e execute.
-- ===========================================================

-- 1) Garante a tabela base (já existente no projeto)
create table if not exists public.sbs_kv (
  key         text primary key,
  value       jsonb,
  updated_at  timestamptz default now()
);

-- 2) Liga o Row Level Security (sem política = ninguém acessa,
--    por isso as políticas abaixo são obrigatórias)
alter table public.sbs_kv enable row level security;

-- ===========================================================
-- 3) MODELO DE PAPÉIS
--    Cada usuário do Supabase Auth recebe um "papel" no
--    app_metadata (ex.: ti, gerencia, ceo, vendedor, rh...).
--    Defina ao criar o usuário, ou via função de admin.
--    Ex.: { "role": "ti", "platforms": ["ti","gerencial"] }
-- ===========================================================

-- helper: papel do usuário logado
create or replace function public.sbs_role()
returns text language sql stable as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    'anon'
  );
$$;

-- ===========================================================
-- 4) POLÍTICAS
--    Estratégia simples e segura para começar:
--    • Usuário AUTENTICADO pode ler e gravar.
--    • Anônimo (sem login) é BLOQUEADO.
--    Depois dá para refinar por prefixo de chave/plataforma.
-- ===========================================================

-- leitura: qualquer usuário logado
create policy "kv_select_auth"
  on public.sbs_kv for select
  to authenticated
  using ( true );

-- escrita (insert/update): qualquer usuário logado
create policy "kv_insert_auth"
  on public.sbs_kv for insert
  to authenticated
  with check ( true );

create policy "kv_update_auth"
  on public.sbs_kv for update
  to authenticated
  using ( true )
  with check ( true );

-- remoção: somente T.I. / admin
create policy "kv_delete_ti"
  on public.sbs_kv for delete
  to authenticated
  using ( public.sbs_role() in ('ti','admin') );

-- ===========================================================
-- 5) (OPCIONAL, FASE 2) Refino por plataforma usando prefixo
--    de chave. Ex.: dados de RH ficam em chaves "rh_*".
--    Descomente e adapte quando quiser granular por setor.
-- ===========================================================
-- create policy "kv_rh_only"
--   on public.sbs_kv for all
--   to authenticated
--   using (
--     case
--       when key like 'rh\_%' then public.sbs_role() in ('rh','ti','admin','ceo')
--       else true
--     end
--   );

-- ===========================================================
-- 6) DEPOIS DE ATIVAR:
--    • O app precisa logar via Supabase Auth (sbs-auth-supabase.js)
--      para ter um usuário 'authenticated'; senão tudo é bloqueado.
--    • Teste TODO o fluxo em homologação antes de produção.
--    • Para reverter rapidamente em emergência:
--        alter table public.sbs_kv disable row level security;
-- ===========================================================
