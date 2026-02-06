'use client';

// Service Worker registration
// Enables PWA features like offline support and home screen installation
// DISABLED in development to prevent caching issues during dev

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Skip registration in development to prevent service worker caching issues
    if (process.env.NODE_ENV === 'development') {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // Unregister any existing service workers in dev
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().catch(() => {
              // silently ignore
            });
          });
        });
      }
      return;
    }

    // Only run in production browser
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.warn('Service Worker registration failed:', error);
          });
      } catch (error) {
        console.warn('Service Worker registration error:', error);
      }
    }
  }, []);

  return null;
}
