import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { getCategory } from "@/lib/tmdb.functions";
import { MovieGrid } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";
import { isSafeTitle } from "@/lib/content-rating";
import { Link } from "@tanstack/react-router";

const CATS = [
  { id: "popular", label: "Popular Movies" },
  { id: "top_rated", label: "Top Rated" },
  { id: "upcoming", label: "Coming Soon" },
  { id: "now_playing", label: "Now Playing" },
  { id: "tv_popular", label: "Popular TV" },
  { id: "tv_top_rated", label: "Top Rated TV" },
] as const;
const CAT_IDS = CATS.map((c) => c.id) as unknown as [string, ...string[]];
const GENRES = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" }, { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" }, { id: 36, name: "History" },
  { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" }, { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" }, { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const Route = createFileRoute("/browse")({
  validateSearch: z.object({
    cat: z.enum(CAT_IDS).optional(),
    page: z.coerce.number().optional().default(1),
  }),
  head: () => ({ meta: [
    { title: "Explore Movies & TV Shows — BIG MOV" },
    { name: "description", content: "Explore popular movies, TV shows and genres on BIG MOV." },
  ] }),
  component: BrowsePage,
});

function BrowsePage() {
  const { cat: catParam, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const cat = catParam ?? "popular";
  const [filter, setFilter] = useState("");
  const categoryFn = useServerFn(getCategory);
  const q = useQuery({
    queryKey: ["browse", cat, page],
    queryFn: () => categoryFn({ data: { category: cat, page } }),
  });
  const isTv = cat.startsWith("tv");
  const items = useMemo(() => (q.data?.results ?? [])
    .filter(isSafeTitle)
    .map((r: any) => ({ ...r, media_type: isTv ? "tv" : "movie" }))
    .filter((r: any) => (r.title ?? r.name ?? "").toLowerCase().includes(filter.toLowerCase())),
    [q.data?.results, isTv, filter]);
  const totalPages = Math.min(q.data?.total_pages ?? 1, 500);
  const setCat = (id: string) => navigate({ search: { cat: id as any, page: 1 } });

  return (
    <div className="browse-page mx-auto max-w-[1600px] py-8">
      <section className="browse-heading px-4 sm:px-6 mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-[.24em] text-primary uppercase">Discover something great</span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black">Explore <span className="text-primary">BIG MOV</span></h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">A bigger screen for your next favourite story. Browse films and series by popularity, rating, and genre.</p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter this collection..." className="h-11 w-full rounded-xl border border-white/10 bg-white/[.045] pl-10 pr-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/15" />
          </label>
        </div>
      </section>

      <section className="px-4 sm:px-6 mb-9">
        <div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="size-4 text-primary" /><h2 className="text-sm font-extrabold">Browse collections</h2></div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition-all ${cat === c.id ? "border-primary bg-primary text-black shadow-[0_5px_22px_rgba(255,101,0,.22)]" : "border-white/10 bg-white/[.035] text-white/70 hover:border-primary/50 hover:text-white"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold">Explore by genre</h2>
          <span className="text-[10px] text-muted-foreground">19 TMDB genres</span>
        </div>
        <div className="browse-genre-grid">
          {GENRES.map((g, index) => (
            <Link key={g.id} to="/genre/$id" params={{ id: String(g.id) }} search={{ type: "movie" }}
              className="browse-genre-chip">
              <span>{g.name}</span><span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><span className="text-[10px] uppercase tracking-[.2em] text-primary font-bold">Handpicked by the data</span><h2 className="mt-1 font-display text-2xl font-black">{CATS.find((c) => c.id === cat)?.label}</h2></div>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
        </div>
        {q.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
          </div>
        ) : items.length ? <MovieGrid items={items} /> : (
          <div className="rounded-2xl border border-white/10 bg-white/[.025] px-6 py-16 text-center text-sm text-muted-foreground">No titles found in this collection. Try another category.</div>
        )}
        <div className="mt-9 flex items-center justify-center gap-4">
          <button disabled={page <= 1} onClick={() => navigate({ search: (p: any) => ({ ...p, page: Math.max(1, page - 1) }) })} className="browse-page-btn"><ChevronLeft className="size-4" /> Previous</button>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => navigate({ search: (p: any) => ({ ...p, page: Math.min(totalPages, page + 1) }) })} className="browse-page-btn">Next <ChevronRight className="size-4" /></button>
        </div>
      </section>
    </div>
  );
}
