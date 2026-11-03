import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "BIG MOV — Watch · Stream · Enjoy" },
    { name: "description", content: "Enter BIG MOV, your cinematic destination for movies and TV series." },
    { property: "og:title", content: "BIG MOV" },
    { property: "og:description", content: "Watch · Stream · Enjoy" },
  ] }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <main className="bigmov-landing">
      <Hero />
    </main>
  );
}
