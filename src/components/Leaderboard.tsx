/**
 * Leaderboard Component
 * 
 * Displays top 10 users ranked by minutes studied in the last 7 days.
 * Shows rank, email, weekly minutes, and current streak.
 */

'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry, getLeaderboard } from '@/lib/leaderboard';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-purple-300">
        <p className="text-sm">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-300">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-purple-300">
        <p className="text-sm">No data yet. Be the first to study!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-4">
        Top 10 This Week
      </h3>
      {entries.map((entry) => (
        <div
          key={entry.userId}
          className="flex items-center justify-between p-4 bg-purple-800/30 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-colors"
        >
          {/* Rank and user */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-lg font-bold text-amber-400 w-6 text-right">#{entry.rank}</div>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-purple-700/40 flex items-center justify-center text-2xl">
                {entry.avatar ? (
                  <span aria-hidden>{entry.avatar}</span>
                ) : (
                  <span className="text-amber-300">{entry.userEmail[0]?.toUpperCase() ?? 'U'}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {entry.displayName ?? entry.userEmail.split('@')[0]}
                </p>
                <p className="text-xs text-purple-300">Streak: {entry.currentStreak}d</p>
              </div>
            </div>
          </div>

          {/* Minutes */}
          <div className="text-right">
            <p className="text-lg font-bold text-amber-400">
              {Math.round(entry.weeklyMinutes)}
            </p>
            <p className="text-xs text-purple-200">min</p>
          </div>
        </div>
      ))}
    </div>
  );
}
