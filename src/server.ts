import { createHandler } from '@tanstack/start';
import { renderToString } from 'react-dom/server';

// TanStack Start server handler wrapper
export default createHandler({
  // Server middleware
  onRequest: async (context) => {
    // Add custom server logic here (auth checks, logging, etc.)
    return context;
  },
});
