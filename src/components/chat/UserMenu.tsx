import { useProfilePopup } from "@/lib/profile-popup-context";

export function UserMenu({
  userId,
  children,
}: {
  userId: string;
  username?: string;
  children: React.ReactNode;
}) {
  const { openProfile } = useProfilePopup();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openProfile(userId);
      }}
      className="cursor-pointer bg-transparent p-0 text-left hover:text-primary focus:outline-none"
    >
      {children}
    </button>
  );
}
