import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, CirclePlay, Tv, Film, Link2, Users, Crown, UserRound,
  MessageSquare, Contact, Crosshair, Smile, Clapperboard, Ghost,
  Rocket, Heart,
} from "lucide-react";

const genres = [
  { id: 28, name: "Action", Icon: Crosshair },
  { id: 35, name: "Comedy", Icon: Smile },
  { id: 18, name: "Drama", Icon: Clapperboard },
  { id: 27, name: "Horror", Icon: Ghost },
  { id: 878, name: "Sci-Fi", Icon: Rocket },
  { id: 10749, name: "Romance", Icon: Heart },
];

function DisabledItem({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="sidebar-link sidebar-link-disabled" aria-disabled="true" title="Coming soon">
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search });
  const cls = (active: boolean) => `sidebar-link ${active ? "sidebar-link-active" : ""}`;
  const activeGenre = path.startsWith("/genre/");

  return (
    <aside className="site-sidebar" aria-label="Main navigation">
      <div className="sidebar-section-label">MAIN</div>
      <nav className="sidebar-primary-nav" aria-label="Main">
        <Link to="/home" className={cls(path === "/home")}><Home /><span>Home</span></Link>
        <DisabledItem Icon={CirclePlay}>Shorts</DisabledItem>
        <Link to="/browse" search={{ cat: "tv_popular" }} className={cls(path === "/browse" && search.cat === "tv_popular")}><Tv /><span>TV Shows</span></Link>
        <Link to="/browse" search={{ cat: "popular" }} className={`${cls(path === "/browse" && (search.cat === "popular" || !search.cat))} sidebar-link-featured`}><Film /><span>Agasobanurye</span></Link>
        <DisabledItem Icon={Link2}>Mirror</DisabledItem>
        <DisabledItem Icon={Users}>Cinema Arena</DisabledItem>
        <DisabledItem Icon={Crown}><span className="sidebar-premium-label">Premium Plans</span></DisabledItem>
        <Link to="/settings" className={cls(path === "/settings")}><UserRound /><span>My Profile</span></Link>
        <DisabledItem Icon={MessageSquare}>Messaging</DisabledItem>
        <Link to="/settings" className={cls(false)}><Contact /><span>My Subscription</span></Link>
      </nav>

      <div className="sidebar-section-label sidebar-genres-heading">GENRES</div>
      <nav className="sidebar-genre-list" aria-label="Genres">
        {genres.map(({ id, name, Icon }) => (
          <Link
            key={id}
            to="/genre/$id"
            params={{ id: String(id) }}
            search={{ type: "movie" }}
            className={cls(path === `/genre/${id}`)}
          >
            <Icon />
            <span>{name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
