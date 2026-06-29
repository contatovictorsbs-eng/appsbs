exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  const send = (obj) => ({ statusCode: 200, headers: cors, body: JSON.stringify(obj) });

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return send({ text: "Use POST" });

  if (typeof fetch !== "function") return send({ text: "⚠️ Servidor sem suporte a fetch (Node 18+ no Netlify)." });

  let prompt = "";
  try { prompt = (JSON.parse(event.body || "{}").prompt || "").toString(); } catch (e) {}
  if (!prompt) return send({ text: "Pergunta vazia." });
  if (prompt.length > 12000) prompt = prompt.slice(0, 12000);

  const key = process.env.GROQ_API_KEY;
  if (!key) return send({ text: "⚙️ Falta a variável GROQ_API_KEY no Netlify." });
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: model, max_tokens: 1024, messages: [{ role: "user", content: prompt }] }),
    });
    const raw = await r.text();
    let j = {};
    try { j = JSON.parse(raw); } catch (e) {}
    if (!r.ok) {
      const msg = (j && j.error && j.error.message) ? j.error.message : ("HTTP " + r.status + " · " + raw.slice(0, 180));
      return send({ text: "⚠️ Groq recusou: " + msg });
    }
    const text = j.choices && j.choices[0] && j.choices[0].message ? j.choices[0].message.content : "";
    return send({ text: text || "Não consegui gerar uma resposta agora." });
  } catch (e) {
    return send({ text: "⚠️ Erro ao chamar a IA: " + (e && e.message ? e.message : String(e)) });
  }
};
