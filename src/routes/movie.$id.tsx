import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Play, Plus, Check, Star, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMovieDetails, getWatchProviders } from "@/lib/tmdb.functions";
import { TMDB_IMG } from "@/lib/tmdb-image";
import { MovieRow } from "@/components/site/Movie";
import { TrailerPlayer, pickBestVideo } from "@/components/site/TrailerPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/movie/$id")({
  validateSearch: z.object({ type: z.enum(["movie", "tv"]).optional().default("movie") }),
  component: MovieDetailsPage,
});

function MovieDetailsPage() {
  const { id } = Route.useParams();
  const { type } = Route.useSearch();
  const { user } = useAuth();
  const detailsFn = useServerFn(getMovieDetails);
  const providersFn = useServerFn(getWatchProviders);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  const q = useQuery({
    queryKey: ["details", type, id],
    queryFn: () => detailsFn({ data: { id: Number(id), type } }),
  });
  const wp = useQuery({
    queryKey: ["providers", type, id],
    queryFn: () => providersFn({ data: { id: Number(id), type } }),
  });

  useEffect(() => {
    if (!user) return setInWatchlist(false);
    supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("tmdb_id", Number(id))
      .eq("media_type", type)
      .maybeSingle()
      .then(({ data }) => setInWatchlist(!!data));
  }, [user, id, type]);

  const toggleWatchlist = async () => {
    if (!user) return toast.error("Sign in to save to your watchlist");
    if (inWatchlist) {
      const { error } = await supabase.from("watchlist").delete().eq("user_id", user.id).eq("tmdb_id", Number(id)).eq("media_type", type);
      if (error) return toast.error(error.message);
      setInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        tmdb_id: Number(id),
        media_type: type,
        title: q.data?.title ?? q.data?.name ?? "",
        poster_path: q.data?.poster_path ?? null,
      });
      if (error) return toast.error(error.message);
      setInWatchlist(true);
      toast.success("Added to watchlist");
    }
  };

  if (q.isLoading) return <Skeleton className="h-[80vh] m-6" />;
  if (q.error || !q.data) return <div className="p-10 text-center text-muted-foreground">Couldn't load this title.</div>;

  const m = q.data;
  const title = m.title ?? m.name;
  const year = (m.release_date ?? m.first_air_date ?? "").slice(0, 4);
  const videos = (m.videos?.results ?? []) as any[];
  const trailer = pickBestVideo(videos);

  return (
    <div className="-mt-16">
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
        {m.backdrop_path && <img src={TMDB_IMG(m.backdrop_path, "original")} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {m.poster_path && (
            <img src={TMDB_IMG(m.poster_path, "w500")} alt={title} className="w-48 sm:w-56 rounded-lg shadow-2xl shrink-0" />
          )}
          <div className="flex-1">
            <h1 className="font-display text-4xl sm:text-5xl mb-3">{title}</h1>
            {m.tagline && <p className="text-muted-foreground italic mb-4">{m.tagline}</p>}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-5">
              {m.vote_average ? <span className="flex items-center gap-1"><Star className="size-4 fill-primary text-primary" />{m.vote_average.toFixed(1)}</span> : null}
              {year && <span className="flex items-center gap-1"><Calendar className="size-4" />{year}</span>}
              {m.runtime ? <span className="flex items-center gap-1"><Clock className="size-4" />{m.runtime}m</span> : null}
              {m.genres?.length ? <span>{m.genres.map((g: any) => g.name).join(" · ")}</span> : null}
            </div>
            <p className="text-foreground/80 leading-relaxed mb-6 max-w-3xl">{m.overview}</p>
            <div className="flex gap-3">
              {trailer && (
                <Button onClick={() => setTrailerOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Play className="size-4 fill-current mr-2" /> Watch Trailer
                </Button>
              )}
              <Button onClick={toggleWatchlist} variant="outline">
                {inWatchlist ? <><Check className="size-4 mr-2" />In Watchlist</> : <><Plus className="size-4 mr-2" />Watchlist</>}
              </Button>
            </div>
          </div>
        </div>

        <WhereToWatch data={wp.data} link={m["watch/providers"]?.link ?? wp.data?.providers?.link} />

        {m.credits?.cast?.length ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {m.credits.cast.slice(0, 12).map((c: any) => (
                <div key={c.id} className="shrink-0 w-24 text-center">
                  <div className="aspect-square rounded-full overflow-hidden bg-surface mb-2">
                    {c.profile_path ? <img src={TMDB_IMG(c.profile_path, "w200")} alt={c.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <p className="text-xs font-medium line-clamp-2">{c.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {m.similar?.results?.length ? (
        <div className="mx-auto max-w-7xl mt-12">
          <MovieRow title="More Like This" items={m.similar.results.map((s: any) => ({ ...s, media_type: type }))} />
        </div>
      ) : null}

      <TrailerPlayer
        videos={videos}
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={title}
      />
    </div>
  );
}
