import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Search, User, LogOut, Shield, Settings as SettingsIcon, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/watchlist", label: "Watchlist" },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");

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
              key={n.to}
              to={n.to}
              className={`transition-colors hover:text-foreground ${
                path === n.to ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-9 w-32 sm:w-56 rounded-md bg-surface/80 border border-border pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </form>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-primary/20 hover:bg-primary/30">
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-surface-elevated">
              <DropdownMenuItem asChild><Link to="/watchlist"><Bookmark className="size-4 mr-2" />Watchlist</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings"><SettingsIcon className="size-4 mr-2" />Settings</Link></DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild><Link to="/admin"><Shield className="size-4 mr-2" />Admin</Link></DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}><LogOut className="size-4 mr-2" />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
