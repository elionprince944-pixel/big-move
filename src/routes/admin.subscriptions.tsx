import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, CircleDollarSign, Plus, Save, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — BIG MOV Admin" }] }),
  component: AdminSubscriptions,
});

type Plan = { id: string; name: string; description: string; price_rwf: number; duration_days: number; features: string[]; is_active: boolean };
type Payment = { id: string; subscription_id: string; user_id: string; amount_rwf: number; transaction_reference: string; payer_note: string; status: string; created_at: string; user_subscriptions?: { plan_id: string; subscription_plans?: { name: string; duration_days: number } } };

function AdminSubscriptions() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("5000");
  const [duration, setDuration] = useState("30");
  const [features, setFeatures] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, r] = await Promise.all([
      (supabase as any).from("subscription_plans").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("subscription_payments").select("*, user_subscriptions(plan_id,subscription_plans(name,duration_days))").order("created_at", { ascending: false }),
    ]);
    if (p.error) toast.error(p.error.message); else setPlans(p.data ?? []);
    if (r.error) toast.error(r.error.message); else setPayments(r.data ?? []);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (isAdmin) void load();
  }, [user, isAdmin, loading, navigate, load]);

  const resetForm = () => { setEditingId(""); setName(""); setDescription(""); setPrice("5000"); setDuration("30"); setFeatures(""); setActive(true); };
  const editPlan = (plan: Plan) => { setEditingId(plan.id); setName(plan.name); setDescription(plan.description ?? ""); setPrice(String(plan.price_rwf)); setDuration(String(plan.duration_days)); setFeatures((plan.features ?? []).join("\n")); setActive(plan.is_active); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const savePlan = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(price); const days = Number(duration);
    if (!name.trim() || !Number.isInteger(amount) || amount < 0 || !Number.isInteger(days) || days < 1) return toast.error("Enter a plan name, valid RWF price and duration.");
    setBusy(true);
    const payload = { name: name.trim(), description: description.trim(), price_rwf: amount, duration_days: days, features: features.split("\n").map((v) => v.trim()).filter(Boolean), is_active: active, updated_at: new Date().toISOString() };
    const result = editingId
      ? await (supabase as any).from("subscription_plans").update(payload).eq("id", editingId)
      : await (supabase as any).from("subscription_plans").insert(payload);
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    toast.success(editingId ? "Plan updated" : "Plan created");
    resetForm(); await load();
  };

  const reviewPayment = async (paymentId: string, decision: "approved" | "rejected") => {
    const { error } = await (supabase as any).rpc("admin_review_subscription_payment", { _payment_id: paymentId, _decision: decision });
    if (error) return toast.error(error.message);
    toast.success(decision === "approved" ? "Payment approved. Subscription activated." : "Payment rejected.");
    await load();
  };

  if (loading) return <div className="min-h-screen bg-[#080808] p-10 text-center text-white/50">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-[#080808] p-10 text-center text-white">Administrator access required.</div>;

  return <main className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-8"><div className="mx-auto max-w-6xl">
    <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-orange-300 hover:text-orange-200"><ArrowLeft className="size-4"/>Back to admin</Link>
    <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Revenue controls</p><h1 className="mb-8 text-3xl font-black">Subscription management</h1>
    <section className="mb-8 rounded-2xl border border-white/10 bg-[#111] p-6">
      <h2 className="mb-5 text-xl font-bold">{editingId ? "Edit subscription plan" : "Create a subscription plan"}</h2>
      <form onSubmit={savePlan} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Plan name<Input className="mt-2 border-white/10 bg-black/40" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60}/></label>
        <label className="text-sm font-medium">Price (RWF)<Input className="mt-2 border-white/10 bg-black/40" type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required/></label>
        <label className="text-sm font-medium">Duration (days)<Input className="mt-2 border-white/10 bg-black/40" type="number" min="1" max="3660" step="1" value={duration} onChange={(e) => setDuration(e.target.value)} required/></label>
        <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm">Plan visible to users<Switch checked={active} onCheckedChange={setActive}/></label>
        <label className="text-sm font-medium sm:col-span-2">Description<Textarea className="mt-2 border-white/10 bg-black/40" rows={2} value={description} onChange={(e) => setDescription(e.target.value)}/></label>
        <label className="text-sm font-medium sm:col-span-2">Features (one per line)<Textarea className="mt-2 border-white/10 bg-black/40" rows={4} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={"Feature one\nFeature two"}/></label>
        <div className="flex flex-wrap gap-2 sm:col-span-2"><Button type="submit" disabled={busy} className="bg-orange-400 font-bold text-black hover:bg-orange-300"><Save className="mr-2 size-4"/>{busy ? "Saving…" : editingId ? "Save changes" : "Create plan"}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel edit</Button>}</div>
      </form>
    </section>

    <section className="mb-10"><h2 className="mb-4 text-xl font-bold">Published plans ({plans.length})</h2><div className="grid gap-3 md:grid-cols-2">{plans.map((plan) => <div key={plan.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111] p-4"><div><div className="font-bold">{plan.name} <span className="ml-2 text-xs text-white/40">{plan.is_active ? "Published" : "Hidden"}</span></div><p className="mt-1 text-sm text-white/50">{plan.price_rwf.toLocaleString("en-RW")} RWF · {plan.duration_days} days</p></div><Button variant="outline" size="sm" onClick={() => editPlan(plan)}>Edit</Button></div>)}</div></section>

    <section><div className="mb-4 flex items-center gap-2"><CircleDollarSign className="size-5 text-orange-400"/><h2 className="text-xl font-bold">Manual payment review ({payments.filter((p) => p.status === "pending").length} pending)</h2></div>
      <div className="space-y-3">{payments.map((payment) => <article key={payment.id} className="rounded-xl border border-white/10 bg-[#111] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{payment.user_subscriptions?.subscription_plans?.name ?? "Subscription"} · {payment.amount_rwf.toLocaleString("en-RW")} RWF</p><p className="mt-1 text-xs text-white/45">User: {payment.user_id}</p><p className="mt-1 text-xs text-white/60">Reference: {payment.transaction_reference}</p>{payment.payer_note && <p className="mt-2 text-sm text-white/50">{payment.payer_note}</p>}<p className="mt-2 text-[10px] text-white/35">{new Date(payment.created_at).toLocaleString()}</p></div>
          <div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${payment.status === "approved" ? "bg-emerald-500/10 text-emerald-300" : payment.status === "rejected" ? "bg-red-500/10 text-red-300" : "bg-orange-500/10 text-orange-300"}`}>{payment.status}</span>{payment.status === "pending" && <><Button size="sm" onClick={() => void reviewPayment(payment.id, "approved")} className="bg-emerald-600 text-white hover:bg-emerald-500"><BadgeCheck className="mr-1 size-4"/>Approve</Button><Button size="sm" variant="destructive" onClick={() => void reviewPayment(payment.id, "rejected")}><XCircle className="mr-1 size-4"/>Reject</Button></>}</div>
        </div>
      </article>)}</div>
      {!payments.length && <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No payment requests yet.</p>}
    </section>
  </div></main>;
}
