'use client';

// Service Worker registration
// Enables PWA features like offline support and home screen installation

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
