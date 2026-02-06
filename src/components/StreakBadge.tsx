"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/lib/auth';

export function StreakBadge({ userId }: { userId?: string | null }) {
  const { profile } = useAuth();
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    if (profile && profile.current_streak !== undefined) {
      setStreak(profile.current_streak ?? 0);
      return;
    }

    // fallback: if userId provided, set to 0 (profile should exist via auth)
    if (userId) setStreak(0);
  }, [profile, userId]);

  const hasStreak = (streak ?? 0) > 0;

  return (
    <div
      className="flex items-center gap-2"
      aria-label={hasStreak ? `Current streak ${streak} days` : "No streak"}
      title={hasStreak ? `${streak} day streak` : "No streak"}
    >
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white ${
          hasStreak ? "text-amber-400" : "text-purple-400"
        }`}
      >
        <svg
          className={`w-5 h-5 ${hasStreak ? "streak-animate" : "opacity-60"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M12 2s4 3 4 6-1 4-4 6c-3-2-4-4-4-6S12 2 12 2z" />
        </svg>
      </span>
      <span className="text-sm font-semibold text-purple-100" aria-hidden>
        {streak}
      </span>

      <style>{`
        @keyframes flame-flicker {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
        .streak-animate {
          animation: flame-flicker 1.8s ease-in-out infinite;
          filter: drop-shadow(0 4px 6px rgba(99,102,241,0.12));
        }
      `}</style>
    </div>
  );
}
