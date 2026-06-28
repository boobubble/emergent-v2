import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMySubscription, getSubscriptionMode, listPlans } from "@/lib/subscription.functions";
import { useAuth } from "@/lib/auth-store";

export type PerkKey =
  | "no_ads"
  | "premium_themes"
  | "premium_games"
  | "creator_tools"
  | "vip_badge"
  | "custom_username_effects"
  | "premium_radio_requests"
  | "premium_chatrooms"
  | "premium_feed_features"
  | "featured_room"
  | "dj_perks";

export function useSubscriptionMode() {
  const fn = useServerFn(getSubscriptionMode);
  return useQuery({ queryKey: ["subscription-mode"], queryFn: () => fn(), staleTime: 60_000 });
}

export function usePlans() {
  const fn = useServerFn(listPlans);
  return useQuery({ queryKey: ["subscription-plans"], queryFn: () => fn(), staleTime: 30_000 });
}

export function useMySubscription() {
  const { user } = useAuth();
  const fn = useServerFn(getMySubscription);
  return useQuery({
    queryKey: ["my-subscription", user?.id ?? "anon"],
    queryFn: () => fn(),
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

/** Check if the current user has a given perk via their active plan. */
export function usePerk(key: PerkKey): { allowed: boolean; loading: boolean; planName?: string } {
  const { data, isLoading } = useMySubscription();
  const sub = data?.subscription as any;
  const plan = sub?.plan as { name?: string; perks?: Record<string, unknown> } | undefined;
  const allowed = data?.isActive ? Boolean(plan?.perks?.[key]) : false;
  return { allowed, loading: isLoading, planName: plan?.name };
}

/** How many personal chatrooms the user can still create. */
export function useRoomQuota() {
  const { data, isLoading } = useMySubscription();
  const sub = data?.subscription as any;
  const max: number = data?.isActive ? Number(sub?.plan?.max_personal_chatrooms ?? 0) : 0;
  const used = data?.ownedRoomCount ?? 0;
  return { loading: isLoading, max, used, canCreate: max > used };
}
