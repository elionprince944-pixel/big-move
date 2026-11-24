import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Settings2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Site Settings — BIG MOV Admin" }] }),
  component: AdminSiteSettings,
});

type Settings = {
  social_instagram: string; social_x: string; social_youtube: string;
  social_whatsapp: string; social_facebook: string;
  ceo_name: string; ceo_title: string; ceo_bio: string; ceo_image_url: string;
  payment_instructions: string;
};
const defaults: Settings = {
  social_instagram: "", social_x: "", social_youtube: "", social_whatsapp: "", social_facebook: "",
  ceo_name: "ISHIMWE ELION PRINCE", ceo_title: "Chief Executive Officer",
  ceo_bio: "", ceo_image_url: "", payment_instructions: "",
};
const socialFields = [
  ["Instagram", "social_instagram"], ["X", "social_x"], ["YouTube", "social_youtube"],
  ["WhatsApp", "social_whatsapp"], ["Facebook", "social_facebook"],
] as const;

function AdminSiteSettings() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(defaults);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isAdmin) return;
    (supabase as any).from("site_settings").select("setting_value").eq("setting_key", "footer").maybeSingle()
      .then(({ data, error }: any) => {
        if (error) toast.error(error.message);
        if (data?.setting_value) setSettings({ ...defaults, ...data.setting_value });
        setLoaded(true);
      });
  }, [user, isAdmin, loading, navigate]);

  const setField = (key: keyof Settings, value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setBusy(true);
    const { error } = await (supabase as any).from("site_settings").upsert({ setting_key: "footer", setting_value: settings, updated_at: new Date().toISOString(), updated_by: user?.id });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Website settings saved. The public footer will use the updated details.");
  };

  if (loading || !loaded) return <div className="min-h-screen bg-[#080808] p-10 text-center text-white/50">Loading settings…</div>;
  if (!isAdmin) return <div className="min-h-screen bg-[#080808] p-10 text-center text-white">Administrator access required.</div>;

  return <main className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-8">
    <div className="mx-auto max-w-4xl">
      <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-orange-300 hover:text-orange-200"><ArrowLeft className="size-4"/>Back to admin</Link>
      <div className="mb-8 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-xl bg-orange-400/10 text-orange-400"><Settings2 className="size-6"/></div><div><p className="text-xs font-bold uppercase tracking-widest text-orange-400">Control room</p><h1 className="text-3xl font-black">Website settings</h1></div></div>

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#111] p-6">
        <h2 className="mb-1 text-xl font-bold">Social media URLs</h2><p className="mb-5 text-sm text-white/45">Only links you enter will appear in the public footer. Use full https:// URLs.</p>
        <div className="grid gap-4 sm:grid-cols-2">{socialFields.map(([label, key]) => <label key={key} className="block text-sm font-medium">{label}<Input className="mt-2 border-white/10 bg-black/40" value={settings[key]} onChange={(e) => setField(key, e.target.value)} placeholder={`https://${label === "X" ? "x.com" : label.toLowerCase()}.com/your-page"}/></label>)}</div>
      </section>

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#111] p-6">
        <h2 className="mb-1 text-xl font-bold">CEO profile</h2><p className="mb-5 text-sm text-white/45">These details are displayed in the public BIG MOV footer.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">CEO name<Input className="mt-2 border-white/10 bg-black/40" value={settings.ceo_name} onChange={(e) => setField("ceo_name", e.target.value)}/></label>
          <label className="block text-sm font-medium">CEO title<Input className="mt-2 border-white/10 bg-black/40" value={settings.ceo_title} onChange={(e) => setField("ceo_title", e.target.value)}/></label>
          <label className="block text-sm font-medium sm:col-span-2">Portrait image URL<Input className="mt-2 border-white/10 bg-black/40" value={settings.ceo_image_url} onChange={(e) => setField("ceo_image_url", e.target.value)} placeholder="https://..."/></label>
          <label className="block text-sm font-medium sm:col-span-2">Biography<Textarea className="mt-2 min-h-24 border-white/10 bg-black/40" value={settings.ceo_bio} onChange={(e) => setField("ceo_bio", e.target.value)} maxLength={500}/></label>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-white/10 bg-[#111] p-6">
        <h2 className="mb-1 text-xl font-bold">Manual payment instructions</h2><p className="mb-5 text-sm text-white/45">Users see this text when they choose a paid subscription. Include the approved payment method and destination details. Never ask users for a PIN or password.</p>
        <Textarea className="min-h-32 border-white/10 bg-black/40" value={settings.payment_instructions} onChange={(e) => setField("payment_instructions", e.target.value)} placeholder="Enter your official payment instructions here..."/>
      </section>

      <div className="flex justify-end"><Button onClick={() => void save()} disabled={busy} className="bg-orange-400 font-bold text-black hover:bg-orange-300"><Save className="mr-2 size-4"/>{busy ? "Saving…" : "Save all settings"}</Button></div>
    </div>
  </main>;
}
