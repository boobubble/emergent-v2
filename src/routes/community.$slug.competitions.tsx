import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listCompetitionsEnriched,
  type EnrichedCompetition,
} from "@/lib/competitions.functions";
import { CompetitionProfileCard } from "@/components/competitions/CompetitionProfileCard";
import { CompetitionEditorDialog, emptyCompetition } from "@/components/competitions/CompetitionEditorDialog";
import { Button } from "@/components/ui/button";
import { Plus, Trophy } from "lucide-react";
import { useCommunity } from "@/lib/community-context";

export const Route = createFileRoute("/community/$slug/competitions")({
  component: CommunityCompetitions,
});

function CommunityCompetitions() {
  const { community, communityId, isOwner } = useCommunity();
  const qc = useQueryClient();
  const list = useServerFn(listCompetitionsEnriched);
  const [editing, setEditing] = useState<any | null>(null);

  const { data: comps = [], isLoading } = useQuery({
    queryKey: ["competitions-community", communityId],
    queryFn: () => list({ data: { communityId } }),
  });

  const live = (comps as EnrichedCompetition[]).filter((c) => c.status === "live");
  const upcoming = (comps as EnrichedCompetition[]).filter((c) => c.status === "upcoming");
  const ended = (comps as EnrichedCompetition[]).filter((c) => c.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div>
          <h2 className="text-sm font-semibold">Community competitions</h2>
          <p className="text-xs text-muted-foreground">Hosted by {community.name}.</p>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setEditing({ ...emptyCompetition(), community_id: communityId })}>
            <Plus className="mr-1 h-4 w-4" /> New competition
          </Button>
        )}
      </div>

      <CompetitionEditorDialog
        value={editing}
        onChange={setEditing}
        invalidateKeys={[["competitions-community", communityId]]}
        onSaved={() => qc.invalidateQueries({ queryKey: ["competitions-community", communityId] })}
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : comps.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No community competitions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isOwner ? "Start one and rally your members." : "Come back soon — competitions are coming."}
          </p>
        </div>
      ) : (
        <>
          <Section title="Live" items={live} onEdit={isOwner ? (c) => setEditing(c) : undefined} />
          <Section title="Upcoming" items={upcoming} onEdit={isOwner ? (c) => setEditing(c) : undefined} />
          <Section title="Ended" items={ended} onEdit={isOwner ? (c) => setEditing(c) : undefined} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  onEdit,
}: {
  title: string;
  items: EnrichedCompetition[];
  onEdit?: (c: EnrichedCompetition) => void;
}) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <CompetitionProfileCard key={c.id} c={c} onEdit={onEdit} />
        ))}
      </div>
    </section>
  );
}
