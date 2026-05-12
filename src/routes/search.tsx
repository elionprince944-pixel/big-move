import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { searchTmdb } from "@/lib/tmdb.functions";
import { MovieGrid } from "@/components/site/Movie";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().default("") }),
  head: () => ({ meta: [{ title: "Search — BIG MOV" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const fn = useServerFn(searchTmdb);
  const query = useQuery({
    queryKey: ["search", q],
    queryFn: () => fn({ data: { query: q } }),
    enabled: !!q,
  });
  const items = (query.data?.results ?? []).filter((r: any) => r.media_type !== "person");

  return (
    <div className="mx-auto max-w-7xl py-8">
      <h1 className="font-display text-3xl px-4 sm:px-6 mb-2">Search</h1>
      <p className="text-muted-foreground px-4 sm:px-6 mb-6">{q ? `Results for “${q}”` : "Type in the search bar to find movies and shows."}</p>
      {query.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 sm:px-6">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3]" />)}
        </div>
      ) : (
        <MovieGrid items={items} />
      )}
    </div>
  );
}
