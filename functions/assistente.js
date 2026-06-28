exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  const ok = (text) => ({ statusCode: 200, headers: cors, body: JSON.stringify({ text }) });

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Use POST" }) };

  let prompt = "";
  try { prompt = (JSON.parse(event.body || "{}").prompt || "").toString(); } catch (e) {}
  if (!prompt) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "prompt vazio" }) };
  if (prompt.length > 12000) prompt = prompt.slice(0, 12000);

  const env = process.env;

  try {
    if (env.GEMINI_API_KEY) {
      const model = env.GEMINI_MODEL || "gemini-1.5-flash";
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + env.GEMINI_API_KEY, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const j = await r.json();
      if (!r.ok) return ok("Não consegui falar com a IA agora (" + ((j.error && j.error.message) || r.status) + ").");
      const text = (((j.candidates || [])[0] || {}).content || {}).parts?.map(p => p.text).join("") || "";
      return ok(text || "Não consegui gerar uma resposta agora.");
    }

    if (env.GROQ_API_KEY) {
      return await openaiLike("https://api.groq.com/openai/v1/chat/completions", env.GROQ_API_KEY, env.GROQ_MODEL || "llama-3.3-70b-versatile", prompt, ok);
    }

    if (env.OPENROUTER_API_KEY) {
      return await openaiLike("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free", prompt, ok);
    }

    if (env.ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: env.CLAUDE_MODEL || "claude-3-5-sonnet-latest", max_tokens: 1024, messages: [{ role: "user", content: prompt }] }),
      });
      const j = await r.json();
      if (!r.ok) return ok("Não consegui falar com a IA agora (" + ((j.error && j.error.message) || r.status) + ").");
      return ok((j.content && j.content[0] && j.content[0].text) || "");
    }

    return ok("⚙️ O assistente ainda não foi ativado: configure GROQ_API_KEY nas variáveis do Netlify.");
  } catch (e) {
    return ok("Falha de conexão com a IA. Tente novamente em instantes.");
  }
};

async function openaiLike(url, key, model, prompt, ok) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Authorization": "Bearer " + key, "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: "user", content: prompt }] }),
  });
  const j = await r.json();
  if (!r.ok) return ok("Não consegui falar com a IA agora (" + ((j.error && j.error.message) || r.status) + ").");
  const text = (((j.choices || [])[0] || {}).message || {}).content || "";
  return ok(text || "Não consegui gerar uma resposta agora.");
