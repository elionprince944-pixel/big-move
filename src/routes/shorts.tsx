import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getShortsFeed } from "@/lib/tmdb.functions";
import { Film, Play, RefreshCw, Video } from "lucide-react";

export const Route = createFileRoute("/shorts")({
  head: () => ({ meta: [
    { title: "Shorts · BIG MOV" },
    { name: "description", content: "Watch official movie and TV clips on BIG MOV Shorts." },
  ] }),
  component: ShortsPage,
});

function ShortsPage() {
  const feedFn = useServerFn(getShortsFeed);
  const feed = useQuery({
    queryKey: ["shorts-feed"],
    queryFn: () => feedFn(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });

  return (
    <div className="shorts-page mx-auto max-w-[1400px] px-4 sm:px-6 py-7">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-primary">
            <Video className="size-4" /> BIG MOV Clips
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black">Shorts <span className="text-primary">Feed</span></h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Official movie and series clips, teasers and trailers from YouTube.</p>
        </div>
        <button onClick={() => feed.refetch()} disabled={feed.isFetching} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-bold text-white transition hover:border-primary/60 disabled:opacity-50">
          <RefreshCw className={`size-4 ${feed.isFetching ? "animate-spin" : ""}`} /> Refresh clips
        </button>
      </header>

      {feed.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[9/14] animate-pulse rounded-2xl bg-white/[.06]" />)}
        </div>
      ) : feed.isError ? (
        <div className="rounded-2xl border border-white/10 bg-white/[.03] px-6 py-14 text-center">
          <Film className="mx-auto mb-3 size-8 text-primary" />
          <p className="font-bold">The clips could not be loaded.</p>
          <p className="mt-2 text-sm text-muted-foreground">Check that the TMDB_API_KEY environment variable is configured in your deployment.</p>
          <button onClick={() => feed.refetch()} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-black">Try again</button>
        </div>
      ) : feed.data?.length ? (
        <>
          <div className="shorts-feed">
            {feed.data.map((clip: any) => (
              <article key={clip.id} className="shorts-card">
                <div className="shorts-player-wrap">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(clip.videoKey)}?playsinline=1&rel=0&modestbranding=1`}
                    title={clip.videoName || clip.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                  <span className="shorts-type">{clip.videoType}</span>
                </div>
                <div className="shorts-caption">
                  <div className="min-w-0">
                    <h2 className="line-clamp-1 text-base font-extrabold">{clip.title}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">{clip.videoName}</p>
                  </div>
                  <Link to="/movie/$id" params={{ id: String(clip.tmdbId) }} search={{ type: clip.mediaType }} className="shorts-details-link">
                    <Play className="size-4 fill-current" /> Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">Videos play through YouTube. Availability and playback restrictions are controlled by each video’s owner.</p>
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[.03] px-6 py-16 text-center">
          <Video className="mx-auto mb-3 size-9 text-primary" />
          <h2 className="font-bold">No clips found right now</h2>
          <p className="mt-2 text-sm text-muted-foreground">TMDB does not have an eligible official YouTube clip for the current trending titles. Try again later.</p>
        </div>
      )}
    </div>
  );
}
