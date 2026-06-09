import { useState } from "react";
import { RotateCcw, Plus, X } from "lucide-react";
import { useFeedPrefs, type DefaultTab, type FeedSort, type DefaultPrivacy } from "@/lib/feed-prefs";
import { useSoundPrefs, setSoundPref, type SoundKind } from "@/lib/sound-prefs";

export function FeedSettingsPanel() {
  const { prefs, setPrefs, reset } = useFeedPrefs();
  const soundPrefs = useSoundPrefs();
  const soundItems: { key: SoundKind; label: string }[] = [
    { key: "public_chat", label: "Public chatroom sounds" },
    { key: "private_chat", label: "Private message sounds" },
    { key: "notifications", label: "Notification sounds" },
    { key: "username_mention", label: "Username mention sound" },
    { key: "calls", label: "Voice / video call sounds" },
  ];
  const [kw, setKw] = useState("");
  const [tag, setTag] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Feed settings</h2>
          <p className="text-xs text-muted-foreground">Saved on this device.</p>
        </div>
        <button
          onClick={() => { if (confirm("Reset feed settings to defaults?")) reset(); }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <Section title="Display">
        <Select
          label="Default tab"
          value={prefs.defaultTab}
          onChange={(v) => setPrefs({ defaultTab: v as DefaultTab })}
          options={[
            { v: "foryou", l: "For You" },
            { v: "trending", l: "Trending" },
            { v: "latest", l: "Latest" },
            { v: "friends", l: "Friends" },
          ]}
        />
        <Select
          label="Sort posts by"
          value={prefs.sortOverride}
          onChange={(v) => setPrefs({ sortOverride: v as FeedSort })}
          options={[
            { v: "smart", l: "Smart (follow tab)" },
            { v: "latest", l: "Latest" },
            { v: "trending", l: "Trending" },
          ]}
        />
        <Toggle label="Compact post cards" checked={prefs.compactCards} onChange={(b) => setPrefs({ compactCards: b })} />
        <Toggle label="Hide reaction & comment counts" checked={prefs.hideCounts} onChange={(b) => setPrefs({ hideCounts: b })} />
        <Toggle label="Hide media posts" checked={prefs.hideMedia} onChange={(b) => setPrefs({ hideMedia: b })} />
        <Toggle label="Autoplay videos" checked={prefs.autoplayVideos} onChange={(b) => setPrefs({ autoplayVideos: b })} />
        <Toggle label="Floating emoji effects" checked={prefs.emojiEffects} onChange={(b) => setPrefs({ emojiEffects: b })} />
      </Section>

      <Section title="Posting">
        <Select
          label="Default post privacy"
          value={prefs.defaultPrivacy}
          onChange={(v) => setPrefs({ defaultPrivacy: v as DefaultPrivacy })}
          options={[
            { v: "public", l: "Public" },
            { v: "friends", l: "Friends only" },
          ]}
        />
        <Toggle label="Post anonymously by default" checked={prefs.anonymousByDefault} onChange={(b) => setPrefs({ anonymousByDefault: b })} />
      </Section>

      <Section title="Notifications">
        <Toggle label="Sound on new posts" checked={prefs.postSound} onChange={(b) => setPrefs({ postSound: b })} />
        <Toggle label="Friend posts" checked={prefs.notifyFriendPosts} onChange={(b) => setPrefs({ notifyFriendPosts: b })} />
        <Toggle label="Comments on my posts" checked={prefs.notifyComments} onChange={(b) => setPrefs({ notifyComments: b })} />
        <Toggle label="Reactions on my posts" checked={prefs.notifyReactions} onChange={(b) => setPrefs({ notifyReactions: b })} />
        <Toggle label="Direct messages" checked={prefs.notifyDMs} onChange={(b) => setPrefs({ notifyDMs: b })} />
      </Section>

      <Section title="Sounds">
        {soundItems.map((s) => (
          <Toggle
            key={s.key}
            label={s.label}
            checked={soundPrefs[s.key] !== false}
            onChange={(b) => setSoundPref(s.key, b)}
          />
        ))}
      </Section>

      <Section title="Muted keywords">
        <p className="text-xs text-muted-foreground">Hide posts containing these words.</p>
        <ChipInput
          placeholder="Add a word and press Enter"
          value={kw}
          setValue={setKw}
          items={prefs.mutedKeywords}
          onAdd={(v) => {
            const w = v.trim().toLowerCase();
            if (!w || prefs.mutedKeywords.includes(w)) return;
            setPrefs({ mutedKeywords: [...prefs.mutedKeywords, w] });
          }}
          onRemove={(w) => setPrefs({ mutedKeywords: prefs.mutedKeywords.filter(x => x !== w) })}
        />
      </Section>

      <Section title="Muted hashtags">
        <p className="text-xs text-muted-foreground">Hide posts with these tags. Without the #.</p>
        <ChipInput
          placeholder="e.g. spoilers"
          value={tag}
          setValue={setTag}
          items={prefs.mutedHashtags}
          prefix="#"
          onAdd={(v) => {
            const w = v.trim().toLowerCase().replace(/^#/, "");
            if (!w || prefs.mutedHashtags.includes(w)) return;
            setPrefs({ mutedHashtags: [...prefs.mutedHashtags, w] });
          }}
          onRemove={(w) => setPrefs({ mutedHashtags: prefs.mutedHashtags.filter(x => x !== w) })}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 rounded-xl border border-border bg-background/40 p-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function ChipInput({
  placeholder, value, setValue, items, onAdd, onRemove, prefix,
}: {
  placeholder: string;
  value: string;
  setValue: (v: string) => void;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  prefix?: string;
}) {
  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => { e.preventDefault(); onAdd(value); setValue(""); }}
        className="flex items-center gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </form>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <span key={it} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
              {prefix}{it}
              <button onClick={() => onRemove(it)} className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" aria-label="Remove">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
