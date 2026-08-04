import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-store";
import { COUNTRY_OPTIONS, detectCountryCode, flagFromCode } from "@/lib/country-flag";
import { DISCOVERY_LANGUAGE_OPTIONS } from "@/lib/discovery/config";
import {
  getChatroomDiscovery,
  getDiscoveryPrefs,
  getInterestTags,
  saveDiscoveryPrefs,
} from "@/lib/discovery/functions";
import type { DiscoverableChannel } from "@/lib/discovery/types";
import { cn } from "@/lib/utils";

type InterestTag = { slug: string; label: string; emoji: string | null; sort_order: number };

type Props = {
  /** When true, shows the manual onboarding dialog (never auto-opens). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isMobile: boolean;
  joinedChannelIds: string[];
  onJoinChannels: (ids: string[]) => void;
};

export function DiscoveryOnboarding({ open: openProp, onOpenChange, isMobile, joinedChannelIds, onJoinChannels }: Props) {
  const { user } = useAuth();
  const fetchPrefs = useServerFn(getDiscoveryPrefs);
  const fetchTags = useServerFn(getInterestTags);
  const fetchDiscovery = useServerFn(getChatroomDiscovery);
  const savePrefs = useServerFn(saveDiscoveryPrefs);

  const prefsQ = useQuery({
    queryKey: ["discovery-prefs"],
    queryFn: () => fetchPrefs(),
    enabled: Boolean(user && !user.isGuest),
  });

  const tagsQ = useQuery({ queryKey: ["interest-tags"], queryFn: () => fetchTags() });

  const [open, setOpen] = useState(false);
  const dialogOpen = openProp ?? open;
  const setDialogOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  const [country, setCountry] = useState("WW");
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [interests, setInterests] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const config = prefsQ.data?.config;
  const suggested = prefsQ.data?.suggestedCountry ?? (detectCountryCode() || "US");

  useEffect(() => {
    if (!prefsQ.data) return;
    setCountry(prefsQ.data.prefs?.discovery_country_code ?? suggested);
    setLanguages(prefsQ.data.prefs?.preferred_languages?.length ? prefsQ.data.prefs.preferred_languages : ["en"]);
    setInterests(prefsQ.data.prefs?.interests ?? []);
  }, [prefsQ.data, suggested]);

  const discoveryQ = useQuery({
    queryKey: ["discovery-onboarding-channels", country, languages.join(","), interests.join(",")],
    queryFn: () => fetchDiscovery({ data: { joinedChannelIds, scope: "for_you" } }),
    enabled: dialogOpen && Boolean(user),
  });

  const recommended: DiscoverableChannel[] = discoveryQ.data?.recommended ?? [];

  useEffect(() => {
    if (!recommended.length) return;
    setSelected((prev) => (prev.length ? prev : recommended.slice(0, 4).map((c) => c.id)));
  }, [recommended]);

  const enabledLangs = useMemo(() => {
    const codes = new Set(config?.enabledLanguages ?? DISCOVERY_LANGUAGE_OPTIONS.map((l) => l.code));
    return DISCOVERY_LANGUAGE_OPTIONS.filter((l) => codes.has(l.code));
  }, [config]);

  const toggle = (list: string[], value: string, max = 12) =>
    list.includes(value) ? list.filter((x) => x !== value) : list.length < max ? [...list, value] : list;

  async function finish(skip: boolean) {
    if (!user) return;
    setSaving(true);
    try {
      await savePrefs({
        data: {
          discovery_country_code: country === "WW" ? null : country,
          preferred_languages: skip ? undefined : languages,
          interests: skip ? undefined : interests,
          selected_channel_ids: skip ? [] : selected,
          detected_country_code: detectCountryCode() || null,
          complete_onboarding: !skip,
          skip_with_defaults: skip,
        },
      });
      if (!skip) onJoinChannels(selected);
      setDialogOpen(false);
      await prefsQ.refetch();
    } finally {
      setSaving(false);
    }
  }

  if (!user || user.isGuest) return null;

  const body = (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <section>
        <h3 className="text-sm font-semibold">Country</h3>
        <p className="text-xs text-muted-foreground">We detected {flagFromCode(suggested)} {suggested}. Change if needed.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip active={country === "WW"} onClick={() => setCountry("WW")}>🌍 Worldwide</Chip>
          {COUNTRY_OPTIONS.filter((c) => !config?.enabledCountries?.length || config.enabledCountries.includes(c.code)).map((c) => (
            <Chip key={c.code} active={country === c.code} onClick={() => setCountry(c.code)}>
              {flagFromCode(c.code)} {c.name}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Languages</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {enabledLangs.map((l) => (
            <Chip key={l.code} active={languages.includes(l.code)} onClick={() => setLanguages(toggle(languages, l.code, 6))}>
              {l.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Interests</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {(tagsQ.data as InterestTag[] | undefined ?? []).map((t) => (
            <Chip key={t.slug} active={interests.includes(t.slug)} onClick={() => setInterests(toggle(interests, t.slug, 10))}>
              {t.emoji ? `${t.emoji} ` : ""}{t.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Recommended channels</h3>
        <div className="mt-2 space-y-2">
          {recommended.map((ch) => (
            <label key={ch.id} className="flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm">
              <Checkbox checked={selected.includes(ch.id)} onCheckedChange={() => setSelected(toggle(selected, ch.id, 20))} />
              <span>
                <span className="font-medium">{ch.name}</span>
                {ch.topic && <span className="block text-xs text-muted-foreground">{ch.topic}</span>}
              </span>
            </label>
          ))}
          {!recommended.length && <p className="text-xs text-muted-foreground">Recommendations update as you choose interests.</p>}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" disabled={saving} onClick={() => finish(true)}>Skip for Now</Button>
        <Button disabled={saving} onClick={() => finish(false)}>Continue to Chatrooms</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Choose what you want to explore</SheetTitle>
            <SheetDescription>Personalize Yaarzo across chatrooms, feed, poetry and more.</SheetDescription>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose what you want to explore</DialogTitle>
          <DialogDescription>Personalize Yaarzo across chatrooms, feed, poetry and more.</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
