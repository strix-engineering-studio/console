# Copilot instructions for Strix console

## Commands

Use the repository scripts from the root:

- `npm install` (or `pnpm install` if the workspace is being managed with pnpm; there is a `pnpm-lock.yaml` in the repo)
- `npm run build` — runs `tsc -b && vite build`
- `npm run lint` — runs ESLint across the repo

There is no `test` script in `package.json`, and there are no matching test files in the repo at the moment. The project does include `vitest` in `devDependencies`, so when tests are added, prefer a targeted invocation such as:

- `npx vitest run src/path/to/file.test.tsx`
- `npx vitest run -t "test name"`

## High-level architecture

This is a Vite + React + TypeScript application with a feature-based folder layout under `src/`:

- `src/router.tsx` defines the app routes and top-level layout structure.
- `src/components/layouts/` contains the auth/admin shell layouts.
- `src/features/*` is the main domain organization: auth, dashboard, users, organizations, leads, map, and search.
- Each feature generally owns its own `pages`, `hooks`, `services`, `schemas`, and `types` folders.
- `src/lib/` holds cross-cutting infrastructure: API client, auth storage, route constants, and utility helpers.
- `src/providers/` wires the app-level providers such as React Query, theme, tooltips, and auth.
- `src/components/ui/` contains the shared UI primitives; the project uses custom wrappers around `@base-ui/react` instead of raw Radix primitives in multiple places.

The app is also built around a standard data flow:

- `src/lib/api/client.ts` centralizes Axios configuration, access-token handling, and refresh behavior.
- Service modules call `apiClient` and return typed Axios responses.
- `useQuery` / `useMutation` hooks in each feature unwrap the standard API envelope before returning values to React Query.
- `src/lib/store/authStore.ts` stores the current authenticated user in Zustand.
- `src/providers/AuthProvider.tsx` initializes auth state and handles login/logout flows.

## Key conventions

- Use the `@` alias for imports pointing to `src/` (`@/features/...`, `@/components/...`, `@/lib/...`).
- Keep domain logic grouped by feature rather than creating one large app-level service layer.
- Prefer updating the nearest feature folder when adding or fixing behavior instead of introducing cross-cutting abstractions.
- The project uses a typed `ApiResponse<T>` pattern; do not return the raw Axios envelope from query hooks unless the code explicitly expects it.
- For auth/user work, align with the actual app model in use (`IAdminUser` and the admin/auth flow), rather than the more generic user names that appear in older code.
- Menu widgets in this repo follow the Base UI pattern used in `src/components/ui/dropdown-menu.tsx`: custom wrappers around `@base-ui/react/menu` with `render`-based trigger composition rather than Radix-style `asChild` props.
- Styling is Tailwind-heavy and component-driven. Match the surrounding patterns and class structure instead of introducing alternative local styling approaches.
- If changes touch route or provider wiring, keep the same overall structure in `src/router.tsx` and `src/providers/AppProviders.tsx` so the app shell stays consistent.

## Repo-specific notes

- The project has a `vite.config.ts` with an alias for `@` and a Babel React Compiler preset.
- `README.md` is a default Vite starter README and does not describe the app’s business domain; prefer code and feature structure over the generic template text when making repository-specific decisions.
- Do not add broad architectural refactors just to satisfy a local file; keep changes scoped to the actual behavior or contract being edited.
