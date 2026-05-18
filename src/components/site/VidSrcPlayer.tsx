import { useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getEmbedUrl } from "@/lib/tmdb.functions";

export function VidSrcPlayer({
  tmdbId,
  type,
  open,
  onClose,
  title,
  season,
  episode,
}: {
  tmdbId: number | string;
  type: "movie" | "tv";
  open: boolean;
  onClose: () => void;
  title: string;
  season?: number;
  episode?: number;
}) {
  const embedFn = useServerFn(getEmbedUrl);
  const q = useQuery({
    queryKey: ["embed", type, tmdbId, season, episode],
    queryFn: () => embedFn({ data: { id: tmdbId, type, season, episode } }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} player`}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="w-full max-w-6xl flex items-center justify-between mb-3 text-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-primary">Now streaming</p>
          <h3 className="font-display text-lg sm:text-xl truncate">{title}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close player"
          className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5 bg-black flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {q.isLoading ? (
          <Loader2 className="size-8 text-primary animate-spin" />
        ) : q.error || !q.data?.url ? (
          <p className="text-sm text-muted-foreground p-4 text-center">Couldn't load stream source.</p>
        ) : (
          <iframe
            src={q.data.url}
            title={title}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center max-w-2xl">
        Stream provided by a third-party embed aggregator. Quality and availability are outside our control. Press Esc to close.
      </p>
    </div>
  );
}
