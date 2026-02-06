-- Migration: Add display_name and avatar columns to user_profiles table
-- Date: 2026-02-06
-- Purpose: Support user profile customization with display names and emoji avatars

-- Add display_name column (nullable, will default to email prefix if not set)
ALTER TABLE public.user_profiles
ADD COLUMN display_name TEXT;

-- Add avatar column (nullable, will default to '🔥' if not set)
ALTER TABLE public.user_profiles
ADD COLUMN avatar TEXT;

-- Optional: Add a trigger to update updated_at timestamp
-- This ensures that any update to user_profiles automatically updates the timestamp
CREATE OR REPLACE FUNCTION public.update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- Create trigger to auto-update the updated_at column
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profiles_timestamp();
