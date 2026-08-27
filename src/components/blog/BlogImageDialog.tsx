import { useRef, useState } from "react";
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
import { isSafeBlogUrl } from "@/lib/blog-sanitize";
import type { BlogImageAlign } from "@/lib/blog-image";

export type BlogImageDraft = {
  src: string;
  alt: string;
  title: string;
  align: BlogImageAlign;
  decorative: boolean;
};

export function BlogImageDialog({
  open,
  onOpenChange,
  uploading,
  onUpload,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  onUpload: (file: File) => Promise<string | null>;
  onInsert: (draft: BlogImageDraft) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [align, setAlign] = useState<BlogImageAlign>("center");
  const [decorative, setDecorative] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setSrc("");
    setAlt("");
    setTitle("");
    setAlign("center");
    setDecorative(false);
    setError("");
  }

  async function pickFile(file: File | undefined) {
    if (!file) return;
    const url = await onUpload(file);
    if (url) setSrc(url);
  }

  function submit() {
    if (!src.trim() || !isSafeBlogUrl(src)) {
      setError("Choose an image or paste a safe https image URL.");
      return;
    }
    if (!decorative && !alt.trim()) {
      setError("Add alt text, or mark the image as decorative.");
      return;
    }
    onInsert({
      src: src.trim(),
      alt: decorative ? "" : alt.trim(),
      title: title.trim(),
      align,
      decorative,
    });
    reset();
    onOpenChange(false);
  }

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
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>Describe the image for accessibility and search engines.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="blog-image-file">Image</Label>
            <input
              ref={fileRef}
              id="blog-image-file"
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
            />
          </div>
          <div>
            <Label htmlFor="blog-image-alt">Alt text</Label>
            <Input
              id="blog-image-alt"
              className="mt-2"
              value={alt}
              disabled={decorative}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="What is shown in the image?"
            />
          </div>
          <div>
            <Label htmlFor="blog-image-title">Title / caption (optional)</Label>
            <Input
              id="blog-image-title"
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Alignment</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["left", "center", "right"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="yz-blog-toolbar-btn capitalize"
                  data-active={align === value ? "true" : "false"}
                  onClick={() => setAlign(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={decorative}
              onChange={(e) => setDecorative(e.target.checked)}
            />
            Decorative image (empty alt)
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {uploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={uploading}>
            Insert image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
