import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePreferences, type Lang, type Theme } from "@/lib/preferences";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — BIG MOV" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const { theme, setTheme, lang, setLang, t } = usePreferences();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, bio, avatar_url").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? "");
        setBio(data?.bio ?? "");
        setAvatarUrl(data?.avatar_url ?? null);
      });
  }, [user]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center py-24 px-6">
        <h1 className="font-display text-3xl mb-3">{t("settings")}</h1>
        <p className="text-muted-foreground mb-6">Sign in to manage your account.</p>
        <Button asChild className="bg-primary"><Link to="/login">{t("signIn")}</Link></Button>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, bio }).eq("user_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    setUploading(false);
    if (dbErr) return toast.error(dbErr.message);
    setAvatarUrl(url);
    toast.success("Profile picture updated");
  };

  const removeAvatar = async () => {
    setUploading(true);
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setUploading(false);
    if (error) return toast.error(error.message);
    setAvatarUrl(null);
    toast.success("Removed");
  };

  return (
    <div className="mx-auto max-w-2xl py-10 px-4 sm:px-6">
      <h1 className="font-display text-4xl mb-8">{t("settings")}</h1>

      <section className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t("profile")}</h2>

        <div className="flex items-center gap-5 mb-6">
          <div className="size-20 rounded-full bg-surface-elevated overflow-hidden ring-2 ring-border shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-2xl font-semibold text-muted-foreground">
                {(displayName || user.email || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">{t("avatar")}</Label>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <Upload className="size-3.5 mr-1.5" />{avatarUrl ? t("change") : t("upload")}
              </Button>
              {avatarUrl && (
                <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={removeAvatar}>
                  <Trash2 className="size-3.5 mr-1.5" />{t("remove")}
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>{t("email")}</Label>
            <Input value={user.email ?? ""} disabled className="mt-1" />
          </div>
          <div>
            <Label>{t("displayName")}</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("bio")}</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" rows={3} />
          </div>
          <Button type="submit" disabled={busy} className="bg-primary hover:bg-primary/90">{busy ? t("saving") : t("save")}</Button>
        </form>
      </section>

      <section className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t("appearance")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>{t("theme")}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">{t("dark")}</SelectItem>
                <SelectItem value="light">{t("light")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("language")}</Label>
            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-destructive/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">{t("account")}</h2>
        <p className="text-sm text-muted-foreground mb-4">Sign out of this device.</p>
        <Button variant="outline" onClick={signOut}>{t("signOut")}</Button>
      </section>
    </div>
  );
}
