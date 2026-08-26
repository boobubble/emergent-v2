import { MessageCircle, Instagram, Twitter, Youtube } from "@/components/home/home-icons";
import { CmsFooterLinks } from "@/components/CmsFooterLinks";

export const HOME_EXPLORE_LINKS = [
  { label: "Chatrooms", href: "/chatroom" },
  { label: "Feed", href: "/feed" },
  { label: "Communities", href: "/communities" },
  { label: "Competitions", href: "/competitions" },
  { label: "Poetry", href: "/poetry" },
] as const;

const SOCIAL = [
  { Icon: MessageCircle, label: "Discord", color: "bg-indigo-500/20 text-indigo-300" },
  { Icon: Instagram, label: "Instagram", color: "bg-pink-500/20 text-pink-300" },
  { Icon: Twitter, label: "Twitter", color: "bg-sky-500/20 text-sky-300" },
  { Icon: Youtube, label: "YouTube", color: "bg-red-500/20 text-red-300" },
] as const;

/**
 * Single homepage/welcome footer: Welcome visual chrome + product Explore
 * links + CMS Custom Pages columns. Does not render the static landing-page
 * column list that duplicated CMS destinations.
 */
export function HomeFooter({
  brandName,
  tagline,
}: {
  brandName: string;
  tagline: string;
}) {
  return (
    <footer className="welcome-footer border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-base"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}
              >
                💬
              </span>
              <span className="text-base font-extrabold">{brandName}</span>
            </div>
            {tagline ? (
              <p className="mt-3 max-w-xs text-sm text-white/55">{tagline}</p>
            ) : null}
          </div>

          <div>
            <div className="text-sm font-bold text-white">Explore</div>
            <ul className="mt-3 space-y-2">
              {HOME_EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/55 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <CmsFooterLinks />

          <div>
            <div className="text-sm font-bold text-white">Follow Us</div>
            <div className="mt-3 flex items-center gap-2">
              {SOCIAL.map(({ Icon, label, color }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`grid h-9 w-9 place-items-center rounded-full ${color} transition-transform hover:scale-105`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
