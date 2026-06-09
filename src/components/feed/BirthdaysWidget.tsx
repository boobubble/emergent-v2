import { useEffect, useState } from "react";
import { Cake } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getFriendBirthdaysToday, type FriendBirthday } from "@/lib/birthdays.functions";

export function BirthdaysWidget() {
  const fetchBirthdays = useServerFn(getFriendBirthdaysToday);
  const [items, setItems] = useState<FriendBirthday[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancel = false;
    fetchBirthdays({})
      .then((rows) => { if (!cancel) { setItems(rows); setLoaded(true); } })
      .catch(() => { if (!cancel) setLoaded(true); });
    return () => { cancel = true; };
  }, [fetchBirthdays]);

  if (!loaded || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Cake className="h-3.5 w-3.5 text-pink-400" /> Birthdays today
      </div>
      <ul className="space-y-1.5">
        {items.map((b) => (
          <li key={b.id} className="flex items-center gap-2 text-xs">
            {b.avatar_url ? (
              <img src={b.avatar_url} alt={b.username} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="grid h-7 w-7 place-items-center rounded-full bg-muted text-[10px] font-bold">
                {b.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{b.username}</div>
              <div className="text-[10px] text-muted-foreground">
                {b.turning_years != null ? `Turning ${b.turning_years} 🎂` : "Happy birthday! 🎉"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
