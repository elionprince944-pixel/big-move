import { Link } from "@tanstack/react-router";
import { ChevronDown, Play } from "lucide-react";
import { FromBig } from "@/components/site/Brand";

function BigMovEmblem() {
  return (
    <svg viewBox="0 0 180 180" role="img" aria-label="BIG MOV crowned film-play logo" className="mx-auto h-36 w-36 sm:h-48 sm:w-48">
      <defs>
        <linearGradient id="bm-metal-fallback" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2bc"/><stop offset=".2" stopColor="#ffc34b"/><stop offset=".52" stopColor="#ff7900"/><stop offset=".82" stopColor="#ff4a00"/><stop offset="1" stopColor="#a92300"/></linearGradient>
      </defs>
      <path d="M88 9 99 25 120 20 116 40 135 52 116 65 64 65 44 52 64 39 59 20 80 25Z" fill="url(#bm-metal-fallback)" stroke="#ffe5a4" strokeWidth="3"/>
      <path d="M25 67 114 39 157 66 157 124 65 160 19 129Z" fill="#090a0d" stroke="#ff9a23" strokeWidth="4"/>
      <path d="M25 75 65 94 65 159 19 129Z" fill="#b93b05"/>
      <path d="M65 94 157 66 157 123 65 159Z" fill="url(#bm-metal-fallback)"/>
      <path d="M77 87 127 108 77 135Z" fill="#08090c" stroke="#fff0d8" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M44 151 65 164 157 130" fill="none" stroke="#ffd17a" strokeWidth="3"/>
    </svg>
  );
}

export function Hero() {
  return (
    <section className="bigmov-welcome relative isolate flex min-h-[calc(100svh-64px)] w-full flex-col items-center justify-center overflow-hidden px-3 py-3 sm:px-6">
      <div className="absolute inset-0 -z-30 bg-[#050607]"/>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,100,0,.28),transparent_36%),radial-gradient(ellipse_at_50%_100%,rgba(255,65,0,.18),transparent_45%),linear-gradient(180deg,#08090b_0%,#090909_58%,#030405_100%)]"/>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-35" style={{backgroundImage:"repeating-linear-gradient(115deg,transparent 0 120px,rgba(255,105,0,.07) 122px,transparent 126px)"}}/>
      <div className="relative z-10 flex w-full max-w-[1280px] flex-col items-center">
        <div className="bm-art-frame relative flex h-[min(69svh,760px)] w-full items-center justify-center overflow-hidden">
          <div className="bm-fallback-brand flex h-full w-full flex-col items-center justify-center text-center">
            <div className="bm-emblem-wrap"><BigMovEmblem/></div>
            <h1 className="bigmov-hero-wordmark -mt-1 font-display text-6xl font-black uppercase leading-none tracking-[-.06em] sm:text-8xl"><span className="text-white">BIG</span><span className="bg-gradient-to-b from-[#fff0bd] via-[#ff8700] to-[#ed3900] bg-clip-text text-transparent"> MOV</span></h1>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[.35em] text-white/90 sm:text-base">WATCH <b className="text-orange-400">•</b> STREAM <b className="text-orange-400">•</b> ENJOY</p>
            <FromBig className="mt-6 border-orange-300/30 bg-black/70 px-5 py-3"/>
          </div>
          <img
            src="/brand/big-mov-cinematic-logo.webp"
            alt="BIG MOV crowned orange 3D film-play logo with cinematic film reels, BIG MOVE lettering, WATCH STREAM ENJOY tagline and FROM BIG badge"
            className="absolute inset-0 z-20 h-full w-full object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,.65)]"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        </div>
        <Link to="/home" className="mt-2 inline-flex items-center gap-3 rounded-full border border-orange-200/80 bg-gradient-to-r from-[#ffb51b] via-[#ff7900] to-[#f04400] px-8 py-3.5 text-sm font-black text-black shadow-[0_0_36px_rgba(255,103,0,.48)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_54px_rgba(255,103,0,.65)] sm:mt-3 sm:px-10 sm:py-4 sm:text-base"><Play className="size-4 fill-current"/>Explore Now<ChevronDown className="size-4 -rotate-90"/></Link>
      </div>
      <a href="#browse" aria-label="Scroll to browse movies" className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-white/75 transition hover:text-orange-300"><ChevronDown className="size-6 animate-bounce"/></a>
    </section>
  );
}
