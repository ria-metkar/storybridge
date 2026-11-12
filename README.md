# StoryBridge: Bilingual Storybook & Audio Subscription

Physical bilingual picture books delivered monthly, paired with synchronized native-speaker audio for children in multicultural homes.

**Stack (team standard):** Next.js (frontend) · Node.js + Express (API) · MongoDB (Mongoose)

## Live

| Part | Where | URL |
| ---- | ----- | --- |
| Frontend | Vercel (Hobby, free) | https://storybridge-tau.vercel.app |
| API | Render (free web service, Singapore) | https://storybridge-api.onrender.com |
| Database | MongoDB Atlas (M0, free) | — |

- Render redeploys the API automatically on every push to `main`. It's configured by [`render.yaml`](render.yaml), with env vars set in the Render dashboard.
- The frontend is deployed with `vercel deploy --prod` from `frontend/`. `API_URL` is set in the Vercel project settings.
- The Atlas IP access list allows only Render's Singapore outbound ranges (`74.220.52.0/24`, `74.220.60.0/24`). Update it if the service moves region.
- The free Render instance sleeps after about 15 minutes idle, so the first request after that takes roughly 30–60 seconds.

## Features

- **Catalogue**: every book is printed in two languages (e.g. English ⇄ Spanish, English ⇄ हिन्दी). You can filter by language and child's age.
- **Subscriptions**: three plans (1, 2 or 4 books/month). Customers pick a language pair and shipping address, and can pause, resume, cancel or change plan.
- **Child profiles**: each child has an age and a language pair, and books are matched to them.
- **Read-along player** (`/listen/<CODE>`): each physical book has an audio code (and QR code) inside the back cover.
  - It plays recorded narration and highlights each line in sync using per-line timestamps.
  - Readers can show both languages or focus on one; the other language is skipped during playback.
  - It has a speed control and turns pages automatically.
  - If a page has no recording yet, it falls back to on-device speech synthesis.
- **Access control**: free samples are public. Other books need a subscription with paid time left. Cancelled subscriptions keep access until the end of the paid period.
- **Admin**:
  - A stats dashboard (customers, active subs, MRR).
  - "Build monthly boxes", which picks the next unsent, age-matched books for each subscriber's language pair. Running it twice doesn't create duplicates.
  - A shipment workflow (pending → shipped → delivered, with tracking numbers).
  - Book CRUD and a subscriber list.
- **Security**:
  - JWT in an httpOnly, SameSite cookie, with bcrypt password hashing.
  - Role-based authorization.
  - zod validation on every input.
  - helmet, CORS and rate limiting.
  - One central error handler that returns consistent `{ error: { message, code, details } }` responses.

## Prerequisites

- **Node.js 20+** (https://nodejs.org)
- **MongoDB**: run it locally (https://www.mongodb.com/try/download/community) or use a free MongoDB Atlas cluster.

## Getting started

```bash
# 1. Install dependencies (root, backend, frontend)
npm run install:all

# 2. Configure environment
cp backend/.env.example backend/.env        # set MONGODB_URI and JWT_SECRET
cp frontend/.env.example frontend/.env.local

# 3. Seed plans, sample books, an admin and a demo customer
npm run seed

# 4. Run API (http://localhost:5000) and web (http://localhost:3000) together
npm run dev
```

> Running `npm run seed` resets the plans and books collections.

### Demo accounts (created by the seed)

| Role     | Email                     | Password      |
| -------- | ------------------------- | ------------- |
| Admin    | `admin@storybridge.test`  | `Admin12345`  |
| Customer | `parent@storybridge.test` | `Parent12345` |

The demo customer has an active English ⇄ Spanish subscription. To try the full flow:

1. Log in as admin and go to **Admin → Overview → Build boxes**.
2. Log in as the customer. The box appears under **My account → Your books**, with **Read along** links.

The free sample is at `/listen/MOON-ES`.

## Project structure

```
backend/
  src/
    config/        env loading/validation, Mongo connection
    constants/     supported languages
    models/        User (+children), Book (+pages/lines), Plan, Subscription, Shipment
    validators/    zod schemas per domain
    middleware/    auth (requireAuth/optionalAuth/requireRole), validate, rate limit, errors
    controllers/   auth, books, plans, subscriptions, users, admin
    routes/        Express routers mounted under /api
    services/      billing (mock payment + renewal)
    app.js         Express app factory · server.js entry · seed.js
frontend/
  app/             Next.js App Router pages (books, listen, plans, subscribe, account, admin)
  components/      ReadAlongPlayer, BookCover/BookCard, Navbar, AddressFields, ui primitives
  context/         AuthContext
  hooks/           useApi, useRequireAuth
  lib/             api client, languages, formatting
```

Next.js proxies `/api/*` to Express (see `frontend/next.config.mjs`), so the auth cookie is first-party and there is no cross-origin cookie setup.

## API

| Method | Path | Auth | Purpose |
| ------ | ---- | ---- | ------- |
| POST | `/api/auth/register` · `/login` · `/logout` | — | Session management |
| GET | `/api/auth/me` | optional | Current user, or `null` |
| GET | `/api/books?q=&lang=&age=&page=&limit=` | — | Catalogue (no page content) |
| GET | `/api/books/:slug` | — | Book details |
| GET | `/api/books/listen/:code` | sample or subscriber | Full book with pages and narration timing |
| GET | `/api/plans` | — | Active plans |
| GET / POST / PATCH | `/api/subscriptions/me`, `/api/subscriptions` | user | View, create, update (`action: pause\|resume\|cancel`, plan, languages, address) |
| GET / POST / DELETE | `/api/users/me/children[/:childId]` | user | Child profiles |
| GET | `/api/users/me/shipments` | user | Your boxes and books |
| GET | `/api/admin/stats` | admin | Dashboard numbers |
| GET / POST / PUT / DELETE | `/api/admin/books[/:id]` | admin | Book CRUD |
| GET / POST / PUT | `/api/admin/plans[/:id]` | admin | Plan management |
| GET | `/api/admin/subscriptions` | admin | All subscriptions |
| GET / PATCH | `/api/admin/shipments[/:id]` | admin | List and advance shipments |
| POST | `/api/admin/shipments/generate` | admin | Build a month's boxes (`{ period: "YYYY-MM" }`) |

## Audio sync format

Each book page looks like this:

```json
{
  "number": 1,
  "illustration": "🌙",
  "audioUrl": "https://cdn.example.com/moon-es/p1.mp3",
  "lines": [
    { "lang": "en", "text": "Every night, the moon visits the old mango tree.", "start": 0.0, "end": 3.4 },
    { "lang": "es", "text": "Cada noche, la luna visita el viejo árbol de mango.", "start": 3.6, "end": 7.2 }
  ]
}
```

- `start`/`end` are in seconds into that page's audio and drive the highlighting.
- If `audioUrl` is left empty, the player narrates the page with the browser's speech synthesis.
- The seeded books have no recordings, so they use speech synthesis.

## Not production-ready yet

- **Payments are mocked** in `backend/src/services/billing.js`. Replace them with Stripe Subscriptions and webhooks before taking real payments.
- **Audio files** need storage (e.g. S3 or Cloudinary) and an upload flow in the admin. Today the admin accepts an `audioUrl`.
- **Missing account features**: email verification, password reset and transactional emails (shipment notifications).
