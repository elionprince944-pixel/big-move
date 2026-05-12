import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — BIG MOV" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? ""));
  }, [user]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center py-24 px-6">
        <h1 className="font-display text-3xl mb-3">Settings</h1>
        <p className="text-muted-foreground mb-6">Sign in to manage your account.</p>
        <Button asChild className="bg-primary"><Link to="/login">Sign in</Link></Button>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="mx-auto max-w-2xl py-10 px-4 sm:px-6">
      <h1 className="font-display text-4xl mb-8">Settings</h1>

      <section className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user.email ?? ""} disabled className="mt-1" />
          </div>
          <div>
            <Label>Display name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" disabled={busy} className="bg-primary hover:bg-primary/90">{busy ? "Saving…" : "Save changes"}</Button>
        </form>
      </section>

      <section className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Preferences</h2>
        <p className="text-sm text-muted-foreground">BIG MOV uses a dark cinematic theme by default.</p>
      </section>

      <section className="bg-surface border border-destructive/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <p className="text-sm text-muted-foreground mb-4">Sign out of this device.</p>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </section>
    </div>
  );
}
