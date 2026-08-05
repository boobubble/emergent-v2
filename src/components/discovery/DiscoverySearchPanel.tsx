import { useMemo, useState } from "react";
import { Search, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCOVERY_LANGUAGE_OPTIONS } from "@/lib/discovery/config";
import {
  searchDiscoveryOptions,
  type DiscoveryNestedOption,
  type DiscoveryPrimaryOption,
  type DiscoverySearchHit,
} from "@/lib/discovery/discovery-options";
import type { DiscoveryDraft } from "@/lib/discovery/discovery-draft";
import { buildDraftLabel } from "@/lib/discovery/discovery-label";

type Props = {
  draft: DiscoveryDraft;
  primaryOptions: DiscoveryPrimaryOption[];
  nestedOptions: DiscoveryNestedOption[];
  enabledLanguages: string[];
  onApplySearchHit: (hit: DiscoverySearchHit) => void;
  onToggleInterest: (slug: string) => void;
  onRemoveInterest: (slug: string) => void;
  className?: string;
};

const GROUP_ORDER = ["Countries", "Cities/Regions", "Languages", "Topics"] as const;

export function DiscoverySearchPanel({
  draft,
  primaryOptions,
  nestedOptions,
  enabledLanguages,
  onApplySearchHit,
  onToggleInterest,
  onRemoveInterest,
  className,
}: Props) {
  const [query, setQuery] = useState("");

  const languages = useMemo(
    () => DISCOVERY_LANGUAGE_OPTIONS.filter((l) => !enabledLanguages.length || enabledLanguages.includes(l.code)),
    [enabledLanguages],
  );

  const hits = useMemo(
    () => searchDiscoveryOptions(query, primaryOptions, nestedOptions, languages),
    [query, primaryOptions, nestedOptions, languages],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, DiscoverySearchHit[]>();
    for (const g of GROUP_ORDER) map.set(g, []);
    for (const h of hits) {
      const list = map.get(h.group) ?? [];
      list.push(h);
      map.set(h.group, list);
    }
    return GROUP_ORDER.map((g) => ({ group: g, items: map.get(g) ?? [] })).filter((x) => x.items.length);
  }, [hits]);

  const selectedNested = draft.interests
    .map((slug) => nestedOptions.find((n) => n.slug === slug))
    .filter(Boolean) as DiscoveryNestedOption[];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries, cities, languages, topics…"
          className="premium-surface w-full rounded-xl border-0 py-2.5 pl-9 pr-9 text-sm outline-none ring-1 ring-border focus:ring-primary/40"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {selectedNested.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedNested.map((n) => (
            <button
              key={n.slug}
              type="button"
              onClick={() => onRemoveInterest(n.slug)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {n.emoji ? `${n.emoji} ` : ""}{n.label}
              <X className="h-3 w-3 opacity-70" />
            </button>
          ))}
        </div>
      )}

      {query.trim() && grouped.length === 0 && (
        <p className="text-xs text-muted-foreground">No matches for “{query.trim()}”.</p>
      )}

      {grouped.map(({ group, items }) => (
        <div key={group}>
          <div className="premium-section-label mb-1 mt-0 px-0">{group}</div>
          <div className="space-y-1">
            {items.map((hit) => (
              <button
                key={`${group}-${hit.id}`}
                type="button"
                onClick={() => {
                  onApplySearchHit(hit);
                  if (hit.slug) onToggleInterest(hit.slug);
                }}
                className="premium-surface premium-surface-hover flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm"
              >
                <span className="text-base">{hit.emoji ?? "•"}</span>
                <span className="flex-1 truncate font-medium">{hit.label}</span>
                {hit.slug && draft.interests.includes(hit.slug) && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!query.trim() && draft.primaryId && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{buildDraftLabel(draft.primaryId, draft.interests, primaryOptions, nestedOptions)}</span>
        </div>
      )}
    </div>
  );
}
