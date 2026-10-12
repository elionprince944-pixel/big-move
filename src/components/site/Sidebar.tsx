import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Film, Tv, Bookmark, Settings, CircleHelp, Info, Tags } from "lucide-react";

const genres = [
  { id: 28, name: "Action" }, { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" }, { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" },
];

export function Sidebar() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navClass = (active: boolean) => `sidebar-link ${active ? "sidebar-link-active" : ""}`;
  return (
    <aside className="site-sidebar" aria-label="Main navigation">
      <nav className="space-y-1">
        <Link to="/" className={navClass(path === "/")}><Home />Home</Link>
        <Link to="/genre/$id" params={{ id: "28" }} search={{ type: "movie" }} className={navClass(false)}><Film />Movies</Link>
        <Link to="/genre/$id" params={{ id: "10759" }} search={{ type: "tv" }} className={navClass(false)}><Tv />TV Shows</Link>
        <Link to="/watchlist" className={navClass(path === "/watchlist")}><Bookmark />My List</Link>
      </nav>
      <div className="mt-9 mb-3 flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground"><Tags className="size-3.5" />Quick Genres</div>
      <nav className="space-y-1" aria-label="Quick Genres">
        {genres.map((genre) => <Link key={genre.id} to="/genre/$id" params={{ id: String(genre.id) }} search={{ type: "movie" }} className={navClass(path === `/genre/${genre.id}`)}>{genre.name}</Link>)}
      </nav>
      <nav className="mt-auto space-y-1 border-t border-border pt-5" aria-label="Information">
        <Link to="/settings" className={navClass(path === "/settings")}><Settings />Settings</Link>
        <Link to="/help" className={navClass(path === "/help")}><CircleHelp />Help</Link>
        <Link to="/about" className={navClass(path === "/about")}><Info />About</Link>
      </nav>
    </aside>
  );
}