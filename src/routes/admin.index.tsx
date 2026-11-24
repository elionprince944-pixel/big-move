import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Bell, Bot, Bookmark, CreditCard, MessageSquare, Save, Send, Settings, Shield, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Panel — BIG MOV" }, { name: "description", content: "Manage BIG MOV website features." }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, watchlist: 0 });
  const [ai, setAi] = useState({
    enabled: true,
    name: "BIG AI",
    welcome_message: "Hi! I can help you discover movies and use BIG MOV.",
    system_prompt: "You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful.",
  });
  const [savingAi, setSavingAi] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isAdmin) return;
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("watchlist").select("*", { count: "exact", head: true }),
      supabase.from("big_ai_settings").select("enabled,name,welcome_message,system_prompt").eq("id", true).maybeSingle(),
    ]).then(([users, watchlist, settings]) => {
      setStats({ users: users.count ?? 0, watchlist: watchlist.count ?? 0 });
      if (settings.data) setAi(settings.data);
      if (users.error) toast.error(users.error.message);
      if (watchlist.error) toast.error(watchlist.error.message);
    });
  }, [user, isAdmin, loading, navigate]);

  const saveAi = async () => {
    setSavingAi(true);
    const { error } = await supabase.from("big_ai_settings").upsert({ id: true, ...ai, updated_at: new Date().toISOString() });
    setSavingAi(false);
    if (error) return toast.error(error.message);
    toast.success("BIG AI settings saved");
  };

  const sendAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    setSendingAnnouncement(true);
    const { data: profiles, error: profileError } = await supabase.from("profiles").select("user_id");
    if (profileError) { setSendingAnnouncement(false); return toast.error(profileError.message); }
    const recipients = (profiles ?? []).map((profile) => ({
      user_id: profile.user_id,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      kind: "announcement",
      target_url: "/home",
    }));
    if (!recipients.length) { setSendingAnnouncement(false); return toast.message("There are no registered profiles to notify yet."); }
    const { error } = await (supabase as any).from("notifications").insert(recipients);
    setSendingAnnouncement(false);
    if (error) return toast.error(error.message);
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    toast.success(`Announcement sent to ${recipients.length} users`);
  };

  if (loading) return <div className="min-h-screen bg-[#070707] p-10 text-center text-white/50">Loading admin panel…</div>;
  if (!user) return null;
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white"><div className="max-w-md text-center"><Shield className="mx-auto mb-4 size-12 text-orange-400"/><h1 className="text-3xl font-bold">Admin only</h1><p className="mb-6 mt-2 text-white/50">Your account doesn't have administrator access.</p><Button asChild className="bg-orange-400 text-black hover:bg-orange-300"><Link to="/admin/login">Admin sign in</Link></Button></div></div>;

  return <div className="min-h-screen bg-[#070707] text-white"><main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-orange-400">BIG MOV Control Room</p><h1 className="mt-2 text-4xl font-black">Admin Dashboard</h1><p className="mt-2 text-sm text-white/45">Manage the live platform, community and subscriptions.</p></div><Link to="/" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-white/5">View website ↗</Link></header>

    <div className="mb-7 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-[#121212] p-6"><div className="flex items-center gap-3 text-white/50"><Users className="size-5 text-orange-400"/>Registered users</div><p className="mt-4 text-4xl font-black">{stats.users}</p></div><div className="rounded-2xl border border-white/10 bg-[#121212] p-6"><div className="flex items-center gap-3 text-white/50"><Bookmark className="size-5 text-orange-400"/>Watchlist entries</div><p className="mt-4 text-4xl font-black">{stats.watchlist}</p></div></div>

    <section className="mb-7"><h2 className="mb-4 text-xl font-bold">Platform management</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Link to="/admin/settings" className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121212] p-5 transition hover:border-orange-400/40"><Settings className="size-5 text-orange-400"/><span className="font-bold">Footer & Site Settings</span></Link>
      <Link to="/admin/subscriptions" className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121212] p-5 transition hover:border-orange-400/40"><CreditCard className="size-5 text-orange-400"/><span className="font-bold">Subscription Management</span></Link>
      <Link to="/support" className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121212] p-5 transition hover:border-orange-400/40"><MessageSquare className="size-5 text-orange-400"/><span className="font-bold">Live Chat Inbox</span></Link>
    </div></section>

    <section className="mb-7 rounded-2xl border border-white/10 bg-[#111] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-orange-400/10 text-orange-400"><Bell className="size-5"/></div><div><h2 className="text-xl font-bold">Broadcast notification</h2><p className="text-sm text-white/40">Send an announcement to all registered users.</p></div></div></div>
      <form onSubmit={sendAnnouncement} className="space-y-3"><Input className="border-white/10 bg-black/30" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Announcement title" maxLength={100} required/><Textarea className="min-h-24 border-white/10 bg-black/30" value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} placeholder="Write your announcement…" maxLength={1000} required/><div className="flex justify-end"><Button type="submit" disabled={sendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()} className="bg-orange-400 font-bold text-black hover:bg-orange-300"><Send className="mr-2 size-4"/>{sendingAnnouncement ? "Sending…" : "Send to all users"}</Button></div></form>
    </section>

    <section className="rounded-2xl border border-white/10 bg-[#111] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-orange-400/10 text-orange-400"><Bot className="size-5"/></div><div><h2 className="text-xl font-bold">BIG AI Controls</h2><p className="text-sm text-white/40">Manage the assistant shown to users.</p></div></div><Switch checked={ai.enabled} onCheckedChange={(enabled) => setAi((current) => ({ ...current, enabled }))}/></div>
      <div className="grid gap-4"><label className="text-sm font-medium text-white/70">AI name<Input className="mt-2 border-white/10 bg-black/30" value={ai.name} onChange={(e) => setAi((current) => ({ ...current, name: e.target.value }))}/></label><label className="text-sm font-medium text-white/70">Welcome message<Input className="mt-2 border-white/10 bg-black/30" value={ai.welcome_message} onChange={(e) => setAi((current) => ({ ...current, welcome_message: e.target.value }))}/></label><label className="text-sm font-medium text-white/70">System instructions<Textarea className="mt-2 min-h-32 border-white/10 bg-black/30" value={ai.system_prompt} onChange={(e) => setAi((current) => ({ ...current, system_prompt: e.target.value }))}/></label><div className="flex items-center justify-between border-t border-white/10 pt-4"><span className="text-xs text-white/35">AI provider secrets remain server-side.</span><Button onClick={() => void saveAi()} disabled={savingAi} className="bg-orange-400 font-bold text-black hover:bg-orange-300"><Save className="mr-2 size-4"/>{savingAi ? "Saving…" : "Save BIG AI"}</Button></div></div>
    </section>
    <div className="mt-6 flex items-center gap-2 text-xs text-white/30"><Activity className="size-4"/>Admin access is protected by the database-backed user_roles table.</div>
  </main></div>;
}
