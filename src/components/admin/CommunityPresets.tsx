import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSettings, type ModulesFlags } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";
import { MessageSquare, Sparkles, Gamepad2, Smile, Heart, Feather } from "lucide-react";

interface Preset {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  modules: Partial<ModulesFlags>;
  layoutPriority?: "chatrooms_first" | "feed_first";
  automationLevel?: "off" | "low" | "medium" | "high";
}

const PRESETS: Preset[] = [
  {
    id: "chatroom",
    label: "Chatroom community",
    description: "Realtime chat first. Lighter feed, voice rooms ready.",
    icon: MessageSquare,
    modules: { feed: true, games: true, voice: true, ai: true, reactions: true, notifications: true, badges: true, streaks: true, referrals: false, emojis: true, gif: true, wallet: true },
    layoutPriority: "chatrooms_first",
    automationLevel: "low",
  },
  {
    id: "creator",
    label: "Creator community",
    description: "Feed-first with rewards, missions and growth loops.",
    icon: Sparkles,
    modules: { feed: true, games: false, voice: false, ai: true, reactions: true, notifications: true, badges: true, streaks: true, referrals: true, emojis: true, gif: true, wallet: true },
    layoutPriority: "feed_first",
    automationLevel: "medium",
  },
  {
    id: "gaming",
    label: "Gaming community",
    description: "Games, voice rooms and competitive engagement.",
    icon: Gamepad2,
    modules: { feed: true, games: true, voice: true, ai: false, reactions: true, notifications: true, badges: true, streaks: true, referrals: true, emojis: true, gif: true, wallet: true },
    layoutPriority: "chatrooms_first",
    automationLevel: "medium",
  },
  {
    id: "meme",
    label: "Meme community",
    description: "Feed and GIFs first. High engagement, low friction.",
    icon: Smile,
    modules: { feed: true, games: false, voice: false, ai: true, reactions: true, notifications: true, badges: false, streaks: false, referrals: false, emojis: true, gif: true, wallet: false },
    layoutPriority: "feed_first",
    automationLevel: "high",
  },
  {
    id: "dating",
    label: "Dating community",
    description: "Profiles, chat and discovery. Light feed, no games.",
    icon: Heart,
    modules: { feed: true, games: false, voice: true, ai: true, reactions: true, notifications: true, badges: false, streaks: false, referrals: false, emojis: true, gif: false, wallet: false },
    layoutPriority: "chatrooms_first",
    automationLevel: "low",
  },
  {
    id: "lightweight",
    label: "Lightweight community",
    description: "Minimal modules. Fast, simple, mobile-friendly.",
    icon: Feather,
    modules: { feed: true, games: false, voice: false, ai: false, reactions: true, notifications: true, badges: false, streaks: false, referrals: false, emojis: true, gif: false, wallet: false },
    layoutPriority: "feed_first",
    automationLevel: "off",
  },
];

export function CommunityPresets() {
  const { modules, refresh } = useAppSettings();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: async (preset: Preset) => {
      const nextModules = { ...modules, ...preset.modules } as ModulesFlags;
      await saveSetting({ data: { key: "modules", value: nextModules } });
      if (preset.layoutPriority) {
        await saveSetting({ data: { key: "layout_priority", value: preset.layoutPriority } });
      }
      if (preset.automationLevel) {
        await saveSetting({ data: { key: "automation", value: { level: preset.automationLevel } } });
      }
    },
    onSuccess: async (_d, preset) => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success(`${preset.label} applied`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Community presets</CardTitle>
        <p className="text-xs text-muted-foreground">One-click configurations. You can still customize everything after.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background p-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={mut.isPending}
                  onClick={() => mut.mutate(p)}
                >
                  Apply preset
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
