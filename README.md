# Slack Clone Backend

A real-time messaging backend inspired by Slack, built with **Fastify**, **TypeScript**, **Prisma**, and **PostgreSQL**. Designed with a modular, scalable architecture that supports workspaces, channels, direct messages, threads, notifications, and more.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Architecture Decisions](#architecture-decisions)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Fastify |
| ORM | Prisma (PostgreSQL adapter) |
| Database | PostgreSQL |
| Auth | JWT via `@fastify/jwt` |
| Validation | Zod + `fastify-type-provider-zod` |
| Password Hashing | bcrypt |
| Logging | pino-pretty |

---

## Project Structure

```
slack-clone-backend/
├── prisma/
│   ├── schema.prisma          # Database schema (single source of truth)
│   └── migrations/            # Auto-generated migration history
├── generated/
│   └── prisma/                # Prisma generated client output
├── src/
│   ├── main.ts                # Entry point — starts server, handles signals
│   ├── config/
│   │   └── env.ts             # Zod-validated environment variables
│   ├── errors/
│   │   └── AppError.ts        # Custom error class with statusCode + code
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT preHandler for protected routes
│   │   └── errorHandler.ts    # Global Fastify error handler
│   ├── modules/
│   │   ├── user.schema.ts     # Zod schemas + inferred TypeScript types
│   │   ├── user.service.ts    # Business logic + Prisma queries
│   │   ├── user.controller.ts # HTTP handlers (request → service → response)
│   │   └── user.route.ts      # Route definitions with schema bindings
│   └── utils/
│       ├── hash.ts            # bcrypt password hashing helpers
│       └── server.ts          # Fastify app builder (buildServer)
└── .env                       # Local environment (never commit this)
```

### Key Architectural Principle

Each module follows a strict 4-layer separation:

```
route.ts  →  controller.ts  →  service.ts  →  prisma (DB)
  │               │                │
schema           HTTP            business
binding         layer             logic
```

- **Routes** bind Zod schemas to handlers — no logic here
- **Controllers** handle HTTP concerns (request parsing, response shaping, JWT signing)
- **Services** handle business logic and DB queries — no HTTP knowledge
- **Schemas** define both validation rules and TypeScript types via `z.infer<>`

---

## Database Schema

The schema models a full workspace-based messaging system. All models use `uuid` primary keys.

### Models

**User** — Core authentication entity. Tracks presence status and account state.

**Workspace** — Top-level container. Users join workspaces via `WorkspaceMember`. Supports `ACTIVE`, `INACTIVE`, and `ARCHIVED` states.

**WorkspaceMember** — Join table between `User` and `Workspace`. Carries role (`ADMIN`, `OWNER`, `MEMBER`), display name, and online status. This is the identity within a workspace — messages are sent by members, not raw users.

**Channel** — Belongs to a workspace. Supports four types:
- `PUBLIC` — visible to everyone in the workspace
- `PRIVATE` — invite-only
- `DM` — direct message between two users
- `GROUP_DM` — multi-user direct message

**ChannelMember** — Join table between `Channel` and `WorkspaceMember`.

**Message** — Sent by a `WorkspaceMember` to a `Channel`. Supports threading via `parent_msg_id` (self-referential). Depth is enforced at **1 level** — replies cannot be replied to. Soft-delete supported via `is_deleted`.

**Notification** — Per-member notifications for DMs, mentions, thread replies, task assignments, and invitations.

### Thread Depth Constraint

Messages support one level of threading. A reply points to its parent via `parent_msg_id`. Nested replies are prevented via a DB trigger (applied in migrations) and enforced again at the service layer as a secondary guard.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/slack-clone-backend.git
cd slack-clone-backend

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in values
cp .env.example .env

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled output
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Prisma Studio (visual DB browser)
```

---

## Environment Variables

All variables are validated at startup via Zod. The server **will not start** if any required variable is missing or malformed.

```env
# Server
NODE_ENV=development          # development | production | test
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/slack_clone

# JWT — minimum 32 characters
JWT_SECRET=your-super-secret-key-minimum-32-chars
JWT_EXPIRES_IN=7d
```

See `src/config/env.ts` for the full schema with defaults.

---

## API Reference

All routes are prefixed as registered in `buildServer`. Currently implemented:

### Auth / User

#### `POST /register`

Create a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "minimum6chars",
  "name": "John Doe"
}
```

**Response `201`:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJ..."
}
```

**Error responses:**
- `400` — validation failed (invalid email, password too short)
- `409` — email already registered

---

#### `POST /login`

Authenticate and receive a JWT.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJ..."
}
```

**Error responses:**
- `401` — invalid email or password

---

### Using Protected Routes

Include the JWT in the `Authorization` header:

```
Authorization: Bearer eyJ...
```

Routes that require authentication use the `authenticate` preHandler:

```typescript
fastify.get('/me', { preHandler: authenticate }, handler)
```

The middleware calls `request.jwtVerify()` — if the token is missing or invalid, a `401` is returned automatically.

---

## Architecture Decisions

**Why Fastify over Express?**
Fastify has built-in schema-based validation via AJV, significantly better performance, and a plugin system that enforces encapsulation. TypeScript support is first-class.

**Why Zod for schemas?**
Zod schemas produce TypeScript types via `z.infer<>`, eliminating the need to maintain separate interface definitions. With `fastify-type-provider-zod`, schemas are automatically converted to JSON Schema for Fastify's AJV validator — no manual conversion needed.

**Why WorkspaceMember as the sender identity?**
Messages reference `WorkspaceMember`, not `User` directly. This allows different display names, roles, and statuses per workspace — the same pattern Slack uses. A user can be "John" in one workspace and "John D. (Engineering)" in another.

**Why separate `app` and `server`?**
`buildServer()` in `utils/server.ts` returns the Fastify instance without calling `.listen()`. `main.ts` calls `buildServer()` and then binds to a port. This separation allows test suites to use `app.inject()` without binding to a real port, and makes graceful shutdown logic cleaner.

**Error handling flow:**
```
Service throws AppError
    → Controller re-throws (or doesn't catch)
        → Fastify errorHandler catches
            → Maps to correct HTTP status code
```
Services never deal with HTTP codes. HTTP codes live in `AppError.statusCode` and the global error handler.

---

## Roadmap

The following features are planned in order of priority:

- [ ] Workspace CRUD (create, invite members, manage roles)
- [ ] Channel CRUD (create, archive, manage members)
- [ ] Message CRUD (send, edit, delete, thread replies)
- [ ] Real-time layer (Socket.io — presence, live messages, typing indicators)
- [ ] Presence system (online/offline/away/do not disturb)
- [ ] Notification engine (DM, mention, thread reply triggers)
- [ ] Message reactions (emoji)
- [ ] File attachments (multipart upload)
- [ ] Pinned messages
- [ ] Permission model (fine-grained per-role capabilities)
- [ ] Audit log (track destructive actions)
- [ ] Huddles (WebRTC audio/video)
- [ ] Company handbook (static workspace knowledge base)
- [ ] Todo lists / Scrum boards (shared and DM-specific)
