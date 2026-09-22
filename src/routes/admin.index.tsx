import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Users, Bookmark, Bot, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — BIG MOV" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, watchlist: 0 });
  const [ai, setAi] = useState({ enabled: true, name: "BIG AI", welcome_message: "Hi! I can help you discover movies and use BIG MOV.", system_prompt: "You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful." });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isAdmin) return;
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("watchlist").select("*", { count: "exact", head: true }),
      supabase.from("big_ai_settings").select("enabled,name,welcome_message,system_prompt").eq("id", true).maybeSingle(),
    ]).then(([u, w, settings]) => {
      setStats({ users: u.count ?? 0, watchlist: w.count ?? 0 });
      if (settings.data) setAi(settings.data);
    });
  }, [user, isAdmin, loading, navigate]);

  const saveAi = async () => {
    setSaving(true);
    const { error } = await supabase.from("big_ai_settings").upsert({ id: true, ...ai, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("BIG AI settings saved");
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md text-center py-24 px-6">
      <Shield className="size-10 text-primary mx-auto mb-3" />
      <h1 className="font-display text-3xl mb-3">Admin only</h1>
      <p className="text-muted-foreground mb-6">Your account doesn't have admin access.</p>
      <Button asChild className="bg-primary"><Link to="/admin/login">Admin sign in</Link></Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl py-10 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8"><Shield className="size-7 text-primary" /><h1 className="font-display text-4xl">Admin Dashboard</h1></div>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6"><Users className="size-5 text-primary mb-2" /><p className="text-sm text-muted-foreground">Total users</p><p className="font-display text-4xl">{stats.users}</p></div>
        <div className="bg-surface border border-border rounded-xl p-6"><Bookmark className="size-5 text-primary mb-2" /><p className="text-sm text-muted-foreground">Watchlist entries</p><p className="font-display text-4xl">{stats.watchlist}</p></div>
      </div>

      <section className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3"><div className="size-10 rounded-full bg-primary/15 flex items-center justify-center text-primary"><Bot className="size-5" /></div><div><h2 className="text-xl font-semibold">BIG AI Controls</h2><p className="text-sm text-muted-foreground">Manage the assistant shown to users.</p></div></div>
          <Switch checked={ai.enabled} onCheckedChange={enabled => setAi(v => ({ ...v, enabled }))} />
        </div>
        <div className="grid gap-5">
          <div><label className="text-sm font-medium">AI name</label><Input className="mt-1" value={ai.name} onChange={e => setAi(v => ({ ...v, name: e.target.value }))} /></div>
          <div><label className="text-sm font-medium">Welcome message</label><Input className="mt-1" value={ai.welcome_message} onChange={e => setAi(v => ({ ...v, welcome_message: e.target.value }))} /></div>
          <div><label className="text-sm font-medium">System instructions</label><Textarea className="mt-1 min-h-32" value={ai.system_prompt} onChange={e => setAi(v => ({ ...v, system_prompt: e.target.value }))} /></div>
          <div className="flex items-center justify-between border-t border-border pt-5"><p className="text-xs text-muted-foreground">The Gemini API key stays server-side.</p><Button onClick={saveAi} disabled={saving}><Save className="size-4 mr-2" />{saving ? "Saving…" : "Save BIG AI"}</Button></div>
        </div>
      </section>

      <section className="mt-6 bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Setup required</h2>
        <p className="text-sm text-muted-foreground">Run <code className="bg-muted px-1 rounded">supabase/big_ai.sql</code> in your Supabase SQL Editor, then add <code className="bg-muted px-1 rounded">GEMINI_API_KEY</code> to your server secrets.</p>
      </section>
    </div>
  );
}
