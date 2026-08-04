import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PAGE_CTA_DEFAULTS,
  buildPageCtaHtml,
  type PageCtaDefaults,
  type PageCtaStyle,
} from "@/lib/page-cta";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: PageCtaDefaults;
  onInsert: (html: string) => void;
};

export function InsertCtaDialog({ open, onOpenChange, defaults, onInsert }: Props) {
  const base = defaults ?? DEFAULT_PAGE_CTA_DEFAULTS;
  const [buttonText, setButtonText] = useState(base.buttonText);
  const [href, setHref] = useState(base.href);
  const [note, setNote] = useState(base.note);
  const [openInNewTab, setOpenInNewTab] = useState(base.openInNewTab);
  const [style, setStyle] = useState<PageCtaStyle>(base.style);

  useEffect(() => {
    if (!open) return;
    setButtonText(base.buttonText);
    setHref(base.href);
    setNote(base.note);
    setOpenInNewTab(base.openInNewTab);
    setStyle(base.style);
  }, [open, base.buttonText, base.href, base.note, base.openInNewTab, base.style]);

  const handleInsert = () => {
    onInsert(
      buildPageCtaHtml({
        buttonText,
        href,
        note,
        openInNewTab,
        style,
      }),
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert call-to-action</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="cta-button-text">Button text</Label>
            <Input
              id="cta-button-text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder={DEFAULT_PAGE_CTA_DEFAULTS.buttonText}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cta-href">Link URL</Label>
            <Input
              id="cta-href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/chatrooms"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cta-note">Supporting note</Label>
            <Input
              id="cta-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={DEFAULT_PAGE_CTA_DEFAULTS.note}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cta-style">Style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as PageCtaStyle)}>
              <SelectTrigger id="cta-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="cta-new-tab">Open in new tab</Label>
              <p className="text-[11px] text-muted-foreground">
                External links always use rel=&quot;noopener noreferrer&quot; when opened in a new tab.
              </p>
            </div>
            <Switch id="cta-new-tab" checked={openInNewTab} onCheckedChange={setOpenInNewTab} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleInsert}>
            Insert CTA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
