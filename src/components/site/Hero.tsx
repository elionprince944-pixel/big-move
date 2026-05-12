import { Link } from "@tanstack/react-router";
import { Play, Info, Star } from "lucide-react";
import { TMDB_IMG } from "@/lib/tmdb-image";
import type { TmdbItem } from "./Movie";

export function Hero({ item }: { item: TmdbItem | undefined }) {
  if (!item) return <div className="h-[60vh] bg-surface" />;
  const title = item.title ?? item.name ?? "";
  const type = item.media_type === "tv" ? "tv" : "movie";
  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      {item.backdrop_path && (
        <img
          src={TMDB_IMG(item.backdrop_path, "original")}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Featured
          </div>
          <h1 className="font-display text-4xl sm:text-6xl mb-4 leading-none">{title}</h1>
          {item.vote_average ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Star className="size-4 fill-primary text-primary" />
              <span className="text-foreground font-medium">{item.vote_average.toFixed(1)}</span>
              <span>· TMDB</span>
            </div>
          ) : null}
          <div className="flex items-center gap-3 mt-4">
            <Link
              to="/movie/$id"
              params={{ id: String(item.id) }}
              search={{ type }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <Play className="size-4 fill-current" /> Watch
            </Link>
            <Link
              to="/movie/$id"
              params={{ id: String(item.id) }}
              search={{ type }}
              className="inline-flex items-center gap-2 bg-surface-elevated/80 hover:bg-surface-elevated text-foreground px-6 py-3 rounded-md font-medium transition-colors backdrop-blur-sm"
            >
              <Info className="size-4" /> More info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
