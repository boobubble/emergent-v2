import { Link } from "@tanstack/react-router";
import { CmsFooterLinks } from "@/components/CmsFooterLinks";

export function LandingFooter({ brandName }: { brandName: string }) {
  return (
    <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs opacity-80">
      <div className="mx-auto max-w-7xl px-5">
        <CmsFooterLinks className="mb-6 text-left" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link to="/welcome" className="underline-offset-4 hover:underline">
            View classic homepage
          </Link>
          <span className="mx-1">·</span>
          © {new Date().getFullYear()} {brandName}
        </div>
      </div>
    </footer>
  );
}
