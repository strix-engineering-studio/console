# Strix Lead

Strix Lead is an internal lead intelligence console for Strix Engineering Studio. It organizes potential clients, organizations, people, research runs, and activity for human review.

## Setup

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: a valid MongoDB connection string.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the single initial admin account. Use a password with at least 12 characters.
- `SESSION_SECRET`: a random secret of at least 32 bytes for signing session cookies.
- Provider keys and map tile URL are optional until those integrations are implemented.

Install dependencies, generate the Prisma client, and create the admin once:

```bash
pnpm install
pnpm prisma:generate
pnpm db:seed
pnpm dev
```

The seed is safe to run repeatedly. It leaves an existing admin account unchanged. The console is available at `/auth/login`.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm prisma:validate
pnpm prisma:generate
```

Research provider execution is intentionally unavailable until a real provider adapter is implemented. The UI reports this state instead of creating fake research results.
