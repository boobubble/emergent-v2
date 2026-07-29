import { ProfilePopup } from "./ProfilePopup";
import { useProfilePopup } from "@/lib/profile-popup-context";

export function ChatProfilePopupHost() {
  const { selectedUserId, profileDialogOpen, closeProfile } = useProfilePopup();

  if (!selectedUserId) return null;

  return (
    <ProfilePopup
      userId={selectedUserId}
      open={profileDialogOpen}
      onClose={closeProfile}
    />
  );
}
