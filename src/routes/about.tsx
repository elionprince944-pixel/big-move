import { createFileRoute } from "@tanstack/react-router";
import { Film, Tv, Bookmark, Search } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BIG MOV" },
      { name: "description", content: "BIG MOV brings you the world's biggest catalog of movies and TV shows in one place." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="text-primary uppercase tracking-widest text-xs mb-3">About</p>
        <h1 className="font-display text-5xl sm:text-6xl mb-4">Movies, made <span className="text-primary">BIG</span>.</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          BIG MOV is a modern streaming hub powered by the world's largest open movie database. Discover, save, and watch — anywhere, on any device.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {[
          { icon: Film, title: "Massive catalog", text: "Thousands of movies updated daily from TMDB." },
          { icon: Tv, title: "TV shows", text: "Track popular and top-rated series from around the world." },
          { icon: Bookmark, title: "Watchlist", text: "Save anything you want to watch later, synced across devices." },
          { icon: Search, title: "Smart search", text: "Find anything in seconds — by title, cast, or genre." },
        ].map((f) => (
          <div key={f.title} className="bg-surface border border-border rounded-xl p-6">
            <f.icon className="size-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>

      <section className="bg-surface border border-border rounded-xl p-8">
        <h2 className="font-display text-2xl mb-3">Our mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          We believe great storytelling deserves great discovery. BIG MOV puts the world's biggest movie database at your fingertips with a clean, fast, beautifully dark experience built for movie lovers.
        </p>
      </section>
    </div>
  );
}
