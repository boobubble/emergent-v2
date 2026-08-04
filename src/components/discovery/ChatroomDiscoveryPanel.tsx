import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { getChatroomDiscovery } from "@/lib/discovery/functions";
import type { DiscoveryContentScope } from "@/lib/discovery/config";
import { DiscoveryScopeSelector } from "@/components/discovery/DiscoveryScopeSelector";

type Props = {
  joinedChannelIds: string[];
  scope: DiscoveryContentScope;
  onScopeChange: (scope: DiscoveryContentScope) => void;
  onSelectChannel: (id: string) => void;
};

export function ChatroomDiscoveryPanel({ joinedChannelIds, scope, onScopeChange, onSelectChannel }: Props) {
  const { user } = useAuth();
  const fetchDiscovery = useServerFn(getChatroomDiscovery);

  const q = useQuery({
    queryKey: ["chatroom-discovery", scope, joinedChannelIds.join(",")],
    queryFn: () => fetchDiscovery({ data: { scope, joinedChannelIds } }),
    enabled: Boolean(user && !user.isGuest),
    staleTime: 60_000,
  });

  if (!user || user.isGuest) return null;

  return (
    <div className="mb-2 space-y-1">
      <DiscoveryScopeSelector scope={scope} onScopeChange={onScopeChange} />

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
