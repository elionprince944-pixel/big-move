import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Film, Tv, Bookmark, Heart, History, Settings, CircleHelp, Info,
  Tags, Clapperboard, Globe, ChevronDown, Sparkles,
} from "lucide-react";
import { Brand } from "@/components/site/Brand";

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 53, name: "Thriller" },
  { id: 878, name: "Science Fiction" },
  { id: 14, name: "Fantasy" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
  { id: 80, name: "Crime" },
  { id: 9648, name: "Mystery" },
  { id: 99, name: "Documentary" },
  { id: 10751, name: "Family" },
  { id: 36, name: "History" },
  { id: 10752, name: "War" },
  { id: 10402, name: "Musical" },
  { id: 18, name: "Biography" },
  { id: 37, name: "Western" },
  { id: 99, name: "Sports" },
];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search });
  const cls = (active: boolean) => `sidebar-link ${active ? "sidebar-link-active" : ""}`;
  const activeGenre = path === "/genre/$id" || path.startsWith("/genre/");

  return (
    <aside className="site-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand"><Brand tagline /></div>

      <nav className="sidebar-primary-nav" aria-label="Discover">
        <Link to="/home" className={cls(path === "/home")}><Home />Home</Link>
        <Link to="/browse" search={{ cat: "popular" }} className={cls(path === "/browse" && search.cat !== "tv_popular" && search.cat !== "tv_top_rated")}><Film />Movies</Link>
        <Link to="/browse" search={{ cat: "tv_popular" }} className={cls(path === "/browse" && (search.cat === "tv_popular" || search.cat === "tv_top_rated"))}><Tv />TV Shows</Link>
        <Link to="/browse" search={{ cat: "upcoming" }} className={cls(false)}><Clapperboard />Shorts <span className="sidebar-new">NEW</span></Link>
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-primary-nav" aria-label="Your library">
        <Link to="/watchlist" className={cls(path === "/watchlist")}><Bookmark />My List</Link>
        <Link to="/watchlist" className={cls(false)}><Heart />Favorites</Link>
        <Link to="/watchlist" className={cls(false)}><History />History</Link>
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-section-label"><Tags />Explore Genres</div>
      <Link to="/browse" search={{ cat: "popular" }} className={`sidebar-all-categories ${activeGenre ? "is-active" : ""}`}>
        All Categories <ChevronDown className="size-3.5" />
      </Link>
      <nav className="sidebar-genre-list" aria-label="Movie genres">
        {genres.map((genre, index) => (
          <Link
            key={`${genre.name}-${index}`}
            to="/genre/$id"
            params={{ id: String(genre.id) }}
            search={{ type: "movie" }}
            className={cls(path === `/genre/${genre.id}`)}
          >
            <span>{genre.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-primary-nav sidebar-utility-nav" aria-label="Support and settings">
        <Link to="/settings" className={cls(path === "/settings")}><Settings />Settings</Link>
        <Link to="/help" className={cls(path === "/help")}><CircleHelp />Help Desk</Link>
        <Link to="/about" className={cls(path === "/about")}><Info />About BIG MOV</Link>
      </nav>
      <div className="sidebar-language"><Globe /><span>Language</span><button type="button" aria-label="Current language English">🇬🇧 English⌄</button></div>
      <div className="sidebar-premium">
        <div className="flex items-center gap-2 text-primary"><Sparkles className="size-4" /><strong>BIG MOV Premium</strong></div>
        <p>Discover more with a premium experience.</p>
        <Link to="/settings">Explore Premium <span>→</span></Link>
      </div>
    </aside>
  );
}
