import { useState } from "react";
import { ProfilePopup } from "./ProfilePopup";

export function UserMenu({
  userId,
  children,
}: {
  userId: string;
  username?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer bg-transparent p-0 text-left hover:text-primary focus:outline-none"
      >
        {children}
      </button>
      <ProfilePopup userId={userId} open={open} onOpenChange={setOpen} />
    </>
  );
}
