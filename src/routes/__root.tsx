import { createRootRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
              <a href="/" className="mr-6 flex items-center space-x-2">
                <span className="text-xl font-bold">🚀 Big Move</span>
              </a>
            </div>
            <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
              <a href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Home
              </a>
              <a href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Dashboard
              </a>
            </nav>
          </div>
        </header>
        <main className="container mx-auto py-6">
          <Outlet />
        </main>
      </div>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </>
  );
}
