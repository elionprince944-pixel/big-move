import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, User, LogOut, Shield, Settings as SettingsIcon, Bookmark, Sun, Moon, Menu, Home, Film, Tv, Star } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { usePreferences } from "@/lib/preferences";
import { getGenres, searchTmdb } from "@/lib/tmdb.functions";
import { TMDB_IMG } from "@/lib/tmdb-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const QUICK_GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme, t } = usePreferences();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const deferredQ = useDeferredValue(q.trim());
  const genresFn = useServerFn(getGenres);
  const searchFn = useServerFn(searchTmdb);
  const genres = useQuery({ queryKey: ["genres"], queryFn: () => genresFn() });
  const liveSearch = useQuery({
    queryKey: ["live-search", deferredQ],
    queryFn: () => searchFn({ data: { query: deferredQ } }),
    enabled: deferredQ.length >= 2,
  });

  const liveItems = (liveSearch.data?.results ?? [])
    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 6);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      setSearchFocused(false);
      navigate({ to: "/search", search: { q: q.trim() } });
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-gradient-to-b from-background/90 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:w-96 p-0 flex flex-col bg-background">
            <SheetHeader className="px-6 py-5 border-b border-border">
              <SheetTitle className="flex items-center gap-1">
                <span className="font-display text-2xl tracking-tight text-primary leading-none">BIG</span>
                <span className="font-display text-2xl tracking-tight text-foreground leading-none">MOV</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="flex flex-col gap-0.5">
                <SheetClose asChild>
                  <Link
                    to="/"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface ${
                      path === "/" ? "text-foreground bg-surface font-medium" : "text-muted-foreground"
                    }`}
                  >
                    <Home className="size-4" /> {t("home")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/watchlist"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface ${
                      path === "/watchlist" ? "text-foreground bg-surface font-medium" : "text-muted-foreground"
                    }`}
                  >
                    <Bookmark className="size-4" /> {t("watchlist")}
                  </Link>
                </SheetClose>
              </nav>

              <Separator className="my-4" />

              <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Quick Genres</div>
              <div className="flex flex-wrap gap-2 px-3 mb-4">
                {QUICK_GENRES.map((g) => (
                  <SheetClose asChild key={g.id}>
                    <Link
                      to="/genre/$id"
                      params={{ id: String(g.id) }}
                      search={{ type: "movie" }}
                      className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    >
                      {g.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="px-3 mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Film className="size-3" /> Movies
              </div>
              <div className="flex flex-col gap-0.5 mb-4">
                {(genres.data?.movie ?? []).map((g: any) => (
                  <SheetClose asChild key={`m-${g.id}`}>
                    <Link
                      to="/genre/$id"
                      params={{ id: String(g.id) }}
                      search={{ type: "movie" }}
                      className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    >
                      {g.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="px-3 mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Tv className="size-3" /> TV
              </div>
              <div className="flex flex-col gap-0.5">
                {(genres.data?.tv ?? []).map((g: any) => (
                  <SheetClose asChild key={`t-${g.id}`}>
                    <Link
                      to="/genre/$id"
                      params={{ id: String(g.id) }}
                      search={{ type: "tv" }}
                      className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                    >
                      {g.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-1 shrink-0" onClick={closeMenu}>
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-primary leading-none">BIG</span>
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-foreground leading-none">MOV</span>
        </Link>

        <form onSubmit={onSearch} className="ml-auto flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
              placeholder={t("search")}
              className="h-9 w-32 sm:w-56 rounded-md bg-surface/80 border border-border pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchFocused && q.trim().length >= 2 && (
              <div className="absolute right-0 mt-2 w-[min(86vw,22rem)] rounded-md border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden">
                {liveSearch.isFetching && !liveItems.length ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">Searching…</div>
                ) : liveItems.length ? (
                  <div className="py-1">
                    {liveItems.map((item: any) => {
                      const itemTitle = item.title ?? item.name ?? "Untitled";
                      const itemType = item.media_type === "tv" ? "tv" : "movie";
                      const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
                      return (
                        <Link
                          key={`${itemType}-${item.id}`}
                          to="/movie/$id"
                          params={{ id: String(item.id) }}
                          search={{ type: itemType }}
                          onClick={() => setSearchFocused(false)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors"
                        >
                          <div className="size-10 shrink-0 overflow-hidden rounded bg-surface">
                            {item.poster_path ? (
                              <img src={TMDB_IMG(item.poster_path, "w200")} alt={itemTitle} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{itemTitle}</p>
                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{itemType === "tv" ? "TV" : "Movie"}</span>
                              {year && <span>{year}</span>}
                              {item.vote_average ? <span className="inline-flex items-center gap-0.5"><Star className="size-3 fill-primary text-primary" />{item.vote_average.toFixed(1)}</span> : null}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                    <button
                      type="submit"
                      className="w-full border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-accent"
                    >
                      View all results for “{q.trim()}”
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-3 text-sm text-muted-foreground">No results found.</div>
                )}
              </div>
            )}
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
    </header>
  );
}
