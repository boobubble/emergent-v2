import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SocialAutomationTabs } from "@/components/admin/SocialAutomationTabs";
import { SocialManualPostsInbox } from "@/components/admin/SocialManualPostsInbox";

export const Route = createFileRoute("/admin/social-manual-posts")({
  component: SocialManualPostsPage,
});

function SocialManualPostsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <AdminPageHeader
        title="Social Automation"
        description="Manual distribution inbox for existing Yaarzo welcome feed posts. Instagram, X, and TikTok stay automatic."
      />
      <SocialAutomationTabs active="manual" />
      <SocialManualPostsInbox />
    </div>
  );
}
