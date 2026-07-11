import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  bonus_coins: number;
  price_inr: number | null;
  price_usd_cents: number | null;
  currency: string;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
};

export type CoinOrder = {
  id: string;
  user_id: string;
  package_id: string | null;
  provider: "manual" | "razorpay" | "stripe";
  provider_order_id: string | null;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  coins: number;
  bonus_coins: number;
  status: "created" | "awaiting_review" | "paid" | "failed" | "refunded" | "cancelled";
  receipt_url: string | null;
  admin_note: string | null;
  created_at: string;
};

export type CoinTransaction = {
  id: string;
  user_id: string;
  amount: number;
  direction: "credit" | "debit" | null;
  wallet_kind: string | null;
  status: string;
  provider: string;
  reference_id: string | null;
  reason: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type WalletStats = {
  coins: number;
  coins_lifetime_earned: number;
  coins_lifetime_spent: number;
  coins_purchased_total: number;
  coins_bonus_total: number;
  wallet_frozen: boolean;
};

export type ProviderRow = { key: "manual" | "razorpay" | "stripe"; enabled: boolean; config: Record<string, unknown> };

export async function fetchWalletStats(userId: string): Promise<WalletStats> {
  const { data, error } = await sb
    .from("profiles")
    .select("coins, coins_lifetime_earned, coins_lifetime_spent, coins_purchased_total, coins_bonus_total, wallet_frozen")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? { coins: 0, coins_lifetime_earned: 0, coins_lifetime_spent: 0, coins_purchased_total: 0, coins_bonus_total: 0, wallet_frozen: false }) as WalletStats;
}

export async function fetchPackages(activeOnly = true): Promise<CoinPackage[]> {
  let q = sb.from("coin_packages").select("*").order("sort_order", { ascending: true });
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CoinPackage[];
}

export async function fetchProviders(): Promise<ProviderRow[]> {
  // `config` is intentionally excluded — it may contain secrets and is server-only.
  const { data, error } = await sb.from("payment_providers").select("key,enabled");
  if (error) throw error;
  return (data ?? []).map((r: { key: ProviderRow["key"]; enabled: boolean }) => ({
    ...r,
    config: {},
  })) as ProviderRow[];
}

export async function fetchTransactions(userId: string, since?: Date): Promise<CoinTransaction[]> {
  let q = sb
    .from("coin_transactions")
    .select("id,user_id,amount,direction,wallet_kind,status,provider,reference_id,reason,created_at,metadata")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (since) q = q.gte("created_at", since.toISOString());
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CoinTransaction[];
}

export async function fetchMyOrders(userId: string): Promise<CoinOrder[]> {
  const { data, error } = await sb
    .from("coin_payment_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as CoinOrder[];
}

export async function createOrder(packageId: string, provider: "manual" | "razorpay" | "stripe"): Promise<CoinOrder> {
  const { data, error } = await sb.rpc("create_coin_order", { _package_id: packageId, _provider: provider });
  if (error) throw error;
  return data as CoinOrder;
}

export async function submitManualReceipt(orderId: string, receiptUrl: string, note?: string) {
  const { error } = await sb
    .from("coin_payment_orders")
    .update({ receipt_url: receiptUrl, admin_note: note ?? null })
    .eq("id", orderId);
  if (error) throw error;
}

export async function claimDailyReward(): Promise<{ coins: number; streak: number; date: string }> {
  const { data, error } = await sb.rpc("claim_daily_reward");
  if (error) throw error;
  return data as { coins: number; streak: number; date: string };
}

export async function fetchTodayClaim(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from("user_daily_claims")
    .select("*")
    .eq("user_id", userId)
    .eq("claim_date", today)
    .maybeSingle();
  return data;
}

export async function fetchLastClaim(userId: string) {
  const { data } = await sb
    .from("user_daily_claims")
    .select("*")
    .eq("user_id", userId)
    .order("claim_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export const TRANSACTION_LABELS: Record<string, string> = {
  purchase: "Coin purchase",
  reward: "Reward",
  competition: "Competition",
  gift_in: "Gift received",
  gift_out: "Gift sent",
  wallpaper: "Wallpaper",
  premium_theme: "Premium theme",
  game_reward: "Game reward",
  admin_bonus: "Admin bonus",
  refund: "Refund",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
  daily_login: "Daily login",
  streak_bonus: "Streak bonus",
  subscription_grant: "Subscription bonus",
  spend_other: "Spent",
};
