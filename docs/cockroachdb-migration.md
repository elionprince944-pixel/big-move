# CockroachDB + standalone authentication migration

## Status
This branch starts a **staged migration**. The current production app remains on Supabase until the new database, authentication, and OAuth flow are implemented and verified. Do not delete or disable the existing Supabase project during migration.

## Target architecture
- CockroachDB Serverless: application data and relational database.
- Better Auth: email/password sessions and Google OAuth, using CockroachDB's PostgreSQL-compatible connection.
- TanStack Start server functions: database access and privileged operations.
- Server-only environment variables: DATABASE_URL, Better Auth secret/base URL, Google OAuth client ID/secret, and existing API keys.
- No database credentials or OAuth secrets in browser code.

## Migration phases
1. Provision CockroachDB and configure a least-privilege database user; keep the connection string in deployment secrets.
2. Add Better Auth and generate its supported schema/migrations for the installed version. Configure Google OAuth callback URLs.
3. Create application tables from db/cockroach/schema.sql.
4. Implement a server-only database layer and replace Supabase queries in profile, watchlist, admin, and BIG AI settings/usage flows.
5. Replace Supabase session checks and role checks with Better Auth session validation and server-side role authorization.
6. Migrate existing profiles, watchlists, roles, and BIG AI settings only after a verified export/backup and ID mapping. Password hashes cannot be assumed portable; users may need to sign in again or reset passwords.
7. Test sign-up, login, Google OAuth, logout, watchlist isolation, admin access, AI controls, and production deployment.
8. Cut over only after acceptance checks and a rollback plan. Remove Supabase dependencies/configuration in a separate final change.

## Required secrets (server-side only)
- DATABASE_URL
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- Existing server secrets such as GEMINI_API_KEY and TMDB_API_KEY

Never commit real secret values. This migration has not yet connected to a live CockroachDB cluster or moved user data.
