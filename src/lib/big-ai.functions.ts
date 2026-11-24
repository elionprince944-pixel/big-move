import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_SYSTEM_PROMPT =
  "You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful.";

async function getSettings() {
  try {
    const { data } = await supabase.from("big_ai_settings").select("enabled,name,welcome_message,system_prompt").eq("id", true).maybeSingle();
    if (data) return data;
  } catch {}
  return { enabled: true, name: "BIG AI", welcome_message: "Hi! I can help you discover movies and use BIG MOV.", system_prompt: DEFAULT_SYSTEM_PROMPT };
}

export const getBigAiSettings = createServerFn({ method: "GET" }).handler(async () => {
  const s = await getSettings();
  return { enabled: s.enabled, name: s.name, welcomeMessage: s.welcome_message };
});

type Msg = { role: "user" | "assistant"; text: string };

async function siteCatalog(query: string): Promise<string> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return "";
  const get = async (path: string, params: Record<string, string> = {}) => {
    try {
      const u = new URL("https://api.themoviedb.org/3" + path);
      u.searchParams.set("api_key", key);
      u.searchParams.set("include_adult", "false");
      for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
      const r = await fetch(u.toString());
      if (!r.ok) return [];
      return ((await r.json())?.results ?? []) as any[];
    } catch { return []; }
  };
  const fmt = (list: any[], n = 12) => list.slice(0, n).map(m => {
    const type = m.media_type === "tv" || (!m.title && m.name) ? "tv" : "movie";
    const year = (m.release_date || m.first_air_date || "").slice(0, 4);
    return `- ${m.title || m.name}${year ? ` (${year})` : ""} [${type}, rating ${Number(m.vote_average ?? 0).toFixed(1)}] link: /movie/${m.id}${type === "tv" ? "?type=tv" : ""}`;
  }).join("\n");
  const [trending, popular, tv, top, search] = await Promise.all([
    get("/trending/all/week"), get("/movie/popular"), get("/tv/popular"), get("/movie/top_rated"),
    query.length > 2 ? get("/search/multi", { query: query.slice(0, 100) }) : Promise.resolve([]),
  ]);
  return `TRENDING ON BIG MOV THIS WEEK:\n${fmt(trending)}\n\nPOPULAR MOVIES:\n${fmt(popular, 10)}\n\nPOPULAR TV SHOWS:\n${fmt(tv, 10)}\n\nTOP RATED MOVIES:\n${fmt(top, 8)}${search.length ? `\n\nSEARCH MATCHES FOR THE USER MESSAGE:\n${fmt(search.filter((m: any) => m.media_type !== "person"), 8)}` : ""}`;
}

function clean(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1").replace(/^\s*[*-]\s+/gm, "• ").replace(/\*/g, "").replace(/^#+\s*/gm, "").trim();
}

async function viaGateway(system: string, history: Msg[], key: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions: system,
      input: history.map(m => ({ role: m.role, content: m.text })),
    }),
  });
  if (res.status === 429) throw new Error("BIG AI is busy, please try again in a moment.");
  if (res.status === 402) throw new Error("BIG AI credits are exhausted.");
  if (!res.ok) throw new Error(`gateway ${res.status}`);
  const j = await res.json();
  if (typeof j?.output_text === "string") return j.output_text.trim();
  const parts: string[] = [];
  for (const o of j?.output ?? []) for (const c of o?.content ?? []) if (typeof c?.text === "string") parts.push(c.text);
  return parts.join("").trim();
}

async function viaGemini(system: string, history: Msg[], key: string) {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] })),
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const j = await res.json();
  return j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
}

export const askBigAi = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string; context?: string; history?: Msg[] }) => data)
  .handler(async ({ data }) => {
    const message = String(data.message ?? "").trim().slice(0, 2000);
    if (!message) throw new Error("Please enter a message.");
    const settings = await getSettings();
    if (!settings.enabled) throw new Error("BIG AI is currently disabled.");

    const catalog = await siteCatalog(message);
    const system = `${settings.system_prompt || DEFAULT_SYSTEM_PROMPT}\n\nBIG MOV context: ${data.context || "none"}\n\nYou DO have live access to what is on the BIG MOV website right now — the lists below are the site's current live catalog. When users ask what is on the site, trending, or for recommendations, answer from these lists by title. Never say you cannot see the site. Write plain text only: no markdown, no asterisks, no bold, no headings. Use simple lines starting with "• " for lists.\n\n${catalog}`;
    const history: Msg[] = [...(data.history ?? []).slice(-10).filter(m => m.text), { role: "user", text: message }];
    while (history.length && history[0].role !== "user") history.shift();

    const lovableKey = process.env.LOVABLE_API_KEY;
    const geminiKey = process.env.AI_API_KEY;
    let lastErr: unknown;
    if (lovableKey) {
      try { const a = await viaGateway(system, history, lovableKey); if (a) return { answer: clean(a) }; } catch (e) { lastErr = e; }
    }
    if (geminiKey) {
      try { const a = await viaGemini(system, history, geminiKey); if (a) return { answer: clean(a) }; } catch (e) { lastErr = e; }
    }
    console.error("BIG AI failed", lastErr);
    if (lastErr instanceof Error && lastErr.message.startsWith("BIG AI")) throw lastErr;
    throw new Error("BIG AI is unavailable right now. Please try again.");
  });
