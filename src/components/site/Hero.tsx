import { Link } from "@tanstack/react-router";
import { ChevronDown, Play, Sparkles, Film } from "lucide-react";
import { TMDB_IMG } from "@/lib/tmdb-image";
import type { TmdbItem } from "./Movie";
import { FromBig } from "@/components/site/Brand";

function CinemaDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bm-reel bm-reel-left"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="82"/><circle cx="90" cy="90" r="65"/><circle cx="90" cy="90" r="17"/><circle cx="90" cy="49" r="17"/><circle cx="129" cy="91" r="17"/><circle cx="90" cy="131" r="17"/><circle cx="50" cy="90" r="17"/></svg></div>
      <div className="bm-reel bm-reel-right"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="82"/><circle cx="90" cy="90" r="65"/><circle cx="90" cy="90" r="17"/><circle cx="90" cy="49" r="17"/><circle cx="129" cy="91" r="17"/><circle cx="90" cy="131" r="17"/><circle cx="50" cy="90" r="17"/></svg></div>
      <div className="bm-filmstrip bm-filmstrip-left"><span/><span/><span/><span/><span/><span/></div>
      <div className="bm-filmstrip bm-filmstrip-right"><span/><span/><span/><span/><span/><span/></div>
      <div className="bm-popcorn"><div className="bm-popcorn-pile">✦ ✧ ✦ ✧ ✦</div><div className="bm-popcorn-cup"><i/><i/><i/><i/><b>▶</b></div></div>
      <div className="bm-clapper"><div className="bm-clapper-top"/> <strong>BIG MOV</strong><small>MOVIE • SERIES • MORE</small></div>
      <div className="bm-floor-glow"/>
    </div>
  );
}

function BigMovEmblem() {
  return (
    <svg viewBox="0 0 180 180" role="img" aria-label="BIG MOV crowned orange play emblem" className="mx-auto h-36 w-36 sm:h-48 sm:w-48">
      <defs>
        <linearGradient id="bm-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0b4"/><stop offset=".24" stopColor="#ffb12b"/><stop offset=".58" stopColor="#ff6500"/><stop offset="1" stopColor="#c82b00"/></linearGradient>
        <linearGradient id="bm-shine" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".75"/><stop offset=".45" stopColor="#fff" stopOpacity=".12"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
        <filter id="bm-shadow"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <path d="M90 15 102 34 125 29 120 51 141 65 119 79 61 79 39 64 60 49 55 29 79 34Z" fill="url(#bm-metal)" stroke="#ffe4a5" strokeWidth="3"/>
      <path d="M26 67 115 40 157 66 157 124 65 159 20 127Z" fill="#08090b" stroke="#ff8a18" strokeWidth="4"/>
      <path d="M26 67 115 40 157 66 65 92Z" fill="url(#bm-shine)"/>
      <path d="M26 76 65 92 65 158 20 127Z" fill="url(#bm-metal)"/>
      <path d="M65 92 157 66 157 123 65 158Z" fill="url(#bm-metal)"/>
      <path d="M78 87 125 107 78 132Z" fill="#090a0d" stroke="#fff0d8" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M11 96 30 104 30 140 11 131Z" fill="#ff9b24" stroke="#17100a" strokeWidth="3"/>
      <path d="M21 91 40 99 40 135 21 127Z" fill="#101010" stroke="#ffb64d" strokeWidth="2"/>
      <path d="M45 151 65 164 157 130" fill="none" stroke="#ffd17a" strokeWidth="3"/>
      <path d="M39 69 115 47" stroke="white" strokeOpacity=".7" strokeWidth="3"/>
    </svg>
  );
}

export function Hero({ item }: { item: TmdbItem | undefined }) {
  const title = item?.title ?? item?.name ?? "Your next favourite story";
  return (
    <section className="bigmov-welcome relative isolate flex min-h-[650px] w-full items-center justify-center overflow-hidden sm:min-h-[730px]">
      {item?.backdrop_path ? <img src={TMDB_IMG(item.backdrop_path, "original")} alt="" aria-hidden="true" className="absolute inset-0 -z-30 h-full w-full object-cover object-center"/> : null}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(4,5,7,.88),rgba(5,6,8,.50)_50%,rgba(4,5,7,.86))]"/>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,104,0,.30),transparent_39%),linear-gradient(180deg,rgba(4,5,7,.16),#060708_94%)]"/>
      <CinemaDecor/>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-16 pt-12 text-center sm:px-8">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-black/45 px-4 py-2 text-[10px] font-bold uppercase tracking-[.24em] text-orange-100 shadow-xl backdrop-blur-xl"><Sparkles className="size-3.5 text-orange-400"/> The home of movie nights</div>
        <div className="bm-emblem-wrap"><BigMovEmblem/></div>
        <h1 className="bigmov-hero-wordmark -mt-1 font-display text-6xl font-black uppercase leading-none tracking-[-.06em] sm:text-8xl"><span className="text-white">BIG</span><span className="bg-gradient-to-b from-[#ffe6a4] via-[#ff8500] to-[#e63800] bg-clip-text text-transparent"> MOV</span></h1>
        <div className="mt-4 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[.32em] text-white/90 sm:text-sm sm:tracking-[.43em]"><span className="h-px w-7 bg-orange-500 sm:w-16"/><span>WATCH <b className="text-orange-400">•</b> STREAM <b className="text-orange-400">•</b> ENJOY</span><span className="h-px w-7 bg-orange-500 sm:w-16"/></div>
        <p className="mt-5 max-w-xl text-sm text-white/80 sm:text-lg">Your ultimate destination for movies and TV series.</p>
        <a href="#browse" className="mt-7 inline-flex items-center gap-3 rounded-full border border-orange-200/80 bg-gradient-to-r from-[#ffad18] via-[#ff7900] to-[#f04b00] px-8 py-4 text-sm font-black text-black shadow-[0_0_36px_rgba(255,103,0,.48)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_54px_rgba(255,103,0,.65)] sm:text-base"><Play className="size-4 fill-current"/>Explore Now<ChevronDown className="size-4"/></a>
        <FromBig className="mt-7 border-orange-300/30 bg-black/65 px-5 py-3"/>
        {item ? <Link to="/movie/$id" params={{id:String(item.id)}} search={{type:item.media_type==="tv"?"tv":"movie"}} className="mt-5 text-xs text-white/60 hover:text-orange-200"><Film className="mr-1 inline size-3"/> Featured: <span className="font-semibold text-white/85">{title}</span></Link> : null}
      </div>
      <a href="#browse" aria-label="Scroll to browse movies" className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-white/80 transition hover:text-orange-300"><ChevronDown className="size-7 animate-bounce"/></a>
    </section>
  );
}
