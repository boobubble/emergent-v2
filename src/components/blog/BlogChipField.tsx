import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { addChip, addChipsFromInput, removeChip } from "@/lib/blog-taxonomy";

export function BlogChipField({
  id,
  label,
  hint,
  values,
  onChange,
  maxItems,
  maxLength,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  maxItems: number;
  maxLength: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const opts = { maxItems, maxLength };

  function commit(raw: string) {
    const result = addChip(values, raw, opts);
    if (result.added) {
      onChange(result.next);
      setDraft("");
      return;
    }
    if (result.reason === "empty") setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <Label htmlFor={id} className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      <div className="mt-2 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(removeChip(values, tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            if (next.includes(",")) {
              const split = addChipsFromInput(values, next, opts);
              onChange(split.next);
              setDraft(split.remainder);
              return;
            }
            setDraft(next);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[7rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {values.length}/{maxItems} · Enter or comma to add
      </p>
    </div>
  );
}
