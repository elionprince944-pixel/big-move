import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronDown, ExternalLink, Pause, Play, RotateCw, Maximize2, Volume2 } from "lucide-react";

type Source = { id: string; label: string; build: (type: "movie" | "tv", id: string, s?: number, e?: number) => string };

const SOURCES: Source[] = [
  {
    id: "multiembed",
    label: "Server 1 (Auto player)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: "vidsrc.to",
    label: "Server 2 (VidSrc direct)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "2embed",
    label: "Server 3 (2embed)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}${s && e ? `&s=${s}&e=${e}` : ""}`,
  },
  {
    id: "vidsrc.xyz",
    label: "Server 4 (vidsrc.xyz)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}${s ? `&season=${s}` : ""}${e ? `&episode=${e}` : ""}`,
  },
  {
    id: "vidsrc.cc",
    label: "Server 5 (vidsrc.cc)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}${s ? `/${s}` : ""}${e ? `/${e}` : ""}`,
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(season ?? 1);
  const [selectedEpisode, setSelectedEpisode] = useState(episode ?? 1);
  const [playbackPaused, setPlaybackPaused] = useState(false);
  const frameWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSourceIdx(0);
      setSelectedSeason(season ?? 1);
      setSelectedEpisode(episode ?? 1);
      setPlaybackPaused(false);
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
    setPlaybackPaused(false);
    setIframeKey((k) => k + 1);
  };

  const resumePlayback = () => {
    setPlaybackPaused(false);
    setIframeKey((k) => k + 1);
  };

  const reloadPlayback = () => {
    setPlaybackPaused(false);
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
        <div className="flex items-center gap-2 shrink-0">
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
          <div className="relative">
            <button
              onClick={() => setPickerOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated px-3 py-1.5 text-sm"
            >
              {SOURCES[sourceIdx].label} <ChevronDown className="size-4" />
            </button>
            {pickerOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-popover text-popover-foreground shadow-xl z-10 overflow-hidden">
                {SOURCES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSourceIdx(i);
                      setPickerOpen(false);
                  setPlaybackPaused(false);
                      setIframeKey((k) => k + 1);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${i === sourceIdx ? "bg-accent/50" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={playbackPaused ? resumePlayback : () => setPlaybackPaused(true)}
            aria-label={playbackPaused ? "Play" : "Pause"}
            title={playbackPaused ? "Play" : "Pause"}
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated"
          >
            {playbackPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4" />}
          </button>
          <button
            onClick={reloadPlayback}
            aria-label="Reload player"
            title="Reload player"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated"
          >
            <RotateCw className="size-4" />
          </button>
          <button
            aria-label="Volume controls are inside the video player"
            title="Volume controls are inside the video player"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 text-muted-foreground"
          >
            <Volume2 className="size-4" />
          </button>
          <button
            onClick={enterFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated"
          >
            <Maximize2 className="size-4" />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated"
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

      <div ref={frameWrapRef} className="w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5 bg-black" onClick={(e) => e.stopPropagation()}>
        {playbackPaused ? (
          <button
            onClick={resumePlayback}
            className="w-full h-full grid place-items-center bg-black text-foreground"
            aria-label="Resume playback"
          >
            <span className="inline-grid place-items-center size-16 rounded-full bg-primary text-primary-foreground shadow-xl">
              <Play className="size-8 fill-current ml-1" />
            </span>
          </button>
        ) : (
          <iframe
            key={`${iframeKey}-${sourceIdx}`}
            src={src}
            title={title}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center max-w-2xl">
        If the player is blank, try another server above. Streams come from third-party providers — some titles may not be available. Press Esc to close.
      </p>
    </div>
  );
}
