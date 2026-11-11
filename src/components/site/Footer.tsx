import { Link } from "@tanstack/react-router";
import { Crown, Film, Play, Clapperboard } from "lucide-react";
import ceoPortrait from "@/assets/ceo-portrait.jpg";
import { Brand } from "@/components/site/Brand";

export function Footer() {
  return (
    <footer className="site-footer relative mt-20 overflow-hidden border-t border-blue-300/15 bg-[#08090b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_0%,rgba(22,119,255,.13),transparent_42%),radial-gradient(ellipse_at_8%_100%,rgba(88,182,255,.08),transparent_35%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-[1fr_1.2fr] md:px-8">
        <div className="flex flex-col items-start">
          <Brand tagline />
          <p className="mb-7 mt-4 max-w-xs text-sm leading-relaxed text-white/50">Your front-row seat to stories worth watching. Discover movies and series, all in one place.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
            <Link to="/about" className="transition hover:text-blue-300">About</Link>
            <Link to="/help" className="transition hover:text-blue-300">Help</Link>
            <Link to="/settings" className="transition hover:text-blue-300">Settings</Link>
          </nav>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-white/[.035] px-3 py-2 text-[10px] font-semibold uppercase tracking-[.22em] text-blue-200/80 backdrop-blur-xl">
            <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_#ff8500]" /> Watch · Stream · Enjoy
          </div>
        </div>

        <section className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-blue-300/20 bg-white/[.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.09)] backdrop-blur-2xl sm:flex-row sm:items-center sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-300/40 to-blue-700/10 blur-md" />
            <img src={ceoPortrait} alt="Ishimwe Elion Prince, Founder and CEO of BIG MOV" loading="lazy" width={816} height={816} className="relative size-24 rounded-2xl border border-blue-200/40 object-cover shadow-xl sm:size-28" />
          </div>
          <div className="relative min-w-0">
            <div className="mb-2 flex items-center gap-2 text-blue-300">
              <Crown className="size-4" />
              <span className="text-[10px] font-bold uppercase tracking-[.24em]">Founder &amp; CEO</span>
            </div>
            <h3 className="break-words font-display text-xl font-black tracking-wide sm:text-2xl">ISHIMWE ELION PRINCE</h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5"><Clapperboard className="size-3.5 text-blue-400" /> Visionary</span>
              <span className="inline-flex items-center gap-1.5"><Film className="size-3.5 text-blue-400" /> Storyteller</span>
              <span className="inline-flex items-center gap-1.5"><Play className="size-3.5 text-blue-400" /> Big ideas</span>
            </p>
            <p className="mt-3 border-l-2 border-blue-400/60 pl-3 text-xs italic text-white/65">“Great stories deserve a BIG stage.”</p>
          </div>
        </section>
      </div>
      <div className="relative border-t border-white/[.07] px-5 py-5 text-center text-xs text-white/35">
        © {new Date().getFullYear()} BIG MOV. Powered by TMDB.
      </div>
    </footer>
  );
}
