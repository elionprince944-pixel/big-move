import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCategory } from "@/lib/tmdb.functions";
import { MovieGrid } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";

const CATS = [
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
  { id: "upcoming", label: "Upcoming" },
  { id: "now_playing", label: "Now Playing" },
  { id: "tv_popular", label: "TV: Popular" },
  { id: "tv_top_rated", label: "TV: Top Rated" },
] as const;

const CAT_IDS = CATS.map((c) => c.id) as unknown as [string, ...string[]];

export const Route = createFileRoute("/browse")({
  validateSearch: z.object({ cat: z.enum(CAT_IDS).optional() }),
  head: () => ({ meta: [{ title: "Browse — BIG MOV" }, { name: "description", content: "Browse popular, top-rated, and upcoming movies and shows." }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const { cat: catParam } = Route.useSearch();
  const navigate = Route.useNavigate();
  const cat = catParam ?? "popular";
  const categoryFn = useServerFn(getCategory);
  const setCat = (id: string) => navigate({ search: { cat: id === "popular" ? undefined : (id as any) } });
  const q = useQuery({
    queryKey: ["browse", cat],
    queryFn: () => categoryFn({ data: { category: cat } }),
  });
  const isTv = cat.startsWith("tv");
  const items = (q.data?.results ?? []).map((r: any) => ({ ...r, media_type: isTv ? "tv" : "movie" }));

  return (
    <div className="mx-auto max-w-7xl py-8">
      <h1 className="font-display text-4xl px-4 sm:px-6 mb-6">Browse</h1>
      <div className="flex gap-2 px-4 sm:px-6 mb-6 overflow-x-auto no-scrollbar">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              cat === c.id ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-surface-elevated text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {q.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      ) : (
        <MovieGrid items={items} />
      )}
    </div>
  );
}
