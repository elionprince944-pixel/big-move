# Big Move

A modern full-stack web application built with TanStack Start, React 19, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Environment variables configured

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and auth keys.

3. **Run migrations**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

## 📁 Project Structure

```
src/
  routes/           TanStack Router pages & layouts
  components/       Reusable React components
  server.ts         SSR entry point
  client.tsx        Client entry point
  db/
    schema.ts       Drizzle ORM schema
    index.ts        Database client
  lib/
    auth.ts         Authentication utilities
    supabase.ts     Supabase client config
```

## 🛠️ Available Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Drizzle migration files

## 🔐 Authentication

Uses Lovable Cloud Auth integrated with Supabase JWT. Configure in `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_LOVABLE_AUTH_KEY=your_auth_key
```

## 📊 Database

PostgreSQL via Supabase with Drizzle ORM for type-safe queries.

- Migrations: `src/db/migrations/`
- Schema: `src/db/schema.ts`
- Client: `src/db/index.ts`

## 🚢 Deployment

### Cloudflare Workers

```bash
npm run build
npx wrangler deploy
```

### Traditional Node.js

```bash
npm run build
node dist/server.js
```

## 📚 Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Query
- **UI**: Radix UI, Tailwind CSS, Lucide Icons
- **Forms**: React Hook Form, Zod validation
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Auth**: Lovable Cloud Auth + Supabase JWT
- **Build**: Vite + TanStack Start
- **Deploy**: Cloudflare Workers

## 📖 Learn More

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Radix UI](https://www.radix-ui.com)
