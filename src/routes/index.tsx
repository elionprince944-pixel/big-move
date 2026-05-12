import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrending, getCategory } from "@/lib/tmdb.functions";
import { Hero } from "@/components/site/Hero";
import { MovieRow } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";

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
  const tv = useQuery({ queryKey: ["cat", "tv_popular"], queryFn: () => categoryFn({ data: { category: "tv_popular" } }) });

  const heroItem = trending.data?.results?.find((r: any) => r.backdrop_path) ?? trending.data?.results?.[0];

  return (
    <div className="-mt-16">
      {trending.isLoading ? <Skeleton className="h-[70vh] w-full" /> : <Hero item={heroItem} />}
      <div className="mx-auto max-w-7xl">
        <MovieRow title="Trending Now" items={trending.data?.results ?? []} />
        <MovieRow title="Popular Movies" items={popular.data?.results ?? []} />
        <MovieRow title="Top Rated" items={topRated.data?.results ?? []} />
        <MovieRow title="Coming Soon" items={upcoming.data?.results ?? []} />
        <MovieRow title="Popular TV Shows" items={(tv.data?.results ?? []).map((r: any) => ({ ...r, media_type: "tv" }))} />
      </div>
    </div>
  );
}
