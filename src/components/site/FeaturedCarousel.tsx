import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { TMDB_IMG } from "@/lib/tmdb-image";
import type { TmdbItem } from "@/components/site/Movie";

export function FeaturedCarousel({ items }: { items: TmdbItem[] }) {
  const featured = (items ?? []).filter((item) => item.backdrop_path || item.poster_path).slice(0, 8);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % featured.length), 6500);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return null;
  const item = featured[active];
  const title = item.title ?? item.name ?? "Featured";
  const type = item.media_type === "tv" ? "tv" : "movie";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
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
          <span className="bm-eyebrow"><span className="bm-live-dot" /> BIG MOV PREMIERE</span>
          <h1 key={item.id} className="bm-featured-title">{title}</h1>
          <div className="bm-featured-meta">
            {year && <span>{year}</span>}
            <span>{type === "tv" ? "TV SERIES" : "MOVIE"}</span>
            {item.vote_average ? <span className="bm-rating"><Star className="size-3.5 fill-current" /> {item.vote_average.toFixed(1)}</span> : null}
          </div>
          <p className="bm-featured-copy">Discover your next favourite story. Explore the details, cast, and viewing options on BIG MOV.</p>
          <Link to="/movie/$id" params={{ id: String(item.id) }} search={{ type }} className="bm-featured-cta"><Play className="size-4 fill-current" /> Explore title</Link>
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
