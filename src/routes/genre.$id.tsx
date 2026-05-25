import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discoverByGenre, getGenres } from "@/lib/tmdb.functions";
import { MovieGrid } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

const SORTS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
  { value: "revenue.desc", label: "Highest Grossing" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);
const RATINGS = [0, 5, 6, 7, 8, 9];

export const Route = createFileRoute("/genre/$id")({
  validateSearch: z.object({
    type: z.enum(["movie", "tv"]).optional().default("movie"),
    sort: z.string().optional().default("popularity.desc"),
    year: z.coerce.number().optional(),
    rating: z.coerce.number().optional().default(0),
    page: z.coerce.number().optional().default(1),
  }),
  component: GenrePage,
});

function GenrePage() {
  const { id } = Route.useParams();
  const { type, sort, year, rating, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const discoverFn = useServerFn(discoverByGenre);
  const genresFn = useServerFn(getGenres);

  const q = useQuery({
    queryKey: ["genre", type, id, sort, year, rating, page],
    queryFn: () =>
      discoverFn({
        data: { genreId: Number(id), type, sortBy: sort, year, minRating: rating, page },
      }),
  });
  const g = useQuery({ queryKey: ["genres"], queryFn: () => genresFn() });
  const genreName =
    (type === "tv" ? g.data?.tv : g.data?.movie)?.find((x: any) => x.id === Number(id))?.name ?? "Genre";

  const items = (q.data?.results ?? []).map((r: any) => ({ ...r, media_type: type }));
  const totalPages = Math.min(q.data?.total_pages ?? 1, 500);

  const update = (patch: Record<string, any>) =>
    navigate({ search: (prev: any) => ({ ...prev, page: 1, ...patch }) });

  const selectCls =
    "h-9 rounded-md bg-surface border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="px-4 sm:px-6 mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl">{genreName}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={type}
            onChange={(e) => update({ type: e.target.value })}
            className={selectCls}
            aria-label="Media type"
          >
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className={selectCls}
            aria-label="Sort by"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={year ?? ""}
            onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : undefined })}
            className={selectCls}
            aria-label="Year"
          >
            <option value="">Any year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={rating}
            onChange={(e) => update({ rating: Number(e.target.value) })}
            className={selectCls}
            aria-label="Minimum rating"
          >
            {RATINGS.map((r) => (
              <option key={r} value={r}>{r === 0 ? "Any rating" : `${r}+ ★`}</option>
            ))}
          </select>
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="px-4 sm:px-6 text-muted-foreground">No titles match these filters.</p>
      ) : (
        <MovieGrid items={items} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8 px-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => navigate({ search: (p: any) => ({ ...p, page: page - 1 }) })}
          >
            <ChevronLeft className="size-4 mr-1" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => navigate({ search: (p: any) => ({ ...p, page: page + 1 }) })}
          >
            Next <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
