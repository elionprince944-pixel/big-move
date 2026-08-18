import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from '@tanstack/react-router';
import rootRoute from './routes/__root';
import { createMemoryHistory, createBrowserHistory } from '@tanstack/react-router';

// Create router instance
const router = new Router({
  routeTree: rootRoute,
  defaultPreload: 'intent',
  context: {
    auth: null,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Mount app to DOM
const rootElement = document.getElementById('app');

if (!rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement!);
  root.render(<Router />);
}
