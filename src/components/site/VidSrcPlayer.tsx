import { useEffect, useMemo, useRef, useState } from "react";
import { X, ExternalLink, Settings, RefreshCw } from "lucide-react";

type Source = { id: string; label: string; build: (type: "movie" | "tv", id: string, s?: number, e?: number) => string };

const SOURCES: Source[] = [
  {
    id: "vidsrc",
    label: "VidSrc",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.sh/embed/movie/${id}`
        : `https://vidsrc.sh/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "vidking",
    label: "VidKing",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://www.vidking.net/embed/movie/${id}`
        : `https://www.vidking.net/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
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
    setSourceIdx((current) => (current + 1) % SOURCES.length);
    setIframeKey((k) => k + 1);
  };

  const enterFullscreen = () => frameWrapRef.current?.requestFullscreen?.();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} player`}
      className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="w-full border-b border-white/10 bg-black/80 px-4 sm:px-6 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Watching
            </div>
            <h3 className="mt-1 font-display text-base sm:text-xl font-semibold truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {type === "tv" && (
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs sm:text-sm">
                <button onClick={() => changeTvPart("season", -1)} className="size-8 rounded-lg hover:bg-white/10 transition" aria-label="Previous season">−</button>
                <span className="px-2 font-medium">S{selectedSeason}</span>
                <button onClick={() => changeTvPart("season", 1)} className="size-8 rounded-lg hover:bg-white/10 transition" aria-label="Next season">+</button>
                <span className="text-white/20">|</span>
                <button onClick={() => changeTvPart("episode", -1)} className="size-8 rounded-lg hover:bg-white/10 transition" aria-label="Previous episode">−</button>
                <span className="px-2 font-medium">E{selectedEpisode}</span>
                <button onClick={() => changeTvPart("episode", 1)} className="size-8 rounded-lg hover:bg-white/10 transition" aria-label="Next episode">+</button>
              </div>
            )}

            <button onClick={() => { setFrameLoaded(false); setIframeKey((k) => k + 1); }} className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition" aria-label="Reload player" title="Reload player">
              <RefreshCw className="mx-auto size-4" />
            </button>
            <button onClick={enterFullscreen} className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition" aria-label="Fullscreen" title="Fullscreen">
              <Settings className="mx-auto size-4" />
            </button>
            <button onClick={tryNextSource} className="hidden sm:inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs hover:bg-white/10 transition" title="Try another server">
              <ExternalLink className="size-4" />
              Server
            </button>
            <a href={src} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition" title="Open in new tab">
              <ExternalLink className="size-4" />
            </a>
            <button onClick={onClose} className="size-9 rounded-xl bg-white/10 hover:bg-primary hover:text-primary-foreground transition" aria-label="Close player">
              <X className="mx-auto size-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 lg:p-6" onClick={(e) => e.stopPropagation()}>
        <div ref={frameWrapRef} className="relative w-full max-w-7xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-[0_25px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10">
          {!frameLoaded && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="mx-auto mb-4 size-14 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-white">Loading {type === "tv" ? "episode" : "movie"}...</p>
                <p className="mt-1 text-xs text-white/40">Connecting to {SOURCES[sourceIdx].label}</p>
              </div>
            </div>
          )}

          <iframe
            key={`${iframeKey}-${sourceIdx}`}
            src={src}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            onLoad={() => setFrameLoaded(true)}
            onError={tryNextSource}
          />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/70 px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 text-[11px] sm:text-xs text-white/45">
          <span>Source: <span className="text-white/70">{SOURCES[sourceIdx].label}</span></span>
          <span className="hidden sm:inline">ESC to close • Use Server if playback is unavailable</span>
        </div>
      </div>
    </div>
  );
}
