import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Crown, CreditCard, Clock3, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [{ title: "Subscriptions — BIG MOV" }, { name: "description", content: "Choose a BIG MOV subscription plan." }] }),
  component: SubscriptionPage,
});

type Plan = { id: string; name: string; description: string; price_rwf: number; duration_days: number; features: string[] };
type Subscription = { id: string; status: string; starts_at: string | null; expires_at: string | null; created_at: string; subscription_plans?: { name: string; price_rwf: number } };

function SubscriptionPage() {
  const { user, loading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [{ data: planData, error: planError }, { data: settings }] = await Promise.all([
      (supabase as any).from("subscription_plans").select("*").eq("is_active", true).order("price_rwf", { ascending: true }),
      (supabase as any).from("site_settings").select("settings").eq("id", true).maybeSingle(),
    ]);
    if (planError) toast.error(planError.message);
    setPlans((planData ?? []) as Plan[]);
    setPaymentInstructions(settings?.settings?.payment_instructions ?? "");
    if (user) {
      const { data, error } = await (supabase as any).from("user_subscriptions")
        .select("*, subscription_plans(name,price_rwf)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setSubscriptions((data ?? []) as Subscription[]);
    } else setSubscriptions([]);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const submitRequest = async () => {
    if (!user) return toast.error("Sign in before requesting a subscription.");
    if (!selected) return;
    if (selected.price_rwf > 0 && reference.trim().length < 3) return toast.error("Enter the payment transaction reference.");
    setBusy(true);
    const { error } = await (supabase as any).rpc("request_subscription", {
      _plan_id: selected.id,
      _transaction_reference: reference.trim(),
      _payer_note: note.trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(selected.price_rwf === 0 ? "Free plan activated." : "Payment submitted for manual verification.");
    setSelected(null); setReference(""); setNote("");
    await load();
  };

  const activeSubscription = subscriptions.find((item) => item.status === "active" && (!item.expires_at || new Date(item.expires_at) > new Date()));
  const pendingSubscription = subscriptions.find((item) => item.status === "pending");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-orange-400/30 bg-orange-400/10 text-orange-400"><Crown className="size-7"/></div>
        <p className="text-xs font-bold uppercase tracking-[.24em] text-primary">BIG MOV Membership</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Choose your plan</h1>
        <p className="mt-3 text-muted-foreground">Plans are priced in Rwandan francs (RWF). Paid subscriptions are activated only after an administrator verifies the payment.</p>
      </div>

      {!user && <div className="mb-7 rounded-xl border border-border bg-card p-4 text-center text-sm">Sign in to request a plan. <Link to="/login" className="font-bold text-primary underline">Sign in here</Link>.</div>}
      {user && (activeSubscription || pendingSubscription) && <div className="mb-7 rounded-2xl border border-primary/25 bg-primary/[.06] p-5"><div className="flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-primary"/>Your subscription status</div>{activeSubscription ? <p className="mt-2 text-sm">Active: <strong>{activeSubscription.subscription_plans?.name ?? "BIG MOV plan"}</strong> · Expires {activeSubscription.expires_at ? new Date(activeSubscription.expires_at).toLocaleDateString() : "not set"}.</p> : <p className="mt-2 text-sm">Your request is awaiting payment verification by an administrator.</p>}</div>}

      {plans.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{plans.map((plan) => <article key={plan.id} className={`rounded-2xl border bg-card p-6 shadow-sm ${selected?.id === plan.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{plan.duration_days} day access</p><h2 className="mt-3 text-2xl font-black">{plan.name}</h2><p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description || "Access benefits included in this BIG MOV plan."}</p>
        <p className="my-6 text-3xl font-black tabular-nums">{plan.price_rwf.toLocaleString("en-RW")} <span className="text-sm font-semibold text-muted-foreground">RWF</span></p>
        <ul className="mb-6 space-y-2">{(plan.features ?? []).map((feature, index) => <li key={index} className="flex gap-2 text-sm"><Check className="size-4 shrink-0 text-primary"/>{feature}</li>)}</ul>
        <Button className="w-full" variant={selected?.id === plan.id ? "default" : "outline"} onClick={() => setSelected(plan)} disabled={!user}>{selected?.id === plan.id ? "Selected" : plan.price_rwf === 0 ? "Choose free plan" : "Choose plan"}</Button>
      </article>)}</div> : <div className="rounded-2xl border border-dashed border-border p-12 text-center"><Crown className="mx-auto mb-3 size-10 text-muted-foreground/40"/><h2 className="text-xl font-bold">No plans available yet</h2><p className="mt-2 text-sm text-muted-foreground">BIG MOV will publish subscription plans here when they are ready.</p></div>}

      {selected && user && <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Selected plan</p><h2 className="text-2xl font-black">{selected.name}</h2></div><p className="text-right text-xl font-black">{selected.price_rwf.toLocaleString("en-RW")} RWF</p></div>
        {selected.price_rwf > 0 ? <><div className="mb-5 rounded-xl border border-primary/20 bg-primary/[.06] p-4"><div className="flex items-center gap-2 font-bold"><CreditCard className="size-4 text-primary"/>Manual payment instructions</div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{paymentInstructions || "Payment instructions have not been configured. Contact BIG MOV support before paying."}</p></div><div className="space-y-3"><label className="block text-sm font-semibold">Payment transaction reference</label><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter your payment reference" maxLength={120}/><label className="block text-sm font-semibold">Additional note (optional)</label><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} placeholder="Payment name, time, or other details"/></div></> : <p className="mb-5 rounded-xl bg-muted p-4 text-sm">This is a free plan. No payment reference is required. It will activate immediately.</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button onClick={() => void submitRequest()} disabled={busy || (selected.price_rwf > 0 && reference.trim().length < 3)}>{busy ? "Submitting…" : selected.price_rwf === 0 ? "Activate free plan" : "Submit for verification"}</Button></div>
      </section>}

      {user && subscriptions.length > 0 && <section className="mt-10"><h2 className="mb-4 text-xl font-black">Subscription history</h2><div className="overflow-hidden rounded-xl border border-border">{subscriptions.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 last:border-0"><div><p className="font-semibold">{item.subscription_plans?.name ?? "Subscription plan"}</p><p className="mt-1 text-xs text-muted-foreground"><Clock3 className="mr-1 inline size-3"/>Requested {new Date(item.created_at).toLocaleDateString()}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : item.status === "pending" ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"}`}>{item.status}</span></div>)}</div></section>}
    </div>
  );
}
