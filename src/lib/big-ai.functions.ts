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

    const system = `${settings.system_prompt || DEFAULT_SYSTEM_PROMPT}\n\nBIG MOV context: ${data.context || "none"}`;
    const history: Msg[] = [...(data.history ?? []).slice(-10).filter(m => m.text), { role: "user", text: message }];
    while (history.length && history[0].role !== "user") history.shift();

    const lovableKey = process.env.LOVABLE_API_KEY;
    const geminiKey = process.env.AI_API_KEY;
    let lastErr: unknown;
    if (lovableKey) {
      try { const a = await viaGateway(system, history, lovableKey); if (a) return { answer: a }; } catch (e) { lastErr = e; }
    }
    if (geminiKey) {
      try { const a = await viaGemini(system, history, geminiKey); if (a) return { answer: a }; } catch (e) { lastErr = e; }
    }
    console.error("BIG AI failed", lastErr);
    if (lastErr instanceof Error && lastErr.message.startsWith("BIG AI")) throw lastErr;
    throw new Error("BIG AI is unavailable right now. Please try again.");
  });
