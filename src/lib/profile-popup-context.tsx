import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";

export type ProfileCloseReason =
  | "x-button"
  | "outside-click"
  | "escape-key"
  | "navigation"
  | "action"
  | "open-other-profile"
  | "programmatic";

type ProfilePopupContextValue = {
  selectedUserId: string | null;
  profileDialogOpen: boolean;
  openProfile: (userId: string) => void;
  closeProfile: (reason: ProfileCloseReason) => void;
};

const ProfilePopupContext = createContext<ProfilePopupContextValue | null>(null);

function logProfileEvent(
  event: "opened" | "closed",
  detail: { userId: string | null; reason?: ProfileCloseReason },
) {
  if (!import.meta.env.DEV) return;
  console.debug(`[ProfilePopup] ${event}`, detail);
}

export function ProfilePopupProvider({ children }: { children: ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const selectedUserIdRef = useRef<string | null>(null);
  selectedUserIdRef.current = selectedUserId;

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPathRef = useRef(pathname);

  const closeProfile = useCallback((reason: ProfileCloseReason) => {
    setProfileDialogOpen((wasOpen) => {
      if (wasOpen) {
        logProfileEvent("closed", { userId: selectedUserIdRef.current, reason });
      }
      return false;
    });
    if (reason !== "open-other-profile") {
      setSelectedUserId(null);
    }
  }, []);

  const openProfile = useCallback((userId: string) => {
    setProfileDialogOpen((wasOpen) => {
      if (wasOpen && selectedUserIdRef.current && selectedUserIdRef.current !== userId) {
        logProfileEvent("closed", { userId: selectedUserIdRef.current, reason: "open-other-profile" });
      }
      return true;
    });
    setSelectedUserId(userId);
    logProfileEvent("opened", { userId });
  }, []);

  useEffect(() => {
    if (profileDialogOpen && prevPathRef.current !== pathname) {
      closeProfile("navigation");
    }
    prevPathRef.current = pathname;
  }, [pathname, profileDialogOpen, closeProfile]);

  return (
    <ProfilePopupContext.Provider
      value={{ selectedUserId, profileDialogOpen, openProfile, closeProfile }}
    >
      {children}
    </ProfilePopupContext.Provider>
  );
}

export function useProfilePopup() {
  const ctx = useContext(ProfilePopupContext);
  if (!ctx) {
    throw new Error("useProfilePopup must be used within ProfilePopupProvider");
  }
  return ctx;
}
