import { useEffect, useMemo, useRef, useState } from "react";
import { X, ExternalLink, Settings, RefreshCw } from "lucide-react";

type Source = { id: string; label: string; build: (type: "movie" | "tv", id: string, s?: number, e?: number) => string };

const SOURCES: Source[] = [
  {
    id: "vidlink",
    label: "Server 1 (VidLink)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
];

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
  const [sourceIdx, setSourceIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(season ?? 1);
  const [selectedEpisode, setSelectedEpisode] = useState(episode ?? 1);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const frameWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSourceIdx(0);
      setSelectedSeason(season ?? 1);
      setSelectedEpisode(episode ?? 1);
      setFrameLoaded(false);
      setIframeKey((k) => k + 1);
    }
  }, [open, tmdbId, type, season, episode]);

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

  const src = useMemo(
    () => SOURCES[sourceIdx].build(type, String(tmdbId), selectedSeason, selectedEpisode),
    [sourceIdx, type, tmdbId, selectedSeason, selectedEpisode],
  );

  const changeTvPart = (field: "season" | "episode", delta: number) => {
    if (field === "season") setSelectedSeason((value) => Math.max(1, value + delta));
    if (field === "episode") setSelectedEpisode((value) => Math.max(1, value + delta));
    setFrameLoaded(false);
    setIframeKey((k) => k + 1);
  };

  const tryNextSource = () => {
    setFrameLoaded(false);
    setIframeKey((k) => k + 1);
  };

  const enterFullscreen = () => frameWrapRef.current?.requestFullscreen?.();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} player`}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="w-full max-w-6xl flex items-center justify-between mb-3 gap-3 text-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-primary">Now streaming</p>
          <h3 className="font-display text-lg sm:text-xl truncate">{title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {type === "tv" && (
            <div className="hidden sm:flex items-center gap-1 rounded-md bg-surface-elevated/80 px-2 py-1 text-sm">
              <button onClick={() => changeTvPart("season", -1)} className="size-7 rounded hover:bg-accent" aria-label="Previous season">−</button>
              <span className="min-w-10 text-center">S{selectedSeason}</span>
              <button onClick={() => changeTvPart("season", 1)} className="size-7 rounded hover:bg-accent" aria-label="Next season">+</button>
              <span className="mx-1 text-muted-foreground">/</span>
              <button onClick={() => changeTvPart("episode", -1)} className="size-7 rounded hover:bg-accent" aria-label="Previous episode">−</button>
              <span className="min-w-10 text-center">E{selectedEpisode}</span>
              <button onClick={() => changeTvPart("episode", 1)} className="size-7 rounded hover:bg-accent" aria-label="Next episode">+</button>
            </div>
          )}
          <button
            onClick={tryNextSource}
            aria-label="Reload player"
            title="Reload player"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated transition-colors"
          >
            <RefreshCw className="size-4" />
          </button>
          <button
            onClick={enterFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated transition-colors"
          >
            <Settings className="size-4" />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated transition-colors"
          >
            <ExternalLink className="size-4" />
          </a>
          <button
            onClick={onClose}
            aria-label="Close player"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div ref={frameWrapRef} className="relative w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5 bg-black" onClick={(e) => e.stopPropagation()}>
        {!frameLoaded && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Loading stream...</p>
            </div>
          </div>
        )}
        <iframe
          key={`${iframeKey}-${sourceIdx}`}
          src={src}
          title={title}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          onLoad={() => setFrameLoaded(true)}
          onError={tryNextSource}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center max-w-2xl">
        If the player is blank, use reload or open it in a new tab. Some titles may not be available. Press Esc to close.
      </p>
    </div>
  );
}
