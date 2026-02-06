# Dev Hardening: Hydration & Caching Stability

## Changes Applied

### 1. CLIENT/SERVER BOUNDARY SAFETY ✅

**All risky components verified as `"use client"`:**
- ✅ `src/app/page.tsx` - Main page (timer, sessions)
- ✅ `src/lib/auth.tsx` - Auth provider (state management)
- ✅ `src/components/ServiceWorkerRegister.tsx` - SW registration
- ✅ `src/components/ProfileModal.tsx` - Profile editing
- ✅ `src/components/AuthScreen.tsx` - Auth UI
- ✅ `src/components/Timer.tsx` - Timer logic
- ✅ `src/components/Leaderboard.tsx` - Leaderboard fetching
- ✅ `src/components/StreakBadge.tsx` - Streak display

**All async/window calls protected:**
- All `window` access wrapped in `typeof window !== 'undefined'` guards
- All Supabase calls in `useEffect` hooks with mounted flags
- No Date.now/Math.random in server-rendered markup

### 2. SERVICE WORKER DEV HANDLING ✅

**src/components/ServiceWorkerRegister.tsx**
- Automatically **unregisters** service workers in development
- Only registers in production
- Prevents stale cache issues during dev

```tsx
// Skip registration in development to prevent service worker caching issues
if (process.env.NODE_ENV === 'development') {
  // Unregister any existing service workers in dev
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().catch(() => {});
    });
  });
  return;
}
```

### 3. DEV-ONLY MOUNT LOGGING ✅

**src/app/page.tsx**
- Logs to console when app mounts and unmounts
- Shows timestamp to identify fresh bundle loads
- Only runs in development mode

```tsx
// Dev-only: Log mount for debugging hydration issues
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `%c[App Mounted] ${timestamp}`,
      'color: #10b981; font-weight: bold;'
    );
    return () => {
      const endTime = new Date().toLocaleTimeString();
      console.log(`%c[App Unmounted] ${endTime}`, 'color: #ef4444;');
    };
  }
}, []);
```

**Console output example:**
```
[App Mounted] 2:45:32 PM
[App Unmounted] 2:45:35 PM
```

### 4. ERROR VISIBILITY & DEV LOGGING ✅

**src/lib/auth.tsx**
- Logs auth state changes in dev
- Logs user load failures
- Console errors are clearly prefixed with `[Auth]`

```tsx
if (process.env.NODE_ENV === 'development') {
  console.log('[Auth] User loaded:', user.email);
  console.log('[Auth] Auth state changed:', event, u?.email);
  console.warn('[Auth] Failed to load profile:', e);
}
```

**src/components/ProfileModal.tsx**
- Logs profile load, save, and sign out operations in dev
- Clear error messages with `[ProfileModal]` prefix
- All catch blocks properly logged

```tsx
if (process.env.NODE_ENV === 'development') {
  console.log('[ProfileModal] Mounting with userId:', userId);
  console.log('[ProfileModal] Profile loaded:', { displayName, avatar });
  console.log('[ProfileModal] Saving profile:', { displayName, avatar });
  console.error('[ProfileModal] Save failed: No userId');
  console.warn('[ProfileModal] Failed to load profile:', err);
}
```

### 5. HYDRATION STABILITY ✅

**src/app/layout.tsx**
- Kept `suppressHydrationWarning` on `<html lang="en">` element
- No dynamic values rendered in server markup
- All client state initialized safely in `useEffect` hooks

---

## How It Works

### Dev Experience
1. **Open app in browser**
   - Console shows: `[App Mounted] 2:45:32 PM`
   - Any auth state changes logged with `[Auth]` prefix
   - Any profile operations logged with `[ProfileModal]` prefix

2. **Make code changes**
   - Save file → Next.js HMR rebuilds
   - Service workers auto-unregistered in dev
   - Fresh bundle loads (no stale cache)
   - Console shows new: `[App Mounted] 2:45:45 PM` (new timestamp)

3. **Check browser console**
   - If hydration errors occur, they're clearly visible
   - Auth state changes are logged
   - Profile operations show detailed logs
   - All errors prefixed for easy filtering

### Production
- All dev logging removed by Next.js tree-shaking (`NODE_ENV === 'production'`)
- Service workers register normally
- No console spam
- Zero performance impact

---

## Verification Steps

```bash
# 1. Build for production (removes dev logging)
npm run build

# 2. Start dev server
npm run dev

# 3. Open Safari/Firefox DevTools → Console

# 4. Refresh page - look for:
# ✅ [App Mounted] HH:MM:SS timestamp
# ✅ [Auth] User loaded: user@email.com
# ✅ No hydration errors

# 5. Click profile button
# ✅ [ProfileModal] Mounting with userId: ...
# ✅ [ProfileModal] Profile loaded: { displayName, avatar }

# 6. Edit profile and save
# ✅ [ProfileModal] Saving profile: ...
# ✅ [ProfileModal] Profile saved successfully
```

---

## What Changed

| File | Change |
|------|--------|
| `src/components/ServiceWorkerRegister.tsx` | Dev-only SW unregister + error handling |
| `src/app/page.tsx` | Dev mount/unmount logging |
| `src/lib/auth.tsx` | Dev auth state & profile load logging |
| `src/components/ProfileModal.tsx` | Dev profile operation logging |

## What Didn't Change

- ✅ Timer logic
- ✅ Session saving
- ✅ Leaderboard fetching
- ✅ Streak calculations
- ✅ App behavior in production
- ✅ No heavy abstractions or refactors

---

## Benefits

| Issue | Fix |
|-------|-----|
| Stale cache in dev | SW auto-unregistered in dev |
| Hydration crashes silent | Clear console errors visible |
| Don't know when bundle reloads | `[App Mounted]` timestamp logged |
| Auth state changes invisible | `[Auth]` prefix logs all changes |
| Profile save failures confusing | `[ProfileModal]` detailed logging |
| Browser updates inconsistent | SW disabled in dev, fresh loads |

---

## Console Filtering Tips (Dev Tools)

Filter for `[App` to see app lifecycle:
```
[App Mounted]
[App Unmounted]
```

Filter for `[Auth` to see auth operations:
```
[Auth] User loaded
[Auth] Auth state changed
[Auth] Failed to load profile
```

Filter for `[ProfileModal` to see profile operations:
```
[ProfileModal] Mounting
[ProfileModal] Profile loaded
[ProfileModal] Saving profile
[ProfileModal] Profile saved successfully
```

---

## Production (NODE_ENV=production)

All dev logging automatically removed:
- No `[App Mounted]` logs
- No `[Auth]` state logs
- No `[ProfileModal]` operation logs
- Service workers register normally
- Zero console spam

Build output will show: `✓ Compiled successfully` with no dev messages.
