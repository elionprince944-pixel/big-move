import { Link } from "@tanstack/react-router";

type BrandProps = { compact?: boolean; className?: string; tagline?: boolean };

export function Brand({ compact = false, className = "", tagline = false }: BrandProps) {
  return (
    <Link to="/home" aria-label="BIG MOV home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 72 72" role="img" aria-label="BIG MOV film-play emblem" className={compact ? "h-9 w-9 shrink-0" : "h-12 w-12 shrink-0"}>
        <defs>
          <linearGradient id="bigmov-orange" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="48%" stopColor="#ff7900" />
            <stop offset="100%" stopColor="#ed3d00" />
          </linearGradient>
          <linearGradient id="bigmov-glass" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".38" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".02" />
          </linearGradient>
          <filter id="bigmov-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        <path d="M36 4 40 10 47 9 46 16 52 20 45 24 27 24 20 19 27 15 29 9Z" fill="url(#bigmov-orange)" stroke="#ffca69" strokeWidth="1.2" />
        <path d="M13 24 48 15 62 25 62 48 29 63 10 51Z" fill="#08090b" stroke="#ff7a00" strokeWidth="2.4" />
        <path d="M13 24 48 15 62 25 27 35Z" fill="url(#bigmov-glass)" />
        <path d="M12 27 28 35 28 61 10 51Z" fill="url(#bigmov-orange)" />
        <path d="M28 35 62 25 62 47 28 61Z" fill="url(#bigmov-orange)" />
        <path d="M34 33 51 39 34 49Z" fill="#090a0d" stroke="#fff0d7" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 40 15 43 15 55 7 51Z" fill="#ffb347" opacity=".9" />
        <path d="M11 39 19 42 19 54 11 51Z" fill="#08090b" stroke="#ffb347" strokeWidth="1" />
        <path d="M18 58 29 64 61 50" fill="none" stroke="#ffbd57" strokeWidth="1.4" opacity=".85" />
        <path d="M15 25 48 17" stroke="#fff" strokeWidth="1.2" opacity=".6" />
      </svg>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={compact ? "font-display text-xl font-black tracking-tight" : "font-display text-2xl sm:text-3xl font-black tracking-tight"}>
          <span className="text-foreground">BIG</span><span className="text-primary"> MOV</span>
        </span>
        {tagline && <span className="mt-1 text-[8px] font-semibold uppercase tracking-[.28em] text-muted-foreground">Watch · Stream · Enjoy</span>}
      </span>
    </Link>
  );
}

export function FromBig({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,.55)] backdrop-blur-xl ${className}`}>
      <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
        <path d="M20 3 23 8 29 7 28 13 34 17 28 21 8 31 5 26 11 13Z" fill="#ff8a00" stroke="#ffd17b" strokeWidth="1" />
        <path d="M8 15 31 10 34 16 13 30 7 26Z" fill="#ff6a00" stroke="#ffb347" strokeWidth="1" />
        <path d="M17 17 27 21 17 26Z" fill="#08090b" stroke="#fff0d7" strokeWidth="1" />
      </svg>
      <span className="flex flex-col leading-none text-left"><span className="text-[9px] font-medium uppercase tracking-[.22em] text-white/65">From</span><span className="text-base font-black tracking-tight text-primary">BIG</span></span>
    </div>
  );
}
