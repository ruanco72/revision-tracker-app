/**
 * Leaderboard Service
 * 
 * Fetches top 10 users by minutes studied in the last 7 days.
 * Includes rank, username, weekly minutes, and current streak.
 */

import { supabase } from '@/lib/supabase';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userEmail: string;
  weeklyMinutes: number;
  currentStreak: number;
  displayName?: string;
  avatar?: string;
}

/**
 * Get top 10 users by minutes studied in the last 7 days
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const weekAgoStr = weekAgo.toISOString();

  // Get all sessions from last 7 days with user profiles
  const { data: sessions, error: sessionsError } = await supabase
    .from('study_sessions')
    .select(
      `
      duration_min,
      user_id,
      user_profiles!inner(current_streak, display_name, avatar, email)
    `
    )
    .gte('start_time', weekAgoStr);

  if (sessionsError) throw sessionsError;

  // Aggregate by user
  const userStats = new Map<
    string,
    { totalMinutes: number; currentStreak: number }
  >();

  sessions?.forEach((session: any) => {
    const userId = session.user_id;
    const currentStreak = session.user_profiles?.current_streak ?? 0;
    const displayName = session.user_profiles?.display_name ?? null;
    const avatar = session.user_profiles?.avatar ?? null;

    if (!userStats.has(userId)) {
      userStats.set(userId, {
        totalMinutes: 0,
        currentStreak,
        displayName,
        avatar,
      } as any);
    }

    const stats = userStats.get(userId)! as any;
    stats.totalMinutes += session.duration_min;
  });

  // Get user emails
  const userIds = Array.from(userStats.keys());
  const { data: users, error: usersError } = await supabase.auth.admin
    .listUsers();

  if (usersError && userIds.length > 0) {
    // Fallback: if admin API not available, fetch from user_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, email, display_name, avatar')
      .in('user_id', userIds);

    if (profilesError) throw profilesError;

    // Build leaderboard from aggregated stats
    const leaderboard: LeaderboardEntry[] = Array.from(userStats.entries())
      .map(([userId, stats]: any) => {
        const profile = profiles?.find((p: any) => p.user_id === userId);
        return {
          userId,
          userEmail: profile?.email ?? 'Unknown',
          weeklyMinutes: stats.totalMinutes,
          currentStreak: stats.currentStreak,
          displayName: profile?.display_name ?? stats.displayName ?? null,
          avatar: profile?.avatar ?? stats.avatar ?? null,
        } as LeaderboardEntry;
      })
      .sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
      .slice(0, 10)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return leaderboard;
  }

  // Build leaderboard from user emails
  const leaderboard: LeaderboardEntry[] = Array.from(userStats.entries())
    .map(([userId, stats]: any) => {
      const user = users?.users?.find((u: any) => u.id === userId);
      return {
        userId,
        userEmail: user?.email ?? 'Unknown',
        weeklyMinutes: stats.totalMinutes,
        currentStreak: stats.currentStreak,
        displayName: stats.displayName ?? null,
        avatar: stats.avatar ?? null,
      } as LeaderboardEntry;
    })
    .sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
    .slice(0, 10)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboard;
}
