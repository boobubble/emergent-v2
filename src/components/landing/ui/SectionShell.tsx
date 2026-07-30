import type { ReactNode } from "react";

export function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}
