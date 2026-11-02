import { Link } from "@tanstack/react-router";
import { ChevronDown, Play, Sparkles } from "lucide-react";
import { TMDB_IMG } from "@/lib/tmdb-image";
import type { TmdbItem } from "./Movie";
import { FromBig } from "@/components/site/Brand";

export function Hero({ item }: { item: TmdbItem | undefined }) {
  const title = item?.title ?? item?.name ?? "Your next favourite story";
  return (
    <section className="bigmov-welcome relative isolate flex min-h-[610px] w-full items-center justify-center overflow-hidden sm:min-h-[690px]">
      {item?.backdrop_path ? (
        <img
          src={TMDB_IMG(item.backdrop_path, "original")}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        />
      ) : null}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(5,6,8,.88),rgba(5,6,8,.48)_48%,rgba(5,6,8,.82))]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,111,0,.24),transparent_42%),linear-gradient(180deg,rgba(5,6,8,.1),#070809_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-20 -z-10 h-px bg-gradient-to-r from-transparent via-orange-500/80 to-transparent shadow-[0_0_24px_8px_rgba(255,105,0,.3)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-14 pt-16 text-center sm:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-black/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[.24em] text-orange-200 shadow-[0_8px_30px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <Sparkles className="size-3.5 text-orange-400" />
          Your cinema starts here
        </div>

        <div className="bigmov-hero-mark mb-2" aria-label="BIG MOV">
          <svg viewBox="0 0 120 120" role="img" aria-label="BIG MOV crowned film play logo" className="mx-auto h-36 w-36 drop-shadow-[0_12px_28px_rgba(255,92,0,.45)] sm:h-44 sm:w-44">
            <defs>
              <linearGradient id="hero-mark-orange" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffe09a" />
                <stop offset="42%" stopColor="#ff8a00" />
                <stop offset="100%" stopColor="#ed3900" />
              </linearGradient>
              <linearGradient id="hero-mark-gloss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity=".62" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M60 5 67 17 81 14 78 28 91 36 77 44 43 44 29 35 43 27 40 15 54 17Z" fill="url(#hero-mark-orange)" stroke="#ffe0a0" strokeWidth="2" />
            <path d="M18 42 79 27 105 43 105 83 44 108 15 88Z" fill="#090a0c" stroke="#ff8b16" strokeWidth="3" />
            <path d="M18 42 79 27 105 43 45 60Z" fill="url(#hero-mark-gloss)" />
            <path d="M18 48 45 60 45 106 15 88Z" fill="url(#hero-mark-orange)" />
            <path d="M45 60 105 43 105 82 45 106Z" fill="url(#hero-mark-orange)" />
            <path d="M52 57 83 71 52 89Z" fill="#090a0c" stroke="#fff0d8" strokeWidth="3" strokeLinejoin="round" />
            <path d="M10 67 24 73 24 94 10 87Z" fill="#ffb64d" stroke="#090a0c" strokeWidth="2" />
            <path d="M24 99 45 111 103 87" fill="none" stroke="#ffd17a" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="bigmov-hero-wordmark mt-0 font-display text-6xl font-black uppercase leading-none tracking-[-.055em] sm:text-8xl">
          <span className="text-white">BIG</span><span className="bg-gradient-to-b from-[#ffe09a] via-[#ff8500] to-[#ed3900] bg-clip-text text-transparent"> MOV</span>
        </h1>
        <div className="mt-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.32em] text-white/85 sm:text-sm sm:tracking-[.42em]">
          <span className="h-px w-8 bg-orange-500 sm:w-16" />
          <span>Watch <b className="text-orange-400">•</b> Stream <b className="text-orange-400">•</b> Enjoy</span>
          <span className="h-px w-8 bg-orange-500 sm:w-16" />
        </div>
        <p className="mt-5 max-w-xl text-sm text-white/75 sm:text-lg">
          Your ultimate destination for movies and TV shows.
        </p>
        <a
          href="#browse"
          className="mt-7 inline-flex items-center gap-3 rounded-full border border-orange-200/70 bg-gradient-to-r from-[#ff9b00] to-[#ff4d00] px-8 py-4 text-sm font-extrabold text-black shadow-[0_0_34px_rgba(255,103,0,.38)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(255,103,0,.55)] sm:text-base"
        >
          <Play className="size-4 fill-current" />
          Explore Now
          <ChevronDown className="size-4" />
        </a>
        <FromBig className="mt-7 px-5 py-2.5" />
        {item ? (
          <Link
            to="/movie/$id"
            params={{ id: String(item.id) }}
            search={{ type: item.media_type === "tv" ? "tv" : "movie" }}
            className="mt-6 text-xs text-white/55 transition hover:text-orange-300"
          >
            Featured today: <span className="font-semibold text-white/80">{title}</span>
          </Link>
        ) : null}
      </div>
      <a href="#browse" aria-label="Scroll to browse movies" className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 transition hover:text-orange-300">
        <ChevronDown className="size-7 animate-bounce" />
      </a>
    </section>
  );
}
