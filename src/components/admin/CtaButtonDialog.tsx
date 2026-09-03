import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
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
import {
  bindCtaButtonEditHandler,
  insertCtaButton,
  updateCtaButton,
  type CtaButtonAttrs,
} from "@/lib/cta-button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "insert" | "edit";
  initialLabel?: string;
  initialHref?: string;
  onConfirm: (attrs: CtaButtonAttrs) => void;
};

export function CtaButtonDialog({
  open,
  onOpenChange,
  mode,
  initialLabel = "",
  initialHref = "",
  onConfirm,
}: Props) {
  const [label, setLabel] = useState(initialLabel);
  const [href, setHref] = useState(initialHref);

  useEffect(() => {
    if (!open) return;
    setLabel(initialLabel);
    setHref(initialHref);
  }, [open, initialLabel, initialHref]);

  const handleConfirm = () => {
    onConfirm({ label, href });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit CTA button" : "Insert CTA button"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="generic-cta-label">Button text</Label>
            <Input
              id="generic-cta-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Start Chatting Now"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="generic-cta-href">Link to</Label>
            <Input
              id="generic-cta-href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/chatrooms"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {mode === "edit" ? "Save" : "Insert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useCtaButtonDialog(
  editor: Editor | null,
  insertDefaults?: { label: string; href: string },
) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"insert" | "edit">("insert");
  const [initialLabel, setInitialLabel] = useState("");
  const [initialHref, setInitialHref] = useState("");

  useEffect(() => {
    if (!editor) return;
    return bindCtaButtonEditHandler(editor, (attrs) => {
      setMode("edit");
      setInitialLabel(attrs.label);
      setInitialHref(attrs.href);
      setOpen(true);
    });
  }, [editor]);

  function openInsert() {
    setMode("insert");
    setInitialLabel(insertDefaults?.label ?? "");
    setInitialHref(insertDefaults?.href ?? "");
    setOpen(true);
  }

  function confirm(attrs: CtaButtonAttrs) {
    if (!editor) return;
    if (mode === "edit") updateCtaButton(editor, attrs);
    else insertCtaButton(editor, attrs);
    setOpen(false);
  }

  return {
    open,
    setOpen,
    mode,
    initialLabel,
    initialHref,
    openInsert,
    confirm,
  };
}
