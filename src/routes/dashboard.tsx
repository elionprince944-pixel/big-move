import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/dashboard')(
  {
    component: DashboardPage,
  },
);

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your application dashboard</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Connected to Supabase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Current authenticated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>What to do after scaffolding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Create your data models in <code className="bg-muted px-2 py-1 rounded">src/db/schema.ts</code></li>
            <li>Add API routes in <code className="bg-muted px-2 py-1 rounded">src/routes/api/</code></li>
            <li>Build your components in <code className="bg-muted px-2 py-1 rounded">src/components/</code></li>
            <li>Create pages in <code className="bg-muted px-2 py-1 rounded">src/routes/</code></li>
            <li>Deploy to Cloudflare or your preferred host</li>
          </ol>
          <div className="pt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">Useful resources:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• <a href="https://tanstack.com/router/latest" className="underline hover:text-foreground">TanStack Router Docs</a></li>
              <li>• <a href="https://supabase.com/docs" className="underline hover:text-foreground">Supabase Documentation</a></li>
              <li>• <a href="https://orm.drizzle.team/docs" className="underline hover:text-foreground">Drizzle ORM Guide</a></li>
              <li>• <a href="https://www.radix-ui.com/docs" className="underline hover:text-foreground">Radix UI Components</a></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
