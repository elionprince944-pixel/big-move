import { Link } from "@tanstack/react-router";
import { Crown, Instagram, Youtube, Facebook, MessageCircle, Twitter, Clapperboard, Film, Play, ArrowUpRight } from "lucide-react";
import ceoPortrait from "@/assets/ceo-portrait.jpg";
import { Brand } from "@/components/site/Brand";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
  { label: "X", href: "https://x.com/", Icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: Youtube },
  { label: "WhatsApp", href: "https://www.whatsapp.com/", Icon: MessageCircle },
  { label: "Facebook", href: "https://www.facebook.com/", Icon: Facebook },
];

export function Footer() {
  return (
    <footer className="site-footer relative mt-20 overflow-hidden border-t border-orange-300/15 bg-[#08090b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_0%,rgba(255,111,0,.13),transparent_42%),radial-gradient(ellipse_at_8%_100%,rgba(255,166,45,.08),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-9 md:grid-cols-4">
          <section className="col-span-2 md:col-span-1">
            <Brand tagline />
            <p className="mb-5 mt-4 max-w-xs text-sm leading-relaxed text-white/50">Your front-row seat to stories worth watching. Discover movies and series in one place.</p>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-white/75">Follow BIG MOV</h3>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-white/65 transition hover:-translate-y-1 hover:border-orange-400/50 hover:bg-orange-500/10 hover:text-orange-300">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-orange-300">Categories</h3>
            <nav className="flex flex-col gap-3 text-sm text-white/55">
              <Link to="/home" className="hover:text-orange-300">Home</Link>
              <Link to="/genre/$id" params={{ id: "10759" }} search={{ type: "tv" }} className="hover:text-orange-300">TV Shows</Link>
              <Link to="/browse" search={{ cat: "popular" }} className="hover:text-orange-300">Movies</Link>
              <Link to="/help" className="hover:text-orange-300">Content ratings</Link>
              <Link to="/watchlist" className="hover:text-orange-300">Watchlist</Link>
            </nav>
          </section>

          <section>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-orange-300">Help Center</h3>
            <nav className="flex flex-col gap-3 text-sm text-white/55">
              <Link to="/help" className="hover:text-orange-300">Help & Support</Link>
              <a href="#big-ai" className="hover:text-orange-300" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLButtonElement>('[aria-label*="BIG AI"], button.fixed.bottom-5.right-5')?.click(); }}>BIG AI Assistant</a>
              <Link to="/help" className="hover:text-orange-300">Live Chat information</Link>
            </nav>
          </section>

          <section>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-orange-300">About Us</h3>
            <nav className="flex flex-col gap-3 text-sm text-white/55">
              <Link to="/about" className="hover:text-orange-300">About BIG MOV</Link>
              <Link to="/about" className="hover:text-orange-300">Our mission</Link>
              <Link to="/settings" className="hover:text-orange-300">Account settings</Link>
            </nav>
          </section>
        </div>

        <section className="relative mt-12 flex flex-col gap-5 overflow-hidden rounded-3xl border border-orange-300/20 bg-white/[.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.09)] backdrop-blur-2xl sm:flex-row sm:items-center sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-orange-300/40 to-orange-700/10 blur-md" />
            <img src={ceoPortrait} alt="BIG MOV founder and CEO" loading="lazy" width={816} height={816} className="relative size-24 rounded-2xl border border-orange-200/40 object-cover shadow-xl sm:size-28" />
          </div>
          <div className="relative min-w-0">
            <div className="mb-2 flex items-center gap-2 text-orange-300"><Crown className="size-4" /><span className="text-[10px] font-bold uppercase tracking-[.24em]">Chief Executive Officer</span></div>
            <h3 className="break-words font-display text-xl font-black tracking-wide sm:text-2xl">ISHIMWE ELION PRINCE</h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5"><Clapperboard className="size-3.5 text-orange-400" /> Founder</span>
              <span className="inline-flex items-center gap-1.5"><Film className="size-3.5 text-orange-400" /> Storyteller</span>
              <span className="inline-flex items-center gap-1.5"><Play className="size-3.5 text-orange-400" /> BIG MOV</span>
            </p>
            <p className="mt-3 max-w-2xl border-l-2 border-orange-400/60 pl-3 text-xs leading-relaxed text-white/65">Leading BIG MOV with a focus on making movie and television discovery simple, engaging, and accessible.</p>
          </div>
          <Link to="/about" className="relative inline-flex shrink-0 items-center gap-2 text-xs font-bold text-orange-300 hover:text-orange-200">About BIG MOV <ArrowUpRight className="size-4" /></Link>
        </section>
      </div>
      <div className="relative border-t border-white/[.07] px-5 py-5 text-center text-xs text-white/35">© {new Date().getFullYear()} BIG MOV. Powered by TMDB.</div>
    </footer>
  );
}
