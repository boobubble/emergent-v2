import { type ReactNode } from "react";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ComingSoonPanel({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
      <div className="mx-auto inline-flex items-center rounded-full bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
        Foundation only · UI wired later
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <ul className="mx-auto mt-2 max-w-md space-y-1 text-left text-sm text-muted-foreground">
        {points.map((p) => (
          <li key={p} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />{p}</li>
        ))}
      </ul>
    </div>
  );
}
