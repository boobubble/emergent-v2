import { Link } from "@tanstack/react-router";
import { CmsFooterLinks } from "@/components/CmsFooterLinks";
import { StaticFooterColumns } from "@/components/footer/StaticFooterColumns";

export function LandingFooter({ brandName }: { brandName: string }) {
  return (
    <footer className="relative z-10 border-t border-white/10 py-8 text-xs opacity-80">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <CmsFooterLinks />
          <StaticFooterColumns />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
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
