## Deploying Team Pulse

### Step 1 — Render (backend)
- Set all env vars from apps/api/.env.example
- Set GOOGLE_CALLBACK_URL to https://your-render-url.onrender.com/api/auth/google/callback
- Set CLIENT_URL to your Vercel frontend URL
- Build command: pnpm --filter api build:render
- Start command: pnpm --filter api start

### Step 2 — Google Cloud Console
- Add the Render callback URL to Authorised redirect URIs
- Add the Vercel frontend URL to Authorised JavaScript origins

### Step 3 — Vercel (frontend)
- Set NEXT_PUBLIC_API_URL to your Render backend URL
- Framework preset: Next.js
- Root directory: apps/web

### Step 4 — Neon database
- Copy the connection string to DATABASE_URL in Render env vars
- Migrations run automatically on deploy via prisma migrate deploy
