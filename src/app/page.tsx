'use client';

/**
 * SPACE-THEMED STUDY TRACKER DASHBOARD WITH SUPABASE INTEGRATION
 * 
 * CONFIGURATION POINTS:
 * - DEFAULT_SESSION_LENGTH: Change default session length (line ~60)
 * - DAILY_GOAL: Change daily goal in minutes (line ~61)
 * - WEEKLY_DAYS: Number of days to look back for weekly sessions (line ~62)
 * 
 * SUPABASE INTEGRATION:
 * - Sessions are persisted to Supabase study_sessions table
 * - User auth managed via useAuth hook from @/lib/auth
 * - Streaks calculated and updated automatically via @/lib/sessions
 * - Leaderboard fetched from @/lib/leaderboard
 * 
 * NOTES:
 * - Sessions stored in Supabase with user_id, timestamps, duration
 * - Minimum session length of 10 minutes enforced before saving
 * - Streaks track consecutive days with valid sessions
 * - Leaderboard updated in real-time based on session data
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { AuthScreen } from '@/components/AuthScreen';
import { Leaderboard } from '@/components/Leaderboard';
import { StreakBadge } from '@/components/StreakBadge';
import { ProfileModal } from '@/components/ProfileModal';
import { saveSession, getTodayTotalMinutes, getWeeklySessionCount } from '@/lib/sessions';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Configuration
const DEFAULT_SESSION_LENGTH = 25; // minutes
const DAILY_GOAL = 60; // minutes
const WEEKLY_DAYS = 7;

// Types
interface Session {
  id: string;
  start: number; // timestamp
  end?: number; // timestamp
  durationMin: number;
}

interface TimerState {
  isRunning: boolean;
  seconds: number;
}

// ============================================================================
// HELPER: Format minutes for display
// ============================================================================
/**
 * Formats a duration in minutes for display.
 * - If < 1 min → "< 1 min"
 * - If 1–9 min → "X min" (rounded)
 * - If ≥ 10 min → "X min" (rounded)
 */
function formatMinutes(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  return `${Math.round(minutes)} min`;
}

// ============================================================================
// COMPONENT: ProgressRing
// ============================================================================
function ProgressRing({
  progress,
  timeLabel,
}: {
  progress: number;
  timeLabel: string;
}) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  // SVG circle circumference for 50px radius
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Progress Circle */}
      <svg width={140} height={140} className="drop-shadow-lg">
        {/* Background circle */}
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke="rgba(200, 150, 255, 0.15)"
          strokeWidth={3}
        />
        {/* Progress circle */}
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute text-center">
        <p className="text-xs text-purple-200 uppercase tracking-wide">
          Current Session
        </p>
        <p className="text-2xl font-bold text-white">{timeLabel}</p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: StatCard
// ============================================================================
function StatCard({
  value,
  label,
  sublabel,
}: {
  value: string | number;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex-1 bg-gradient-to-br from-purple-800/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/40 transition-colors">
      <p className="text-sm text-purple-300 font-semibold uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-4xl font-bold text-white mb-1">{value}</p>
      {sublabel && (
        <p className="text-xs text-purple-200">{sublabel}</p>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: SessionCTA
// ============================================================================
function SessionCTA({
  isRunning,
  onStart,
  onStop,
}: {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="space-y-3">
      {!isRunning ? (
        <button
          onClick={onStart}
          aria-label="Start a new study session"
          className="w-full px-8 py-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold text-lg rounded-2xl shadow-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Start Session
        </button>
      ) : (
        <button
          onClick={onStop}
          aria-label="Stop the current study session"
          className="w-full px-8 py-5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Stop Session
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: SessionList
// ============================================================================
function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-6 text-purple-300">
        <p className="text-sm">No sessions yet. Start your first session! 🚀</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.slice(-5).reverse().map((session) => {
        const date = new Date(session.start);
        const time = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
        return (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-purple-800/30 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-white">{time}</p>
              <p className="text-xs text-purple-300">
                {date.toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-400">
                {formatMinutes(session.durationMin)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    seconds: 0,
  });

  const [sessions, setSessions] = useLocalStorage<Session[]>(
    'studySessions',
    []
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [shortSessionMsg, setShortSessionMsg] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState.isRunning) {
      interval = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          seconds: prev.seconds + 1,
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState.isRunning]);

  // Load data when user is authenticated
  useEffect(() => {
    if (!authLoading) {
      setIsLoaded(true);

      if (user) {
        // Load today's minutes and weekly count from Supabase
        const loadStats = async () => {
          try {
            const today = await getTodayTotalMinutes(user.id);
            const weekly = await getWeeklySessionCount(user.id);
            setTodayMinutes(today);
            setWeeklyCount(weekly);
          } catch (err) {
            console.error('Failed to load stats:', err);
          }
        };

        loadStats();
      }
    }
  }, [authLoading, user]);

  // Format timer display (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Session progress (0-100) based on DEFAULT_SESSION_LENGTH
  const sessionProgress =
    (timerState.seconds / (DEFAULT_SESSION_LENGTH * 60)) * 100;

  // Handle start session
  const handleStart = () => {
    setTimerState({
      isRunning: true,
      seconds: 0,
    });
  };

  // Handle stop session
  const handleStop = async () => {
    const durationMin = timerState.seconds / 60;

    // Enforce minimum session length (10 minutes)
    if (durationMin < 10) {
      setShortSessionMsg(true);
      setTimeout(() => setShortSessionMsg(false), 3000);

      // Reset timer but don't save session
      setTimerState({
        isRunning: false,
        seconds: 0,
      });
      return;
    }

    setIsSaving(true);

    try {
      if (user) {
        // Save to Supabase
        await saveSession({
          userId: user.id,
          durationMin,
        });

        // Update local stats
        setTodayMinutes((prev) => prev + durationMin);
        setWeeklyCount((prev) => prev + 1);
      }

      // Also save to localStorage as fallback
      const newSession: Session = {
        id: `session-${Date.now()}`,
        start: Date.now(),
        durationMin,
      };
      setSessions((prev) => [...prev, newSession]);

      setTimerState({
        isRunning: false,
        seconds: 0,
      });
    } catch (err) {
      console.error('Failed to save session:', err);
      // Still reset timer even if save fails
      setTimerState({
        isRunning: false,
        seconds: 0,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show auth screen if not authenticated
  if (!authLoading && !user) {
    return <AuthScreen />;
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a0f3a 50%, #0f0820 100%)',
      }}
    >
      {/* Animated star background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `twinkle ${3 + Math.random() * 4}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Keyframes for twinkle animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 sm:p-6">
        {/* Header: 3-column layout - Streak | Title | Profile */}
        <div className="grid grid-cols-3 items-center mb-4">
          <div className="flex items-center">
            <StreakBadge userId={user?.id} />
          </div>

          <div className="flex justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Tracker</h1>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-100 transition px-3 py-2"
              aria-label="Open profile"
            >
              Profile
            </button>
          </div>
        </div>

        {showProfile && <ProfileModal userId={user?.id} onClose={() => setShowProfile(false)} />}

        {/* Main content container */}
        <div className="flex-1 flex flex-col items-center justify-start max-w-md mx-auto w-full space-y-8">
          {/* Progress Ring Section */}
          <div className="relative w-full flex justify-center py-4">
            <ProgressRing
              progress={sessionProgress}
              timeLabel={formatTime(timerState.seconds)}
            />
          </div>

          {/* Stats Row */}
          <div className="w-full flex gap-4 justify-center">
            <StatCard
              value={weeklyCount}
              label="Weekly Sessions"
              sublabel="Last 7 days"
            />
            <StatCard
              value={formatMinutes(todayMinutes)}
              label="Today"
              sublabel="Total minutes"
            />
          </div>

          {/* CTA Section */}
          <div className="w-full">
            <SessionCTA
              isRunning={timerState.isRunning}
              onStart={handleStart}
              onStop={handleStop}
            />
            {shortSessionMsg && (
              <div className="mt-3 text-center text-sm text-orange-300">
                Session too short to count (minimum 10 minutes)
              </div>
            )}
            {isSaving && (
              <div className="mt-3 text-center text-sm text-blue-300">
                Saving session...
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="w-full">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recent Sessions
            </h2>
            <SessionList sessions={sessions} />
          </div>

          {/* Leaderboard */}
          <div className="w-full pt-8 border-t border-purple-500/20">
            <Leaderboard />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-purple-400 text-xs">
          <p>
            {DEFAULT_SESSION_LENGTH}min sessions • {DAILY_GOAL}min daily goal
          </p>
        </div>
      </div>
    </main>
  );
}