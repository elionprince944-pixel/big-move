import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discoverByGenre, getGenres } from "@/lib/tmdb.functions";
import { MovieGrid } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/genre/$id")({
  validateSearch: z.object({ type: z.enum(["movie", "tv"]).optional().default("movie") }),
  component: GenrePage,
});

function GenrePage() {
  const { id } = Route.useParams();
  const { type } = Route.useSearch();
  const discoverFn = useServerFn(discoverByGenre);
  const genresFn = useServerFn(getGenres);

  const q = useQuery({
    queryKey: ["genre", type, id],
    queryFn: () => discoverFn({ data: { genreId: Number(id), type } }),
  });
  const g = useQuery({ queryKey: ["genres"], queryFn: () => genresFn() });
  const genreName = (type === "tv" ? g.data?.tv : g.data?.movie)?.find((x: any) => x.id === Number(id))?.name ?? "Genre";

  const items = (q.data?.results ?? []).map((r: any) => ({ ...r, media_type: type }));

  return (
    <div className="mx-auto max-w-7xl py-8">
      <h1 className="font-display text-4xl px-4 sm:px-6 mb-6">{genreName}</h1>
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
