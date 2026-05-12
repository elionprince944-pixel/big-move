import { useEffect, useMemo, useState } from "react";
import { X, ChevronDown } from "lucide-react";

export type TmdbVideo = {
  key: string;
  name: string;
  site: string; // "YouTube" | "Vimeo"
  type: string; // "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind the Scenes"
  official?: boolean;
  published_at?: string;
};

const TYPE_RANK: Record<string, number> = {
  Trailer: 0,
  Teaser: 1,
  Clip: 2,
  Featurette: 3,
  "Behind the Scenes": 4,
};

export function pickBestVideo(videos: TmdbVideo[] | undefined): TmdbVideo | null {
  if (!videos?.length) return null;
  const yt = videos.filter((v) => v.site === "YouTube" && v.key);
  if (!yt.length) return null;
  const sorted = [...yt].sort((a, b) => {
    const ta = TYPE_RANK[a.type] ?? 99;
    const tb = TYPE_RANK[b.type] ?? 99;
    if (ta !== tb) return ta - tb;
    if (!!b.official !== !!a.official) return b.official ? 1 : -1;
    const da = a.published_at ? Date.parse(a.published_at) : 0;
    const db = b.published_at ? Date.parse(b.published_at) : 0;
    return db - da;
  });
  return sorted[0] ?? null;
}

export function TrailerPlayer({
  videos,
  open,
  onClose,
  title,
}: {
  videos: TmdbVideo[];
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const ordered = useMemo(() => {
    const yt = (videos ?? []).filter((v) => v.site === "YouTube" && v.key);
    return [...yt].sort((a, b) => {
      const ta = TYPE_RANK[a.type] ?? 99;
      const tb = TYPE_RANK[b.type] ?? 99;
      if (ta !== tb) return ta - tb;
      if (!!b.official !== !!a.official) return b.official ? 1 : -1;
      return 0;
    });
  }, [videos]);

  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentKey(ordered[0]?.key ?? null);
      setPickerOpen(false);
    }
  }, [open, ordered]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const current = ordered.find((v) => v.key === currentKey) ?? ordered[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 text-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-primary">Now playing</p>
          <h3 className="font-display text-lg sm:text-xl truncate">{title}{current?.name ? ` — ${current.name}` : ""}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ordered.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated/80 hover:bg-surface-elevated px-3 py-1.5 text-sm"
              >
                {current?.type ?? "Video"} <ChevronDown className="size-4" />
              </button>
              {pickerOpen && (
                <div className="absolute right-0 mt-2 w-72 max-h-72 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-xl z-10">
                  {ordered.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => { setCurrentKey(v.key); setPickerOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-start gap-2 ${v.key === current?.key ? "bg-accent/50" : ""}`}
                    >
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 shrink-0">{v.type}</span>
                      <span className="line-clamp-2">{v.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close player"
            className="inline-flex items-center justify-center size-9 rounded-md bg-surface-elevated/80 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5" onClick={(e) => e.stopPropagation()}>
        {current ? (
          <iframe
            key={current.key}
            src={`https://www.youtube-nocookie.com/embed/${current.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={current.name || `${title} trailer`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full grid place-items-center bg-surface text-muted-foreground text-sm">
            No trailer available for this title.
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Press Esc or click outside to close</p>
    </div>
  );
}
