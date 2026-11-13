import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrending, getCategory } from "@/lib/tmdb.functions";
import { MovieRow } from "@/components/site/Movie";
import { Link } from "@tanstack/react-router";
import { SpinMovie } from "@/components/site/SpinMovie";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { isSafeTitle } from "@/lib/content-rating";
import { TMDB_IMG } from "@/lib/tmdb-image";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animation" },
];

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [
    { title: "BIG MOV \u2014 Movies & TV Shows" },
    { name: "description", content: "Discover trending movies, popular TV shows, and your next movie night on BIG MOV." },
    { property: "og:title", content: "BIG MOV \u2014 Movies & TV Shows" },
    { property: "og:description", content: "Discover trending movies, popular TV shows, and your next movie night on BIG MOV." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
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

  return (
    <div className="home-content">
      <div id="browse" className="mx-auto max-w-7xl scroll-mt-20">
        <FeaturedCarousel items={safeTrending} />
        <section className="px-4 sm:px-6 pt-8 pb-2">
          <div className="flex items-center justify-between mb-4"><h2 className="movie-row-title text-lg sm:text-xl">Browse by Categories</h2><Link to="/genre/$id" params={{id:"28"}} search={{type:"movie"}} className="text-xs font-bold text-primary hover:underline">All Categories →</Link></div>
          <div className="category-tiles">
            {GENRES.concat([{id:10749,name:"Romance"}]).map((genre,index)=>{
              const artwork = safeTrending.find((movie: any) => movie.genre_ids?.includes(genre.id) && (movie.backdrop_path || movie.poster_path));
              const imagePath = artwork?.backdrop_path ?? artwork?.poster_path;
              return <Link key={genre.id} to="/genre/$id" params={{id:String(genre.id)}} search={{type:"movie"}} className={`category-tile category-tile-${index%8}`} style={imagePath ? { backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.92),rgba(0,0,0,.12)),url("${TMDB_IMG(imagePath,"w780")}")` } : undefined}><span>{genre.name}</span><small>Explore</small></Link>;
            })}
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

        <section className="mx-4 sm:mx-6 my-12 border-t border-border py-6 sm:py-8">
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
