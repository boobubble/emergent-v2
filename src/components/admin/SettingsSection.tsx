import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminToggle } from "@/components/admin/AdminToggle";

export function SettingsCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function NumberField({ label, value, onChange, min = 0, max, step = 1, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min} max={max} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * WoWonder-style settings row: label + description on the left,
 * big ON/OFF pill on the right. Use everywhere in the admin panel.
 */
export function ToggleRow({ label, desc, value, onChange, disabled }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>}
      </div>
      <AdminToggle checked={value} onCheckedChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
  );
}

/**
 * Compact divided list of toggle rows (use inside a Card with `divide-y p-0`).
 */
export function ToggleListRow({ label, desc, value, onChange, disabled, icon }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
  disabled?: boolean; icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="truncate text-xs text-muted-foreground">{desc}</div>}
      </div>
      <AdminToggle checked={value} onCheckedChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
  );
}
