import { Link } from "@tanstack/react-router";

type BrandProps = { compact?: boolean; className?: string; tagline?: boolean };

function BEmblem({ compact = false }: { compact?: boolean }) {
  return (
    <svg viewBox="0 0 72 72" role="img" aria-label="BIG MOV B emblem" className={compact ? "h-9 w-9 shrink-0" : "h-12 w-12 shrink-0"}>
      <defs>
        <linearGradient id="bm-b-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0b3" />
          <stop offset=".28" stopColor="#ffb52e" />
          <stop offset=".62" stopColor="#ff6900" />
          <stop offset="1" stopColor="#9e2600" />
        </linearGradient>
        <linearGradient id="bm-b-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="bm-b-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path d="M18 8h25c14 0 22 7 22 18 0 7-4 12-10 15 8 2 13 8 13 16 0 12-9 19-24 19H18V8Z" fill="#ff6900" opacity=".3" filter="url(#bm-b-glow)" transform="translate(-2 -2)"/>
      <path d="M14 7h28c13 0 21 7 21 18 0 7-4 12-10 15 8 2 13 8 13 16 0 12-9 19-24 19H14V7Zm15 13v14h12c5 0 8-2 8-7s-3-7-8-7H29Zm0 27v15h13c6 0 9-2 9-7s-3-8-9-8H29Z" fill="url(#bm-b-metal)" stroke="#ffe0a0" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M18 11h24c11 0 17 5 18 13-4-5-9-7-17-7H24v53h-6V11Z" fill="url(#bm-b-glass)"/>
      <path d="m39 34 11 7-11 7V34Z" fill="#101010" stroke="#fff0c9" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9 62h53" stroke="#ffb52e" strokeWidth="1.5" strokeLinecap="round" opacity=".8"/>
      <circle cx="56" cy="12" r="3" fill="#fff0b3"/>
    </svg>
  );
}

export function Brand({ compact = false, className = "", tagline = false }: BrandProps) {
  return (
    <Link to="/home" aria-label="BIG MOV home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <BEmblem compact={compact} />
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
    <div className={`inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-black/55 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,.55)] backdrop-blur-xl ${className}`}>
      <BEmblem compact />
      <span className="flex flex-col leading-none text-left"><span className="text-[9px] font-medium uppercase tracking-[.22em] text-white/65">From</span><span className="text-base font-black tracking-tight text-primary">BIG</span></span>
    </div>
  );
}
