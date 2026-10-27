import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, ExternalLink, RefreshCw, Maximize2, Film, MonitorPlay, ChevronLeft,
  ChevronRight, RotateCcw, RotateCw, Volume2, Keyboard, ShieldCheck,
} from "lucide-react";

type Source = { id: string; label: string; build: (type: "movie" | "tv", id: string, s?: number, e?: number) => string };

// Playback servers, tried in this order. All use TMDB ids:
//   movie: {base}/movie/{tmdbId}    tv: {base}/tv/{tmdbId}/{season}/{episode}
const VIDSRC_BASE_URL = "https://vidsrc.sh/embed";
const VIDSRC_FALLBACK_BASE_URL = "https://vidsrc.tw/embed";

const SOURCES: Source[] = [
  {
    id: "vidsrc-sh",
    label: "VidSrc",
    build: (type, id, s, e) =>
      type === "movie"
        ? `${VIDSRC_BASE_URL}/movie/${encodeURIComponent(id)}`
        : `${VIDSRC_BASE_URL}/tv/${encodeURIComponent(id)}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "vidking",
    label: "VidKing",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://www.vidking.net/embed/movie/${encodeURIComponent(id)}`
        : `https://www.vidking.net/embed/tv/${encodeURIComponent(id)}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "vidsrc-tw",
    label: "VidSrc alternate",
    build: (type, id, s, e) =>
      type === "movie"
        ? `${VIDSRC_FALLBACK_BASE_URL}/movie/${encodeURIComponent(id)}`
        : `${VIDSRC_FALLBACK_BASE_URL}/tv/${encodeURIComponent(id)}/${s ?? 1}/${e ?? 1}`,
  },
];

function isInsideFrame() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function VidSrcPlayer({
  tmdbId, type, open, onClose, title, season, episode,
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
  const [embedded, setEmbedded] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const frameWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setEmbedded(isInsideFrame()), []);

  const openSiteInNewTab = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("play", "1");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!open) return;
    setSourceIdx(0);
    setSelectedSeason(season ?? 1);
    setSelectedEpisode(episode ?? 1);
    setFrameLoaded(false);
    setNoticeDismissed(false);
    setIframeKey((k) => k + 1);
  }, [open, tmdbId, type, season, episode]);

  const tryNextSource = () => {
    setFrameLoaded(false);
    setSourceIdx((current) => (current + 1) % SOURCES.length);
    setIframeKey((k) => k + 1);
  };

  const reloadPlayer = () => {
    setFrameLoaded(false);
    setIframeKey((k) => k + 1);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        frameWrapRef.current?.requestFullscreen?.();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        reloadPlayer();
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        tryNextSource();
      }
      if (e.key === "?") setShowShortcuts((v) => !v);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, sourceIdx]);

  const src = useMemo(
    () => SOURCES[sourceIdx].build(type, String(tmdbId), selectedSeason, selectedEpisode),
    [sourceIdx, type, tmdbId, selectedSeason, selectedEpisode],
  );

  useEffect(() => {
    if (!open || frameLoaded || embedded) return;
    const timer = setTimeout(() => {
      setSourceIdx((current) => (current + 1) % SOURCES.length);
      setIframeKey((k) => k + 1);
    }, 12000);
    return () => clearTimeout(timer);
  }, [open, frameLoaded, embedded, iframeKey, sourceIdx]);

  const changeTvPart = (field: "season" | "episode", delta: number) => {
    if (field === "season") {
      setSelectedSeason((v) => Math.max(1, v + delta));
      setSelectedEpisode(1);
    } else {
      setSelectedEpisode((v) => Math.max(1, v + delta));
    }
    setFrameLoaded(false);
    setIframeKey((k) => k + 1);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} player`}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#050505] text-white animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-orange-500/[0.09] to-transparent" />
      <header className="relative z-10 border-b border-white/[0.08] bg-[#090909]/95 px-4 py-3 sm:px-7">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10 text-orange-300 sm:flex">
              <Film className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300 sm:text-xs">
                <span className="size-1.5 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,.8)]" />
                BIG MOV • NOW PLAYING
              </div>
              <h2 className="mt-1 truncate text-base font-bold sm:text-xl">{title}</h2>
              <p className="mt-0.5 text-[11px] text-white/40">
                {type === "tv" ? `Season ${selectedSeason} · Episode ${selectedEpisode}` : "Feature film"} · External player
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {type === "tv" && (
              <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 sm:flex">
                <button onClick={(e) => { e.stopPropagation(); changeTvPart("season", -1); }} className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Previous season"><ChevronLeft className="size-4" /></button>
                <span className="min-w-9 text-center text-xs font-semibold">S{String(selectedSeason).padStart(2, "0")}</span>
                <button onClick={(e) => { e.stopPropagation(); changeTvPart("season", 1); }} className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Next season"><ChevronRight className="size-4" /></button>
                <span className="mx-1 h-5 w-px bg-white/10" />
                <button onClick={(e) => { e.stopPropagation(); changeTvPart("episode", -1); }} className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Previous episode"><RotateCcw className="size-4" /></button>
                <span className="min-w-9 text-center text-xs font-semibold">E{String(selectedEpisode).padStart(2, "0")}</span>
                <button onClick={(e) => { e.stopPropagation(); changeTvPart("episode", 1); }} className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Next episode"><RotateCw className="size-4" /></button>
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setShowShortcuts((v) => !v); }} className="hidden size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 hover:text-white sm:flex" title="Keyboard shortcuts (?)"><Keyboard className="size-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); reloadPlayer(); }} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-orange-400/30 hover:text-orange-300" title="Reload player (R)" aria-label="Reload player"><RefreshCw className="size-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); frameWrapRef.current?.requestFullscreen?.(); }} className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-orange-400/30 hover:text-orange-300" title="Fullscreen (F)" aria-label="Fullscreen"><Maximize2 className="size-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="grid size-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-orange-400 hover:text-black" title="Close (Esc)" aria-label="Close player"><X className="size-5" /></button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col justify-center px-2 py-3 sm:px-5 sm:py-5 lg:px-8" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <MonitorPlay className="size-4 text-orange-300" />
              <span>Playback window</span>
              <span className="text-white/20">/</span>
              <span className="text-white/70">{SOURCES[sourceIdx].label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] font-semibold text-emerald-300"><ShieldCheck className="size-3" /> Player connection</span>
              <button onClick={(e) => { e.stopPropagation(); tryNextSource(); }} className="rounded-lg border border-orange-300/20 bg-orange-300/[0.08] px-3 py-1.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-300/15">Switch server <span className="ml-1 text-orange-200/50">(N)</span></button>
            </div>
          </div>

          <div ref={frameWrapRef} className="group relative mx-auto aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_24px_100px_rgba(0,0,0,.7)] ring-1 ring-orange-300/[0.06] sm:rounded-2xl">
            <div className="pointer-events-none absolute inset-0 z-[1] rounded-xl ring-1 ring-inset ring-white/[0.04] sm:rounded-2xl" />
            {!frameLoaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#070707]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,.09),transparent_55%)]" />
                <div className="relative px-6 text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-300/[0.07]">
                    <div className="size-8 animate-spin rounded-full border-2 border-orange-300 border-t-transparent" />
                  </div>
                  <p className="text-sm font-semibold text-white">Preparing your {type === "tv" ? "episode" : "movie"}</p>
                  <p className="mt-1 text-xs text-white/40">Connecting to {SOURCES[sourceIdx].label}…</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/20">BIG MOV CINEMA</p>
                </div>
              </div>
            )}

            {embedded && !noticeDismissed && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#070707] p-6">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-orange-300/20 bg-orange-300/[0.08]"><ExternalLink className="size-6 text-orange-300" /></div>
                  <p className="text-lg font-bold">Open BIG MOV in a new tab</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">This preview is inside another frame, which may block external playback. Open the website directly for the best experience.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button onClick={openSiteInNewTab} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-300 px-4 text-sm font-bold text-black transition hover:bg-orange-200"><ExternalLink className="size-4" />Open in new tab</button>
                    <button onClick={() => setNoticeDismissed(true)} className="h-10 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/70 hover:bg-white/10">Try here anyway</button>
                  </div>
                </div>
              </div>
            )}

            <iframe
              key={`${iframeKey}-${sourceIdx}`}
              src={src}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setFrameLoaded(true)}
              onError={tryNextSource}
            />

            {showShortcuts && (
              <div className="absolute bottom-4 right-4 z-30 w-64 rounded-xl border border-white/10 bg-[#101010]/95 p-4 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between"><span className="text-sm font-bold">Keyboard shortcuts</span><button onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts"><X className="size-4 text-white/50" /></button></div>
                <div className="space-y-2 text-xs text-white/55">
                  <div className="flex justify-between"><span>Close player</span><kbd className="rounded bg-white/10 px-1.5 py-1 text-white">Esc</kbd></div>
                  <div className="flex justify-between"><span>Fullscreen</span><kbd className="rounded bg-white/10 px-1.5 py-1 text-white">F</kbd></div>
                  <div className="flex justify-between"><span>Reload stream</span><kbd className="rounded bg-white/10 px-1.5 py-1 text-white">R</kbd></div>
                  <div className="flex justify-between"><span>Next server</span><kbd className="rounded bg-white/10 px-1.5 py-1 text-white">N</kbd></div>
                </div>
                <p className="mt-3 border-t border-white/10 pt-3 text-[10px] leading-4 text-white/35">Pause, volume, and 10-second seeking are controlled by the video provider inside the frame.</p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <Volume2 className="size-4 text-orange-300/80" />
              <span>Use the controls inside the video for volume, pause and seeking.</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/35">
              <span className="hidden sm:inline">Tip: use the provider's timeline to seek</span>
              <button onClick={(e) => { e.stopPropagation(); setShowShortcuts((v) => !v); }} className="inline-flex items-center gap-1.5 text-orange-200/80 transition hover:text-orange-200"><Keyboard className="size-3.5" />Shortcuts (?)</button>
              <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-white/55 transition hover:text-orange-200"><ExternalLink className="size-3.5" />Open source</a>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] bg-[#080808] px-4 py-3 sm:px-7">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 text-[10px] text-white/30 sm:text-xs">
          <span>BIG MOV <span className="mx-1 text-white/15">/</span> CINEMA MODE</span>
          <span>Press <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-white/60">?</kbd> for shortcuts · <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-white/60">Esc</kbd> to exit</span>
        </div>
      </footer>
    </div>
  );
}
