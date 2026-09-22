import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrending, getCategory } from "@/lib/tmdb.functions";
import { Hero } from "@/components/site/Hero";
import { MovieRow } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { SpinMovie } from "@/components/site/SpinMovie";
import { isSafeTitle } from "@/lib/content-rating";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animation" },
];

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const trendingFn = useServerFn(getTrending);
  const categoryFn = useServerFn(getCategory);

  const trending = useQuery({ queryKey: ["trending"], queryFn: () => trendingFn() });
  const popular = useQuery({ queryKey: ["cat", "popular"], queryFn: () => categoryFn({ data: { category: "popular" } }) });
  const topRated = useQuery({ queryKey: ["cat", "top_rated"], queryFn: () => categoryFn({ data: { category: "top_rated" } }) });
  const upcoming = useQuery({ queryKey: ["cat", "upcoming"], queryFn: () => categoryFn({ data: { category: "upcoming" } }) });
  const nowPlaying = useQuery({ queryKey: ["cat", "now_playing"], queryFn: () => categoryFn({ data: { category: "now_playing" } }) });
  const tv = useQuery({ queryKey: ["cat", "tv_popular"], queryFn: () => categoryFn({ data: { category: "tv_popular" } }) });
  const tvTopRated = useQuery({ queryKey: ["cat", "tv_top_rated"], queryFn: () => categoryFn({ data: { category: "tv_top_rated" } }) });

  const safe = (items: any[] | undefined) => (items ?? []).filter(isSafeTitle);
  const safeTrending = safe(trending.data?.results);
  const safePopular = safe(popular.data?.results);
  const safeTopRated = safe(topRated.data?.results);
  const safeUpcoming = safe(upcoming.data?.results);
  const safeNowPlaying = safe(nowPlaying.data?.results);
  const safeTv = safe(tv.data?.results).map((r: any) => ({ ...r, media_type: "tv" }));
  const safeTvTopRated = safe(tvTopRated.data?.results).map((r: any) => ({ ...r, media_type: "tv" }));
  const heroItem = safeTrending.find((r: any) => r.backdrop_path) ?? safeTrending[0];

  return (
    <div className="-mt-16">
      {trending.isLoading ? <Skeleton className="h-[70vh] w-full" /> : <Hero item={heroItem} />}

      <div className="mx-auto max-w-7xl">
        <section className="px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Explore</p>
              <h2 className="font-display text-2xl sm:text-3xl">Browse by genre</h2>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {GENRES.map((genre) => (
              <Link
                key={genre.id}
                to="/genre/$id"
                params={{ id: String(genre.id) }}
                search={{ type: "movie" }}
                className="shrink-0 rounded-full border border-border bg-surface/70 px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-surface transition-all"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </section>

        <SpinMovie />

        <MovieRow title="Trending Now" items={safeTrending} />
        <MovieRow title="Popular Movies" items={safePopular} />
        <MovieRow title="Now Playing" items={safeNowPlaying} />
        <MovieRow title="Top Rated" items={safeTopRated} />
        <MovieRow title="Coming Soon" items={safeUpcoming} />
        <MovieRow title="Popular TV Shows" items={safeTv} />
        <MovieRow title="Top Rated TV" items={safeTvTopRated} />

        <section className="mx-4 sm:mx-6 my-12 rounded-2xl border border-border bg-surface/50 p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">BIG MOV</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Your next movie night starts here.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Discover movies and shows, save your favorites, explore genres, and open a title to see its full details.
          </p>
        </section>
      </div>
    </div>
  );
}
