import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ACCENTS, useAccent } from "@/lib/use-accent";
import { useThemeMode, type ThemeMode } from "@/lib/use-theme-mode";
import { Sun, Moon, Monitor, Upload, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_admin/appearance")({
  component: Appearance,
});

function Appearance() {
  const { accent, setAccent } = useAccent();
  const { mode, setMode } = useThemeMode();

  const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Appearance" description="Theme mode, accent color, and brand assets." />

      <Card>
        <CardContent className="space-y-4 p-5">
          <Label>Theme mode</Label>
          <div className="grid grid-cols-3 gap-2 sm:max-w-sm">
            {modes.map((m) => {
              const I = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition ${
                    active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <I className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Label>Accent color</Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ACCENTS.map((a) => {
              const active = accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-[11px] transition ${
                    active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="h-8 w-8 rounded-full" style={{ background: a.gradient }} />
                  <span className="truncate">{a.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Label>Brand assets</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <AssetSlot title="Logo" hint="SVG or PNG, up to 1MB" icon={ImageIcon} />
            <AssetSlot title="Favicon" hint="32×32 PNG or ICO" icon={ImageIcon} />
          </div>
          <p className="text-xs text-muted-foreground">Upload wiring will be enabled in a future step.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AssetSlot({ title, hint, icon: Icon }: { title: string; hint: string; icon: typeof ImageIcon }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-background text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Button variant="outline" size="sm" disabled className="gap-1.5"><Upload className="h-3.5 w-3.5" />Upload</Button>
    </div>
  );
}
