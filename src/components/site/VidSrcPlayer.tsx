import { useEffect, useMemo, useState } from "react";
import { X, ChevronDown, ExternalLink } from "lucide-react";

type Source = { id: string; label: string; build: (type: "movie" | "tv", id: string, s?: number, e?: number) => string };

const SOURCES: Source[] = [
  {
    id: "vidsrc.to",
    label: "Server 1 (vidsrc.to)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}${s ? `/${s}` : ""}${e ? `/${e}` : ""}`,
  },
  {
    id: "vidsrc.xyz",
    label: "Server 2 (vidsrc.xyz)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}`
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}${s ? `&season=${s}` : ""}${e ? `&episode=${e}` : ""}`,
  },
  {
    id: "vidsrc.cc",
    label: "Server 3 (vidsrc.cc)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}${s ? `/${s}` : ""}${e ? `/${e}` : ""}`,
  },
  {
    id: "2embed",
    label: "Server 4 (2embed)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}${s && e ? `&s=${s}&e=${e}` : ""}`,
  },
  {
    id: "multiembed",
    label: "Server 5 (multiembed)",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1${s ? `&s=${s}` : ""}${e ? `&e=${e}` : ""}`,
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

  useEffect(() => {
    if (open) {
      setSourceIdx(0);
      setIframeKey((k) => k + 1);
    }
  }, [open, tmdbId, type]);

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
    () => SOURCES[sourceIdx].build(type, String(tmdbId), season, episode),
    [sourceIdx, type, tmdbId, season, episode],
  );

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

      <div className="w-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5 bg-black" onClick={(e) => e.stopPropagation()}>
        <iframe
          key={`${iframeKey}-${sourceIdx}`}
          src={src}
          title={title}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center max-w-2xl">
        If the player is blank, try another server above. Streams come from third-party providers — some titles may not be available. Press Esc to close.
      </p>
    </div>
  );
}
