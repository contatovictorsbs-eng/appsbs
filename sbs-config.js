/* ===========================================================
   SBS — Configuração do backend (nuvem)
   -----------------------------------------------------------
   Para ATIVAR o modo nuvem (dados compartilhados entre todos
   os dispositivos em tempo real), preencha os 2 valores abaixo
   com os dados do seu projeto Supabase:

     Supabase → Project Settings → API
       • Project URL      →  url
       • anon public key  →  anonKey

   Enquanto estiverem vazios, o app funciona em MODO LOCAL
   (dados só no navegador do aparelho) — útil para testes.
   =========================================================== */
window.SBS_BACKEND = {
  url: "https://wqlxpcfrovdgrvtxslzn.supabase.co",
  anonKey: "sb_publishable_0T2jW_paSDNMT1oBOZUV5w_lStv73w6"
};
