import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminSaveCompetitor } from "@/lib/competitions.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface CompetitorDraft {
  id?: string;
  competition_id: string;
  name: string;
  photo_url?: string | null;
  description?: string | null;
  linked_user_id?: string | null;
  sort_order?: number;
}

export function emptyCompetitor(competitionId: string, sortOrder = 0): CompetitorDraft {
  return { competition_id: competitionId, name: "", photo_url: "", description: "", linked_user_id: null, sort_order: sortOrder };
}

export function CompetitorEditorDialog({
  value, onChange, invalidateKey,
}: {
  value: CompetitorDraft | null;
  onChange: (v: CompetitorDraft | null) => void;
  invalidateKey: (string | number)[];
}) {
  const save = useServerFn(adminSaveCompetitor);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<CompetitorDraft | null>(value);
  useEffect(() => setDraft(value), [value]);

  const m = useMutation({
    mutationFn: (d: CompetitorDraft) => save({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: invalidateKey });
      onChange(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!draft) return null;
  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit competitor" : "Add competitor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input value={draft.photo_url ?? ""} onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <Label>Linked user ID (optional)</Label>
            <Input value={draft.linked_user_id ?? ""} onChange={(e) => setDraft({ ...draft, linked_user_id: e.target.value || null })} />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onChange(null)}>Cancel</Button>
          <Button
            disabled={!draft.name.trim() || m.isPending}
            onClick={() => m.mutate({ ...draft, name: draft.name.trim() })}
          >
            {m.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
