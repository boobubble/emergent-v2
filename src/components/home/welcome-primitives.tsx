import { useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { publicAvatarThumbUrl } from "@/lib/public-avatar";

export function WelcomeCard({
  className = "",
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#10101f]/80 backdrop-blur-xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function PillAvatar({
  name,
  size = 32,
  color,
  src,
  lazy = true,
}: {
  name: string;
  size?: number;
  color?: string;
  /** Public https avatar. Initials render when missing or if the image fails. */
  src?: string | null;
  lazy?: boolean;
}) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  const original = src?.trim() || "";
  const thumb = original ? publicAvatarThumbUrl(original, Math.ceil(size * 2)) : "";
  const [failed, setFailed] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImg = Boolean(original) && !failed;
  const imgSrc = useOriginal || thumb === original ? original : thumb;
  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white ring-2 ring-white/10"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background:
          color ||
          `linear-gradient(135deg, hsl(${Math.abs(name.charCodeAt(0) * 13) % 360} 70% 55%), hsl(${Math.abs(name.charCodeAt(0) * 29) % 360} 70% 45%))`,
      }}
    >
      {letter}
      {showImg && (
        <img
          src={imgSrc}
          alt=""
          width={size}
          height={size}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className={`absolute inset-0 h-full w-full rounded-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!useOriginal && thumb && thumb !== original) {
              setUseOriginal(true);
              return;
            }
            setFailed(true);
          }}
        />
      )}
    </div>
  );
}

export function StatCell({
  icon: Icon,
  label,
  value,
  tint = "#a78bfa",
  pulse = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tint?: string;
  pulse?: boolean;
}) {
  return (
    <div
      className="stat-cell group relative flex min-w-0 items-center gap-2 p-2.5 transition-colors hover:bg-white/[0.04] sm:gap-3 sm:rounded-2xl sm:p-4 lg:p-5
                 [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:right-0 [&:not(:last-child)]:after:top-1/2
                 [&:not(:last-child)]:after:hidden [&:not(:last-child)]:after:h-8 [&:not(:last-child)]:after:w-px
                 [&:not(:last-child)]:after:-translate-y-1/2 [&:not(:last-child)]:after:bg-white/10 sm:[&:not(:last-child)]:after:h-10 lg:[&:not(:last-child)]:after:block
                 [&:not(:nth-child(2n))]:after:block sm:[&:not(:nth-child(2n))]:after:hidden
                 sm:[&:not(:nth-child(3n))]:after:block"
      style={{ ["--stat-tint" as string]: tint }}
    >
      <div
        className="stat-tile grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-white/10 backdrop-blur-md sm:h-11 sm:w-11 sm:rounded-xl"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${tint} 28%, transparent), color-mix(in oklab, ${tint} 10%, transparent))`,
          boxShadow: `0 8px 24px -10px ${tint}90, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        <Icon className="stat-icon h-4 w-4 sm:h-5 sm:w-5" style={{ color: tint }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-lg font-black leading-none tracking-tight sm:text-2xl lg:text-[26px]">
          <span
            className="stat-value truncate bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg,#ffffff, color-mix(in oklab, ${tint} 60%, #ffffff))` }}
          >
            {value}
          </span>
          {pulse && (
            <span className="relative grid h-2 w-2 shrink-0 place-items-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[8px] font-semibold uppercase leading-tight tracking-wider text-white/60 sm:mt-1 sm:truncate sm:text-[11px]">
          {label}
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({
  icon,
  title,
  suffix,
  href,
}: {
  icon: string;
  title: string;
  suffix?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <h2 className="inline text-sm font-bold text-white">{title}</h2>
        {suffix && <span className="ml-1.5 text-[11px] text-white/50">{suffix}</span>}
      </div>
      {href && (
        <a
          href={href}
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-purple-300 hover:text-purple-200"
        >
          View All <ChevronRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
