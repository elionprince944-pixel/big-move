import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

type Notice = {
  id: string; title: string; message: string; kind: string;
  target_url: string | null; is_read: boolean; created_at: string;
};

export function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const unread = items.filter((item) => !item.is_read).length;

  useEffect(() => {
    if (!user) { setItems([]); return; }
    const load = async () => {
      const { data } = await (supabase as any).from("notifications")
        .select("id,title,message,kind,target_url,is_read,created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      if (data) setItems(data as Notice[]);
    };
    void load();
    const channel = (supabase as any).channel(`notifications-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { void (supabase as any).removeChannel(channel); };
  }, [user]);

  if (!user) return null;

  const markRead = async (notice: Notice) => {
    if (!notice.is_read) {
      await (supabase as any).from("notifications").update({ is_read: true }).eq("id", notice.id).eq("user_id", user.id);
      setItems((current) => current.map((item) => item.id === notice.id ? { ...item, is_read: true } : item));
    }
    setOpen(false);
    if (notice.target_url) navigate({ to: notice.target_url as any });
  };

  const markAllRead = async () => {
    await (supabase as any).from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications"
        aria-expanded={open} className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground">
        <Bell className="size-4" />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[80] w-[min(90vw,22rem)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div><p className="font-bold">Notifications</p><p className="text-xs text-muted-foreground">{unread} unread</p></div>
            <button type="button" onClick={markAllRead} disabled={!unread} className="inline-flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-40"><CheckCheck className="size-3.5"/>Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length ? items.map((item) => (
              <button type="button" key={item.id} onClick={() => void markRead(item)}
                className={`block w-full border-b border-border/70 px-4 py-3 text-left transition hover:bg-accent ${item.is_read ? "opacity-65" : "bg-primary/[0.04]"}`}>
                <span className="flex items-start gap-2"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.is_read ? "bg-transparent" : "bg-orange-500"}`}/><span className="min-w-0"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.message}</span><span className="mt-1 block text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span></span></span>
              </button>
            )) : <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
