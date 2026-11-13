import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookmarkPlus, Check, ChevronLeft, ChevronRight, Info, Play, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { TMDB_IMG } from "@/lib/tmdb-image";
import type { TmdbItem } from "@/components/site/Movie";

const GENRE_NAMES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 18: "Drama", 14: "Fantasy", 27: "Horror",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller",
  10751: "Family", 36: "History", 10402: "Music", 10752: "War",
  37: "Western", 10759: "Action & Adventure", 10765: "Sci-Fi & Fantasy",
};

export function FeaturedCarousel({ items }: { items: TmdbItem[] }) {
  const featured = (items ?? []).filter((item) => item.backdrop_path || item.poster_path).slice(0, 8);
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % featured.length), 6500);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  const item = featured[active] ?? featured[0];
  const type = item?.media_type === "tv" ? "tv" : "movie";

  useEffect(() => {
    let cancelled = false;
    if (!user || !item) {
      setInWatchlist(false);
      return;
    }
    supabase.from("watchlist").select("id")
      .eq("user_id", user.id).eq("tmdb_id", item.id).eq("media_type", type).maybeSingle()
      .then(({ data }) => { if (!cancelled) setInWatchlist(!!data); });
    return () => { cancelled = true; };
  }, [user, item?.id, type]);

  if (!featured.length || !item) return null;
  const title = item.title ?? item.name ?? "Featured";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const genres = (item.genre_ids ?? []).map((id) => GENRE_NAMES[id]).filter(Boolean).slice(0, 2);

  const toggleWatchlist = async () => {
    if (!user) {
      toast.error("Sign in to save titles to your list");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (inWatchlist) {
        const { error } = await supabase.from("watchlist").delete()
          .eq("user_id", user.id).eq("tmdb_id", item.id).eq("media_type", type);
        if (error) throw error;
        setInWatchlist(false);
        toast.success("Removed from My List");
      } else {
        const { error } = await supabase.from("watchlist").insert({
          user_id: user.id,
          tmdb_id: item.id,
          media_type: type,
          title,
          poster_path: item.poster_path ?? null,
        });
        if (error) throw error;
        setInWatchlist(true);
        toast.success("Added to My List");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update My List");
    } finally {
      setSaving(false);
    }
  };

  const move = (direction: number) => setActive((current) => (current + direction + featured.length) % featured.length);

  return (
    <section className="bm-featured-shell" aria-label="Featured titles">
      <div className="bm-featured-stage">
        {featured.map((movie, index) => (
          <div key={movie.id} className={`bm-featured-slide ${index === active ? "is-active" : ""}`} aria-hidden={index !== active}>
            {(movie.backdrop_path || movie.poster_path) && (
              <img src={TMDB_IMG(movie.backdrop_path ?? movie.poster_path!, "original")} alt="" className="bm-featured-image" />
            )}
          </div>
        ))}
        <div className="bm-featured-shade" />
        <div className="bm-featured-content">
          <span className="bm-eyebrow"><span className="bm-live-dot" /> TRENDING NOW</span>
          <h1 key={item.id} className="bm-featured-title">{title}</h1>
          <div className="bm-featured-meta">
            {year && <span>{year}</span>}
            <span>{type === "tv" ? "TV SERIES" : "MOVIE"}</span>
            {genres.map((genre) => <span key={genre}>{genre}</span>)}
            {item.vote_average ? <span className="bm-rating"><Star className="size-3.5 fill-current" /> {item.vote_average.toFixed(1)}</span> : null}
          </div>
          <p className="bm-featured-copy">{item.overview?.trim() || "Discover the story, explore the cast, and find your next favourite on BIG MOV."}</p>
          <div className="bm-featured-actions">
            <Link to="/movie/$id" params={{ id: String(item.id) }} search={{ type, play: 1 }} className="bm-featured-cta"><Play className="size-4 fill-current" /> Play Now</Link>
            <Link to="/movie/$id" params={{ id: String(item.id) }} search={{ type }} className="bm-featured-info"><Info className="size-4" /> More Info</Link>
            <button type="button" onClick={toggleWatchlist} disabled={saving} aria-label={inWatchlist ? "Remove from My List" : "Add to My List"} className="bm-featured-save">
              {inWatchlist ? <Check className="size-5" /> : <BookmarkPlus className="size-5" />}
            </button>
          </div>
        </div>
        <div className="bm-featured-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous featured title"><ChevronLeft /></button>
          <div className="bm-featured-dots">
            {featured.map((movie, index) => <button key={movie.id} type="button" aria-label={`Show featured title ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)} />)}
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Next featured title"><ChevronRight /></button>
        </div>
        <span className="bm-featured-count">{String(active + 1).padStart(2, "0")} <i>/</i> {String(featured.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
