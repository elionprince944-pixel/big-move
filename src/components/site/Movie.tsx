import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { TMDB_IMG } from "@/lib/tmdb-image";

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
};

export function MovieCard({ item }: { item: TmdbItem }) {
  const title = item.title ?? item.name ?? "Untitled";
  const type = item.media_type === "tv" ? "tv" : "movie";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  return (
    <Link
      to="/movie/$id"
      params={{ id: String(item.id) }}
      search={{ type }}
      className="group relative shrink-0 w-[140px] sm:w-[170px] md:w-[190px] rounded-md overflow-hidden bg-surface transition-transform duration-300 hover:scale-105 hover:z-10"
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
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--gradient-card)" }}>
          <p className="text-sm font-medium line-clamp-2">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {year && <span>{year}</span>}
            {item.vote_average ? (
              <span className="flex items-center gap-0.5"><Star className="size-3 fill-primary text-primary" />{item.vote_average.toFixed(1)}</span>
            ) : null}
          </div>
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
  if (!items?.length) return null;
  return (
    <section className="relative my-8">
      <h2 className="text-xl sm:text-2xl font-display tracking-wide mb-3 px-4 sm:px-6">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll(-1)}
          className="hidden md:grid place-items-center absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar px-4 sm:px-6 pb-2">
          {items.map((m) => <MovieCard key={`${m.media_type ?? "x"}-${m.id}`} item={m} />)}
        </div>
        <button
          onClick={() => scroll(1)}
          className="hidden md:grid place-items-center absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </section>
  );
}

export function MovieGrid({ items }: { items: TmdbItem[] }) {
  if (!items?.length) return <p className="text-muted-foreground text-sm px-4 sm:px-6">No results.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6">
      {items.map((m) => <MovieCard key={`${m.media_type ?? "x"}-${m.id}`} item={m} />)}
    </div>
  );
}
