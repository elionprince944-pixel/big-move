import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help — BIG MOV" }, { name: "description", content: "Get help using BIG MOV." }] }),
  component: HelpPage,
});

const faqs = [
  { q: "How do I create an account?", a: "Click 'Sign in' in the top right and choose 'Create account', or continue with Google." },
  { q: "How does the watchlist work?", a: "Open any movie or show and tap 'Watchlist'. Find saved titles under My Watchlist." },
  { q: "Where do the movies come from?", a: "Catalog data and posters come from The Movie Database (TMDB), updated daily." },
  { q: "Can I watch full movies?", a: "BIG MOV streams official YouTube trailers. Full streaming requires partnered providers." },
  { q: "I forgot my password.", a: "Use the 'Sign in with Google' option, or contact support to reset your email password." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      <h1 className="font-display text-5xl mb-2">Help Center</h1>
      <p className="text-muted-foreground mb-8">Common questions and answers.</p>
      <Accordion type="single" collapsible className="bg-surface border border-border rounded-xl px-4">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-sm text-muted-foreground text-center mt-8">Still need help? Email support@bigmov.app</p>
    </div>
  );
}
