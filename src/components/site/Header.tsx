import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, User, LogOut, Shield, Settings as SettingsIcon, Bookmark, Sun, Moon, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { usePreferences } from "@/lib/preferences";
import { getGenres } from "@/lib/tmdb.functions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const QUICK_GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi / Fantasy" },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme, t } = usePreferences();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const genresFn = useServerFn(getGenres);
  const genres = useQuery({ queryKey: ["genres"], queryFn: () => genresFn() });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  const navItems: { to: string; label: string; search?: any }[] = [
    { to: "/", label: t("home") },
    { to: "/browse", label: "Movies", search: { cat: "popular" } },
    { to: "/browse", label: "Top Rated", search: { cat: "top_rated" } },
    { to: "/browse", label: "Upcoming", search: { cat: "upcoming" } },
    { to: "/browse", label: "TV Shows", search: { cat: "tv_popular" } },
    { to: "/watchlist", label: t("watchlist") },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-gradient-to-b from-background/90 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-primary leading-none">BIG</span>
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-foreground leading-none">MOV</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm">
          {navItems.map((n) => (
            <Link
              key={`${n.to}-${n.label}`}
              to={n.to}
              search={n.search as any}
              className={`transition-colors hover:text-foreground ${
                path === n.to ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              {t("genres")} <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto bg-surface-elevated">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Movies</DropdownMenuLabel>
              {(genres.data?.movie ?? []).map((g: any) => (
                <DropdownMenuItem key={`m-${g.id}`} asChild>
                  <Link to="/genre/$id" params={{ id: String(g.id) }} search={{ type: "movie" }}>{g.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">TV</DropdownMenuLabel>
              {(genres.data?.tv ?? []).map((g: any) => (
                <DropdownMenuItem key={`t-${g.id}`} asChild>
                  <Link to="/genre/$id" params={{ id: String(g.id) }} search={{ type: "tv" }}>{g.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <form onSubmit={onSearch} className="ml-auto flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="h-9 w-32 sm:w-56 rounded-md bg-surface/80 border border-border pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </form>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-primary/20 hover:bg-primary/30">
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-surface-elevated">
              <DropdownMenuItem asChild><Link to="/watchlist"><Bookmark className="size-4 mr-2" />{t("watchlist")}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings"><SettingsIcon className="size-4 mr-2" />{t("settings")}</Link></DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild><Link to="/admin"><Shield className="size-4 mr-2" />Admin</Link></DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}><LogOut className="size-4 mr-2" />{t("signOut")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/login">{t("signIn")}</Link>
          </Button>
        )}
      </div>
      <div className="border-t border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-10 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar text-xs sm:text-sm">
          <span className="text-muted-foreground shrink-0 mr-2 uppercase tracking-wider text-[10px]">Genres</span>
          {QUICK_GENRES.map((g) => (
            <Link
              key={g.id}
              to="/genre/$id"
              params={{ id: String(g.id) }}
              search={{ type: "movie" }}
              className="shrink-0 px-3 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            >
              {g.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
