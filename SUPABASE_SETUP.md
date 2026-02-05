# Supabase Setup & Completion Guide

## Current Status
✅ **Completed:**
- Supabase auth context + hooks created
- Session persistence logic (with 10-min enforcement)
- Streak calculation algorithm
- Leaderboard ranking logic
- Auth UI component
- Leaderboard display component
- Main page integrated with Supabase
- @supabase/supabase-js package installed

⏳ **Remaining Steps:**
1. Create Supabase project
2. Configure environment variables
3. Create database tables & RLS policies
4. Test authentication
5. Test session saving and streaks
6. Deploy (optional)

---

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up or log in with your email
3. Click "New project"
4. Enter a **Project Name** (e.g., "tracker-app")
5. Set a **Database Password** (save this somewhere safe)
6. Choose a **Region** closest to you
7. Click "Create new project" and wait ~2 minutes for it to initialize

---

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings > API**
2. Find these two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy both values

---

## Step 3: Configure Environment Variables

1. In the project root (`/Users/ruan/Docs/RevisionApp`), create a file named `.env.local` (or copy from `.env.local.example`)
2. Paste your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Save the file

---

## Step 4: Create Database Tables

1. In Supabase, go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `SUPABASE_SCHEMAS.sql` from the project root
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait for confirmation that all tables were created

**What this creates:**
- `user_profiles` table — stores user streaks and email
- `study_sessions` table — stores session data with timestamps
- Row-Level Security (RLS) policies — ensures users can only see their own data
- Trigger — automatically creates user profile when user signs up

---

## Step 5: Enable Auth

1. In Supabase, go to **Authentication > Providers**
2. Find "Email" and ensure it's **enabled** (it's on by default)
3. Go to **Settings > Email Templates** to check signup/login emails (optional)

---

## Step 6: Test the App

### Start the dev server:
```bash
npm run dev
```
The app runs at [http://localhost:3000](http://localhost:3000)

### Test signup:
1. Click "Sign Up"
2. Enter an email and password (min 6 characters)
3. You should see the dashboard after signup
4. Check Supabase > Authentication > Users to verify the user was created

### Test session saving:
1. Click "Start Session"
2. Wait at least 10 minutes (or speed up for testing by changing `DEFAULT_SESSION_LENGTH` in page.tsx)
3. Click "Stop Session"
4. Check Supabase > Table Editor > `study_sessions` — should see a new row
5. Check `user_profiles` — `current_streak` should be 1

### Test streaks:
1. Create sessions on 2 consecutive days
2. Check `user_profiles` — `current_streak` should be 2
3. Skip a day, then create another session
4. `current_streak` should reset to 1

### Test leaderboard:
1. Create multiple user accounts
2. Have each user create sessions
3. The leaderboard should rank them by weekly minutes

---

## File Overview

### New Files Created:
- `src/lib/supabase.ts` — Supabase client initialization
- `src/lib/auth.tsx` — Auth context provider and useAuth hook
- `src/lib/sessions.ts` — Session save logic, streak calculation
- `src/lib/leaderboard.ts` — Leaderboard queries
- `src/components/AuthScreen.tsx` — Sign up / Sign in form UI
- `src/components/Leaderboard.tsx` — Leaderboard display component
- `SUPABASE_SCHEMAS.sql` — Database schema definitions
- `.env.local` — Your Supabase credentials (create this)

### Updated Files:
- `src/app/page.tsx` — Now shows AuthScreen if not logged in, integrates Supabase
- `src/app/layout.tsx` — Wrapped in AuthProvider

---

## Key Features

### Authentication
- Email/password signup and signin
- Automatic user profile creation on signup
- Session persistence (JWT tokens)
- Sign out button in header

### Session Tracking
- 10-minute minimum enforcement
- Accurate float duration storage (seconds / 60)
- Displays as formatted minutes ("X min" or "< 1 min")
- Saved to Supabase with timestamps

### Streaks
- Automatically calculated on session save
- Current streak = consecutive days with sessions
- Longest streak = best consecutive days ever
- Resets if a day is missed

### Leaderboard
- Top 10 users by minutes in last 7 days
- Shows: rank, email (prefix), weekly minutes, current streak
- Updates in real-time as sessions are saved

### Mobile & PWA
- Installable to home screen
- Works offline (via service worker)
- Fully responsive design
- Space-themed dark UI

---

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not configured"
→ Make sure `.env.local` exists and has correct values. Restart `npm run dev`.

### "User already exists" error during signup
→ That email is already registered. Try signing in instead.

### Sessions not saving
→ Check browser console for errors. Verify Supabase RLS policies allow inserts.

### Leaderboard shows empty
→ Make sure other users have created sessions with durations ≥ 10 minutes.

### Streaks not updating
→ Check `study_sessions` table — sessions must have `duration_min` ≥ 10 to count.

---

## Next Steps (Optional)

- **Customize timer length:** Edit `DEFAULT_SESSION_LENGTH` in `src/app/page.tsx`
- **Customize daily goal:** Edit `DAILY_GOAL` in `src/app/page.tsx`
- **Change UI colors:** Modify Tailwind classes in components
- **Deploy:** Use Vercel, Netlify, or any hosting platform
- **Add more features:** Notifications, social sharing, advanced analytics

---

## Questions?
Check the inline comments in each file for detailed explanations of the code logic, especially in:
- `src/lib/sessions.ts` — Streak calculation algorithm
- `src/lib/leaderboard.ts` — Aggregation and ranking logic
