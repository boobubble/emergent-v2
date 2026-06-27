import { createFileRoute } from "@tanstack/react-router";
import { Save, Home, Sparkles } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { HOME_PAGE_KEY, type HomePageMode } from "@/lib/hero-page-config";

import { HomepagePage } from "./admin.homepage";
import { HeroPageAdmin } from "./admin.hero-page";

export const Route = createFileRoute("/admin/landing")({
  component: LandingAdmin,
});

function ActivePageToggle() {
  const { values, set, save, saving } = useAdminSetting<{ mode: HomePageMode }>(
    HOME_PAGE_KEY,
    { mode: "welcome" },
  );
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Active Landing Page</div>
            <div className="text-xs text-muted-foreground">
              Choose which page unauthenticated visitors see. Only one can be active — the other tab still saves settings for later.
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save active page"}
          </Button>
        </div>
        <RadioGroup
          value={values.mode}
          onValueChange={(v) => set("mode", v as HomePageMode)}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              values.mode === "welcome" ? "border-primary bg-primary/5" : ""
            }`}
          >
            <RadioGroupItem value="welcome" className="mt-1" />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Home className="h-4 w-4" /> Welcome Page
              </div>
              <div className="text-xs text-muted-foreground">
                Classic landing at <code>/welcome</code>.
              </div>
            </div>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              values.mode === "hero" ? "border-primary bg-primary/5" : ""
            }`}
          >
            <RadioGroupItem value="hero" className="mt-1" />
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> Hero Homepage
              </div>
              <div className="text-xs text-muted-foreground">
                Premium long-scroll landing at <code>/heropage</code>.
              </div>
            </div>
          </label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function SetAsHomeBanner({ mode, label }: { mode: HomePageMode; label: string }) {
  const { values, set, save, saving } = useAdminSetting<{ mode: HomePageMode }>(
    HOME_PAGE_KEY,
    { mode: "welcome" },
  );
  const isActive = values.mode === mode;
  const handleClick = () => {
    if (isActive) return;
    set("mode", mode);
    // Save on next tick so state update is committed before mutation reads it.
    setTimeout(() => save(), 0);
  };
  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
        isActive ? "border-primary/40 bg-primary/5" : "bg-muted/30"
      }`}
    >
      <div className="text-sm">
        {isActive ? (
          <span className="font-medium text-primary">✓ {label} is the active landing page</span>
        ) : (
          <span className="text-muted-foreground">
            {label} is not active. Visitors currently see the other page.
          </span>
        )}
      </div>
      <Button
        size="sm"
        variant={isActive ? "outline" : "default"}
        onClick={handleClick}
        disabled={isActive || saving}
        className="gap-2"
      >
        <Home className="h-4 w-4" />
        {isActive ? "Currently Home" : saving ? "Setting…" : "Set as Home"}
      </Button>
    </div>
  );
}

function LandingAdmin() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Landing Pages"
        description="Manage both the Welcome page and the Hero Homepage from one place. Pick which one is active, edit settings for either in its own tab."
      />

      <ActivePageToggle />

      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="welcome" className="gap-2">
            <Home className="h-4 w-4" /> Welcome Page
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-2">
            <Sparkles className="h-4 w-4" /> Hero Homepage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="welcome" className="mt-6">
          <SetAsHomeBanner mode="welcome" label="Welcome Page" />
          <HomepagePage />
        </TabsContent>
        <TabsContent value="hero" className="mt-6">
          <SetAsHomeBanner mode="hero" label="Hero Homepage" />
          <HeroPageAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
