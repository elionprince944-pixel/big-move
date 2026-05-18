import { useEffect } from "react";
import { X } from "lucide-react";

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

  const src =
    type === "movie"
      ? `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`
      : `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}${season ? `&season=${season}` : ""}${episode ? `&episode=${episode}` : ""}`;

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

      <div className="w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5 bg-black" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={src}
          title={title}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center max-w-2xl">
        Stream provided by a third-party embed aggregator. Quality and availability are outside our control. Press Esc to close.
      </p>
    </div>
  );
}
