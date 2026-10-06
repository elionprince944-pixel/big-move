import { Link } from "@tanstack/react-router";
import { Crown, Film, Play, Clapperboard } from "lucide-react";
import ceoPortrait from "@/assets/ceo-portrait.jpg";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Brand + links */}
        <div>
          <div className="flex items-center gap-1 mb-3">
            <span className="font-display text-2xl text-primary">BIG</span>
            <span className="font-display text-2xl">MOV</span>
          </div>
          <p className="text-muted-foreground text-xs mb-6">Movies &amp; shows, anywhere.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
          </nav>
        </div>

        {/* CEO card */}
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-5 shadow-[var(--shadow-elegant)]">
          <img
            src={ceoPortrait}
            alt="Ishimwe Elion Prince, Founder & CEO of BIG MOV"
            loading="lazy"
            width={816}
            height={816}
            className="size-20 sm:size-24 rounded-xl object-cover ring-2 ring-primary/40 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-primary">
              <Crown className="size-3.5" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Founder &amp; CEO</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl mt-1 leading-tight break-words">
              ISHIMWE ELION PRINCE
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1"><Clapperboard className="size-3 text-primary" /> Visionary</span>
              <span className="inline-flex items-center gap-1"><Film className="size-3 text-primary" /> Storyteller</span>
              <span className="inline-flex items-center gap-1"><Play className="size-3 text-primary" /> Big ideas</span>
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-2 italic">
              "Great stories deserve a BIG stage."
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BIG MOV. Powered by TMDB.
      </div>
    </footer>
  );
}
