## Study Session Tracker - Setup & Quick Start Guide

Your PWA project is now ready to run! Here's everything you need to know.

### ✅ What's Included

Your complete Next.js PWA with:
- **Timer Component** - Displays MM:SS format, counts up, stops and records minutes
- **useLocalStorage Hook** - Persists daily study stats to browser storage
- **Main App** - Beautiful mobile-first UI with progress tracking
- **PWA Setup** - Installable to home screen + offline support via Service Worker
- **Tailwind CSS** - Pre-configured for quick styling

### 🚀 Running the Project

The development server is already running at **http://localhost:3000**

**To stop/restart in terminal:**
```bash
# Stop: Ctrl+C
# Start: npm run dev
```

### 📁 File Structure Explained

```
RevisionApp/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← Main app (Start/Stop buttons, stats display)
│   │   ├── layout.tsx        ← PWA metadata & Service Worker register
│   │   └── globals.css       ← Tailwind styles
│   ├── components/
│   │   ├── Timer.tsx         ← Timer display & stop button
│   │   └── ServiceWorkerRegister.tsx  ← Registers PWA service worker
│   └── hooks/
│       └── useLocalStorage.ts ← localStorage management hook
├── public/
│   ├── manifest.json         ← PWA app config (name, icons, colors)
│   └── sw.js                 ← Service worker (offline support)
├── package.json              ← Dependencies & scripts
├── tsconfig.json             ← TypeScript config
├── next.config.ts            ← Next.js config
└── README.md                 ← Full documentation
```

### 🔧 How the App Works

1. **Start Button** clicks → Sets `isRunning = true`
2. **Timer Component** → Counts seconds every 1000ms
3. **Stop Button** appears → Click to stop session
4. **Stop Handler** → Converts seconds to minutes, adds to today's total
5. **localStorage** → Saves daily stats (persists on reload!)
6. **Progress Bar** → Shows visual progress toward 60-minute goal
7. **Auto-Reset** → Resets at midnight (based on date in localStorage)

### 💾 Data Persistence

Data is stored as JSON in localStorage under key `"studySession"`:
```json
{
  "date": "2025-02-05",
  "minutes": 45
}
```

Check it in browser DevTools:
- Chrome: Inspect → Application → Local Storage
- Safari: Develop → Show Web Inspector → Storage
- Firefox: Inspector → Storage tab

### 📱 Testing PWA Features

**On Mac (Chrome/Edge):**
1. Open DevTools (Cmd+Option+I)
2. Go to Application → Manifest
3. Click "Add to home screen" button
4. Or: Menu (⋯) → "Install app"

**On iPhone (Safari):**
1. Share button → "Add to Home Screen"
2. Name it and tap "Add"

**Offline Testing:**
1. DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh page - should still load from cache!

### 🎨 Customizing

**Change the daily goal (60 min):**
- Open `src/app/page.tsx`
- Find line: `const DAILY_GOAL = 60;`
- Change to your preferred number

**Change theme color (blue):**
- `src/app/layout.tsx` → `theme-color` meta tag
- `public/manifest.json` → `theme_color` property
- `src/app/page.tsx` → Tailwind color classes (blue-600 → other colors)

**Change app name:**
- `public/manifest.json` → `"name"` and `"short_name"`
- `src/app/layout.tsx` → `title` in metadata

### 📦 Available Commands

```bash
# Development (hot reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Check for linting errors
npm run lint
```

### 🐛 Troubleshooting

**App not showing?**
- Check http://localhost:3000 in browser
- Look for errors in DevTools Console (Cmd+Option+I)
- Ensure dev server is running: Look for "Ready in Xms" in terminal

**Data not saving?**
- Check localStorage is enabled in browser
- Open DevTools → Application → Storage → Clear all
- Hard refresh (Cmd+Shift+R)

**Service Worker not working?**
- DevTools → Application → Service Workers → Unregister
- Restart dev server: `npm run dev`
- Hard refresh page

**Timer not counting?**
- Check browser console for JavaScript errors
- Ensure you're using latest Chrome/Safari/Edge

### 📚 Key Code Comments

All source files have detailed comments explaining:
- How the Timer counts and formats time
- How useLocalStorage syncs with browser storage
- How the main page tracks daily stats
- How the Service Worker enables PWA features

Read them for deeper understanding of how it all works!

### 🚀 Next Steps

Once you're comfortable with this MVP:
1. Add weekly/monthly stats
2. Add notification sounds
3. Add dark mode
4. Build a backend for cloud sync
5. Add leaderboards

### ⚡ Pro Tips

- **localStorage limit**: ~5-10MB per site (plenty for years of data)
- **Service Worker**: Only works on HTTPS in production, localhost in dev
- **Mobile testing**: Chrome DevTools has mobile device emulation
- **Tailwind classes**: Find more at tailwindcss.com/docs
- **Next.js docs**: nextjs.org/docs for more features

---

**Your app is ready to use! Click the Start Session button and begin tracking.** 📚⏱️

Need help? Check README.md for full documentation.
