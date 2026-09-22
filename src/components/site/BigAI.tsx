import { useEffect, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askBigAi, getBigAiSettings } from "@/lib/big-ai.functions";

type Message = { role: "user" | "assistant"; text: string };

export function BigAI() {
  const getSettings = useServerFn(getBigAiSettings);
  const ask = useServerFn(askBigAi);
  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState("BIG AI");
  const [welcome, setWelcome] = useState("Hi! I can help you find something to watch.");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => { getSettings().then(s => { setEnabled(s.enabled); setName(s.name); setWelcome(s.welcomeMessage); }).catch(() => {}); }, []);
  useEffect(() => { if (open && messages.length === 0) setMessages([{ role: "assistant", text: welcome }]); }, [open, messages.length, welcome]);
  if (!enabled) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const result = await ask({ data: { message: text, context: "BIG MOV has movie and TV discovery, search, genres, watchlist, movie details and Spin a Movie. Keep recommendations safe and age-appropriate." } });
      setMessages(m => [...m, { role: "assistant", text: result.answer }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "BIG AI is unavailable.");
    } finally { setBusy(false); }
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-2xl transition-transform hover:scale-105">
      <Bot className="size-5" />{name}<Sparkles className="size-4" />
    </button>
    {open && <div className="fixed bottom-20 right-4 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary"><Bot className="size-5" /></div><div><p className="font-semibold">{name}</p><p className="text-xs text-muted-foreground">Your BIG MOV assistant</p></div></div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="size-4" /></Button>
      </div>
      <div className="h-80 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => <div key={i} className={m.role === "user" ? "ml-8 rounded-xl bg-primary p-3 text-sm text-primary-foreground" : "mr-8 rounded-xl bg-surface p-3 text-sm"}>{m.text}</div>)}
        {busy && <div className="mr-8 rounded-xl bg-surface p-3 text-sm text-muted-foreground">BIG AI is thinking…</div>}
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder="Ask BIG AI…" disabled={busy} />
        <Button size="icon" onClick={send} disabled={busy || !input.trim()}><Send className="size-4" /></Button>
      </div>
    </div>}
  </>;
}
