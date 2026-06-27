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


function LandingSettingsTabs() {
  const { values } = useAdminSetting<{ mode: HomePageMode }>(
    HOME_PAGE_KEY,
    { mode: "welcome" },
  );
  const activeMode = values.mode === "hero" ? "hero" : "welcome";
  return (
    <Tabs value={activeMode} className="w-full">
      <TabsList className="grid w-full grid-cols-1">
        {activeMode === "welcome" ? (
          <TabsTrigger value="welcome" className="gap-2">
            <Home className="h-4 w-4" /> Welcome Page
          </TabsTrigger>
        ) : (
          <TabsTrigger value="hero" className="gap-2">
            <Sparkles className="h-4 w-4" /> Hero Homepage
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="welcome" className="mt-6">
        <HomepagePage />
      </TabsContent>
      <TabsContent value="hero" className="mt-6">
        <HeroPageAdmin />
      </TabsContent>
    </Tabs>
  );
}

function LandingAdmin() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Landing Pages"
        description="Pick which page unauthenticated visitors see. Settings for the active page appear below."
      />

      <ActivePageToggle />

      <LandingSettingsTabs />
    </div>
  );
}
