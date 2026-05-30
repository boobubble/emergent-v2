import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flame } from "lucide-react";
import { getMyRoomLoyalty } from "@/lib/economy.functions";
import { roomLoyaltyFor } from "@/lib/economy-config";

/** Tiny chip showing the user's loyalty level + streak in the current room. */
export function LoyaltyChip({ channelId }: { channelId: string }) {
  const fetchLoyalty = useServerFn(getMyRoomLoyalty);
  const [data, setData] = useState<{ total: number; streak: number } | null>(null);

  useEffect(() => {
    if (!channelId || channelId.startsWith("dm:")) return;
    let cancelled = false;
    fetchLoyalty({ data: { channelId } })
      .then((r) => { if (!cancelled) setData({ total: r.total_messages ?? 0, streak: r.streak_days ?? 0 }); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  if (!data) return null;
  const lvl = roomLoyaltyFor(data.total);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${lvl.chip}`} title={`${lvl.name} · ${data.total} msgs`}>
      {lvl.name}
      {data.streak > 1 && (
        <span className="inline-flex items-center gap-0.5 text-orange-500">
          <Flame className="h-2.5 w-2.5" />{data.streak}
        </span>
      )}
    </span>
  );
}
