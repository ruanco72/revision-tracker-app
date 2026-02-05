# Quick Reference: Supabase Integration

## 3-Minute Setup

### Step 1: Get Credentials
→ https://app.supabase.com > Create project > Settings > API > Copy 2 values

### Step 2: Update `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=<your_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key>
```

### Step 3: Create Tables
→ Supabase SQL Editor > Copy all of `SUPABASE_SCHEMAS.sql` > Run

### Step 4: Start App
```bash
npm run dev
```

---

## API Reference

### `useAuth()` — Get current user
```tsx
const { user, loading, signIn, signUp, signOut } = useAuth();
```

### `saveSession(userId, durationMin)` — Save a study session
```tsx
await saveSession({
  userId: user.id,
  durationMin: 25.5
});
```

### `getTodayTotalMinutes(userId)` — Get today's minutes
```tsx
const mins = await getTodayTotalMinutes(user.id);
```

### `getWeeklySessionCount(userId)` — Get weekly sessions
```tsx
const count = await getWeeklySessionCount(user.id);
```

### `getLeaderboard()` — Get top 10 users
```tsx
const users = await getLeaderboard();
// [{ rank, userId, userEmail, weeklyMinutes, currentStreak }]
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `user_profiles` | Stores user streaks |
| `study_sessions` | Stores session data |

---

## Key Features

✅ Email/password auth  
✅ Session persistence (Supabase)  
✅ Automatic streaks  
✅ Real-time leaderboard  
✅ 10-minute minimum enforcement  
✅ Mobile-first responsive design  
✅ PWA (installable)  

---

## Testing

```bash
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Check for issues
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase URL not configured" | Update `.env.local` and restart dev server |
| Sign up fails | Password must be 6+ chars |
| Sessions not saving | Check Supabase > study_sessions table |
| Leaderboard empty | Other users must create sessions |
| Streaks = 0 | Sessions must be ≥10 minutes |

---

## Files Overview

```
src/
├── app/page.tsx                  ← Main dashboard (Supabase integrated)
├── lib/auth.tsx                  ← Authentication
├── lib/sessions.ts               ← Session & streak logic
├── lib/leaderboard.ts            ← Leaderboard queries
└── components/
    ├── AuthScreen.tsx            ← Login/signup form
    └── Leaderboard.tsx           ← Top 10 display

SUPABASE_SCHEMAS.sql              ← Run in Supabase SQL Editor
```

---

## What's Working

✅ Build system (npm run build succeeds)  
✅ TypeScript compilation (no errors)  
✅ All imports resolved  
✅ Components ready to use  
✅ Auth context configured  
✅ Database schema ready (pending credentials)  

---

## Next: Real Credentials

1. Sign up at https://app.supabase.com
2. Create a project
3. Copy API keys
4. Update `.env.local`
5. Run SUPABASE_SCHEMAS.sql
6. Test!

See SUPABASE_SETUP.md for detailed instructions.
