import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-1">
            <span className="font-display text-2xl text-primary">BIG</span>
            <span className="font-display text-2xl">MOV</span>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">Movies & shows, anywhere.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Explore</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground">Browse</Link></li>
            <li><Link to="/search" search={{ q: "" }} className="hover:text-foreground">Search</Link></li>
            <li><Link to="/watchlist" className="hover:text-foreground">Watchlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/help" className="hover:text-foreground">Help</Link></li>
            <li><Link to="/settings" className="hover:text-foreground">Settings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Account</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Create account</Link></li>
            <li><Link to="/admin/login" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BIG MOV. Powered by TMDB.
      </div>
    </footer>
  );
}
