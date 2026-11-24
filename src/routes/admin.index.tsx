import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, Bell, Bot, Film, Flag, HelpCircle, LayoutDashboard, MessageSquare,
  Radio, Save, Search, Settings, Shield, Sparkles, Tags, Tv, Users, ExternalLink,
  Download, Eye, CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [
    { title: "Admin Panel \u2014 BIG MOV" },
    { name: "description", content: "Manage BIG MOV content and assistant settings." },
    { property: "og:title", content: "Admin Panel \u2014 BIG MOV" },
    { property: "og:description", content: "Manage BIG MOV content and assistant settings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminPage,
});

const navSections: { title: string; items: { label: string; icon: typeof Film; active?: boolean }[] }[] = [
  { title: "Main", items: [{ label: "Dashboard", icon: LayoutDashboard, active: true }] },
  { title: "Content", items: [
    { label: "Movies", icon: Film }, { label: "TV Shows", icon: Tv },
    { label: "Catalog Curation", icon: Sparkles }, { label: "Genres & Categories", icon: Tags },
    { label: "Content Pages", icon: MessageSquare },
  ]},
  { title: "Community", items: [
    { label: "User Management", icon: Users }, { label: "Guest Access", icon: Shield },
    { label: "Live Chat", icon: MessageSquare },
  ]},
];

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, watchlist: 0, inquiries: 0, comments: 0, downloads: 0, watchHistory: 0, banned: 0 });
  const [ai, setAi] = useState({
    enabled: true, name: "BIG AI",
    welcome_message: "Hi! I can help you discover movies and use BIG MOV.",
    system_prompt: "You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful.",
  });
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [footer, setFooter] = useState<Record<string, string>>({
    social_instagram: "https://www.instagram.com/", social_x: "https://x.com/",
    social_youtube: "https://www.youtube.com/", social_whatsapp: "https://www.whatsapp.com/",
    social_facebook: "https://www.facebook.com/", ceo_name: "BIG MOV Founder",
    ceo_title: "Chief Executive Officer", ceo_bio: "", ceo_image_url: "",
  });
  const [planDraft, setPlanDraft] = useState({ name: "", description: "", price_usd: "", duration_days: "30", features: "" });
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isAdmin) return;
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("watchlist").select("*", { count: "exact", head: true }),
      supabase.from("big_ai_settings").select("enabled,name,welcome_message,system_prompt").eq("id", true).maybeSingle(),
    ]).then(([u, w, settings]) => {
      setStats((current) => ({ ...current, users: u.count ?? 0, watchlist: w.count ?? 0 }));
      if (settings.data) setAi(settings.data);
    });
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadAdminExtras = async () => {
      const [p, pay, site] = await Promise.all([
        (supabase as any).from("subscription_plans").select("*").order("sort_order"),
        (supabase as any).from("subscription_payments").select("id,user_id,subscription_id,amount_usd,payment_method,payer_name,transaction_reference,notes,status,created_at").eq("status", "pending").order("created_at", { ascending: true }),
        (supabase as any).from("site_settings").select("setting_value").eq("setting_key", "footer").maybeSingle(),
      ]);
      if (!p.error) setPlans(p.data ?? []);
      if (!pay.error) setPayments(pay.data ?? []);
      if (site.data?.setting_value) setFooter((current) => ({ ...current, ...site.data.setting_value }));
    };
    void loadAdminExtras();
  }, [isAdmin]);

  const saveFooter = async () => {
    const { error } = await (supabase as any).from("site_settings").upsert({
      setting_key: "footer", setting_value: footer, updated_at: new Date().toISOString(), updated_by: user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Footer details saved");
  };

  const createPlan = async () => {
    if (!planDraft.name.trim() || !planDraft.price_usd || Number(planDraft.price_usd) < 0 || Number(planDraft.duration_days) < 1) {
      return toast.error("Enter a plan name, valid USD price and duration.");
    }
    setSavingPlan(true);
    const { data, error } = await (supabase as any).from("subscription_plans").insert({
      name: planDraft.name.trim(), description: planDraft.description.trim(),
      price_usd: Number(planDraft.price_usd), duration_days: Number(planDraft.duration_days),
      features: planDraft.features.split("\\n").map((x: string) => x.trim()).filter(Boolean),
      sort_order: plans.length,
    }).select("*").single();
    setSavingPlan(false);
    if (error) return toast.error(error.message);
    setPlans((current) => [...current, data]);
    setPlanDraft({ name: "", description: "", price_usd: "", duration_days: "30", features: "" });
    toast.success("Subscription plan created");
  };

  const reviewPayment = async (paymentId: string, approve: boolean) => {
    const { error } = await (supabase as any).rpc("review_subscription_payment", { _payment_id: paymentId, _approve: approve });
    if (error) return toast.error(error.message);
    setPayments((current) => current.filter((payment) => payment.id !== paymentId));
    toast.success(approve ? "Payment approved and subscription activated" : "Payment rejected");
  };

  const saveAi = async () => {
    setSaving(true);
    const { error } = await supabase.from("big_ai_settings").upsert({ id: true, ...ai, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("BIG AI settings saved");
  };

  if (loading) return <div className="min-h-screen bg-[#070707] p-10 text-center text-white/50">Loading admin panel…</div>;
  if (!user) return null;
  if (!isAdmin) return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <Shield className="size-12 text-orange-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Admin only</h1>
        <p className="text-white/50 mt-2 mb-6">Your account doesn't have administrator access.</p>
        <Button asChild className="bg-orange-400 text-black hover:bg-orange-300"><Link to="/admin/login">Admin sign in</Link></Button>
      </div>
    </div>
  );

  const statCards = [
    { value: 0, label: "Custom Content", sub: "BIG MOV Originals", icon: Film },
    { value: stats.users, label: "Total Users", sub: "active accounts", icon: Users },
    { value: stats.inquiries, label: "Open Help Desk", sub: "total inquiries", icon: HelpCircle },
    { value: stats.comments, label: "Pending Comments", sub: "awaiting review", icon: MessageSquare },
  ];
  const compactCards = [
    { value: 0, label: "Signups (7d)", icon: Activity },
    { value: stats.downloads, label: "User Downloads", icon: Download },
    { value: stats.watchHistory, label: "Watch History", icon: Eye },
    { value: stats.banned, label: "Banned Users", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#0b0b0b] sticky top-0 h-screen">
          <div className="h-24 px-6 flex items-center gap-3 border-b border-white/[0.07]">
            <div className="size-11 rounded-xl bg-orange-400 text-black grid place-items-center font-black text-2xl shadow-[0_0_25px_rgba(249,115,22,.18)]">B</div>
            <div><div className="text-xl font-black tracking-wide">BIG MOV</div><div className="text-[11px] tracking-[0.25em] font-bold text-orange-400">ADMIN PANEL</div></div>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            {navSections.map((section) => (
              <div key={section.title} className="mb-6">
                <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.25em] text-white/25 font-bold">{section.title}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return <button key={item.label} className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${item.active ? "bg-orange-400/[0.12] text-orange-400 ring-1 ring-orange-400/20" : "text-white/55 hover:bg-white/[0.04] hover:text-white"}`}>
                      <Icon className="size-4" /><span>{item.label}</span>{item.active && <span className="ml-auto text-orange-400">›</span>}
                    </button>;
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-3 border-t border-white/[0.07]">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-orange-400 hover:bg-orange-400/[0.08]"><ExternalLink className="size-4" />View Live Website</Link>
            <div className="mt-2 rounded-xl border border-orange-400/20 bg-orange-400/[0.06] p-3">
              <div className="flex items-center gap-2 text-sm font-bold"><span className="size-2 rounded-full bg-orange-400 animate-pulse" />Live Website Linked</div>
              <p className="text-[11px] text-white/35 mt-1">Primary admin · full control</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="h-24 border-b border-white/[0.07] bg-[#090909]/95 backdrop-blur-xl flex items-center justify-between px-5 sm:px-8 sticky top-0 z-20">
            <div><p className="text-sm text-orange-400 font-semibold">Overview</p><h1 className="text-2xl font-black">Dashboard</h1></div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/[0.08] px-4 py-2 text-sm font-bold text-orange-400"><span className="size-2 rounded-full bg-orange-400 animate-pulse" />LIVE</div>
              <button className="size-11 rounded-xl border border-white/[0.07] bg-white/[0.03] grid place-items-center text-white/60 hover:text-white"><Bell className="size-5" /></button>
              <div className="size-11 rounded-xl bg-orange-400 text-black grid place-items-center font-black">B</div>
            </div>
          </header>

          <div className="p-5 sm:p-8 max-w-[1400px]">
            <section className="rounded-2xl border border-white/[0.08] bg-[#101010] p-7 sm:p-9 shadow-[0_20px_70px_rgba(0,0,0,.35)]">
              <div className="flex items-center gap-2 text-orange-400 text-sm font-bold uppercase tracking-[0.14em]"><Activity className="size-4" />Live Overview</div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black">Welcome back to BIG MOV</h2>
              <p className="mt-2 text-white/45">Full control of the live BIG MOV website, including users, content, chat, ads and settings.</p>
              <p className="mt-5 text-xs font-bold tracking-[0.15em] text-orange-400">PRIMARY ADMINISTRATOR · LINKED SESSION ACTIVE</p>
            </section>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-7">
              {statCards.map((card) => { const Icon = card.icon; return (
                <div key={card.label} className="rounded-2xl border border-white/[0.08] bg-[#141414] p-6">
                  <div className="size-12 rounded-xl bg-orange-400/[0.10] ring-1 ring-orange-400/25 grid place-items-center text-orange-400"><Icon className="size-6" /></div>
                  <div className="mt-5 text-4xl font-black">{card.value}</div><div className="mt-1 text-white/60 font-medium">{card.label}</div>
                  <div className="mt-5 pt-4 border-t border-white/[0.07] text-sm text-white/30">{card.sub}</div>
                </div>
              ); })}
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
              {compactCards.map((card) => { const Icon = card.icon; return (
                <div key={card.label} className="rounded-2xl border border-white/[0.08] bg-[#141414] px-5 py-4 flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-orange-400/[0.10] grid place-items-center text-orange-400"><Icon className="size-5" /></div>
                  <div><div className="text-2xl font-black">{card.value}</div><div className="text-xs text-white/40">{card.label}</div></div>
                </div>
              ); })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-7">
              {[
                ["Catalog", Sparkles], ["Help Desk", HelpCircle], ["Ads", Radio],
                ["Broadcasts", Bell], ["Live Chat", MessageSquare], ["Audit Log", Activity],
              ].map(([label, Icon]) => (
                <button key={String(label)} className="rounded-xl border border-white/[0.08] bg-[#141414] p-4 text-left hover:border-orange-400/25 hover:bg-[#181818] transition">
                  {typeof Icon !== "string" && <Icon className="size-5 text-orange-400 mb-3" />}
                  <span className="font-bold text-sm">{String(label)}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link to="/admin/settings" className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#141414] p-4 transition hover:border-orange-400/30"><Settings className="size-5 text-orange-400"/><span className="text-sm font-bold">Footer & Site Settings</span></Link>
              <Link to="/admin/subscriptions" className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#141414] p-4 transition hover:border-orange-400/30"><CreditCard className="size-5 text-orange-400"/><span className="text-sm font-bold">Subscription Management</span></Link>
              <Link to="/support" className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#141414] p-4 transition hover:border-orange-400/30"><MessageSquare className="size-5 text-orange-400"/><span className="text-sm font-bold">Open Live Chat Inbox</span></Link>
            </div>

            <div className="grid xl:grid-cols-2 gap-5 mt-7">
              <section className="rounded-2xl border border-white/[0.08] bg-[#111111] overflow-hidden">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between"><div className="flex items-center gap-3"><Activity className="size-5 text-orange-400" /><h2 className="font-bold text-lg">Recent Content</h2></div><button className="text-sm text-orange-400 font-semibold">View all ›</button></div>
                <div className="p-8 text-center text-white/25 text-sm">No custom content has been added yet.</div>
              </section>
              <section className="rounded-2xl border border-white/[0.08] bg-[#111111] overflow-hidden">
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between"><div className="flex items-center gap-3"><MessageSquare className="size-5 text-orange-400" /><h2 className="font-bold text-lg">Recent Comments</h2></div><button className="text-sm text-orange-400 font-semibold">All ›</button></div>
                <div className="p-8 text-center text-white/25 text-sm">No pending comments.</div>
              </section>
            </div>

            <section className="mt-7 rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3"><div className="size-11 rounded-xl bg-orange-400/[0.10] grid place-items-center text-orange-400"><Bot className="size-5" /></div><div><h2 className="font-bold text-lg">BIG AI Controls</h2><p className="text-sm text-white/35">Manage the assistant shown to users.</p></div></div>
                <Switch checked={ai.enabled} onCheckedChange={(enabled) => setAi((v) => ({ ...v, enabled }))} />
              </div>
              <div className="grid gap-5">
                <div><label className="text-sm font-medium text-white/70">AI name</label><Input className="mt-2 bg-black/30 border-white/10" value={ai.name} onChange={(e) => setAi((v) => ({ ...v, name: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-white/70">Welcome message</label><Input className="mt-2 bg-black/30 border-white/10" value={ai.welcome_message} onChange={(e) => setAi((v) => ({ ...v, welcome_message: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-white/70">System instructions</label><Textarea className="mt-2 min-h-32 bg-black/30 border-white/10" value={ai.system_prompt} onChange={(e) => setAi((v) => ({ ...v, system_prompt: e.target.value }))} /></div>
                <div className="flex items-center justify-between border-t border-white/[0.07] pt-5"><p className="text-xs text-white/30">The Gemini API key stays server-side.</p><Button onClick={saveAi} disabled={saving} className="bg-orange-400 text-black hover:bg-orange-300"><Save className="size-4 mr-2" />{saving ? "Saving…" : "Save BIG AI"}</Button></div>
              </div>
            </section>

            <section className="mt-7 grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-6">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">USD Subscription Plans</h2><p className="text-xs text-white/40">Create plans users can request by manual payment.</p></div><Crown className="size-5 text-orange-400"/></div>
                <div className="mb-5 space-y-2">
                  <Input placeholder="Plan name" value={planDraft.name} onChange={(e) => setPlanDraft((v) => ({ ...v, name: e.target.value }))} className="border-white/10 bg-black/30"/>
                  <Input placeholder="Short description" value={planDraft.description} onChange={(e) => setPlanDraft((v) => ({ ...v, description: e.target.value }))} className="border-white/10 bg-black/30"/>
                  <div className="grid grid-cols-2 gap-2"><Input type="number" min="0" step="0.01" placeholder="Price (USD)" value={planDraft.price_usd} onChange={(e) => setPlanDraft((v) => ({ ...v, price_usd: e.target.value }))} className="border-white/10 bg-black/30"/><Input type="number" min="1" placeholder="Duration (days)" value={planDraft.duration_days} onChange={(e) => setPlanDraft((v) => ({ ...v, duration_days: e.target.value }))} className="border-white/10 bg-black/30"/></div>
                  <Textarea placeholder="Features, one per line" value={planDraft.features} onChange={(e) => setPlanDraft((v) => ({ ...v, features: e.target.value }))} className="border-white/10 bg-black/30"/>
                  <Button onClick={createPlan} disabled={savingPlan} className="w-full bg-orange-400 text-black hover:bg-orange-300">{savingPlan ? "Creating…" : "Create plan"}</Button>
                </div>
                <div className="space-y-2">{plans.map((plan) => <div key={plan.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3"><div><p className="font-semibold">{plan.name}</p><p className="text-xs text-white/40">{plan.duration_days} days · {plan.is_active ? "Active" : "Hidden"}</p></div><span className="font-bold text-orange-300">${Number(plan.price_usd).toFixed(2)} USD</span></div>)}{!plans.length && <p className="text-sm text-white/35">No plans created yet.</p>}</div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-6">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Payment Verification</h2><p className="text-xs text-white/40">Approve only after checking the real payment record.</p></div><Shield className="size-5 text-orange-400"/></div>
                <div className="space-y-3">{payments.map((payment) => <div key={payment.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between"><span className="font-bold">${Number(payment.amount_usd).toFixed(2)} USD</span><span className="text-[10px] uppercase text-amber-300">Pending</span></div><p className="mt-2 text-sm">{payment.payment_method} · {payment.payer_name}</p><p className="mt-1 break-all text-xs text-white/40">Reference: {payment.transaction_reference}</p>{payment.notes && <p className="mt-2 text-xs text-white/45">{payment.notes}</p>}<div className="mt-3 flex gap-2"><Button size="sm" onClick={() => reviewPayment(payment.id, true)} className="bg-emerald-600 text-white hover:bg-emerald-500">Approve</Button><Button size="sm" variant="outline" onClick={() => reviewPayment(payment.id, false)} className="border-red-400/30 text-red-300 hover:bg-red-400/10">Reject</Button></div></div>)}{!payments.length && <p className="py-8 text-center text-sm text-white/35">No pending payment requests.</p>}</div>
              </div>
            </section>

            <section className="mt-7 rounded-2xl border border-white/[0.08] bg-[#111] p-6">
              <div className="mb-5"><h2 className="text-lg font-bold">Footer & Social Settings</h2><p className="text-xs text-white/40">These details appear on the public website footer.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Instagram URL","social_instagram"],["X URL","social_x"],["YouTube URL","social_youtube"],["WhatsApp URL","social_whatsapp"],["Facebook URL","social_facebook"],["CEO image URL","ceo_image_url"],["CEO name","ceo_name"],["CEO title","ceo_title"],
                ].map(([label,key]) => <label key={key} className="text-xs font-semibold text-white/60">{label}<Input value={footer[key] ?? ""} onChange={(e) => setFooter((v) => ({ ...v, [key]: e.target.value }))} className="mt-2 border-white/10 bg-black/30"/></label>)}
                <label className="text-xs font-semibold text-white/60 sm:col-span-2">CEO biography<Textarea value={footer.ceo_bio ?? ""} onChange={(e) => setFooter((v) => ({ ...v, ceo_bio: e.target.value }))} className="mt-2 border-white/10 bg-black/30"/></label>
              </div>
              <div className="mt-4 flex justify-end"><Button onClick={saveFooter} className="bg-orange-400 text-black hover:bg-orange-300"><Save className="mr-2 size-4"/>Save footer settings</Button></div>
            </section>

            <div className="mt-6 rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4 text-xs text-white/30 flex items-center gap-2"><Search className="size-4" />Admin design upgraded to the black and cinematic-orange control-room style from your reference.<Settings className="size-4 ml-auto" /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
