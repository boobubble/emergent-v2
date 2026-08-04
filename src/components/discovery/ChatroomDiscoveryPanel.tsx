import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { getChatroomDiscovery, getDiscoveryPrefs, saveDiscoveryPrefs } from "@/lib/discovery/functions";
import { shouldShowPersonalizePrompt } from "@/lib/discovery/country";
import type { DiscoveryContentScope } from "@/lib/discovery/config";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const SCOPES: { id: DiscoveryContentScope; label: string }[] = [
  { id: "for_you", label: "For You" },
  { id: "my_country", label: "My Country" },
  { id: "worldwide", label: "Worldwide" },
];

type Props = {
  joinedChannelIds: string[];
  scope: DiscoveryContentScope;
  onScopeChange: (scope: DiscoveryContentScope) => void;
  onSelectChannel: (id: string) => void;
};

export function ChatroomDiscoveryPanel({ joinedChannelIds, scope, onScopeChange, onSelectChannel }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchDiscovery = useServerFn(getChatroomDiscovery);
  const fetchPrefs = useServerFn(getDiscoveryPrefs);
  const savePrefs = useServerFn(saveDiscoveryPrefs);

  const prefsQ = useQuery({
    queryKey: ["discovery-prefs"],
    queryFn: () => fetchPrefs(),
    enabled: Boolean(user && !user.isGuest),
  });

  const q = useQuery({
    queryKey: ["chatroom-discovery", scope, joinedChannelIds.join(",")],
    queryFn: () => fetchDiscovery({ data: { scope, joinedChannelIds } }),
    enabled: Boolean(user && !user.isGuest),
    staleTime: 60_000,
  });

  if (!user || user.isGuest) return null;

  const config = prefsQ.data?.config;
  const showPersonalize =
    config?.onboardingEnabled &&
    shouldShowPersonalizePrompt(prefsQ.data?.prefs ?? null, { requireAgain: config?.requireOnboardingAgain });

  return (
    <div className="mb-3 space-y-2">
      {showPersonalize && (
        <PersonalizeYaarzoBanner
          onOpen={() => window.dispatchEvent(new CustomEvent("yaarzo:open-discovery-onboarding"))}
          onDismiss={async () => {
            await savePrefs({ data: { dismiss_personalize_prompt: true } });
            qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
          }}
        />
      )}
      <div className="flex flex-wrap gap-1 px-1">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onScopeChange(s.id)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              scope === s.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {(q.data?.sections ?? []).map((section) => (
        <div key={section.key}>
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</div>
          <div className="space-y-0.5">
            {section.channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch.id)}
                className="premium-nav-item flex w-full min-h-9 items-center gap-2 px-2 text-left text-sm"
              >
                <span className="opacity-50">#</span>
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PersonalizeYaarzoBanner({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  return (
    <div className="relative mx-1.5 mb-2 rounded-xl border border-primary/20 bg-primary/5 p-2 text-xs">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute right-1.5 top-1.5 rounded p-0.5 text-muted-foreground hover:bg-muted"
        onClick={onDismiss}
      >
        <X className="h-3 w-3" />
      </button>
      <div className="font-semibold text-foreground">Personalize Yaarzo</div>
      <p className="text-muted-foreground">Set country, languages and interests for better recommendations.</p>
      <button type="button" className="mt-1 font-medium text-primary hover:underline" onClick={onOpen}>Set preferences</button>
    </div>
  );
}
