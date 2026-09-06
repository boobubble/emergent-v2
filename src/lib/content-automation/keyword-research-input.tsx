import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatResearchSource } from "@/lib/content-automation/parse-research-paste";
import {
  previewIdeaKeywordResearch,
  saveIdeaKeywordResearch,
} from "@/lib/content-automation/seo-engine.functions";

export type PendingIdeaForResearch = {
  id: number;
  type: "blog" | "page";
  identifier: string;
  baseName: string | null;
  keywords: string | null;
};

type OpportunityRow = {
  action: string;
  primaryKeyword: string;
  cannibalizationStatus: string;
  existingUrl: string | null;
  existingTitle: string | null;
  searchIntent: string;
  sources: string[];
};

type PreviewResult = {
  sources: string[];
  clustersFound: number;
  keywordsFound: number;
  duplicatesRemoved: number;
  primary: string[];
  secondary: string[];
  longTail: string[];
  keywordsText: string;
  opportunities: OpportunityRow[];
  cannibalizationRisks: number;
  errors: string[];
  idea: { mainKeyword: string; title: string };
};

function actionLabel(action: string): string {
  if (action === "new_content") return "ATTACH TO THIS ITEM";
  if (action === "merge_existing") return "MERGE INTO EXISTING";
  if (action === "use_as_secondary") return "USE AS SECONDARY";
  if (action === "skip_cannibalization") return "SKIP - CANNIBALIZATION RISK";
  return action;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: PendingIdeaForResearch | null;
};

export function PendingKeywordResearchDialog({ open, onOpenChange, idea }: Props) {
  const qc = useQueryClient();
  const previewFn = useServerFn(previewIdeaKeywordResearch);
  const saveFn = useServerFn(saveIdeaKeywordResearch);
  const [clusterText, setClusterText] = useState("");
  const [ideasText, setIdeasText] = useState("");
  const [extraText, setExtraText] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setClusterText("");
    setIdeasText("");
    setExtraText("");
    setPreview(null);
  }, [open, idea?.id, idea?.type]);

  const mainKeyword =
    (idea?.keywords || "").split(",")[0]?.trim()
    || idea?.baseName
    || idea?.identifier
    || "";

  const previewMut = useMutation({
    mutationFn: async () => {
      if (!idea) throw new Error("No pending item selected");
      return previewFn({
        data: {
          ideaType: idea.type,
          ideaId: idea.id,
          clusterText,
          ideasText,
          extraText,
        },
      }) as Promise<PreviewResult>;
    },
    onSuccess: (data) => {
      setPreview(data);
      toast.success(`Parsed ${data.keywordsFound} keywords for this item`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!idea) throw new Error("No pending item selected");
      return saveFn({
        data: {
          ideaType: idea.type,
          ideaId: idea.id,
          clusterText,
          ideasText,
          extraText,
        },
      });
    },
    onSuccess: (data: { keywordsFound?: number; keywordUpsert?: { upserted: number } }) => {
      toast.success(
        `Research saved on this pending item (${data.keywordsFound ?? 0} keywords). Not published — use Send to Content Generation when ready.`,
      );
      qc.invalidateQueries({ queryKey: ["content-automation-ideas"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>Keyword Research</DialogTitle>
          <DialogDescription>
            Paste RyRob Keyword Cluster and Neil Patel / Ubersuggest keywords for this pending item.
            Saving research never publishes — send to Content Generation separately.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {idea && (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <div className="font-medium">
                {idea.type === "blog" ? "Blog" : "Page"}: {idea.baseName || idea.identifier}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Main keyword: <span className="font-medium text-foreground">{mainKeyword || "—"}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">RyRob Keyword Cluster</label>
            <p className="text-xs text-muted-foreground">
              Paste the cluster block (Cluster heading + keyword lines). Main keyword is already the parent for this item.
            </p>
            <Textarea
              value={clusterText}
              onChange={(e) => setClusterText(e.target.value)}
              rows={8}
              className="font-mono text-xs"
              placeholder={`Cluster: ${mainKeyword || "your main keyword"}\n- related keyword\n- long tail keyword`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Neil Patel / Ubersuggest Keyword Ideas</label>
            <p className="text-xs text-muted-foreground">
              Paste the Keyword Ideas table (tabs or spaces). Volume, SD, PD, and intent are parsed when present.
            </p>
            <Textarea
              value={ideasText}
              onChange={(e) => setIdeasText(e.target.value)}
              rows={8}
              className="font-mono text-xs"
              placeholder={"Keyword Ideas\nkeyword\tVolume\tSD\t...\nindian chat room\t2400\t34"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Extra keywords (optional)</label>
            <Textarea
              value={extraText}
              onChange={(e) => setExtraText(e.target.value)}
              rows={3}
              className="font-mono text-xs"
              placeholder="comma or newline separated extras"
            />
          </div>

          {preview && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">{preview.keywordsFound} keywords</Badge>
                <Badge variant="secondary">{preview.clustersFound} clusters</Badge>
                <Badge variant="secondary">{preview.duplicatesRemoved} dupes removed</Badge>
                {preview.cannibalizationRisks > 0 && (
                  <Badge variant="destructive">{preview.cannibalizationRisks} cannibalization risks</Badge>
                )}
                {preview.sources.map((s) => (
                  <Badge key={s} variant="outline">{formatResearchSource(s)}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Will attach to this pending item only (replace keywords). Does not create new pending ideas or publish.
              </p>
              {preview.keywordsText && (
                <p className="line-clamp-3 text-xs" title={preview.keywordsText}>
                  <span className="font-medium">Keywords preview:</span> {preview.keywordsText}
                </p>
              )}
              {preview.opportunities.slice(0, 6).map((opp) => (
                <div key={`${opp.primaryKeyword}-${opp.action}`} className="border-t pt-2 text-xs">
                  <div className="font-medium">{opp.primaryKeyword}</div>
                  <div className="text-muted-foreground">
                    {actionLabel(opp.action)}
                    {opp.existingUrl ? ` · ${opp.existingTitle || opp.existingUrl}` : ""}
                  </div>
                </div>
              ))}
              {preview.errors.length > 0 && (
                <ul className="list-disc pl-4 text-xs text-amber-700 dark:text-amber-300">
                  {preview.errors.slice(0, 5).map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={previewMut.isPending || !idea}
            onClick={() => previewMut.mutate()}
          >
            {previewMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Preview
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saveMut.isPending || !idea}
              onClick={() => saveMut.mutate()}
            >
              {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Research
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
