import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Users, Bookmark } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — BIG MOV" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, watchlist: 0 });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isAdmin) return;
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("watchlist").select("*", { count: "exact", head: true }),
    ]).then(([u, w]) => setStats({ users: u.count ?? 0, watchlist: w.count ?? 0 }));
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md text-center py-24 px-6">
        <Shield className="size-10 text-primary mx-auto mb-3" />
        <h1 className="font-display text-3xl mb-3">Admin only</h1>
        <p className="text-muted-foreground mb-6">Your account doesn't have admin access.</p>
        <Button asChild className="bg-primary"><Link to="/admin/login">Admin sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-10 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="size-7 text-primary" />
        <h1 className="font-display text-4xl">Admin Dashboard</h1>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <Users className="size-5 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Total users</p>
          <p className="font-display text-4xl">{stats.users}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <Bookmark className="size-5 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Watchlist entries</p>
          <p className="font-display text-4xl">{stats.watchlist}</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Make a user an admin</h2>
        <p className="text-sm text-muted-foreground">
          Open the backend dashboard, find the user's ID under <code className="bg-muted px-1 rounded">auth.users</code>,
          then insert a row in <code className="bg-muted px-1 rounded">user_roles</code> with role <code className="bg-muted px-1 rounded">admin</code>.
        </p>
      </div>
    </div>
  );
}
