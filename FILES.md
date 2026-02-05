# 📚 Study Session Tracker - File Index

## 🎯 Read These First
- **[START_HERE.md](START_HERE.md)** ← Begin here! Overview + how to use
- **[QUICKSTART.md](QUICKSTART.md)** ← 5-minute quick reference
- **[README.md](README.md)** ← Full detailed documentation

## 🚀 Running the App

**The dev server is already running at:** http://localhost:3000

**Commands:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Run production version
npm run lint     # Check code quality
```

---

## 📁 Core Application Files

### Main Pages & Layout
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | **Main app page** - Timer UI, buttons, stats display |
| `src/app/layout.tsx` | **Root layout** - PWA metadata, Service Worker register |
| `src/app/globals.css` | **Global styles** - Tailwind CSS setup |

### Components
| File | Purpose |
|------|---------|
| `src/components/Timer.tsx` | **Timer display** - MM:SS format, count logic |
| `src/components/ServiceWorkerRegister.tsx` | **PWA registration** - Enables offline support |

### Custom Hook
| File | Purpose |
|------|---------|
| `src/hooks/useLocalStorage.ts` | **Storage hook** - Syncs React state with localStorage |

### PWA Files
| File | Purpose |
|------|---------|
| `public/manifest.json` | **PWA config** - App name, icons, colors, display mode |
| `public/sw.js` | **Service Worker** - Offline caching, background sync |

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.ts` | Next.js build configuration |
| `tailwind.config.ts` | Tailwind CSS theme & plugins |
| `postcss.config.mjs` | PostCSS build pipeline |
| `eslint.config.mjs` | Code linting rules |

---

## 📖 Documentation

| File | Best For |
|------|----------|
| **[START_HERE.md](START_HERE.md)** | Complete overview, what you got, how to use |
| **[QUICKSTART.md](QUICKSTART.md)** | Fast reference, commands, troubleshooting |
| **[README.md](README.md)** | Deep dive, architecture, customization, deployment |
| **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** | Setup details, file structure, next steps |
| **[COMMANDS.sh](COMMANDS.sh)** | Copy-paste command reference |

---

## 🎯 Quick Navigation

### I want to...

**See the app running**
- Open http://localhost:3000

**Edit the main app**
- Open `src/app/page.tsx`
- Comments explain every section

**Change the timer display**
- Edit `src/components/Timer.tsx`
- Controls MM:SS formatting and stop logic

**Understand data storage**
- Read `src/hooks/useLocalStorage.ts`
- Comments explain how it syncs with localStorage

**Change app colors**
- Edit `src/app/page.tsx` - Tailwind color classes
- Edit `src/app/layout.tsx` - Meta theme color
- Edit `public/manifest.json` - App theme color

**Change daily goal (60 minutes)**
- Edit `src/app/page.tsx` line 31
- `const DAILY_GOAL = 60;` ← change this number

**Install as PWA**
- Click menu → "Install app"
- Or Settings → "Add to home screen"
- Works on iOS, Android, Mac, Windows

**Test offline functionality**
- DevTools → Network → check "Offline"
- Refresh page - should still load from cache

**View localStorage data**
- DevTools → Application → Local Storage
- Look for "studySession" entry

**Check Service Worker**
- DevTools → Application → Service Workers
- Should show registered service worker

---

## 💻 Source Code Overview

### `src/app/page.tsx` (Main App - 130 lines)
Main logic and UI:
- `isRunning` state - tracks if timer is active
- `dailyStats` state - stores date and minutes via localStorage
- `handleStart()` - begins timer
- `handleStop(minutes)` - adds minutes to total
- Progress bar calculation
- Beautiful Tailwind CSS layout

**Key sections:**
- Line 16-28: Initialize state with localStorage
- Line 31: Daily goal constant (easy to change)
- Line 37-42: Check if day changed, reset if needed
- Line 60-80: Timer component with stop handler
- Line 90-120: Stats display and progress bar

### `src/components/Timer.tsx` (60 lines)
Timer display:
- Accepts `isRunning` boolean prop
- Counts up in seconds every 1000ms
- Formats to MM:SS display
- Shows "Stop Session" button while running
- Calls parent `onStop` with total minutes

**Key sections:**
- Line 15-28: useEffect for interval management
- Line 30-37: formatTime helper function
- Line 39-45: Stop handler

### `src/hooks/useLocalStorage.ts` (50 lines)
Custom React hook:
- Like `useState` but syncs with localStorage
- Loads data on component mount
- Saves data on every update
- Returns `[value, setValue]` tuple
- Prevents hydration mismatch in Next.js

**Key sections:**
- Line 13-30: setValue with localStorage sync
- Line 32-48: useEffect to load data on mount
- Line 50-52: Return values

### `src/app/layout.tsx` (40 lines)
Root layout:
- PWA metadata (manifest, icons, colors)
- Service Worker registration component
- Apple web app configuration for iOS
- Viewport settings for mobile

### `public/manifest.json` (50 lines)
PWA configuration:
- App name and short name
- App description
- Start URL and scope
- Display mode (standalone - no browser UI)
- Theme and background colors
- App icons (SVG)

### `public/sw.js` (60 lines)
Service Worker:
- Runs in background
- Caches app on install
- Serves from cache, falls back to network
- Updates cache from network
- Enables offline functionality

---

## 🔗 File Dependencies

```
index.html (served by Next.js)
├── layout.tsx
│   ├── ServiceWorkerRegister.tsx
│   │   └── /public/sw.js (registers)
│   └── page.tsx (rendered here)
│       ├── Timer.tsx (component)
│       └── useLocalStorage.ts (hook)
│           └── localStorage (browser API)
├── manifest.json (referenced in head)
├── globals.css (Tailwind styles)
└── theme-color meta tag (controls browser UI color)
```

---

## ✨ Key Features & Where They're Implemented

| Feature | Files | How It Works |
|---------|-------|-------------|
| Timer Display | Timer.tsx | Increments every 1s, formats MM:SS |
| Start Button | page.tsx | Sets isRunning=true |
| Stop Button | Timer.tsx, page.tsx | Calculates minutes, calls onStop |
| Daily Totals | page.tsx | Manages dailyStats state |
| Progress Bar | page.tsx | Width = (minutes/goal)*100% |
| Data Persistence | useLocalStorage.ts | Syncs state ↔ localStorage |
| Auto-Reset | page.tsx | Checks date, resets if new day |
| Offline Support | sw.js | Service Worker caching |
| Installable | manifest.json, sw.js | PWA configuration |
| Mobile UI | page.tsx, globals.css | Tailwind responsive design |

---

## 🎨 Styling

All styling uses **Tailwind CSS** (utility-first CSS framework):
- `bg-blue-500` = blue background
- `text-white` = white text
- `rounded-lg` = rounded corners
- `shadow-xl` = drop shadow
- `hover:bg-blue-600` = hover state
- `max-w-md` = max width

Colors are configurable in `tailwind.config.ts`

---

## 📦 Dependencies

```json
{
  "next": "^15.0.0",       // React framework
  "react": "^19.0.0",      // UI library
  "react-dom": "^19.0.0"   // DOM rendering
}
```

TypeScript and Tailwind CSS included by default.

---

## 🚀 Development Workflow

1. **Edit file** in VS Code
2. **Save** (Cmd+S)
3. **Auto-reload** happens in browser (hot reload)
4. **DevTools** shows any errors

No manual refresh needed! Just edit and see changes instantly.

---

## 🧪 Testing the App

### Manual Testing Checklist
- [ ] Click "Start Session" → timer counts up
- [ ] Click "Stop Session" → shows minutes added
- [ ] Refresh page → data persists
- [ ] Wait until next day → stats auto-reset
- [ ] Check DevTools → see localStorage data
- [ ] Check DevTools → see Service Worker
- [ ] Go offline (DevTools) → page still loads
- [ ] Try installing → works as home screen app

---

## 🎯 Customization Reference

### Easy Changes (5 minutes)
- **Goal:** Line 31 in page.tsx
- **Colors:** Tailwind classes in page.tsx, meta tag in layout.tsx
- **App name:** manifest.json name fields

### Medium Changes (15 minutes)
- **Layout:** Edit page.tsx JSX
- **Timer style:** Edit Timer.tsx
- **Form validation:** Add to stop handler

### Hard Changes (1+ hour)
- **Multiple sessions per day:** Restructure dailyStats
- **Weekly stats:** Add state management
- **Backend sync:** Requires server

---

## 📚 Learning Resources

### In Your Code
- Every file has comments explaining logic
- Look for `//'` or `/**/` comments in code

### In Documentation
- START_HERE.md - beginner overview
- README.md - complete reference
- Code comments - inline explanations

### Online
- Next.js: nextjs.org/docs
- React: react.dev
- Tailwind: tailwindcss.com/docs
- Web.dev: web.dev/progressive-web-apps

---

## ⏱️ File Change Frequency

**Often (while developing):**
- `src/app/page.tsx` - Main logic
- `src/components/Timer.tsx` - Timer styling
- `src/app/globals.css` - Styles

**Sometimes:**
- `src/hooks/useLocalStorage.ts` - Storage logic
- `public/manifest.json` - App config

**Rarely:**
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript rules
- `next.config.ts` - Build config

---

## 📊 Code Statistics

```
Total files created: 21
Total lines of code: ~500
Largest file: src/app/page.tsx (~130 lines)
Comments ratio: ~20% of code
```

---

## 🎯 Where to Start

1. **Read:** START_HERE.md (2 min)
2. **Run:** http://localhost:3000 (open it now!)
3. **Test:** Click Start/Stop buttons
4. **Edit:** Open src/app/page.tsx and read comments
5. **Customize:** Change colors, goal, or layout

---

## 🚀 Next Steps

1. Use the app for a week to track study time
2. Get comfortable with React and Tailwind CSS
3. Add new features (weekly stats, badges, etc.)
4. Deploy to Vercel (one-click deploy from GitHub)
5. Add backend for cloud sync and multi-device support

---

## ❓ Questions?

Check these in order:
1. START_HERE.md - Overview and quick help
2. QUICKSTART.md - Common issues
3. README.md - Full documentation
4. Code comments - Inline explanations
5. DevTools - Debug the running app

---

**Ready to get started? Open http://localhost:3000 now!** 🚀

Questions about a specific file? Click the filename above to jump to it in VS Code.
