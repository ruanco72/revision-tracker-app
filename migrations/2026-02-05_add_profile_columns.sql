-- SQL migration for Supabase SQL Editor
-- Adds display_name and avatar columns to user_profiles

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar text;

-- Optional: backfill avatar/display_name for existing users if desired.
