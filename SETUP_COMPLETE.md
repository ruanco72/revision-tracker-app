# Study Session Tracker - Complete Setup ✅

Your **minimal PWA study session tracker** is ready to use!

## 📋 Project Summary

A Next.js + React Progressive Web App that:
- ⏱️ Tracks study sessions with a live timer
- 📊 Shows daily progress toward a 60-minute goal
- 💾 Saves data to localStorage (persists across reloads)
- 📱 Works on mobile with big, touch-friendly buttons
- 📲 Installable to home screen as a native app
- 🔌 Works offline thanks to Service Worker caching

## ✨ Live Features

Your app is **currently running** at: **http://localhost:3000**

**Try it out:**
1. Click **"Start Session"** button
2. Watch the timer count up
3. Click **"Stop Session"** to end
4. See minutes added to "Today's Total"
5. Refresh the page - data persists!

## 📦 What's Included

### Source Files Created
```
src/
├── app/
│   ├── page.tsx                    # Main UI with buttons and stats
│   ├── layout.tsx                  # PWA setup and Service Worker registration
│   └── globals.css                 # Tailwind styling
├── components/
│   ├── Timer.tsx                   # Timer display (MM:SS format)
│   └── ServiceWorkerRegister.tsx   # Registers offline support
└── hooks/
    └── useLocalStorage.ts          # React hook for localStorage

public/
├── manifest.json                   # PWA installation config
└── sw.js                           # Service Worker (offline + caching)

Config Files
├── package.json                    # Dependencies: Next.js, React, Tailwind
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS setup
├── postcss.config.mjs              # PostCSS configuration
└── eslint.config.mjs               # Linting configuration
```

## 🚀 How to Run

### Terminal Commands

**Start development server:**
```bash
cd /Users/ruan/Docs/RevisionApp
npm run dev
```
- Opens at http://localhost:3000
- Auto-reloads on code changes
- Hot reload enabled

**Build for production:**
```bash
npm run build
npm start
```

**Check for code issues:**
```bash
npm run lint
```

### VS Code Shortcuts

- **Cmd+Shift+B** - Run default build task (dev server)
- **Cmd+J** - Open terminal panel
- **Cmd+\`** - Toggle VS Code terminal

## 📱 PWA Installation

### On iPhone (Safari)
1. Open http://localhost:3000
2. Tap Share button (box with arrow)
3. Select "Add to Home Screen"
4. Choose name and tap "Add"

### On Android/Mac Chrome
1. Open http://localhost:3000
2. Menu (⋯) → "Install app"
3. Or: Menu → "Add to Home Screen"
4. Complete installation

### Testing Offline
1. Open DevTools (Cmd+Option+I)
2. Network tab → Check "Offline" box
3. Refresh page - should still load!

## 🔧 Code Structure Explained

### Timer Component (`src/components/Timer.tsx`)
```typescript
// Displays time in MM:SS format
// Counts up by 1 second when isRunning=true
// Shows "Stop Session" button while running
// Passes back total minutes when stopped
```

**Key features:**
- Uses `setInterval` to increment every 1000ms
- Formats seconds to MM:SS
- Stops counting when button clicked
- Clears interval on unmount

### useLocalStorage Hook (`src/hooks/useLocalStorage.ts`)
```typescript
// Like useState, but syncs with localStorage automatically
// const [value, setValue] = useLocalStorage('key', default)
```

**Key features:**
- Loads from localStorage on mount
- Saves to localStorage on every update
- Works with any JSON-serializable data
- Prevents hydration mismatch in Next.js

### Main App (`src/app/page.tsx`)
```typescript
// Manages session state and daily totals
// Auto-resets at midnight
// Shows progress bar toward 60-minute goal
// Displays today's date
```

**Key features:**
- Tracks isRunning state
- Stores daily stats: { date, minutes }
- Detects date change, auto-resets
- Shows "Goal reached!" when ≥60 minutes

### Service Worker (`public/sw.js`)
```javascript
// Registers app for offline use
// Caches files for quick loading
// Serves from cache, falls back to network
```

**Key features:**
- Installs and activates automatically
- Caches app shell on first load
- Serves from cache first
- Updates cache from network

## 💾 Data Storage

**localStorage Key:** `"studySession"`

**Data Format:**
```json
{
  "date": "2025-02-05",
  "minutes": 45
}
```

**How to inspect:**
1. DevTools (Cmd+Option+I)
2. Application tab
3. Local Storage → http://localhost:3000
4. Look for "studySession" entry

## 🎨 Customization Quick Guide

### Change Daily Goal
**File:** `src/app/page.tsx` (line ~31)
```typescript
const DAILY_GOAL = 60; // Change this number
```

### Change Theme Color (Blue → Other)
**Three places to update:**

1. `src/app/layout.tsx` (line ~25)
```html
<meta name="theme-color" content="#3b82f6" /> <!-- Change hex color -->
```

2. `public/manifest.json` (line ~7)
```json
"theme_color": "#3b82f6", <!-- Change hex color -->
```

3. `src/app/page.tsx` - Replace `blue-500`, `blue-600` with other Tailwind colors

### Change App Name
**Files:**
- `public/manifest.json` - Update `"name"` and `"short_name"`
- `src/app/layout.tsx` - Update `title` in metadata

## 🐛 Troubleshooting

**Q: App not loading?**
- Check http://localhost:3000 in browser
- Check terminal for errors: `npm run dev` should show "Ready in Xms"
- Hard refresh: Cmd+Shift+R

**Q: Data not saving?**
- Open DevTools → Application → Storage → Clear all
- Refresh page
- Check that "studySession" appears in Local Storage

**Q: Service Worker not working?**
- DevTools → Application → Service Workers → Unregister
- Restart server: Ctrl+C, then `npm run dev`
- Hard refresh: Cmd+Shift+R

**Q: Timer not counting?**
- Check browser console (Cmd+Option+I)
- Look for red error messages
- Try a different browser if issue persists

## 📚 Key Files to Know

| File | Purpose | Edit for |
|------|---------|----------|
| `src/app/page.tsx` | Main UI and logic | Layout, buttons, stats display |
| `src/components/Timer.tsx` | Timer display | Timer styling and behavior |
| `src/hooks/useLocalStorage.ts` | Data persistence | Storage logic (rarely change) |
| `public/manifest.json` | PWA config | App name, colors, icons |
| `package.json` | Dependencies | Add packages with `npm install ...` |
| `README.md` | Full documentation | Reference for details |

## 🚀 Next Steps

### To Extend This App
1. **Add weekly stats** - Track multiple days
2. **Add notifications** - Sound alerts at goal reached
3. **Add dark mode** - System preference detection
4. **Add export** - Download data as CSV
5. **Add backend sync** - Save to cloud (requires server)

### To Deploy
1. **Vercel (easiest)** - `npm i -g vercel && vercel`
2. **GitHub Pages** - Push to GitHub, enable Pages
3. **Your own server** - `npm run build && npm start`

## 📖 Learning Resources

**Inside this project:**
- Detailed comments in every source file
- See `README.md` for full documentation
- See `QUICKSTART.md` for quick reference

**External:**
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)

## 🎯 Project Files Checklist

✅ `package.json` - Dependencies configured
✅ `src/app/page.tsx` - Main app page
✅ `src/app/layout.tsx` - Root layout with PWA setup
✅ `src/app/globals.css` - Global styles
✅ `src/components/Timer.tsx` - Timer component
✅ `src/components/ServiceWorkerRegister.tsx` - PWA registration
✅ `src/hooks/useLocalStorage.ts` - Data persistence hook
✅ `public/manifest.json` - PWA manifest
✅ `public/sw.js` - Service Worker
✅ `tsconfig.json` - TypeScript config
✅ `next.config.ts` - Next.js config
✅ `tailwind.config.ts` - Tailwind config
✅ `README.md` - Full documentation

## 💡 Code Comments

All source files include detailed comments explaining:
- How localStorage hook works
- How timer counts and formats
- How app tracks daily stats
- How service worker enables PWA

Read the comments for deeper understanding!

---

## 🎉 You're All Set!

Your study session tracker is running at **http://localhost:3000**

**Start tracking now:**
1. Click "Start Session"
2. Study for a bit
3. Click "Stop Session"
4. Watch your minutes add up!

Good luck with your studies! 📚✨

---

**Questions?** Check the comments in source files or README.md for detailed explanations.
