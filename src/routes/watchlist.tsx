import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { MovieGrid, type TmdbItem } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "Watchlist — BIG MOV" }] }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<TmdbItem[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { setBusy(false); return; }
    supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []).map((r) => ({ id: r.tmdb_id, title: r.title, poster_path: r.poster_path, media_type: r.media_type })));
        setBusy(false);
      });
  }, [user, loading]);

  if (loading || busy) {
    return (
      <div className="mx-auto max-w-7xl py-8">
        <h1 className="font-display text-3xl px-4 sm:px-6 mb-6">My Watchlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center py-24 px-6">
        <h1 className="font-display text-3xl mb-3">Your Watchlist</h1>
        <p className="text-muted-foreground mb-6">Sign in to save movies and shows you want to watch later.</p>
        <Button asChild className="bg-primary"><Link to="/login">Sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-8">
      <h1 className="font-display text-3xl px-4 sm:px-6 mb-6">My Watchlist</h1>
      {items.length ? <MovieGrid items={items} /> : (
        <p className="text-muted-foreground text-center py-12">Your watchlist is empty. Add titles from any movie or show page.</p>
      )}
    </div>
  );
}
