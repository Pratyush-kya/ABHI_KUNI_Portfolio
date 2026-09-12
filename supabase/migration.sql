-- ============================================================
-- ABHI-KUNI — Supabase Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS songs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  lyrics          TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('ଗୀତ')),
  author          TEXT NOT NULL DEFAULT 'Abinash Rath',
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON songs FOR SELECT USING (true);
CREATE POLICY "Admin write" ON songs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- After running SQL, also create the Storage bucket:
-- Supabase Dashboard → Storage → New Bucket
-- Name: song-artwork
-- Set to Public
-- ============================================================
