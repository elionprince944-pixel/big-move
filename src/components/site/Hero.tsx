import { Link } from "@tanstack/react-router";
import { ChevronDown, Play } from "lucide-react";
import { FromBig } from "@/components/site/Brand";

function CinemaDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bm-reel bm-reel-left"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="82"/><circle cx="90" cy="90" r="65"/><circle cx="90" cy="90" r="17"/><circle cx="90" cy="49" r="17"/><circle cx="129" cy="91" r="17"/><circle cx="90" cy="131" r="17"/><circle cx="50" cy="90" r="17"/></svg></div>
      <div className="bm-reel bm-reel-right"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="82"/><circle cx="90" cy="90" r="65"/><circle cx="90" cy="90" r="17"/><circle cx="90" cy="49" r="17"/><circle cx="129" cy="91" r="17"/><circle cx="90" cy="131" r="17"/><circle cx="50" cy="90" r="17"/></svg></div>
      <div className="bm-filmstrip bm-filmstrip-left"><span/><span/><span/><span/><span/><span/></div>
      <div className="bm-filmstrip bm-filmstrip-right"><span/><span/><span/><span/><span/><span/></div>
      <div className="bm-popcorn"><div className="bm-popcorn-pile">✦ ✧ ✦ ✧ ✦</div><div className="bm-popcorn-cup"><i/><i/><i/><i/><b>▶</b></div></div>
      <div className="bm-clapper"><div className="bm-clapper-top"/><strong>Big Move</strong><small>MOVIE • SERIES • MORE</small></div>
      <div className="bm-floor-glow"/>
    </div>
  );
}

function BigMovEmblem() {
  return (
    <svg viewBox="0 0 180 180" role="img" aria-label="BIG MOV crowned film-play logo" className="mx-auto h-44 w-44 sm:h-64 sm:w-64">
      <defs>
        <linearGradient id="bm-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2bc"/><stop offset=".2" stopColor="#ffc34b"/><stop offset=".52" stopColor="#ff7900"/><stop offset=".82" stopColor="#ff4a00"/><stop offset="1" stopColor="#a92300"/></linearGradient>
        <linearGradient id="bm-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9b24"/><stop offset="1" stopColor="#7e1b00"/></linearGradient>
        <linearGradient id="bm-gloss" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".78"/><stop offset=".4" stopColor="#fff" stopOpacity=".14"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
        <filter id="bm-drop"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="91" cy="151" rx="67" ry="13" fill="#ff5a00" opacity=".32" filter="url(#bm-drop)"/>
      <path d="M88 9 99 25 120 20 116 40 135 52 116 65 64 65 44 52 64 39 59 20 80 25Z" fill="url(#bm-metal)" stroke="#ffe5a4" strokeWidth="3"/>
      <path d="m64 27 9 8 9-8 8 8 9-8 8 8 9-8" fill="none" stroke="#fff0c4" strokeWidth="2"/>
      <circle cx="88" cy="47" r="3" fill="#fff2cf"/><circle cx="66" cy="49" r="2.5" fill="#fff2cf"/><circle cx="111" cy="49" r="2.5" fill="#fff2cf"/>
      <path d="M25 67 114 39 157 66 157 124 65 160 19 129Z" fill="#090a0d" stroke="#ff9a23" strokeWidth="4"/>
      <path d="M25 67 114 39 157 66 65 94Z" fill="url(#bm-gloss)"/>
      <path d="M25 75 65 94 65 159 19 129Z" fill="url(#bm-side)" stroke="#ffad42" strokeWidth="1.5"/>
      <path d="M65 94 157 66 157 123 65 159Z" fill="url(#bm-metal)" stroke="#ffb34b" strokeWidth="1.5"/>
      <path d="M77 87 127 108 77 135Z" fill="#08090c" stroke="#fff0d8" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M15 96 29 103 29 139 15 132Z" fill="#ffb43c" stroke="#17100a" strokeWidth="2"/>
      <path d="M25 91 40 98 40 134 25 127Z" fill="#111" stroke="#ffbd58" strokeWidth="2"/>
      <path d="M44 151 65 164 157 130" fill="none" stroke="#ffd17a" strokeWidth="3"/>
      <path d="M36 70 113 46" stroke="#fff" strokeOpacity=".78" strokeWidth="3"/>
      <path d="M30 80 55 92" stroke="#fff" strokeOpacity=".3" strokeWidth="2"/>
    </svg>
  );
}

export function Hero() {
  return (
    <section className="bigmov-welcome relative isolate flex min-h-[calc(100svh-64px)] w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-30 bg-[#050607]"/>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,100,0,.28),transparent_36%),radial-gradient(ellipse_at_50%_100%,rgba(255,65,0,.18),transparent_45%),linear-gradient(180deg,#08090b_0%,#090909_58%,#030405_100%)]"/>
      <div className="absolute inset-0 -z-20 opacity-40" style={{backgroundImage:"linear-gradient(115deg,transparent 15%,rgba(255,105,0,.11) 48%,transparent 72%)"}}/>
      <CinemaDecor/>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-16 pt-8 text-center sm:px-8">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-black/55 px-4 py-2 text-[10px] font-bold uppercase tracking-[.24em] text-orange-100 shadow-xl backdrop-blur-xl"><Sparkles className="size-3.5 text-orange-400"/> Your cinema. Your stories.</div>
        <div className="bm-emblem-wrap"><BigMovEmblem/></div>
        <h1 className="bigmov-hero-wordmark -mt-1 font-display text-6xl font-black uppercase leading-none tracking-[-.06em] sm:text-9xl"><span className="text-white">BIG</span><span className="bg-gradient-to-b from-[#fff0bd] via-[#ff8700] to-[#ed3900] bg-clip-text text-transparent"> MOV</span></h1>
        <div className="mt-4 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[.32em] text-white/90 sm:text-sm sm:tracking-[.43em]"><span className="h-px w-7 bg-orange-500 sm:w-16"/><span>WATCH <b className="text-orange-400">•</b> STREAM <b className="text-orange-400">•</b> ENJOY</span><span className="h-px w-7 bg-orange-500 sm:w-16"/></div>
        <p className="mt-5 max-w-xl text-sm text-white/80 sm:text-lg">Your ultimate destination for movies and TV series.</p>
        <Link to="/home" className="mt-7 inline-flex items-center gap-3 rounded-full border border-orange-200/80 bg-gradient-to-r from-[#ffb51b] via-[#ff7900] to-[#f04400] px-8 py-4 text-sm font-black text-black shadow-[0_0_36px_rgba(255,103,0,.48)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_54px_rgba(255,103,0,.65)] sm:text-base"><Play className="size-4 fill-current"/>Explore Now<ChevronDown className="size-4 -rotate-90"/></Link>
        <FromBig className="mt-7 border-orange-300/30 bg-black/70 px-5 py-3"/>
      </div>
      <div className="pointer-events-none absolute inset-x-[18%] bottom-12 -z-10 h-5 rounded-[50%] bg-orange-600/60 blur-2xl"/>
    </section>
  );
}
