import { Link } from "@tanstack/react-router";
import { BadgeCheck, MessageSquare, Settings, User, UserPlus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/chat/Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfileDirectory, useRemoteProfiles } from "@/lib/use-remote-profiles";
import { useSocialGraphOptional } from "@/lib/use-social-graph";
import { useCodyChatCommunity } from "./use-codychat-community";
import { CodyChatRadioWidget } from "./CodyChatRadioWidget";
import { CodyChatCompetitionWidget } from "./CodyChatCompetitionWidget";
import { CodyChatHighlights } from "./CodyChatHighlights";

type CodyChatProfilePanelProps = {
  onClose?: () => void;
  forceDesktopColumn?: boolean;
  className?: string;
};

export function CodyChatProfilePanel({
  onClose,
  forceDesktopColumn,
  className,
}: CodyChatProfilePanelProps) {
  const { user } = useAuth();
  const { profiles, loading } = useRemoteProfiles();
  const { profiles: rawDirectory } = useRemoteProfileDirectory();
  const social = useSocialGraphOptional();
  const { enabledWidgets, liveCompetitions } = useCodyChatCommunity();

  const self = user ? profiles[user.id] : undefined;
  const isOfficial = user ? !!rawDirectory[user.id]?.is_official : false;

  const friendCount = social?.meId
    ? social.friendships.filter((f) => f.status === "accepted").length
    : null;

  return (
    <aside
      data-cody-column="profile"
      className={cn(
        "cody-profile-panel flex h-full shrink-0 flex-col overflow-hidden",
        !forceDesktopColumn && "hidden",
        className,
      )}
      style={forceDesktopColumn ? { display: "flex" } : undefined}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border/40 px-3 py-2">
        <h2 className="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Profile
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <ScrollArea className="cody-scroll-area min-h-0 flex-1">
        <div className="space-y-4 px-3 py-3">
          {loading && !self ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Loading profile…</p>
          ) : null}

          {self && user ? (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="cody-profile-avatar-ring">
                  <Avatar user={self} size={72} square={false} />
                </div>
                <p className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold">
                  {self.name}
                  {isOfficial ? (
                    <BadgeCheck className="h-4 w-4 text-sky-400" aria-label="Verified" />
                  ) : null}
                </p>
                <p className="text-[11px] capitalize text-muted-foreground">
                  {self.status === "online" ? "Online now" : self.status}
                </p>
                {self.bio ? (
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{self.bio}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                <dl className="cody-stat-chip">
                  <dt>Level</dt>
                  <dd>Lv {self.level ?? 1}</dd>
                </dl>
                {friendCount != null ? (
                  <dl className="cody-stat-chip">
                    <dt>Friends</dt>
                    <dd>{friendCount}</dd>
                  </dl>
                ) : null}
                {self.streak != null && self.streak > 0 ? (
                  <dl className="cody-stat-chip">
                    <dt>Streak</dt>
                    <dd>{self.streak}d</dd>
                  </dl>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" size="sm" className="h-9 text-xs" asChild>
                  <Link to="/u/$username" params={{ username: user.username }}>
                    <User className="mr-1.5 h-3.5 w-3.5" />
                    View profile
                  </Link>
                </Button>
                <Button size="sm" className="h-9 text-xs" asChild>
                  <Link to="/feed/">
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Message
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" className="col-span-2 h-9 text-xs" asChild>
                  <Link to="/find-friends">
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Find friends
                  </Link>
                </Button>
              </div>
            </>
          ) : !loading ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Profile unavailable.</p>
          ) : null}

          <CodyChatRadioWidget widgets={enabledWidgets} />
          <CodyChatCompetitionWidget competitions={liveCompetitions} />
          <CodyChatHighlights />

          <div className="cody-brand-footer">
            <p className="text-[10px] leading-snug text-muted-foreground">
              Good people · Better conversations · That&apos;s Yaarzo 💜
            </p>
            <Link
              to="/feed/"
              search={{ tab: "account" }}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary"
            >
              <Settings className="h-3 w-3" />
              Account settings
            </Link>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
