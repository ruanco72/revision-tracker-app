# Database Migration & Code Alignment Guide

## Issue
Supabase errors:
- "Could not find the 'avatar' column of 'user_profiles' in the schema cache"
- "column user_profiles_1.display_name does not exist"

Root cause: The Next.js code was trying to use `display_name` and `avatar` columns that didn't exist in the database schema.

## Solution Applied

### A) DATABASE MIGRATION

**SQL Migration File:** `migrations/2026-02-06_add_profile_columns.sql`

Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Migration: Add display_name and avatar columns to user_profiles table
-- Date: 2026-02-06
-- Purpose: Support user profile customization with display names and emoji avatars

-- Add display_name column (nullable, will default to email prefix if not set)
ALTER TABLE public.user_profiles
ADD COLUMN display_name TEXT;

-- Add avatar column (nullable, will default to '🔥' if not set)
ALTER TABLE public.user_profiles
ADD COLUMN avatar TEXT;

-- Add trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profiles_timestamp();
```

**After running migration:**
1. Wait **1-2 minutes** for Supabase schema cache to refresh (or restart your dev server)
2. If cache doesn't refresh automatically, re-open the table in Supabase dashboard (it will show the new columns)
3. Verify: Query the table and confirm `display_name` and `avatar` columns exist

### B) CODE UPDATES

**Files Updated:**

1. **src/components/ProfileModal.tsx**
   - Now includes `email` in the profile select to use as fallback display name
   - Falls back to email prefix if no display_name set
   - Falls back to '🔥' emoji if no avatar set
   - Trims display name on save to prevent whitespace issues

2. **src/lib/leaderboard.ts**
   - Updated fallback logic to use email prefix when display_name is null
   - Updated fallback avatar to '🔥' emoji when avatar is null
   - Applied consistently in both code paths (admin API and fallback)

3. **SUPABASE_SCHEMAS.sql** (reference only)
   - Updated table definition to include new columns
   - Added updated_at trigger definition

**Key Changes:**
- ProfileModal now fetches `email` alongside `display_name` and `avatar`
- Leaderboard uses email prefix as fallback display name
- Both use '🔥' as fallback avatar
- No crashes on null values

### C) BACKWARD COMPATIBILITY

Existing user_profiles rows (without display_name/avatar):
- **Display Name:** Falls back to email prefix (e.g., "john" from "john@example.com")
- **Avatar:** Falls back to '🔥' emoji
- **No data loss:** Existing `user_id`, `email`, `current_streak`, `longest_streak` unaffected

New user signup flow:
- Profile created with `user_id` and `email`
- `display_name` and `avatar` remain NULL until user customizes in profile modal
- UI shows fallback values (email prefix + 🔥) until explicitly set

## Final Schema

```sql
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,                    -- NEW: nullable, falls back to email prefix
  avatar TEXT,                          -- NEW: nullable, falls back to '🔥'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing Checklist

- [ ] Run migration in Supabase SQL Editor
- [ ] Wait 1-2 minutes for schema cache refresh
- [ ] Refresh dev server: `npm run dev`
- [ ] Sign up new user → profile modal opens → save display name/avatar → no errors
- [ ] Edit profile → change display name and avatar → verify updates in leaderboard
- [ ] Existing users (before migration): profile shows email prefix as name, 🔥 as avatar
- [ ] Leaderboard displays correctly with fallback values
- [ ] `npm run build` succeeds with no errors
- [ ] Check browser console: no Supabase errors

## Commands to Run

```bash
# 1. Run migration in Supabase dashboard, then restart dev server
npm run dev

# 2. Verify build works
npm run build

# 3. Type check
npx tsc --noEmit
```

## Files Changed

| File | Change |
|------|--------|
| `migrations/2026-02-06_add_profile_columns.sql` | **NEW** - Migration file |
| `SUPABASE_SCHEMAS.sql` | Updated schema definition |
| `src/components/ProfileModal.tsx` | Added fallback logic, email fetch |
| `src/lib/leaderboard.ts` | Added fallback display name & avatar |

## Notes

- All existing functionality preserved
- No breaking changes
- Graceful degradation: UI works even if user hasn't set profile
- `updated_at` auto-updates on any profile change (via trigger)
- Schema change is one-way: adding columns only (safe to migrate)
