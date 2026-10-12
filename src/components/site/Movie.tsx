import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TMDB_IMG } from "@/lib/tmdb-image";
import { isSafeTitle } from "@/lib/content-rating";

export type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  adult?: boolean;
};

export function MovieCard({ item }: { item: TmdbItem }) {
  if (!isSafeTitle(item)) return null;
  const title = item.title ?? item.name ?? "Untitled";
  const type = item.media_type === "tv" ? "tv" : "movie";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  return (
    <Link
      to="/movie/$id"
      params={{ id: String(item.id) }}
      search={{ type }}
      className="movie-card group relative shrink-0 w-[140px] sm:w-[158px] md:w-[174px] rounded-lg overflow-hidden bg-card border border-border transition-transform duration-300 hover:-translate-y-1 hover:border-primary/60"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="aspect-[2/3] relative">
        {item.poster_path ? (
          <img
            src={TMDB_IMG(item.poster_path, "w300")}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">{title}</div>
        )}
      </div>
        <div className="px-2.5 py-3">
          <p className="text-xs font-semibold truncate" title={title}>{title}</p>
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mt-2">
            {year && <span>{year}</span>}
            {item.vote_average ? (
              <span className="flex items-center gap-0.5"><Star className="size-3 fill-primary text-primary" />{item.vote_average.toFixed(1)}</span>
            ) : null}
          </div>
        </div>
    </Link>
  );
}

export function MovieRow({ title, items }: { title: string; items: TmdbItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };
  const safeItems = items?.filter(isSafeTitle) ?? [];
  if (!safeItems.length) return null;
  return (
    <section className="relative my-10">
      <h2 className="movie-row-title text-lg sm:text-xl font-display mb-5 px-4 sm:px-6">{title}</h2>
      <div className="relative group">
        <Button variant="ghost"
          onClick={() => scroll(-1)}
          className="hidden md:grid place-items-center absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-6" />
        </Button>
        <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar px-4 sm:px-6 pb-2">
          {safeItems.map((m) => <MovieCard key={`${m.media_type ?? "x"}-${m.id}`} item={m} />)}
        </div>
        <Button variant="ghost"
          onClick={() => scroll(1)}
          className="hidden md:grid place-items-center absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </section>
  );
}

export function MovieGrid({ items }: { items: TmdbItem[] }) {
  const safeItems = items?.filter(isSafeTitle) ?? [];
  if (!safeItems.length) return <p className="text-muted-foreground text-sm px-4 sm:px-6">No safe titles found.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6">
      {safeItems.map((m) => <MovieCard key={`${m.media_type ?? "x"}-${m.id}`} item={m} />)}
    </div>
  );
}
