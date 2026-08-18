import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/')(
  {
    component: HomePage,
  },
);

function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Big Move</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern full-stack application built with TanStack Start, React 19, and Supabase.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎨 Beautiful UI</CardTitle>
            <CardDescription>Built with Radix UI and Tailwind CSS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Professional component library with accessible, unstyled primitives.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Full-Stack</CardTitle>
            <CardDescription>Server & Client in one project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TanStack Start handles SSR and routing for you.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔐 Secure Auth</CardTitle>
            <CardDescription>Lovable + Supabase JWT</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade authentication out of the box.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Getting Started</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>✅ Environment variables configured (.env.local)</p>
          <p>✅ Database schema ready (check src/db/schema.ts)</p>
          <p>✅ Components library installed (Radix UI)</p>
          <p>✅ Routing configured (TanStack Router)</p>
        </div>
        <div className="flex gap-4">
          <a href="/dashboard">
            <Button>Go to Dashboard</Button>
          </a>
          <a href="https://tanstack.com/start/latest" target="_blank" rel="noreferrer">
            <Button variant="outline">Learn TanStack Start</Button>
          </a>
        </div>
      </section>
    </div>
  );
}
