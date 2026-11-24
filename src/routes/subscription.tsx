import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Crown, Loader2, ShieldCheck, Clock3, ReceiptText } from "lucide-react";
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

type Plan = { id: string; name: string; description: string; price_usd: number; duration_days: number; features: string[] };
type PaymentRequest = { id: string; amount_usd: number; payment_method: string; transaction_reference: string; status: string; created_at: string; user_subscriptions?: { status: string; ends_at: string | null; subscription_plans?: { name: string } } };

function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money");
  const [payerName, setPayerName] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/subscription" } as any });
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setLoadError("");
      const [planResult, requestResult] = await Promise.all([
        (supabase as any).from("subscription_plans").select("id,name,description,price_usd,duration_days,features").eq("is_active", true).order("sort_order"),
        (supabase as any).from("subscription_payments").select("id,amount_usd,payment_method,transaction_reference,status,created_at,user_subscriptions(status,ends_at,subscription_plans(name))").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      if (planResult.error || requestResult.error) {
        setLoadError(planResult.error?.message || requestResult.error?.message || "Could not load subscription information.");
      } else {
        setPlans((planResult.data ?? []) as Plan[]);
        setRequests((requestResult.data ?? []) as PaymentRequest[]);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user, authLoading, navigate]);

  const submitRequest = async () => {
    if (!selected || !payerName.trim() || !reference.trim()) {
      toast.error("Complete the payer name and transaction reference.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await (supabase as any).rpc("request_subscription", {
      _plan_id: selected.id,
      _payment_method: paymentMethod,
      _payer_name: payerName.trim(),
      _transaction_reference: reference.trim(),
      _notes: notes.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Payment request submitted for manual verification.");
    setSelected(null);
    setPayerName("");
    setReference("");
    setNotes("");
    const { data: refreshed, error: refreshError } = await (supabase as any).from("subscription_payments").select("id,amount_usd,payment_method,transaction_reference,status,created_at,user_subscriptions(status,ends_at,subscription_plans(name))").eq("user_id", user?.id).order("created_at", { ascending: false });
    if (!refreshError) setRequests(refreshed ?? []);
    if (!data) toast.message("Your request is being processed.");
  };

  return (
    <div className="min-h-screen bg-[#080808] px-4 pb-20 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-orange-400/30 bg-orange-400/10 text-orange-400"><Crown className="size-7" /></div>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-orange-400">BIG MOV Membership</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Choose your experience</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">Select a plan and submit your payment details. An administrator will verify your payment before premium access is activated.</p>
        </div>

        {loadError && <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">Subscription service unavailable: {loadError}. If the project database is paused, restore it in the Supabase dashboard before using subscriptions.</div>}

        {loading ? <div className="flex justify-center py-16 text-orange-400"><Loader2 className="size-7 animate-spin" /></div> : plans.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <section key={plan.id} className={`flex flex-col rounded-3xl border p-6 ${selected?.id === plan.id ? "border-orange-400 bg-orange-400/[.08]" : "border-white/10 bg-white/[.035]"}`}>
                <div className="mb-5 flex items-center justify-between"><span className="rounded-full bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">{plan.duration_days} days</span><Crown className="size-5 text-orange-400" /></div>
                <h2 className="text-2xl font-black">{plan.name}</h2>
                <p className="mt-2 min-h-10 text-sm text-white/50">{plan.description}</p>
                <div className="my-6 text-4xl font-black">${Number(plan.price_usd).toFixed(2)}<span className="ml-2 text-sm font-medium text-white/40">USD</span></div>
                <ul className="mb-7 flex-1 space-y-3 text-sm text-white/70">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => <li key={index} className="flex gap-2"><Check className="size-4 shrink-0 text-orange-400" />{feature}</li>)}
                </ul>
                <Button onClick={() => setSelected(plan)} className="w-full bg-orange-500 font-bold text-black hover:bg-orange-400">Choose plan</Button>
              </section>
            ))}
          </div>
        ) : !loading && !loadError ? (
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center"><Crown className="mx-auto size-8 text-orange-400" /><h2 className="mt-4 text-xl font-bold">Plans are being prepared</h2><p className="mt-2 text-sm text-white/45">There are no active subscription plans yet. Check back later.</p></div>
        ) : null}

        {selected && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-orange-400/25 bg-[#111] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Manual payment</p><h2 className="mt-1 text-2xl font-black">{selected.name}</h2></div><button onClick={() => setSelected(null)} className="text-white/50 hover:text-white" aria-label="Close">✕</button></div>
              <div className="mb-5 rounded-xl border border-white/10 bg-white/[.04] p-4"><div className="text-sm text-white/50">Amount to pay</div><div className="text-3xl font-black">${Number(selected.price_usd).toFixed(2)} USD</div><p className="mt-2 text-xs text-white/40">Pay using the payment instructions supplied by BIG MOV. Do not submit sensitive banking passwords or PINs.</p></div>
              <div className="space-y-4">
                <label className="block text-sm font-medium">Payment method<Input className="mt-2 border-white/10 bg-black/40" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Mobile Money, bank transfer..." /></label>
                <label className="block text-sm font-medium">Payer name<Input className="mt-2 border-white/10 bg-black/40" value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Name used for payment" /></label>
                <label className="block text-sm font-medium">Transaction reference<Input className="mt-2 border-white/10 bg-black/40" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Payment transaction ID" /></label>
                <label className="block text-sm font-medium">Additional note (optional)<Textarea className="mt-2 border-white/10 bg-black/40" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any details that help the admin verify the payment" /></label>
              </div>
              <div className="mt-6 flex gap-3"><Button variant="outline" className="flex-1 border-white/15" onClick={() => setSelected(null)}>Cancel</Button><Button className="flex-1 bg-orange-500 font-bold text-black hover:bg-orange-400" disabled={submitting} onClick={submitRequest}>{submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ReceiptText className="mr-2 size-4" />}Submit for review</Button></div>
            </section>
          </div>
        )}

        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[.025] p-6">
          <div className="mb-5 flex items-center gap-3"><Clock3 className="size-5 text-orange-400" /><h2 className="text-xl font-bold">Your payment requests</h2></div>
          {requests.length ? <div className="space-y-3">{requests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4"><div><div className="font-semibold">${Number(request.amount_usd).toFixed(2)} USD · {request.payment_method}</div><div className="mt-1 text-xs text-white/40">Reference: {request.transaction_reference} · {new Date(request.created_at).toLocaleDateString()}</div></div><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${request.status === "approved" ? "bg-emerald-400/10 text-emerald-300" : request.status === "rejected" ? "bg-red-400/10 text-red-300" : "bg-amber-400/10 text-amber-300"}`}>{request.status}</span></div>)}</div> : <p className="text-sm text-white/40">You have not submitted a payment request yet.</p>}
        </section>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/35"><ShieldCheck className="size-4 text-orange-400" />Premium access is granted only after an administrator verifies payment.</div>
        <div className="mt-6 text-center"><Link to="/help" className="text-sm text-orange-300 hover:text-orange-200">Need help? Contact BIG MOV support</Link></div>
      </div>
    </div>
  );
}
