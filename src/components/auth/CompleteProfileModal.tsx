import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SKIP_KEY = "palrgo:complete-profile-skip";

/**
 * Post-signup extended profile collection. Shown once per session when the
 * authenticated user has `profile_completed = false`. Fully skippable.
 */
export function CompleteProfileModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user || user.isGuest || user.isDemo) return;
    let cancel = false;
    (async () => {
      try { if (sessionStorage.getItem(`${SKIP_KEY}:${user.id}`) === "1") return; } catch { /* ignore */ }
      const { data } = await supabase
        .from("profiles")
        .select("profile_completed, display_name, about_me, country_code, city, interests")
        .eq("id", user.id)
        .maybeSingle();
      if (cancel || !data) return;
      const d = data as Record<string, unknown>;
      if (d.profile_completed === true) return;
      setDisplayName((d.display_name as string) ?? "");
      setAboutMe((d.about_me as string) ?? "");
      setCountry((d.country_code as string) ?? "");
      setCity((d.city as string) ?? "");
      const arr = Array.isArray(d.interests) ? (d.interests as string[]) : [];
      setInterestsText(arr.join(", "));
      setLoaded(true);
      setOpen(true);
    })();
    return () => { cancel = true; };
  }, [user]);

  function onPickAvatar(file: File | null) {
    setErr("");
    setAvatarFile(file);
    if (!file) { setAvatarPreview(""); return; }
    if (!file.type.startsWith("image/")) { setErr("Please choose an image."); setAvatarFile(null); return; }
    if (file.size > 2 * 1024 * 1024) { setErr("Image must be under 2MB."); setAvatarFile(null); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  async function uploadAvatar(userId: string): Promise<string | null> {
    if (!avatarFile) return null;
    const ext = (avatarFile.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "") || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("avatars").upload(path, avatarFile, { contentType: avatarFile.type, upsert: true });
    if (up.error) throw up.error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  function markSkipped(id: string) {
    try { sessionStorage.setItem(`${SKIP_KEY}:${id}`, "1"); } catch { /* ignore */ }
  }

  async function onSkip() {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from("profiles").update({ profile_completed: true } as never).eq("id", user.id);
    } finally {
      markSkipped(user.id);
      setOpen(false);
      setBusy(false);
    }
  }

  async function onSave() {
    if (!user) return;
    setErr(""); setBusy(true);
    try {
      const avatar_url = await uploadAvatar(user.id);
      const interests = interestsText
        .split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 12);
      const update: Record<string, unknown> = {
        profile_completed: true,
        display_name: displayName.trim() || null,
        about_me: aboutMe.trim().slice(0, 1000) || null,
        country_code: country.trim().toUpperCase().slice(0, 2) || null,
        city: city.trim().slice(0, 80) || null,
        interests,
      };
      if (avatar_url) update.avatar_url = avatar_url;
      const { error } = await supabase.from("profiles").update(update as never).eq("id", user.id);
      if (error) throw error;
      markSkipped(user.id);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onSkip(); }}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Finish your profile ✨</DialogTitle>
          <DialogDescription>Make it easier for friends to find you. You can skip and add these later.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Profile picture</label>
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-input text-[10px] text-muted-foreground">
                {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : <span>No image</span>}
              </div>
              <label className="flex-1 cursor-pointer rounded-full border border-dashed border-border bg-background px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground">
                {avatarPreview ? "Change image" : "Choose image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Display name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={40} placeholder="How should friends see you?" className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">About me</label>
            <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} maxLength={600} rows={3} placeholder="A short bio with emojis 🌟" className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
            <p className="mt-1 text-[10px] text-muted-foreground">{aboutMe.trim().split(/\s+/).filter(Boolean).length}/100 words</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Country</label>
              <input value={country} onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} placeholder="US" className="w-full rounded-lg bg-input px-3 py-2 text-sm uppercase outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">City</label>
              <input value={city} onChange={e => setCity(e.target.value)} maxLength={80} placeholder="e.g. Mumbai" className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Interests</label>
            <input value={interestsText} onChange={e => setInterestsText(e.target.value)} placeholder="music, gaming, anime, photography" className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
            <p className="mt-1 text-[10px] text-muted-foreground">Comma-separated. Up to 12 tags.</p>
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={onSkip} disabled={busy} className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent disabled:opacity-50">Skip for now</button>
            <button onClick={onSave} disabled={busy} className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
              {busy ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
