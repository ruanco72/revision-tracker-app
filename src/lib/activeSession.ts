/**
 * Active Session Persistence
 * 
 * Manages crash-proof session recovery by persisting session state to localStorage.
 * This ensures that if the app is killed/suspended (via phone lock, background suspension, etc.),
 * the session can be restored accurately using timestamp-based calculations.
 */

/**
 * Represents a session that is currently in progress.
 * - running: true if session is active
 * - startMs: timestamp in milliseconds when session started (Date.now())
 * - pausedMs: total milliseconds the session has been paused (cumulative)
 * - goalMinutes: optional target duration (not used for calculations, just metadata)
 */
export interface ActiveSession {
  running: boolean;
  startMs: number;
  pausedMs: number;
  goalMinutes?: number;
}

const ACTIVE_SESSION_KEY = 'activeSession';

/**
 * Saves an active session to localStorage.
 * Safe: catches JSON serialization errors and returns false if serialization fails.
 */
export function saveActiveSession(session: ActiveSession): boolean {
  try {
    if (typeof window === 'undefined') return false;
    window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.warn('Failed to save active session:', error);
    return false;
  }
}

/**
 * Loads an active session from localStorage.
 * Returns null if:
 * - localStorage is empty/not available
 * - JSON is corrupt
 * - running is false (session not active)
 */
export function loadActiveSession(): ActiveSession | null {
  try {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored) as ActiveSession;

    // Only return if session is actively running
    if (!session.running || typeof session.startMs !== 'number') {
      return null;
    }

    return session;
  } catch (error) {
    console.warn('Failed to load active session (corrupt or empty):', error);
    return null;
  }
}

/**
 * Clears the active session from localStorage.
 * Safe: catches errors silently.
 */
export function clearActiveSession(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear active session:', error);
  }
}

/**
 * Calculates elapsed seconds from an active session using timestamps.
 * This is the source of truth for elapsed time (no setInterval drift).
 * 
 * Formula: (now - startMs - pausedMs) / 1000
 */
export function getElapsedSeconds(session: ActiveSession | null): number {
  if (!session) return 0;
  const elapsedMs = Date.now() - session.startMs - session.pausedMs;
  return Math.max(0, Math.floor(elapsedMs / 1000));
}

/**
 * Creates a new active session starting now.
 */
export function createActiveSession(goalMinutes?: number): ActiveSession {
  return {
    running: true,
    startMs: Date.now(),
    pausedMs: 0,
    goalMinutes,
  };
}
