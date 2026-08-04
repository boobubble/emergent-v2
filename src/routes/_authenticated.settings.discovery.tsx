import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { COUNTRY_OPTIONS, flagFromCode } from "@/lib/country-flag";
import { DISCOVERY_LANGUAGE_OPTIONS, type UserContentPreference } from "@/lib/discovery/config";
import { getDiscoveryPrefs, getInterestTags, saveDiscoveryPrefs } from "@/lib/discovery/functions";
import { cn } from "@/lib/utils";
import { Compass } from "lucide-react";

type InterestTag = { slug: string; label: string; emoji: string | null; sort_order: number };

export const Route = createFileRoute("/_authenticated/settings/discovery")({
  component: DiscoverySettingsPage,
  head: () => ({ meta: [{ title: "Content & Discovery · Settings" }] }),
});

const PREFS: { id: UserContentPreference; label: string }[] = [
  { id: "for_you", label: "For You" },
  { id: "country_first", label: "Country First" },
  { id: "balanced", label: "Balanced" },
  { id: "worldwide_first", label: "Worldwide First" },
];

function DiscoverySettingsPage() {
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getDiscoveryPrefs);
  const fetchTags = useServerFn(getInterestTags);
  const savePrefs = useServerFn(saveDiscoveryPrefs);

  const prefsQ = useQuery({ queryKey: ["discovery-prefs"], queryFn: () => fetchPrefs() });
  const tagsQ = useQuery({ queryKey: ["interest-tags"], queryFn: () => fetchTags() });

  const prefs = prefsQ.data?.prefs;
  const config = prefsQ.data?.config;
  const lockCountry = config?.strictIsolation.lockDiscoveryCountry && !config.allowUserChangeDiscoveryCountry;

  async function update(patch: Record<string, unknown>) {
    try {
      await savePrefs({ data: patch });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Compass className="h-5 w-5" /> Content & Discovery</h1>
        <p className="text-sm text-muted-foreground">Control how Yaarzo personalizes chatrooms, feed, poetry and more.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Discovery country</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {COUNTRY_OPTIONS.map((c) => (
            <button
              key={c.code}
              type="button"
              disabled={lockCountry}
              onClick={() => update({ discovery_country_code: c.code })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                prefs?.discovery_country_code === c.code ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              {flagFromCode(c.code)} {c.name}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Languages</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {DISCOVERY_LANGUAGE_OPTIONS.map((l) => {
            const active = prefs?.preferred_languages?.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  const cur = prefs?.preferred_languages ?? [];
                  const next = active ? cur.filter((x) => x !== l.code) : [...cur, l.code];
                  update({ preferred_languages: next });
                }}
                className={cn("rounded-full border px-3 py-1 text-xs", active ? "border-primary bg-primary/10 text-primary" : "border-border")}
              >
                {l.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Interests</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(tagsQ.data as InterestTag[] | undefined ?? []).map((t) => {
            const active = prefs?.interests?.includes(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => {
                  const cur = prefs?.interests ?? [];
                  const next = active ? cur.filter((x) => x !== t.slug) : [...cur, t.slug];
                  update({ interests: next });
                }}
                className={cn("rounded-full border px-3 py-1 text-xs", active ? "border-primary bg-primary/10 text-primary" : "border-border")}
              >
                {t.emoji ? `${t.emoji} ` : ""}{t.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Content preference</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PREFS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update({ content_scope: p.id })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                prefs?.content_scope === p.id ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              {p.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" asChild><Link to="/chatroom">Open chatrooms</Link></Button>
        <Button variant="outline" asChild><Link to="/settings/privacy">Privacy settings</Link></Button>
        <Button variant="ghost" onClick={() => update({ reset_onboarding: true })}>Re-run onboarding</Button>
      </div>
    </div>
  );
}
