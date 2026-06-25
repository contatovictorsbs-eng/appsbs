# SBS Green Seeds — Publicação

Site estático (HTML/JS/CSS). Os dados e o sincronismo em tempo real vêm da nuvem
(Supabase), já configurada em `sbs-config.js`. Não há build — é só servir os arquivos.

## Páginas
- `index.html` — página inicial (hub) com acesso aos 3 sistemas
- `SBS Portal do Vendedor.html` — app da força de vendas  (atalho: /vendedor)
- `SBS Painel Gerencial.html` — gestão comercial            (atalho: /painel)
- `SBS Painel T.I.html` — liberação de features e GMud       (atalho: /ti)

Login (protótipo): usuário pelo primeiro nome · senha `12345678`.

---

## Publicar no Netlify ligado ao GitHub (automático)

### 1. Subir esta pasta para um repositório no GitHub
- Crie um repositório novo em github.com (ex.: `sbs-sistemas`).
- Na página do repositório: **Add file → Upload files** → arraste TODO o conteúdo
  desta pasta (incluindo a pasta `materiais/`) → **Commit changes**.

### 2. Ligar o Netlify ao repositório (uma vez só)
- Conta grátis em netlify.com → **Add new site → Import an existing project → GitHub**.
- Selecione o repositório. Não precisa configurar build (deixe em branco) e
  **Publish directory** = `.` (raiz). → **Deploy**.
- Em ~1 min o site fica no ar com um link permanente (você pode trocar o nome do
  subdomínio em Site settings, ou ligar um domínio próprio).

### 3. Atualizações dali em diante (automático)
- Quando o código mudar, basta enviar os arquivos alterados para o GitHub
  (**Add file → Upload files** novamente, ou GitHub Desktop).
- O Netlify detecta o commit e **republica sozinho**. O link nunca muda.

> Dados (pedidos, preços, reclamações) e liga/desliga de features NÃO exigem
> republicar — mudam pela nuvem em tempo real.
