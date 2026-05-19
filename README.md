# GrowTogether 🌿

A local marketplace where neighbors buy, sell, and trade plants, cuttings, seeds, herbs, fruit trees, vegetables, and homegrown produce.

Built with **Next.js 15**, **Tailwind CSS 4**, and **Supabase** (Auth, Postgres, Storage, Realtime).

## Features

- User sign up and login (email/password)
- User profiles with bio and location
- Create listings with multiple image uploads
- Browse, search, and filter by category
- Listing detail pages
- Message sellers (real-time chat)
- Save/favorite listings
- Mark listings as sold

## Project structure

```
grow-together/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home / browse listings
│   │   ├── login/              # Auth
│   │   ├── signup/
│   │   ├── auth/callback/      # OAuth / email confirm callback
│   │   ├── listings/
│   │   │   ├── new/            # Create listing
│   │   │   └── [id]/           # Listing detail
│   │   ├── profile/
│   │   │   ├── [username]/     # Public profile
│   │   │   └── edit/           # Edit own profile
│   │   ├── favorites/          # Saved listings
│   │   └── messages/           # Inbox & threads
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   ├── listings/           # Cards, search, filters, actions
│   │   ├── messages/           # Chat thread
│   │   └── ui/                 # Button, Input, Badge, etc.
│   └── lib/
│       ├── constants.ts        # Categories, helpers
│       ├── types/database.ts   # TypeScript types
│       └── supabase/           # Client, server, middleware
├── supabase/migrations/        # SQL schema & RLS policies
├── public/
└── .env.example
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (20+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project (free tier works)

## Setup

### 1. Clone and install dependencies

```bash
cd grow-together
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Wait for the database to finish provisioning.

### 3. Run the database migration

1. Open **SQL Editor** in your Supabase dashboard.
2. Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it.
3. Copy and run `supabase/migrations/002_enable_realtime.sql` for live messaging.
4. Copy and run `supabase/migrations/003_avatar_storage.sql` for profile picture uploads.

Alternatively, if you use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 4. Configure authentication

In Supabase → **Authentication** → **Providers**:

- Enable **Email** provider.
- For local development, you may disable **Confirm email** under Email settings so sign-ups work immediately.

Add your site URL under **Authentication** → **URL Configuration**:

| Setting            | Local development      |
|--------------------|------------------------|
| Site URL           | `http://localhost:3000` |
| Redirect URLs      | `http://localhost:3000/auth/callback` |

### 5. Verify storage

The migration creates a public `listing-images` bucket. Confirm it exists under **Storage** in the dashboard.

### 6. Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values**

1. Supabase dashboard → **Project Settings** → **API**
2. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **Security note:** Only the `anon` key belongs in `.env.local`. Never commit `.env.local` or expose the `service_role` key in client-side code.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key for client & server |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only admin key (not used in MVP) |

## Categories

- Indoor plants
- Outdoor plants
- Fruit trees
- Herbs
- Vegetables
- Seeds
- Cuttings
- Homegrown produce
- Gardening supplies

## Database schema overview

| Table | Purpose |
|-------|---------|
| `profiles` | User public profile (linked to `auth.users`) |
| `listings` | Marketplace posts with full-text search |
| `listing_images` | Image URLs per listing |
| `favorites` | Saved listings per user |
| `conversations` | Buyer–seller threads per listing |
| `messages` | Chat messages (Realtime-enabled) |

Row Level Security (RLS) is enabled on all tables. Users can only edit their own data; active listings are publicly readable.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the same environment variables from `.env.local`.
4. Update Supabase **Redirect URLs** with your production domain.

### Other hosts

Any platform that supports Next.js 15 works. Set `NEXT_PUBLIC_*` env vars and run `npm run build` + `npm run start`.

## Troubleshooting

**Sign-up works but profile is missing**  
Re-run `001_initial_schema.sql` — the `handle_new_user` trigger creates profiles automatically.

**Image upload fails**  
Check that the `listing-images` bucket exists and storage policies were applied.

**Profile photo upload fails**  
Run `003_avatar_storage.sql` and confirm the `avatars` bucket exists under **Storage**.

**Messages don't update live**  
Run `002_enable_realtime.sql` and confirm Realtime is enabled for the `messages` table in Supabase → **Database** → **Replication**.

**Search returns no results**  
Full-text search uses English stemming. Try simpler keywords or browse by category.

## License

MIT
