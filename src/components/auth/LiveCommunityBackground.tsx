import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Heart, MessageSquare, Users, Radio, Sparkles } from "lucide-react";

type Author = {
  username: string;
  avatar_url: string | null;
  avatar_color: string | null;
  anonymous: boolean;
};

interface PostItem {
  id: string;
  text: string;
  created_at: string;
  reaction_count: number;
  comment_count: number;
  has_media: boolean;
  author: Author;
}

interface ChatItem {
  id: string;
  text: string;
  created_at: string;
  author: Author;
}

interface CommunityPayload {
  enabled: boolean;
  config?: {
    blur: boolean;
    showStats: boolean;
    showFeed: boolean;
    showChat: boolean;
    headline: string;
  };
  stats?: { online: number; members: number; postsToday: number; activeRooms: number };
  posts?: PostItem[];
  messages?: ChatItem[];
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function Avatar({ author }: { author: Author }) {
  const initial = (author.username || "?").trim().charAt(0).toUpperCase();
  if (author.avatar_url) {
    return <img src={author.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/20" />;
  }
  return (
    <div
      className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white ring-1 ring-white/20"
      style={{ background: author.avatar_color || "var(--primary)" }}
    >
      {initial}
    </div>
  );
}

function StatChip({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-md">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="font-bold text-white">{Intl.NumberFormat().format(value)}</span>
      <span className="text-white/60">{label}</span>
    </div>
  );
}

export function LiveCommunityBackground({ blur = true, children }: { blur?: boolean; children: React.ReactNode }) {
  const [data, setData] = useState<CommunityPayload | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancel = false;
    let timer: number | undefined;

    const load = async () => {
      try {
        const res = await fetch("/api/public/community-bg", { credentials: "omit" });
        if (!res.ok) return;
        const json = (await res.json()) as CommunityPayload;
        if (!cancel) setData(json);
      } catch {
        /* offline / not wired — silent */
      }
    };
    load();
    timer = window.setInterval(load, 30_000);
    return () => {
      cancel = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const enabled = !!data?.enabled;
  const cfg = data?.config;
  const stats = data?.stats;
  const posts = data?.posts ?? [];
  const messages = data?.messages ?? [];

  // Duplicate the list for a seamless marquee loop.
  const postLoop = useMemo(() => (posts.length ? [...posts, ...posts] : []), [posts]);
  const chatLoop = useMemo(() => (messages.length ? [...messages, ...messages] : []), [messages]);

  const useBlur = blur && (cfg?.blur ?? true);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background layer */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        {/* Ambient gradient orbs */}
        <div
          className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 60%, transparent), transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-24 h-[460px] w-[460px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent, var(--primary)) 55%, transparent), transparent)" }}
        />

        {enabled && (
          <>
            {/* Top: chat marquee */}
            {cfg?.showChat && chatLoop.length > 0 && (
              <div className="absolute inset-x-0 top-0 hidden md:block">
                <div className="relative h-40 overflow-hidden">
                  <div
                    className="flex w-max gap-3 px-6 pt-6"
                    style={
                      reduced
                        ? undefined
                        : { animation: "auth-bg-marquee 70s linear infinite" }
                    }
                  >
                    {chatLoop.map((m, i) => (
                      <div
                        key={`${m.id}-${i}`}
                        className="flex max-w-[280px] items-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md"
                      >
                        <Avatar author={m.author} />
                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-semibold text-white/80">
                            @{m.author.username}
                          </div>
                          <div className="line-clamp-2 text-[12px] text-white/70">{m.text || "…"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom: post marquee (reverse direction) */}
            {cfg?.showFeed && postLoop.length > 0 && (
              <div className="absolute inset-x-0 bottom-0">
                <div className="relative h-56 overflow-hidden">
                  <div
                    className="flex w-max gap-3 px-6 pb-6"
                    style={
                      reduced
                        ? undefined
                        : { animation: "auth-bg-marquee-rev 90s linear infinite" }
                    }
                  >
                    {postLoop.map((p, i) => (
                      <article
                        key={`${p.id}-${i}`}
                        className="flex w-[260px] flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
                      >
                        <header className="flex items-center gap-2">
                          <Avatar author={p.author} />
                          <div className="min-w-0 text-[11px] font-semibold text-white/85">
                            @{p.author.username}
                          </div>
                        </header>
                        <p className="line-clamp-4 text-[12px] leading-snug text-white/75">
                          {p.text || (p.has_media ? "📷 shared a photo" : "shared an update")}
                        </p>
                        <footer className="flex items-center gap-3 text-[10px] text-white/60">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {p.reaction_count}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {p.comment_count}
                          </span>
                        </footer>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats strip — top center */}
            {cfg?.showStats && stats && (
              <div className="absolute inset-x-0 top-4 flex justify-center px-4">
                <div className="hidden flex-wrap items-center justify-center gap-2 sm:flex">
                  <StatChip icon={Users} label="online" value={stats.online} />
                  <StatChip icon={Sparkles} label="members" value={stats.members} />
                  <StatChip icon={MessageCircle} label="posts today" value={stats.postsToday} />
                  <StatChip icon={Radio} label="active rooms" value={stats.activeRooms} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Dark vignette for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/85" />
      </div>

      {/* Foreground (login card slot) */}
      <div className={`relative z-10 grid min-h-screen place-items-center p-4 ${useBlur ? "[--auth-card-blur:24px]" : "[--auth-card-blur:0px]"}`}>
        {children}
      </div>

      {/* Marquee keyframes (scoped, no global CSS edits) */}
      <style>{`
        @keyframes auth-bg-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes auth-bg-marquee-rev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
