import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Minus, Code2, Undo2, Redo2, Smile,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const EMOJIS = ["😀","😂","😍","🔥","✨","🎉","👍","❤️","🙏","💡","🚀","✅","⭐","💬","🌟","🎮"];

/**
 * Lightweight contentEditable WYSIWYG editor — no heavy deps.
 * Uses document.execCommand which, while deprecated, remains widely
 * supported and is the smallest possible footprint for a CMS editor.
 */
export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string>(value);

  // Sync external value -> editor only when it diverges and editor isn't focused
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

  const insertLink = () => {
    const url = window.prompt("URL (https://… or /internal-slug)");
    if (!url) return;
    exec("createLink", url);
  };
  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    exec("insertImage", url);
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
        <TB onClick={insertImage} title="Image"><ImageIcon className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertHr} title="Separator"><Minus className="h-3.5 w-3.5" /></TB>
        <TB onClick={insertEmoji} title="Emoji"><Smile className="h-3.5 w-3.5" /></TB>
        <Sep />
        <TB onClick={() => exec("undo")} title="Undo"><Undo2 className="h-3.5 w-3.5" /></TB>
        <TB onClick={() => exec("redo")} title="Redo"><Redo2 className="h-3.5 w-3.5" /></TB>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
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
