import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  formatKeywordResearchMatch,
  mergeKeywords,
  parseKeywordResearch,
  prepareKeywordResearchTags,
  type KeywordResearchCandidate,
  type KeywordResearchMatch,
  type KeywordResearchTagPrep,
  type KeywordSaveMode,
} from "@/lib/content-automation/parse-keyword-research";

export type PasteKeywordResearchApply = {
  match: KeywordResearchCandidate | null;
  saveMode: KeywordSaveMode;
  extracted: string[];
  keywordsText: string;
  tags: string[];
  keywordPhrases: string[];
  prep: KeywordResearchTagPrep | null;
};

type PasteKeywordResearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** queue = full comma-separated keywords; tags = sanitized tags (+ SEO phrases). */
  variant: "queue" | "tags";
  requireMatch: boolean;
  candidates?: KeywordResearchCandidate[];
  matchFn?: (title: string, candidates: KeywordResearchCandidate[]) => KeywordResearchMatch;
  existingTags?: string[] | null;
  maxTags?: number;
  maxPhrases?: number;
  applyBusy?: boolean;
  candidatesLoading?: boolean;
  applyLabel?: string;
  description?: string;
  onApply: (payload: PasteKeywordResearchApply) => Promise<void> | void;
};

const PLACEHOLDER = `How to Make Real Friends Online: 10 Proven Tips
Choosing the right apps for online friendship (commercial)

* best apps to make friends online
* apps for making new friends`;

export function PasteKeywordResearchDialog({
  open,
  onOpenChange,
  variant,
  requireMatch,
  candidates = [],
  matchFn,
  existingTags,
  maxTags,
  maxPhrases,
  applyBusy,
  candidatesLoading,
  applyLabel,
  description,
  onApply,
}: PasteKeywordResearchDialogProps) {
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pasteMatch, setPasteMatch] = useState<KeywordResearchMatch | null>(null);
  const [extracted, setExtracted] = useState<string[]>([]);
  const [saveMode, setSaveMode] = useState<KeywordSaveMode>("replace");
  const [pickedMatch, setPickedMatch] = useState<KeywordResearchCandidate | null>(null);
  const [lastSave, setLastSave] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resetPreview() {
    setPasteError(null);
    setPasteMatch(null);
    setExtracted([]);
    setSaveMode("replace");
    setPickedMatch(null);
  }

  function applyParse(raw: string) {
    const parsed = parseKeywordResearch(raw);
    if (!parsed.title) {
      setPasteError(raw.trim() ? "Paste should start with the topic or page title." : null);
      setPasteMatch(null);
      setExtracted([]);
      setPickedMatch(null);
      return;
    }
    if (parsed.keywords.length === 0) {
      setPasteError(raw.includes("*") ? "No keywords found. Each keyword should be a bullet starting with * " : null);
      setPasteMatch(null);
      setExtracted([]);
      setPickedMatch(null);
      return;
    }
    setExtracted(parsed.keywords);
    setSaveMode("replace");
    if (!requireMatch || !matchFn) {
      setPasteError(null);
      setPasteMatch(null);
      setPickedMatch(null);
      return;
    }
    const match = matchFn(parsed.title, candidates);
    setPasteError(match.status === "none" ? match.message : null);
    setPasteMatch(match);
    setPickedMatch(match.status === "matched" ? match.match : null);
  }

  const selectedMatch = pickedMatch ?? (pasteMatch?.status === "matched" ? pasteMatch.match : null);
  const canApply = extracted.length > 0 && (!requireMatch || Boolean(selectedMatch));

  const existingFromMatch = selectedMatch?.keywords ?? null;
  const existingList =
    existingTags && existingTags.length
      ? existingTags
      : existingFromMatch
        ? existingFromMatch.split(",").map((p) => p.trim()).filter(Boolean)
        : [];
  const hasExisting = existingList.length > 0;

  const mergedExtracted =
    hasExisting && saveMode === "append" ? [...existingList, ...extracted] : extracted;
  const keywordsText = mergeKeywords(
    hasExisting ? existingList.join(", ") : null,
    extracted,
    hasExisting ? saveMode : "replace",
  );
  const prep =
    variant === "tags"
      ? prepareKeywordResearchTags(mergedExtracted, { maxTags, maxPhrases })
      : null;
  const previewText = variant === "tags" ? (prep?.tags ?? []).join(", ") : keywordsText;
  const previewCount = variant === "tags" ? (prep?.tags.length ?? 0) : keywordsText.split(",").map((p) => p.trim()).filter(Boolean).length;

  async function handleApply() {
    if (!canApply) return;
    try {
      await onApply({
        match: selectedMatch,
        saveMode: hasExisting ? saveMode : "replace",
        extracted,
        keywordsText,
        tags: prep?.tags ?? extracted,
        keywordPhrases: prep?.keywordPhrases ?? extracted,
        prep,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save keyword research");
      return;
    }
    const label = selectedMatch ? formatKeywordResearchMatch(selectedMatch) : "this item";
    const summary = `Applied ${previewCount} ${variant === "tags" ? "tag" : "keyword"}${previewCount === 1 ? "" : "s"} to ${label}`;
    setLastSave(summary);
    toast.success(summary);
    setPasteText("");
    resetPreview();
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => textareaRef.current?.focus());
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setPasteText("");
          resetPreview();
          setLastSave(null);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paste Keyword Research</DialogTitle>
          <DialogDescription>
            {description ??
              (requireMatch
                ? "Paste one topic or page block at a time. First line is the title; bullets starting with * become keywords. Preview the match before saving."
                : "Paste a keyword-cluster block. The first line can stay as the title; bullets starting with * populate tags. Preview before applying.")}
          </DialogDescription>
        </DialogHeader>

        {lastSave && (
          <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-200">
            {lastSave}
          </p>
        )}

        <Textarea
          ref={textareaRef}
          value={pasteText}
          onChange={(e) => {
            setPasteText(e.target.value);
            applyParse(e.target.value);
          }}
          onKeyDown={(e) => {
            if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
            e.preventDefault();
            if (canApply) void handleApply();
            else applyParse(pasteText);
          }}
          rows={12}
          className="font-mono text-xs"
          placeholder={PLACEHOLDER}
        />

        {pasteError && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            {pasteError}
          </p>
        )}

        {pasteMatch?.status === "ambiguous" && (
          <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">{pasteMatch.message}</p>
            <div className="flex flex-col gap-1">
              {pasteMatch.candidates.map((candidate) => (
                <Button
                  key={`${candidate.type}-${candidate.id}`}
                  type="button"
                  size="sm"
                  variant={pickedMatch?.id === candidate.id && pickedMatch.type === candidate.type ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setPickedMatch(candidate)}
                >
                  {formatKeywordResearchMatch(candidate)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {canApply && (
          <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
            {requireMatch && selectedMatch && (
              <p>
                <span className="font-medium">Matched:</span> {formatKeywordResearchMatch(selectedMatch)}
                {pasteMatch?.status === "matched" && pasteMatch.confidence === "derived" && (
                  <Badge variant="secondary" className="ml-2">
                    Derived match — confirm this is the right item
                  </Badge>
                )}
              </p>
            )}
            {!requireMatch && (
              <p className="text-muted-foreground">
                Will apply to the item you are editing — confirm this paste belongs here.
              </p>
            )}
            <p className="text-muted-foreground">
              Extracted {extracted.length} keyword{extracted.length === 1 ? "" : "s"}
              {variant === "tags" ? ` · ${previewCount} tag${previewCount === 1 ? "" : "s"} after quality trim` : ""}
            </p>
            {prep?.warning && (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-800 dark:text-amber-200">
                {prep.warning}
              </p>
            )}
            {hasExisting && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  This item already has {variant === "tags" ? "tags" : "keywords"}. Replace is the default for a fresh paste.
                </p>
                <pre className="max-h-20 overflow-auto whitespace-pre-wrap rounded border bg-background p-2 text-xs">
                  {existingList.join(", ")}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant={saveMode === "replace" ? "default" : "outline"} onClick={() => setSaveMode("replace")}>
                    Replace
                  </Button>
                  <Button type="button" size="sm" variant={saveMode === "append" ? "default" : "outline"} onClick={() => setSaveMode("append")}>
                    Merge
                  </Button>
                </div>
              </div>
            )}
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {variant === "tags" ? "Tags that will be saved" : hasExisting ? "Final keywords" : "Keyword preview"}
              </p>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded border bg-background p-2 text-xs">
                {previewText}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => applyParse(pasteText)}
            disabled={!pasteText.trim() || candidatesLoading}
          >
            Preview match
          </Button>
          <Button type="button" onClick={() => void handleApply()} disabled={!canApply || applyBusy}>
            {applyBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {applyLabel ?? (variant === "tags" ? "Save tags" : "Save keywords")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
