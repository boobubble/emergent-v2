import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Minus, Code2, Undo2, Redo2, Smile, Upload, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Optional bucket folder prefix, e.g. "pages" */
  uploadFolder?: string;
}

const EMOJIS = ["😀","😂","😍","🔥","✨","🎉","👍","❤️","🙏","💡","🚀","✅","⭐","💬","🌟","🎮"];
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export function RichTextEditor({ value, onChange, placeholder, uploadFolder = "pages" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastHtml = useRef<string>(value);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
      lastHtml.current = value;
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    try { document.execCommand(cmd, false, arg); } catch { /* noop */ }
    handleInput();
  };

  const handleInput = () => {
    const html = ref.current?.innerHTML ?? "";
    if (html !== lastHtml.current) {
      lastHtml.current = html;
      onChange(html);
    }
  };

  const insertImageAtCursor = (url: string, alt = "") => {
    ref.current?.focus();
    const safeAlt = alt.replace(/"/g, "&quot;");
    document.execCommand("insertHTML", false, `<img src="${url}" alt="${safeAlt}" style="max-width:100%;height:auto;" />`);
    handleInput();
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files are supported"); return null; }
    if (file.size > MAX_UPLOAD_BYTES) { toast.error("Image must be under 8 MB"); return null; }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${uploadFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await uploadFile(file);
    if (url) insertImageAtCursor(url, file.name.replace(/\.[^.]+$/, ""));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    const url = await uploadFile(file);
    if (url) insertImageAtCursor(url);
  };

  const handleDrop = async (e: React.DragEvent) => {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    e.preventDefault();
    const url = await uploadFile(file);
    if (url) insertImageAtCursor(url, file.name.replace(/\.[^.]+$/, ""));
  };

  const insertLink = () => {
    const url = window.prompt("URL (https://… or /internal-slug)");
    if (!url) return;
    exec("createLink", url);
  };
  const insertImageByUrl = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    insertImageAtCursor(url);
  };
  const insertHr = () => exec("insertHorizontalRule");
  const insertEmoji = () => {
    const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    exec("insertText", e);
  };

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        <TB onClick={() => exec("formatBlock", "<h1>")} title="H1"><Heading1 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("formatBlock", "<h2>")} title="H2"><Heading2 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("formatBlock", "<h3>")} title="H3"><Heading3 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("formatBlock", "<p>")} title="Paragraph"><span className="text-[10px] font-semibold">P</span></TB>
        <Sep />
        <TB onClick={() => exec("bold")} title="Bold"><Bold className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("italic")} title="Italic"><Italic className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("underline")} title="Underline"><Underline className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB onClick={() => exec("insertUnorderedList")} title="Bullet list"><List className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("formatBlock", "<blockquote>")} title="Quote"><Quote className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("formatBlock", "<pre>")} title="Code block"><Code2 className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB onClick={insertLink} title="Link"><LinkIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => fileRef.current?.click()} title="Upload image">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        </TB>
        <TB onClick={insertImageByUrl} title="Image by URL"><ImageIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertHr} title="Separator"><Minus className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertEmoji} title="Emoji"><Smile className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB onClick={() => exec("undo")} title="Undo"><Undo2 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("redo")} title="Redo"><Redo2 className="h-3.5 w-3.5" /></TB>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePickFile}
      />
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        data-placeholder={placeholder ?? "Write your page content…"}
        className="prose prose-sm dark:prose-invert min-h-[280px] max-w-none p-3 text-sm outline-none [&[data-placeholder]:empty]:before:text-muted-foreground [&[data-placeholder]:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

function TB({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} title={title}>
      {children}
    </Button>
  );
}
function Sep() { return <div className="mx-1 h-5 w-px bg-border" />; }
