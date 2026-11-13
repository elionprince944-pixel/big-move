import { useId } from "react";
import { Link } from "@tanstack/react-router";

type BrandProps = { compact?: boolean; className?: string; tagline?: boolean };

function BEmblem({ compact = false }: { compact?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const gradient = `bigmov-orange-${uid}`;
  const shine = `bigmov-shine-${uid}`;

  return (
    <svg
      viewBox="0 0 76 76"
      role="img"
      aria-label="BIG MOV orange B play emblem"
      className={compact ? "h-9 w-9 shrink-0" : "h-12 w-12 shrink-0"}
      fill="none"
    >
      <defs>
        <linearGradient id={gradient} x1="12" y1="8" x2="64" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC078" />
          <stop offset=".34" stopColor="#FF8C00" />
          <stop offset=".7" stopColor="#FF6500" />
          <stop offset="1" stopColor="#C63800" />
        </linearGradient>
        <linearGradient id={shine} x1="18" y1="8" x2="50" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF4E8" stopOpacity=".72" />
          <stop offset="1" stopColor="#FFF4E8" stopOpacity="0" />
        </linearGradient>
        <filter id={`${gradient}-shadow`} x="-35%" y="-30%" width="170%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      <path d="M13 12 57 28 68 37 57 47 13 64Z" fill="#FF6500" opacity=".24" filter={`url(#${gradient}-shadow)`} />
      <path
        d="M17 8.5C17 5.7 20.1 4 22.5 5.5L63.3 29.7C69.1 33.1 69.1 41.1 63.3 44.5L22.5 68.7C20.1 70.2 17 68.5 17 65.7V8.5Z"
        fill={`url(#${gradient})`}
        stroke="#FFB36B"
        strokeWidth="1.2"
      />
      <path d="M23 12 57.5 32.3C60.2 33.9 60.2 40.3 57.5 41.9L23 62.2V12Z" fill="#15100D" />
      <path
        d="M31 18.5H43.4C53.1 18.5 58.4 23.2 58.4 31.1C58.4 35.4 56.5 38.3 53.2 40.1C57.6 41.6 60 44.9 60 49.7C60 58.1 54.3 63 44.2 63H31V18.5ZM41.1 27.2V36.1H44.1C47 36.1 48.5 34.7 48.5 31.7C48.5 28.8 47 27.2 44.1 27.2H41.1ZM41.1 44.1V54H44.7C48 54 49.7 52.4 49.7 49.1C49.7 45.8 48 44.1 44.7 44.1H41.1Z"
        fill={`url(#${gradient})`}
        opacity=".98"
      />
      <path d="M21 10.5 54 30" stroke={`url(#${shine})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M31.5 18.5V62.5" stroke="#FFF0E1" strokeOpacity=".3" strokeWidth="1" />
      <path d="M45 34.5 55 40.5 45 46.5V34.5Z" fill="#090909" stroke="#FFE1C4" strokeOpacity=".8" strokeWidth=".8" />
    </svg>
  );
}

export function Brand({ compact = false, className = "", tagline = false }: BrandProps) {
  return (
    <Link to="/" aria-label="BIG MOV home" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid shrink-0 place-items-center">
        <span aria-hidden="true" className="absolute inset-1 rounded-full bg-orange-500/25 blur-lg transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
        <BEmblem compact={compact} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={compact ? "font-display text-xl font-black tracking-[-.055em]" : "font-display text-2xl sm:text-3xl font-black tracking-[-.055em]"}>
          <span className="text-foreground">BIG</span><span className="bg-gradient-to-r from-[#FFB15A] via-[#FF7800] to-[#FF4D00] bg-clip-text text-transparent"> MOV</span>
        </span>
        {tagline && <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[.25em] text-muted-foreground">Watch · Stream · Enjoy</span>}
      </span>
    </Link>
  );
}

export function FromBig({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-black/65 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,.55)] backdrop-blur-xl ${className}`}>
      <BEmblem compact />
      <span className="flex flex-col leading-none text-left"><span className="text-[9px] font-medium uppercase tracking-[.22em] text-white/65">From</span><span className="text-base font-black tracking-tight text-primary">BIG</span></span>
    </div>
  );
}
