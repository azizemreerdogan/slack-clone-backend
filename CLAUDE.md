# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with hot reload (tsx watch on src/)
npm run build        # Compile TypeScript to dist/ (via tsc)
npm run start        # Run compiled output from dist/

# Prisma
npm run db:generate  # Regenerate Prisma client after schema changes (alias: npx prisma generate)
npm run db:migrate   # Run pending migrations (alias: npx prisma migrate dev)
npm run db:studio    # Open Prisma Studio
```

> There are no tests yet (`npm test` exits with an error). The project uses `tsx` (not `ts-node`) to run TypeScript directly.

After any change to `prisma/schema.prisma`, always run `npx prisma generate` — the generated client lives in `generated/prisma/`, not the default location.

## Architecture

### Module structure

Every feature follows a strict 4-layer pattern. All four files live together in `src/modules/<feature>/`:

```
route.ts → controller.ts → service.ts → prisma (DB)
```

- **Routes** register Fastify routes and bind Zod schemas to handlers — no logic.
- **Controllers** handle HTTP concerns: parse request, call service, shape response, sign JWT. No Prisma.
- **Services** contain all business logic and Prisma queries. No HTTP knowledge, no `reply`.
- **Schemas** define Zod schemas and export inferred TypeScript types via `z.infer<>`.

### Server setup

`buildServer()` in `src/utils/server.ts` constructs and returns the Fastify app without calling `.listen()`. `src/main.ts` is the entry point — it calls `buildServer()`, binds to a port, and registers graceful shutdown. This separation lets future tests use `app.inject()` without a real port.

Plugins registered in `buildServer()`:
- `@fastify/jwt` (secret + expiry from env)
- `fastify-type-provider-zod` (converts Zod schemas to JSON Schema for Fastify's AJV validator)
- Global error handler (`src/middleware/errorHandler.ts`)

**Route registration happens in `buildServer()`** — when adding a new module, register its routes there.

### Auth & authorization middleware chain

Protected routes use a `preHandler` array. The standard chain for workspace-scoped mutations is:

```typescript
preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole]
```

- `authenticate` — verifies JWT via `request.jwtVerify()`; populates `request.user`
- `requireWorkspaceMember` — checks that `request.user.id` is a member of `request.params.workspace_id`
- `requireWorkspaceRole` — checks that the member has `ADMIN` role (via `roleChecker` in `src/utils/roleChecker.ts`)

The JWT payload type is augmented on `FastifyRequest` in `src/types/fastify-jwt.d.ts`.

### Error handling

Services throw `AppError(statusCode, message, code?)` from `src/errors/AppError.ts`. Controllers re-throw (or don't catch). The global error handler in `src/middleware/errorHandler.ts` maps `AppError` to the correct HTTP response. Services never set HTTP status codes directly.

### Database identity model

Messages and notifications are attributed to `WorkspaceMember`, not `User` directly. A `WorkspaceMember` is the join between a `User` and a `Workspace` — it carries role, display name, and status within that workspace.

Message threading is limited to **1 level deep**: a `Message` can have a `parent_msg_id` pointing to another message, but replies cannot be replied to. This is enforced both by a DB trigger (in migrations) and at the service layer.

### Environment

All env vars are Zod-validated at startup in `src/config/env.ts`. The server will not start if any required variable is missing. Required vars: `DATABASE_URL`, `JWT_SECRET` (min 32 chars), `JWT_EXPIRES_IN`, `NODE_ENV`, `PORT`, `HOST`.

### TypeScript config notes

- Module system: `"module": "nodenext"` — all local imports must use `.js` extensions (even for `.ts` source files).
- `strict: true` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are enabled.
- `verbatimModuleSyntax: true` — use `import type` for type-only imports.
