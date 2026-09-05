# ABHI-KUNI — ଅବିନାଶ ରଥ

A personal website showcasing Odia music lyrics and writings by **ଅବିନାଶ ରଥ**.

## Features
- 🔤 Noto Sans Odia font for all lyrics
- 🎨 AI-generated artwork per song (Google Gemini)
- 🌙 Light/dark mode
- 📂 Browse by category (ଗୀତ / ଭଜନ / ଲୋକ) and date
- 🖨️ Print / PDF export
- 🔗 Social sharing
- 🔐 Password-protected admin panel to add/edit/delete songs

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/migration.sql`
3. Go to **Storage** → create a bucket named `song-artwork` → set to **Public**
4. Copy your project URL, anon key, and service role key from **Settings → API**

### 3. Set up environment variables
Copy `.env.local` and fill in your keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_PASSWORD=YOUR_SECRET_PASSWORD
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
Get your Gemini API key from: https://aistudio.google.com/app/apikey

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 5. Admin panel
Go to http://localhost:3000/admin and enter your admin password.

## Deploy to Vercel
```bash
npx vercel
```
Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (PostgreSQL + Storage)
- Google Gemini AI (image generation)
- Lucide Icons
- next-themes (dark mode)
