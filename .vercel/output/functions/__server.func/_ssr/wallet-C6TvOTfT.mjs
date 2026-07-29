import { s as supabase } from "./client-H8IXbXWR.mjs";
const sb = supabase;
async function fetchWalletStats(userId) {
  const { data, error } = await sb.from("profiles").select("coins, coins_lifetime_earned, coins_lifetime_spent, coins_purchased_total, coins_bonus_total, wallet_frozen").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ?? { coins: 0, coins_lifetime_earned: 0, coins_lifetime_spent: 0, coins_purchased_total: 0, coins_bonus_total: 0, wallet_frozen: false };
}
async function fetchPackages(activeOnly = true) {
  let q = sb.from("coin_packages").select("*").order("sort_order", { ascending: true });
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
async function fetchProviders() {
  const { data, error } = await sb.rpc("list_enabled_payment_providers");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    config: {}
  }));
}
async function fetchTransactions(userId, since) {
  let q = sb.from("coin_transactions").select("id,user_id,amount,direction,wallet_kind,status,provider,reference_id,reason,created_at,metadata").eq("user_id", userId).order("created_at", { ascending: false }).limit(200);
  if (since) q = q.gte("created_at", since.toISOString());
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
async function fetchMyOrders(userId) {
  const { data, error } = await sb.from("coin_payment_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}
async function createOrder(packageId, provider) {
  const { data, error } = await sb.rpc("create_coin_order", { _package_id: packageId, _provider: provider });
  if (error) throw error;
  return data;
}
async function submitManualReceipt(orderId, receiptUrl, note) {
  const { error } = await sb.from("coin_payment_orders").update({ receipt_url: receiptUrl, admin_note: null }).eq("id", orderId);
  if (error) throw error;
}
async function claimDailyReward() {
  const { data, error } = await sb.rpc("claim_daily_reward");
  if (error) throw error;
  return data;
}
async function fetchTodayClaim(userId) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const { data } = await sb.from("user_daily_claims").select("*").eq("user_id", userId).eq("claim_date", today).maybeSingle();
  return data;
}
async function fetchLastClaim(userId) {
  const { data } = await sb.from("user_daily_claims").select("*").eq("user_id", userId).order("claim_date", { ascending: false }).limit(1).maybeSingle();
  return data;
}
const TRANSACTION_LABELS = {
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
  spend_other: "Spent"
};
export {
  TRANSACTION_LABELS as T,
  fetchPackages as a,
  fetchProviders as b,
  fetchTransactions as c,
  fetchMyOrders as d,
  fetchTodayClaim as e,
  fetchWalletStats as f,
  fetchLastClaim as g,
  claimDailyReward as h,
  createOrder as i,
  submitManualReceipt as s
};
