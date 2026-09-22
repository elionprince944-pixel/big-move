import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_SYSTEM_PROMPT =
  "You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful.";

async function getSettings() {
  const { data } = await supabase.from("big_ai_settings").select("enabled,name,welcome_message,system_prompt").eq("id", true).maybeSingle();
  return data ?? {
    enabled: true,
    name: "BIG AI",
    welcome_message: "Hi! I can help you discover movies and use BIG MOV.",
    system_prompt: DEFAULT_SYSTEM_PROMPT,
  };
}

export const getBigAiSettings = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await getSettings();
  return { enabled: settings.enabled, name: settings.name, welcomeMessage: settings.welcome_message };
});

export const askBigAi = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string; context?: string }) => data)
  .handler(async ({ data }) => {
    const message = data.message.trim();
    if (!message) throw new Error("Please enter a message.");
    const settings = await getSettings();
    if (!settings.enabled) throw new Error("BIG AI is currently disabled.");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured on the server.");

    const prompt = [
      settings.system_prompt || DEFAULT_SYSTEM_PROMPT,
      "BIG MOV context:",
      data.context || "No additional context.",
      "User message:",
      message,
    ].join("\n\n");

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
      }),
    });

    if (!response.ok) throw new Error("BIG AI request failed (" + response.status + ").");
    const json = await response.json();
    const answer = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
    return { answer: answer || "I couldn't generate a response right now." };
  });
