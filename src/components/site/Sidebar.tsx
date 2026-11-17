import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Clapperboard, Bookmark, ShieldCheck, Info, LifeBuoy, Crown, CirclePlay,
} from "lucide-react";

const items = [
  { label: "Home", to: "/home", Icon: Home, active: (path: string) => path === "/home" || path === "/" },
  { label: "Shorts", to: "/shorts", Icon: CirclePlay, active: (path: string) => path === "/shorts", badge: "NEW" },
  { label: "Genre", to: "/browse", Icon: Clapperboard, active: (path: string) => path === "/browse" || path.startsWith("/genre/") },
  { label: "Watchlist", to: "/watchlist", Icon: Bookmark, active: (path: string) => path === "/watchlist" },
  // Mature-rated titles are not linked directly. This opens the help page's content-rating guidance.
  { label: "18+", to: "/help", Icon: ShieldCheck, active: () => false },
  { label: "About", to: "/about", Icon: Info, active: (path: string) => path === "/about" },
  { label: "Help", to: "/help", Icon: LifeBuoy, active: (path: string) => path === "/help" },
  { label: "Subscription", to: "/settings", Icon: Crown, active: (path: string) => path === "/settings" },
] as const;

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className={`site-sidebar${mobile ? " site-sidebar-mobile" : ""}`} aria-label="Main navigation">
      <div className="sidebar-section-label">EXPLORE BIG MOV</div>
      <nav className="sidebar-primary-nav" aria-label="Main navigation">
        {items.map(({ label, to, Icon, active, ...rest }) => (
          <Link
            key={label}
            to={to as any}
            className={`sidebar-link ${active(path) ? "sidebar-link-active" : ""}`}
            aria-current={active(path) ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
            {"badge" in rest && rest.badge ? <span className="sidebar-new">{rest.badge}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-5 pt-6 text-[11px] leading-relaxed text-white/35">
        Discover. Watch. Enjoy.
      </div>
    </aside>
  );
}
