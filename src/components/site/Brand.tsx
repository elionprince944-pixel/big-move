import { Link } from "@tanstack/react-router";

type BrandProps = { compact?: boolean; className?: string; tagline?: boolean };

export function Brand({ compact = false, className = "", tagline = false }: BrandProps) {
  return (
    <Link
      to="/home"
      aria-label="BIG MOV home"
      className={`group inline-flex min-w-0 shrink-0 items-center ${className}`}
    >
      <span className="flex min-w-0 flex-col items-start">
        <img
          src="/brand/big-mov-logo.png"
          alt="BIG MOV"
          width={compact ? 112 : 152}
          height={compact ? 63 : 85}
          className={compact
            ? "h-10 w-auto max-w-[112px] object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            : "h-12 w-auto max-w-[152px] object-contain transition-transform duration-200 group-hover:scale-[1.03]"}
        />
        {tagline && (
          <span className="mt-0.5 pl-1 text-[7px] font-bold uppercase tracking-[.22em] text-muted-foreground">
            Watch · Stream · Enjoy
          </span>
        )}
      </span>
    </Link>
  );
}

export function FromBig({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-black/65 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,.55)] backdrop-blur-xl ${className}`}>
      <img
        src="/brand/big-mov-logo.png"
        alt="BIG MOV"
        width={96}
        height={54}
        className="h-8 w-auto max-w-[88px] object-contain"
      />
      <span className="flex flex-col leading-none text-left">
        <span className="text-[9px] font-medium uppercase tracking-[.22em] text-white/65">From</span>
        <span className="text-base font-black tracking-tight text-primary">BIG</span>
      </span>
    </div>
  );
}
