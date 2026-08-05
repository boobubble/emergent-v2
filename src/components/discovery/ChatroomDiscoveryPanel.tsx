import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { getChatroomDiscovery, getDiscoveryPrefs } from "@/lib/discovery/functions";
import { isModuleRolloutEnabled } from "@/lib/discovery/rollout";

type Props = {
  joinedChannelIds: string[];
  onSelectChannel: (id: string) => void;
};

export function ChatroomDiscoveryPanel({ joinedChannelIds, onSelectChannel }: Props) {
  const { user } = useAuth();
  const fetchDiscovery = useServerFn(getChatroomDiscovery);
  const fetchPrefs = useServerFn(getDiscoveryPrefs);

  const prefsQ = useQuery({
    queryKey: ["discovery-prefs"],
    queryFn: () => fetchPrefs(),
    enabled: Boolean(user && !user.isGuest),
    staleTime: 60_000,
  });

  const chatroomsEnabled = prefsQ.data?.config
    ? isModuleRolloutEnabled(prefsQ.data.config, "chatrooms")
    : false;

  const q = useQuery({
    queryKey: ["chatroom-discovery", joinedChannelIds.join(",")],
    queryFn: () => fetchDiscovery({ data: { joinedChannelIds } }),
    enabled: Boolean(user && !user.isGuest && chatroomsEnabled),
    staleTime: 60_000,
  });

  if (!user || user.isGuest || !chatroomsEnabled) return null;

  return (
    <div className="mb-2 space-y-1">
      {(q.data?.sections ?? []).map((section) => (
        <div key={section.key}>
          <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</div>
          <div className="space-y-0.5">
            {section.channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch.id)}
                className="premium-nav-item flex w-full min-h-8 items-center gap-2 px-2 text-left text-sm"
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
