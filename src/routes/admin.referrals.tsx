import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/referrals")({ component: Page });

function Page() {
  return (
    <div>
      <AdminPageHeader title="Referral System" description="Invite codes and rewards for bringing friends." />
      <ComingSoonPanel
        title="Referrals"
        points={[
          "Per-user referral codes and links",
          "Coin / XP rewards on signup or milestone",
          "Leaderboard of top referrers",
          "Fraud / self-referral guards",
        ]}
      />
    </div>
  );
}
