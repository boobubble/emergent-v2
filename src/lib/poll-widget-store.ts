// Hook + helpers for the Chatroom Poll Discovery Widget.
//
// Reads `app_settings.poll_widget` (with realtime sync) and fetches the
// latest public poll posts from the Social Feed. No mutations happen here —
// all voting is performed on the feed page the CTA links to.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { postsSafe } from "@/lib/posts-safe";
import {
  POLL_WIDGET_DEFAULTS,
  mergePollWidgetConfig,
  sumVotes,
  type PollWidgetConfig,
  type PollPreview,
  type PollCategory,
} from "@/lib/poll-widget-config";

const SETTINGS_KEY = "poll_widget";

export function usePollWidgetConfig() {
  const [config, setConfig] = useState<PollWidgetConfig>(POLL_WIDGET_DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();
      if (!mounted) return;
      setConfig(mergePollWidgetConfig(data?.value));
      setReady(true);
    };
    load().catch(() => { if (mounted) setReady(true); });

    const channel = supabase
      .channel(`poll_widget_${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${SETTINGS_KEY}` },
        (payload) => {
          const next = (payload.new as { value?: unknown } | null)?.value;
          setConfig(mergePollWidgetConfig(next));
        },
      )
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  return { config, ready };
}

interface RawPollRow {
  id: string;
  slug: string;
  owner_id: string;
  is_anonymous: boolean;
  poll: { question: string; options: string[]; votes?: Record<string, number> } | null;
  reaction_count: number;
  trending_score: number;
  created_at: string;
}

export function usePollPreviews(config: PollWidgetConfig): {
  previews: PollPreview[];
  loading: boolean;
} {
  const [rows, setRows] = useState<RawPollRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config.enabled) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await postsSafe()
        .select("id, slug, owner_id, is_anonymous, poll, reaction_count, trending_score, created_at")
        .eq("kind", "poll")
        .eq("privacy", "public")
        .order("created_at", { ascending: false })
        .limit(40);
      if (!mounted) return;
      const polls = (data ?? []) as RawPollRow[];
      setRows(polls);

      const ownerIds = Array.from(
        new Set(polls.filter((p) => !p.is_anonymous && p.owner_id).map((p) => p.owner_id)),
      );
      if (ownerIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", ownerIds);
        if (!mounted) return;
        const map: Record<string, string> = {};
        for (const p of profs ?? []) map[p.id as string] = (p.username as string) ?? "user";
        setNames(map);
      }
      setLoading(false);
    })().catch(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [config.enabled]);

  const previews = useMemo<PollPreview[]>(() => {
    if (!config.enabled || !rows.length) return [];
    const lifetimeMs = Math.max(1, config.pollLifetimeDays) * 86_400_000;
    const now = Date.now();
    const dayAgo = now - 86_400_000;
    const weekAgo = now - 7 * 86_400_000;

    const toPreview = (row: RawPollRow, category: PollCategory): PollPreview | null => {
      if (!row.poll) return null;
      const created = new Date(row.created_at).getTime();
      const expiresAt = created + lifetimeMs;
      const creatorName = row.is_anonymous
        ? "Anonymous"
        : names[row.owner_id] ?? "Someone";
      return {
        id: row.id,
        slug: row.slug,
        question: row.poll.question,
        voteCount: sumVotes(row.poll.votes),
        creatorName,
        isAnonymous: row.is_anonymous,
        createdAt: row.created_at,
        expiresAt,
        status: now >= expiresAt ? "closed" : "open",
        category,
      };
    };

    const out: PollPreview[] = [];
    const used = new Set<string>();
    const pick = (
      enabled: boolean,
      category: PollCategory,
      pool: RawPollRow[],
      sort: (a: RawPollRow, b: RawPollRow) => number,
    ) => {
      if (!enabled) return;
      const sorted = [...pool].sort(sort);
      const row = sorted.find((r) => !used.has(r.id) && r.poll);
      if (!row) return;
      const p = toPreview(row, category);
      if (p) { out.push(p); used.add(row.id); }
    };

    pick(config.showTrending, "trending", rows, (a, b) => b.trending_score - a.trending_score);
    pick(
      config.showPollOfDay,
      "poll_of_day",
      rows.filter((r) => new Date(r.created_at).getTime() >= dayAgo),
      (a, b) => b.reaction_count - a.reaction_count,
    );
    pick(
      config.showCreatorPolls,
      "creator",
      rows.filter((r) => !r.is_anonymous),
      (a, b) => b.reaction_count - a.reaction_count,
    );
    pick(
      config.showWeeklyVote,
      "weekly",
      rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo),
      (a, b) => {
        const va = sumVotes(a.poll?.votes); const vb = sumVotes(b.poll?.votes);
        return vb - va;
      },
    );

    return out;
  }, [rows, names, config]);

  return { previews, loading };
}
