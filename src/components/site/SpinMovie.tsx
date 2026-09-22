import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Clapperboard, Dices, Loader2, Play, Star } from "lucide-react";
import { getRandomMovie } from "@/lib/tmdb.functions";
import { TMDB_IMG } from "@/lib/tmdb-image";

export function SpinMovie() {
  const randomMovieFn = useServerFn(getRandomMovie);
  const [movie, setMovie] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setMovie(null);
    try {
      const result = await randomMovieFn({ data: {} });
      await new Promise((resolve) => setTimeout(resolve, 1100));
      setMovie(result);
    } finally {
      setSpinning(false);
    }
  };

  const title = movie?.title ?? movie?.name ?? "Your next movie";
  const type = movie?.media_type === "tv" ? "tv" : "movie";
  const year = (movie?.release_date ?? movie?.first_air_date ?? "").slice(0, 4);

  return (
    <section className="mx-4 sm:mx-6 my-10 overflow-hidden rounded-3xl border border-border bg-surface/70 p-5 sm:p-8 relative" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-7 lg:grid-cols-[1fr_280px] items-center">
        <div>
          <div className="flex items-center gap-2 text-primary text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Dices className="size-4" />
            Movie Roulette
          </div>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Can’t decide what to watch?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Let BIG MOV pick something for you. One spin, one random movie, zero scrolling paralysis.
          </p>

          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {spinning ? <Loader2 className="size-4 animate-spin" /> : <Dices className="size-4" />}
            {spinning ? "Finding a movie..." : movie ? "Spin Again" : "Spin a Movie"}
          </button>

          {movie && !spinning && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start rounded-2xl border border-border bg-background/50 p-4">
              {movie.poster_path ? (
                <img src={TMDB_IMG(movie.poster_path, "w300")} alt={title} className="w-24 h-36 rounded-lg object-cover" />
              ) : (
                <div className="w-24 h-36 rounded-lg bg-surface" />
              )}
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">Tonight’s pick</p>
                <h3 className="mt-1 text-xl font-display line-clamp-2">{title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {movie.vote_average ? <span className="inline-flex items-center gap-1"><Star className="size-3 fill-primary text-primary" />{movie.vote_average.toFixed(1)}</span> : null}
                  {year && <span>{year}</span>}
                  <span>{type === "tv" ? "TV Series" : "Movie"}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{movie.overview || "A surprise pick from BIG MOV."}</p>
                <Link
                  to="/movie/$id"
                  params={{ id: String(movie.id) }}
                  search={{ type }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Play className="size-3 fill-current" />
                  Open Details
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className={`mx-auto grid size-52 place-items-center rounded-full border-[10px] border-primary/20 bg-background shadow-2xl ${spinning ? "animate-spin" : ""}`} style={{ animationDuration: "1.1s" }}>
          <div className="grid size-40 place-items-center rounded-full border border-primary/30 bg-surface">
            <Clapperboard className="size-14 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
