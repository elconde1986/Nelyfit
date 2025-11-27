# NelyFit – Duolingo-style Fitness Coaching (Demo)

This repo is a **demo implementation** of the NelyFit concept:

- Coaches manage programs, workouts and clients.
- Clients get a **Duolingo-style day view** with:
  - XP, levels, streaks, badges
  - Short, satisfying habit + workout completions
  - Program map (lesson-style tree)
- Basic coach dashboard & template marketplace stubs.
- Postgres via Prisma + Docker, ready for local dev and Vercel deployment.

It is intentionally simplified so you can run it locally quickly and then extend.

---

## 1. Tech stack

- **Next.js 14** (App Router, TypeScript)
- **React 18**
- **Prisma** ORM
- **PostgreSQL**
- **Docker + docker-compose** (for local DB + app)
- Minimal Tailwind-like utility classes in CSS (no Tailwind config wired – you can add it later)

Auth here is **demo-style** (no real login). We seed:

- `coach@nelyfit.demo` – demo coach
- `client@nelyfit.demo` – demo client

All main flows are wired against these demo identities.

---

## 2. Environment variables

Copy the example env file:

```bash
cp .env.example .env
```

For Docker, a dedicated file is already included:

- `.env.docker` – used by `docker-compose.yml`

You can leave defaults as-is for local dev:

```bash
DATABASE_URL=postgresql://nelyfit:nelyfit@localhost:5434/nelyfit?schema=public
```

---

## 3. Running locally (no Docker for app)

### 3.1. Start Postgres (option A: Docker for DB only)

From the project root:

```bash
docker compose up db -d
```

This launches **Postgres 16** on `localhost:5434` with credentials:

- user: `nelyfit`
- password: `nelyfit`
- database: `nelyfit`

### 3.2. Install dependencies

```bash
npm install
```

### 3.3. Run Prisma migrations + seed

```bash
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts
```

> If you don’t have `ts-node` globally, install it:

```bash
npm install --save-dev ts-node
```

### 3.4. Start the dev server

```bash
npm run dev
```

Then open: <http://localhost:3000>

- **Home**: overview with links to:
  - `/coach/dashboard`
  - `/client/today`
- **Client today**: XP, levels, streaks, habits, gamified phrases, confetti.
- **Client program map**: simple “lesson tree” for current program.
- **Client badges**: badge gallery with locked/unlocked states.
- **Coach dashboard**: overview of demo coach + demo client.
- **Coach templates**: stub for template marketplace.

---

## 4. Running everything via Docker & docker-compose

If you want to test the full stack in containers (app + DB):

1. Make sure **no local Postgres** is already using port `5434` or `3000`.

2. Build and start:

```bash
docker compose up --build
```

This will:

- Build the Next.js app image (`Dockerfile`).
- Start the Postgres container (`db` service).
- Start the app container (`app` service) on `http://localhost:3000`.

The app container runs:

- `npx prisma migrate deploy` to apply migrations.
- `npm run start` to serve the built app.

> If you change the Prisma schema, rebuild:

```bash
docker compose down
docker compose up --build
```

---

## 5. Deploying to Vercel

Here’s a high-level guide to get this demo running on Vercel.

### 5.1. Push this repo to GitHub

Create a new repo and push the contents of this project:

```bash
git init
git add .
git commit -m "Initial NelyFit demo"
git branch -M main
git remote add origin git@github.com:<your-user>/<your-repo>.git
git push -u origin main
```

### 5.2. Create a Postgres database for production

You have two main options:

1. **Vercel Postgres** (recommended for simplicity), or  
2. An external Postgres instance (RDS, Supabase, etc.)

Whatever you choose, copy the connection URL and set it as `DATABASE_URL`.

### 5.3. Create a new Vercel project

1. Go to Vercel dashboard → **New Project**.
2. Import your GitHub repo.
3. In the **Environment Variables** section, add:

   - `DATABASE_URL` → your production Postgres URL

4. Deploy.

### 5.4. Run Prisma migrations on Vercel

There are several ways; a simple approach:

- Locally, set `DATABASE_URL` to point to your production DB and run:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

> This applies migrations and runs the seed script against the production database.

Then trigger a **redeploy** in Vercel so the app code matches the DB structure.

---

## 6. Where to extend

This demo intentionally includes:

- Core **Prisma models**:
  - User, Client, Program, ProgramDay, Workout, Exercise
  - CompletionLog, GamificationProfile
  - ChatMessage, CoachNote, Notification
  - ProgramTemplate (+ Day), Team, TeamMember
- Core **client flows**:
  - `/client/today` – XP, levels, streaks, badges, confetti, habits, workout.
  - `/client/program-map` – Duolingo-style day graph.
  - `/client/badges` – badge gallery.
- Core **coach flows** (simplified/stubbed):
  - `/coach/dashboard` – quick stats, “on fire” clients concept.
  - `/coach/templates` – template marketplace stub.

Features described in the higher-level design that you can build on top:

- Real **auth** (NextAuth or your own) with coach/client roles.
- Full **coach inbox** (unread messages, nudge suggestions based on streaks).
- Full **chat** between coach and client.
- Full **program planner** with auto-templates (3x/week, 5x/week).
- Full **program marketplace**, with:
  - Save program as template
  - Public / team / private visibility
  - Using templates to instantiate new programs.

The schema and file layout are set up so you can layer those features in without refactoring the foundation.

---

## 7. TL;DR – Quick start

```bash
# 1. Install deps
npm install

# 2. Start DB in Docker
docker compose up db -d

# 3. Migrate & seed
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts

# 4. Run dev server
npm run dev

# 5. Open
http://localhost:3000
```

You now have a working **NelyFit demo** you can extend, containerize and deploy to Vercel.
