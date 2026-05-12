import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin sign in — BIG MOV" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { setBusy(false); return toast.error(error?.message ?? "Sign in failed"); }
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    setBusy(false);
    if (!role) { await supabase.auth.signOut(); return toast.error("This account is not an administrator."); }
    toast.success("Welcome, admin");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface/80 backdrop-blur border border-primary/30 rounded-xl p-8" style={{ boxShadow: "var(--shadow-glow)" }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/15 mb-3">
            <Shield className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted area · authorized accounts only</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
          <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
          <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90">{busy ? "Verifying…" : "Sign in"}</Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Not an admin? <Link to="/login" className="text-primary hover:underline">User sign in</Link>
        </p>
      </div>
    </div>
  );
}
