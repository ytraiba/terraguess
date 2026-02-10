# TerraGuess Architecture

## Overview

TerraGuess is a geography guessing game built with:

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Database**: Turso (libSQL) in production, SQLite locally
- **ORM**: Prisma 7 with driver adapters
- **Authentication**: Auth.js v5 (next-auth) with OAuth providers
- **Hosting**: Vercel (serverless)
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet / React-Leaflet
- **Street Imagery**: Mapillary (public API)

## Authentication

### How It Works

TerraGuess uses **OAuth-only authentication** via Auth.js v5 (NextAuth.js). Users sign in with their Google account — there are no passwords stored in the database.

**Flow:**
1. User clicks "Continue with Google" on the login page
2. Auth.js redirects to Google's consent screen
3. User authorizes the app
4. Google redirects back to `/api/auth/callback/google`
5. Auth.js creates or updates the user record in the database via `PrismaAdapter`
6. A **JWT session token** is issued and stored as an HTTP-only cookie
7. Subsequent requests include this cookie — middleware and server components verify it

### Session Strategy

- **JWT-based sessions** (not database sessions) — the session token is a signed JWT stored in a cookie
- Cookie names: `authjs.session-token` (development) or `__Secure-authjs.session-token` (production/HTTPS)
- JWT contains the user's ID, name, and email
- No session data is stored in the database (the Session table exists for compatibility but is unused with JWT strategy)

### Route Protection

- `middleware.ts` runs on protected routes (`/dashboard`, `/play`, `/game`, `/results`, `/profile`)
- It checks for the presence of a valid session cookie
- If no cookie is found, the user is redirected to `/login`
- This runs in the Edge runtime — no database or native module access needed

## Data Storage

### Database

| Environment | Provider | Details |
|-------------|----------|---------|
| Development | SQLite | Local `dev.db` file via `better-sqlite3` adapter |
| Production | Turso | Hosted libSQL database via `@prisma/adapter-libsql` |

### What's Stored

| Data | Table | Details |
|------|-------|---------|
| User profile | `User` | Name, email, avatar URL (from OAuth). No passwords. |
| OAuth accounts | `Account` | Provider info, access/refresh tokens (encrypted by provider) |
| Game history | `Game` | Mode, status, total score, timestamps |
| Round details | `Round` | Actual location, user's guess, distance, score, time spent |
| Locations | `Location` | Lat/lng, Mapillary image ID, region |
| User stats | `User` | High score, total games, current/longest streak |

### What's NOT Stored

- Passwords (OAuth only)
- Payment information
- IP addresses or device fingerprints
- Precise user location (only their map guesses within games)
- Analytics or tracking data
- Cookies beyond the session token

### Data Relationships

All user data cascades on deletion — deleting a user removes their accounts, games, rounds, and stats automatically (`onDelete: Cascade`).

## Security Measures

### Authentication & Authorization
- **OAuth-only** — no password storage, no credential management
- **JWT sessions** — signed tokens, not guessable session IDs
- **CSRF protection** — built into Auth.js via state parameter and PKCE
- **Middleware route guards** — unauthenticated users cannot access protected pages

### Data Protection
- **Prisma ORM** — parameterized queries prevent SQL injection
- **Environment variables** — secrets (OAuth credentials, database URL, auth token) stored in env vars, never committed
- **HTTPS** — enforced in production (Vercel default)
- **Input validation** — Zod schemas validate all user input (game creation, guess submission)

### Third-Party Services

| Service | Data Shared | Purpose |
|---------|-------------|---------|
| **Google OAuth** | Email, name, avatar | Authentication |
| **Turso** | All app data | Database hosting |
| **Mapillary** | None (public API) | Street-level imagery |
| **Vercel** | App code, env vars | Hosting & deployment |

No user data is sent to Mapillary — the API is used to fetch publicly available street-level images by location coordinates.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Database connection string |
| `TURSO_AUTH_TOKEN` | Production | Turso database auth token |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (must be random, 32+ chars) |
| `NEXTAUTH_URL` | Yes | App base URL |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth secret |
| `MAPILLARY_ACCESS_TOKEN` | Yes | Mapillary API token (server-side) |
| `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN` | Yes | Mapillary API token (client-side) |

## Project Structure

```
src/
  app/
    (auth)/login/       # Login page (OAuth buttons)
    (main)/             # Authenticated pages (dashboard, play, profile, leaderboard)
    api/auth/           # Auth.js API routes
    api/games/          # Game CRUD API
    page.tsx            # Landing page
  components/
    auth/               # Auth UI components
    game/               # Game components (panorama viewer, guess map, timer)
    layout/             # Navbar
  lib/
    auth.ts             # Auth.js configuration
    db.ts               # Prisma client singleton
    validations.ts      # Zod schemas
  generated/prisma/     # Generated Prisma client
prisma/
  schema.prisma         # Database schema
  seed.ts               # Seed script for locations
```

## Future Considerations: Multiplayer

Architecture notes for eventual multiplayer support:

### Game Rooms
- New `GameRoom` model with invite codes and room state
- `PlayerInRoom` join table linking users to rooms
- Both players see the same 5 locations per round

### Real-Time Communication
- **WebSocket** or **Server-Sent Events** for live score updates
- Options: Partykit, Pusher, or Vercel's Edge runtime with streaming
- Each room needs a shared timer and round progression

### Schema Additions (Future)
```
GameRoom: id, code, hostId, status, mode, createdAt
PlayerInRoom: roomId, userId, score, joinedAt
```

### Considerations
- Keep the existing single-player flow intact
- Multiplayer as an additional game mode, not a replacement
- Consider latency — all players should receive location reveals simultaneously
- Leaderboard may need filtering (solo vs. multiplayer scores)
