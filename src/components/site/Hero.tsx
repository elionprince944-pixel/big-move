import { Link } from "@tanstack/react-router";
import { ChevronDown, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="bigmov-welcome relative isolate flex min-h-[calc(100svh-64px)] w-full flex-col items-center justify-center overflow-hidden px-3 py-8 sm:px-6">
      <div className="absolute inset-0 -z-30 bg-[#050607]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,100,0,.28),transparent_36%),radial-gradient(ellipse_at_50%_100%,rgba(255,65,0,.18),transparent_45%),linear-gradient(180deg,#08090b_0%,#090909_58%,#030405_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-35"
        style={{ backgroundImage: "repeating-linear-gradient(115deg,transparent 0 120px,rgba(255,105,0,.07) 122px,transparent 126px)" }}
      />
      <div className="relative z-10 flex w-full max-w-[1280px] flex-col items-center">
        <div className="relative flex min-h-[min(68svh,720px)] w-full items-center justify-center overflow-hidden">
          <img
            src="/brand/big-mov-logo.png"
            alt="BIG MOV popcorn and cinematic film logo"
            width={1672}
            height={941}
            fetchPriority="high"
            className="h-auto max-h-[68svh] w-full max-w-[1120px] object-contain drop-shadow-[0_18px_48px_rgba(255,92,0,.24)]"
          />
        </div>
        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[.35em] text-white/75 sm:mt-2 sm:text-xs">
          Watch <span className="text-orange-400">•</span> Stream <span className="text-orange-400">•</span> Enjoy
        </p>
        <Link
          to="/home"
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-orange-200/80 bg-gradient-to-r from-[#ffb51b] via-[#ff7900] to-[#f04400] px-8 py-3.5 text-sm font-black text-black shadow-[0_0_36px_rgba(255,103,0,.48)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_54px_rgba(255,103,0,.65)] sm:px-10 sm:py-4 sm:text-base"
        >
          <Play className="size-4 fill-current" />
          Explore Now
          <ChevronDown className="size-4 -rotate-90" />
        </Link>
      </div>
    </section>
  );
}
