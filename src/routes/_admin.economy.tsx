import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_admin/economy")({ component: () => (
  <div>
    <AdminPageHeader title="Economy" description="Coins, rewards, shop pricing, and payouts." />
    <ComingSoonPanel title="Economy controls" points={[
      "Coin issuance rules",
      "Daily reward tuning",
      "Shop catalog pricing",
    ]} />
  </div>
)});
