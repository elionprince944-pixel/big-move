import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Brand, FromBig } from "@/components/site/Brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Sign in \u2014 BIG MOV" },
    { name: "description", content: "Sign in to your BIG MOV account." },
    { property: "og:title", content: "Sign in \u2014 BIG MOV" },
    { property: "og:description", content: "Sign in to your BIG MOV account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    if (googleBusy) return;
    setGoogleBusy(true);

    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      setGoogleBusy(false);
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }

    if (result.redirected) return;

    setGoogleBusy(false);
    navigate({ to: "/" });
  };

  return (
    <div className="login-stage relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />
        <div className="absolute bottom-[-18rem] right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-orange-600/10 blur-[110px]" />
      </div>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-black/45 shadow-[0_35px_120px_rgba(0,0,0,.72)] backdrop-blur-2xl lg:grid-cols-[1.1fr_.9fr]">
        <section className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden px-7 py-12 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,116,0,.19),transparent_62%)]" />
          <div className="relative">
            <div className="mx-auto mb-5 grid size-32 place-items-center rounded-[2rem] border border-orange-300/25 bg-white/[.04] shadow-[0_0_80px_rgba(255,105,0,.22),inset_0_1px_0_rgba(255,255,255,.22)] backdrop-blur-xl sm:size-40">
              <Brand compact tagline />
            </div>
            <h2 className="font-display text-4xl font-black tracking-tight sm:text-6xl"><span className="text-white">BIG</span> <span className="text-primary">MOV</span></h2>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[.32em] text-white/55">Watch · Stream · Enjoy</p>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/65">Your next great story starts here. Discover movies and series in one cinematic destination.</p>
            <FromBig className="mt-8" />
          </div>
        </section>
        <section className="border-t border-white/10 bg-white/[.035] p-7 sm:p-10 lg:border-l lg:border-t-0">
          <div className="mb-7"><Brand compact tagline /></div>
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">Welcome back. Continue watching.</p>

        <Button onClick={onGoogle} disabled={googleBusy || busy} variant="outline" className="w-full mb-4">
          {googleBusy ? "Connecting to Google…" : "Continue with Google"}
        </Button>
        <div className="relative mb-4 text-center text-xs text-muted-foreground">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <span className="relative bg-surface px-2">or</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" disabled={busy || googleBusy} className="w-full bg-primary hover:bg-primary/90">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          New to BIG MOV? <Link to="/signup" className="text-primary hover:underline">Create account</Link>
        </p>
        </section>
      </div>
    </div>
  );
}
