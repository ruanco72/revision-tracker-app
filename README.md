# Study Session Tracker - PWA

A minimal Progressive Web App (PWA) for tracking daily study sessions. Built with Next.js and React.

## Features

- ⏱️ **Start/Stop Timer** - Track study sessions with a live timer
- 📊 **Daily Progress** - See today's total minutes and progress toward your 60-minute goal
- 💾 **Persistent Data** - Data is saved to localStorage and persists across page reloads
- 📱 **Mobile-First UI** - Big, simple buttons and layout optimized for mobile devices
- 📲 **Installable PWA** - Install to home screen on iOS and Android
- 🔌 **Offline Support** - Works offline thanks to service worker caching
- 🎯 **Auto-Reset** - Automatically resets daily totals at midnight

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main app page with session tracker UI
│   ├── layout.tsx        # Root layout with PWA metadata
│   └── globals.css       # Global Tailwind styles
├── components/
│   ├── Timer.tsx         # Timer display and stop button component
│   └── ServiceWorkerRegister.tsx  # Service worker registration
├── hooks/
│   └── useLocalStorage.ts # Custom hook for localStorage management
public/
├── manifest.json         # PWA manifest for installation
├── sw.js                 # Service worker for offline support
└── favicon.ico          # App icon
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm (comes with Node.js)
- Mac with VS Code

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd /Users/ruan/Docs/RevisionApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Open [http://localhost:3000](http://localhost:3000)
   - The app will automatically reload when you make changes

## Running the Project

### Development Mode
```bash
npm run dev
```
- Runs on [http://localhost:3000](http://localhost:3000)
- Hot-reload enabled - changes update instantly
- Service worker enabled for PWA testing

### Production Build
```bash
npm run build
npm start
```
- Optimized build
- Best performance for testing PWA installation

### Linting
```bash
npm run lint
```

## How It Works

### Timer Component
The `Timer.tsx` component:
- Displays elapsed time in MM:SS format
- Counts up by 1 second when `isRunning` is true
- Shows a "Stop Session" button while running
- Passes minutes rounded to parent on stop

### useLocalStorage Hook
The `useLocalStorage.ts` hook:
- Syncs React state with browser localStorage
- Automatically loads data on mount
- Automatically saves data on every update
- Works with any JSON-serializable data type

### Session Tracking
The main `page.tsx`:
- Manages session state and daily totals
- Automatically resets daily stats at midnight
- Shows progress toward 60-minute goal
- Displays visual progress bar
- Uses localStorage to persist data

### PWA Features
- **manifest.json** - Defines app name, icons, colors, and display mode
- **sw.js** - Service worker handles offline caching
- **ServiceWorkerRegister.tsx** - Registers service worker on page load
- Installable via browser "Add to Home Screen" menu

## Installing to Home Screen

### iOS
1. Open the app in Safari
2. Tap the Share button (box with arrow)
3. Select "Add to Home Screen"
4. Name it and tap "Add"

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home Screen"
4. Confirm installation

## Data Storage

- **localStorage Key:** `studySession`
- **Data Structure:**
  ```typescript
  {
    date: "2025-02-05",  // YYYY-MM-DD format
    minutes: 45          // Total minutes studied today
  }
```
- **Persistence:** Data survives browser refresh, restart, and even uninstall/reinstall (until cache is cleared)

## Customization

### Change Daily Goal
In [src/app/page.tsx](src/app/page.tsx#L31):
```typescript
const DAILY_GOAL = 60; // Change to your preferred goal
```

### Change Theme Color
- In [src/app/layout.tsx](src/app/layout.tsx#L25): Update `theme-color` meta tag
- In [public/manifest.json](public/manifest.json#L7): Update `theme_color`
- In [src/app/page.tsx](src/app/page.tsx#L64): Update Tailwind color classes

### Modify UI
- Edit [src/app/page.tsx](src/app/page.tsx) for main layout
- Edit [src/components/Timer.tsx](src/components/Timer.tsx) for timer display

## Future Enhancements

Ideas for v2.0:
- ✨ Weekly/monthly statistics
- 🏆 Achievement badges
- 📱 Desktop/mobile sync (requires backend)
- 🎵 Sound notifications
- 🌙 Dark mode
- 📊 Data export/import

## Troubleshooting

### Service Worker Not Working
1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Unregister service worker: DevTools > Application > Service Workers > Unregister
4. Restart dev server: Stop and `npm run dev`

### Data Not Persisting
1. Check browser localStorage is enabled
2. Clear cookies: DevTools > Application > Storage > Clear site data
3. Check browser localStorage quota (usually 5-10MB)

### App Not Installing as PWA
1. Ensure it's served over HTTPS (production) or localhost (development)
2. Verify manifest.json is accessible: Visit `/manifest.json` in browser
3. Check browser console for manifest errors

## Technology Stack

- **Next.js 15** - React framework with file-based routing
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Service Worker API** - Offline support and installation
- **Web Storage API** - localStorage for persistence

## License

Open source - feel free to use and modify!

## Questions?

Check the comments in the code files:
- [useLocalStorage hook](src/hooks/useLocalStorage.ts)
- [Timer component](src/components/Timer.tsx)
- [Main page](src/app/page.tsx)
- [Service worker](public/sw.js)
