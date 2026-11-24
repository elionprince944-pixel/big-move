import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Send, Plus, ShieldCheck, Lock, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Live Chat — BIG MOV" }, { name: "description", content: "Talk to BIG MOV support." }] }),
  component: SupportPage,
});

type Conversation = { id: string; user_id: string; subject: string; status: "open" | "closed"; updated_at: string; created_at: string };
type ChatMessage = { id: string; conversation_id: string; sender_id: string; sender_role: "user" | "admin"; body: string; created_at: string };

function SupportPage() {
  const { user, isAdmin, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    let query = (supabase as any).from("chat_conversations").select("*").order("updated_at", { ascending: false });
    if (!isAdmin) query = query.eq("user_id", user.id);
    const { data, error } = await query;
    if (error) { toast.error(error.message); return; }
    setConversations((data ?? []) as Conversation[]);
    if (!activeId && data?.length) setActiveId(data[0].id);
  }, [user, isAdmin, activeId]);

  const loadMessages = useCallback(async () => {
    if (!activeId) { setMessages([]); return; }
    const { data, error } = await (supabase as any).from("chat_messages").select("*")
      .eq("conversation_id", activeId).order("created_at", { ascending: true });
    if (error) { toast.error(error.message); return; }
    setMessages((data ?? []) as ChatMessage[]);
  }, [activeId]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => { void loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (!user) return;
    const channel = (supabase as any).channel("big-mov-support-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => {
        void loadMessages();
        void loadConversations();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => void loadConversations())
      .subscribe();
    return () => { void (supabase as any).removeChannel(channel); };
  }, [user, loadMessages, loadConversations]);

  const createConversation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !subject.trim()) return;
    setBusy(true);
    const { data, error } = await (supabase as any).from("chat_conversations")
      .insert({ user_id: user.id, subject: subject.trim() }).select("*").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setSubject("");
    setConversations((current) => [data, ...current]);
    setActiveId(data.id);
    toast.success("Support conversation created");
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !activeId || !draft.trim()) return;
    const conversation = conversations.find((item) => item.id === activeId);
    if (!conversation || (!isAdmin && conversation.status === "closed")) return;
    setBusy(true);
    const { error } = await (supabase as any).from("chat_messages").insert({
      conversation_id: activeId, sender_id: user.id, sender_role: isAdmin ? "admin" : "user", body: draft.trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDraft("");
    await loadMessages();
    await loadConversations();
  };

  const setConversationStatus = async (status: "open" | "closed") => {
    if (!activeId) return;
    const { error } = await (supabase as any).from("chat_conversations").update({ status, updated_at: new Date().toISOString() }).eq("id", activeId);
    if (error) return toast.error(error.message);
    setConversations((current) => current.map((item) => item.id === activeId ? { ...item, status } : item));
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading support…</div>;
  if (!user) return <div className="mx-auto max-w-md px-6 py-24 text-center"><MessageCircle className="mx-auto mb-4 size-12 text-primary"/><h1 className="text-3xl font-bold">BIG MOV Live Chat</h1><p className="my-3 text-muted-foreground">Sign in to contact the support team.</p><Button asChild><Link to="/login">Sign in</Link></Button></div>;

  const active = conversations.find((item) => item.id === activeId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-widest text-primary">BIG MOV Support</p><h1 className="mt-1 text-4xl font-black">Live Chat</h1><p className="mt-2 text-sm text-muted-foreground">Messages are saved to your account so you can return to them later.</p></div>
        {isAdmin && <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><ShieldCheck className="size-4"/>Admin inbox</span>}
      </div>
      <div className="grid min-h-[580px] overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[280px_1fr]">
        <aside className="border-b border-border bg-muted/20 md:border-b-0 md:border-r">
          <div className="border-b border-border p-4"><h2 className="font-bold">{isAdmin ? "All conversations" : "Your conversations"}</h2><p className="mt-1 text-xs text-muted-foreground">{conversations.length} conversation(s)</p></div>
          <div className="max-h-[420px] overflow-y-auto p-2 md:max-h-[520px]">
            {conversations.map((conversation) => (
              <button key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)}
                className={`mb-1 w-full rounded-xl p-3 text-left transition ${activeId === conversation.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent"}`}>
                <span className="block truncate text-sm font-semibold">{conversation.subject}</span>
                {isAdmin && <span className="mt-1 block truncate text-[10px] text-muted-foreground">{conversation.user_id}</span>}
                <span className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>{new Date(conversation.updated_at).toLocaleDateString()}</span><span className={conversation.status === "open" ? "text-emerald-500" : "text-muted-foreground"}>{conversation.status}</span></span>
              </button>
            ))}
            {!isAdmin && <form onSubmit={createConversation} className="mt-3 space-y-2 border-t border-border p-2 pt-4"><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What do you need help with?" maxLength={100} required/><Button type="submit" size="sm" className="w-full" disabled={busy || !subject.trim()}><Plus className="mr-2 size-4"/>New conversation</Button></form>}
            {isAdmin && !conversations.length && <p className="p-4 text-xs text-muted-foreground">No support conversations yet.</p>}
          </div>
        </aside>
        <section className="flex min-h-[580px] flex-col">
          {active ? <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div><h2 className="font-bold">{active.subject}</h2><p className="text-xs text-muted-foreground">{isAdmin ? `Customer ID: ${active.user_id}` : "BIG MOV Support Team"}</p></div>{isAdmin && <Button size="sm" variant="outline" onClick={() => void setConversationStatus(active.status === "open" ? "closed" : "open")}>{active.status === "open" ? <Lock className="mr-2 size-3.5"/> : <RefreshCw className="mr-2 size-3.5"/ >}{active.status === "open" ? "Close chat" : "Reopen chat"}</Button>}</div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/10 p-4">
              {messages.map((message) => {
                const mine = message.sender_id === user.id;
                return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${mine ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}><p className="mb-1 text-[10px] font-bold opacity-65">{message.sender_role === "admin" ? "BIG MOV Support" : isAdmin ? "Customer" : "You"}</p><p className="whitespace-pre-wrap break-words text-sm">{message.body}</p><p className="mt-2 text-right text-[10px] opacity-55">{new Date(message.created_at).toLocaleString()}</p></div></div>;
              })}
              {!messages.length && <p className="py-12 text-center text-sm text-muted-foreground">Start the conversation below.</p>}
            </div>
            <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-border p-3"><Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={active.status === "closed" && !isAdmin ? "This conversation is closed." : "Write a message…"} rows={2} maxLength={4000} disabled={active.status === "closed" && !isAdmin} className="resize-none"/><Button type="submit" size="icon" disabled={busy || !draft.trim() || (active.status === "closed" && !isAdmin)} aria-label="Send message"><Send className="size-4"/></Button></form>
          </> : <div className="grid flex-1 place-items-center p-8 text-center"><div><MessageCircle className="mx-auto mb-4 size-12 text-muted-foreground/40"/><h2 className="font-bold">No conversation selected</h2><p className="mt-2 text-sm text-muted-foreground">{isAdmin ? "Choose a customer conversation from the inbox." : "Create a new conversation to contact support."}</p></div></div>}
        </section>
      </div>
    </div>
  );
}
