import { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { Community } from "@/lib/community.functions";

interface CommunityContextValue {
  community: Community;
  communityId: string;
  slug: string;
  accent: string;
  isOwner: boolean;
  isMember: boolean;
  exitCommunity: (to?: string) => void;
  /** Confirm-guard state for intercepted global-nav clicks */
  pendingExit: string | null;
  setPendingExit: (to: string | null) => void;
  confirmExit: () => void;
  cancelExit: () => void;
}

const Ctx = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({
  community,
  isOwner,
  isMember,
  children,
}: {
  community: Community;
  isOwner: boolean;
  isMember: boolean;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [pendingExit, setPendingExit] = useState<string | null>(null);

  const exitCommunity = useCallback(
    (to: string = "/") => {
      navigate({ to } as never);
    },
    [navigate],
  );

  const confirmExit = useCallback(() => {
    const target = pendingExit;
    setPendingExit(null);
    if (target) navigate({ to: target } as never);
  }, [pendingExit, navigate]);

  const cancelExit = useCallback(() => setPendingExit(null), []);

  const value = useMemo<CommunityContextValue>(
    () => ({
      community,
      communityId: community.id,
      slug: community.slug,
      accent: community.accent_color || "#7c3aed",
      isOwner,
      isMember,
      exitCommunity,
      pendingExit,
      setPendingExit,
      confirmExit,
      cancelExit,
    }),
    [community, isOwner, isMember, exitCommunity, pendingExit, confirmExit, cancelExit],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Returns community context or null (safe to call outside community routes). */
export function useCommunityOptional(): CommunityContextValue | null {
  return useContext(Ctx);
}

/** Returns community context. Throws when called outside a community route. */
export function useCommunity(): CommunityContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCommunity must be used inside a community route");
  return v;
}

/** True when the current URL is inside a community. */
export function useInCommunity(): boolean {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname.startsWith("/community/");
}
