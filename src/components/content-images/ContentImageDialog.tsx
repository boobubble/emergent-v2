import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBytes, optimizeImageFile, readImageDimensions, type OptimizeImageResult } from "@/lib/content-image-optimize";
import { isSafeContentImageSrc, isWeakAltText } from "@/lib/content-image-seo";

export type ContentImageDraft = {
  src: string;
  alt: string;
  title: string;
  align: "left" | "center" | "right";
  decorative: boolean;
  width: number | null;
  height: number | null;
  optimized: "true" | "unavailable" | null;
  bytes: number | null;
};

export type ContentImageDialogInitial = Partial<ContentImageDraft> & { fileName?: string };

export function ContentImageDialog({
  open,
  onOpenChange,
  uploading,
  mode = "insert",
  showAlign = true,
  initial,
  onUpload,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  mode?: "insert" | "replace";
  showAlign?: boolean;
  initial?: ContentImageDialogInitial | null;
  onUpload: (file: File) => Promise<string | null>;
  onInsert: (draft: ContentImageDraft) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [decorative, setDecorative] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [opt, setOpt] = useState<OptimizeImageResult["status"] | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  function reset() {
    setSrc(initial?.src ?? "");
    setAlt(initial?.alt ?? "");
    setTitle(initial?.title ?? "");
    setAlign(initial?.align ?? "center");
    setDecorative(initial?.decorative ?? false);
    setError("");
    setFileName(initial?.fileName ?? "");
    setFileSize(initial?.bytes ?? null);
    setWidth(initial?.width ?? null);
    setHeight(initial?.height ?? null);
    setOpt(initial?.optimized === "true" ? "ok" : initial?.optimized === "unavailable" ? "unavailable" : null);
  }

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.src]);

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setOptimizing(true);
    setError("");
    try {
      const optimized = await optimizeImageFile(file);
      const url = await onUpload(optimized.file);
      if (!url) return;
      setSrc(url);
      setFileName(optimized.fileName || file.name);
      setFileSize(optimized.outputBytes);
      setWidth(optimized.width || null);
      setHeight(optimized.height || null);
      setOpt(optimized.status);
      if (!alt.trim() && !decorative) {
        const guessed = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        if (guessed && !isWeakAltText(guessed, file.name)) setAlt(guessed);
      }
    } finally {
      setOptimizing(false);
    }
  }

  function submit() {
    if (!src.trim() || !isSafeContentImageSrc(src)) {
      setError("Choose an image or paste a safe https image URL.");
      return;
    }
    if (!decorative && isWeakAltText(alt, src)) {
      setError("Add a short description of what is shown, or mark the image as decorative.");
      return;
    }
    onInsert({
      src: src.trim(),
      alt: decorative ? "" : alt.trim(),
      title: title.trim(),
      align,
      decorative,
      width,
      height,
      optimized: opt === "ok" ? "true" : opt === "unavailable" ? "unavailable" : src.toLowerCase().includes(".webp") || src.toLowerCase().includes(".avif") ? "true" : null,
      bytes: fileSize,
    });
    onOpenChange(false);
  }

  const optLabel =
    opt === "ok" ? "✓ Optimized" : opt === "unavailable" ? "⚠ Optimization unavailable" : opt === "required" ? "⚠ Optimization required" : "—";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{mode === "replace" ? "Replace Image" : "Add Image"}</DialogTitle>
          <DialogDescription>Describe what is shown in the image for accessibility and search engines.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {src && isSafeContentImageSrc(src) && (
            <img src={src} alt="" className="max-h-40 w-full rounded-md border border-border object-contain" />
          )}
          <div>
            <Label htmlFor="content-image-file">Image</Label>
            <input
              ref={fileRef}
              id="content-image-file"
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void pickFile(file);
              }}
            />
            <Input
              className="mt-2"
              placeholder="Or paste https:// image URL"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              onBlur={async () => {
                if (!src || width) return;
                try {
                  const res = await fetch(src);
                  const blob = await res.blob();
                  const dims = await readImageDimensions(new File([blob], "remote", { type: blob.type }));
                  if (dims) {
                    setWidth(dims.width);
                    setHeight(dims.height);
                    setFileSize(blob.size);
                  }
                } catch {
                  /* remote probe is optional */
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            <p>File: {fileName || "—"}</p>
            <p>Size: {fileSize != null ? formatBytes(fileSize) : "—"}</p>
            <p>Dimensions: {width && height ? `${width}×${height}` : "—"}</p>
            <p>Optimization: {optLabel}</p>
          </div>
          <div>
            <Label htmlFor="content-image-alt">Alt text</Label>
            <Input
              id="content-image-alt"
              className="mt-2"
              value={alt}
              disabled={decorative}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="What is shown in the image?"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Describe what is shown in the image for accessibility and search engines.
            </p>
          </div>
          {showAlign && (
            <fieldset>
              <legend className="text-sm font-medium">Alignment</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["left", "center", "right"] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={align === value ? "secondary" : "outline"}
                    className="h-7 capitalize"
                    onClick={() => setAlign(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={decorative}
              onChange={(e) => setDecorative(e.target.checked)}
            />
            Decorative image
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {(uploading || optimizing) && (
            <p className="text-sm text-muted-foreground">{optimizing ? "Optimizing…" : "Uploading…"}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={uploading || optimizing}>
            {mode === "replace" ? "Replace Image" : "Insert Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
