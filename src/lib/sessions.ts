/**
 * Session Service
 * 
 * Handles saving sessions to Supabase and updating streaks.
 * 
 * STREAK LOGIC:
 * - A streak is consecutive days with at least one valid session (≥10 min)
 * - current_streak: Resets to 0 if a day is missed, increments if session recorded
 * - longest_streak: Tracks the maximum streak ever achieved
 * - Updated automatically when a session is saved
 */

import { supabase } from '@/lib/supabase';

export interface SaveSessionParams {
  userId: string;
  durationMin: number;
  startTime?: Date;
}

/**
 * Saves a session to Supabase and updates streaks.
 * Returns the saved session record or throws an error.
 */
export async function saveSession({
  userId,
  durationMin,
  startTime = new Date(),
}: SaveSessionParams) {
  // Enforce minimum session length
  if (durationMin < 10) {
    throw new Error('Session must be at least 10 minutes');
  }

  // Calculate end time
  const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);

  // Save session to Supabase
  const { data: sessionData, error: sessionError } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_min: durationMin,
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Update streaks
  await updateStreaks(userId);

  return sessionData;
}

/**
 * Updates current_streak and longest_streak for a user.
 * 
 * Logic:
 * 1. Get all sessions for user, sorted by start_time DESC
 * 2. Group by date and check if each consecutive date has ≥1 session
 * 3. If today has a session and yesterday had a session → increment streak
 * 4. If today has a session but yesterday didn't → reset to 1
 * 5. If today has no session → reset to 0
 * 6. Update longest_streak if current > longest
 */
async function updateStreaks(userId: string) {
  // Get all sessions for user, sorted newest first
  const { data: sessions, error: fetchError } = await supabase
    .from('study_sessions')
    .select('start_time')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (fetchError) throw fetchError;

  // Get user's current streaks
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('current_streak, longest_streak')
    .eq('user_id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is okay for new users
    throw profileError;
  }

  const previousStreak = userProfile?.current_streak ?? 0;
  const previousLongest = userProfile?.longest_streak ?? 0;

  // Group sessions by date and calculate streak
  const sessionsByDate = new Map<string, boolean>();

  if (sessions && sessions.length > 0) {
    sessions.forEach((session) => {
      const date = new Date(session.start_time).toISOString().split('T')[0];
      sessionsByDate.set(date, true);
    });
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  const hasSessionToday = sessionsByDate.has(today);

  let currentStreak = 0;

  if (hasSessionToday) {
    // Check if there's a consecutive chain from today backwards
    let currentDate = new Date();
    let streak = 0;

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (sessionsByDate.has(dateStr)) {
        streak += 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    currentStreak = streak;
  }

  // Update longest streak if needed
  const newLongest = Math.max(currentStreak, previousLongest);

  // Update user profile
  const { error: updateError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: newLongest,
      updated_at: new Date().toISOString(),
    });

  if (updateError) throw updateError;
}

/**
 * Get user's profile including streaks
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data ?? { user_id: userId, current_streak: 0, longest_streak: 0 };
}

/**
 * Get user's session count for today
 */
export async function getTodaySessionCount(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { count, error } = await supabase
    .from('study_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('start_time', todayStr);

  if (error) throw error;

  return count ?? 0;
}

/**
 * Get user's total minutes for today
 */
export async function getTodayTotalMinutes(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { data, error } = await supabase
    .from('study_sessions')
    .select('duration_min')
    .eq('user_id', userId)
    .gte('start_time', todayStr);

  if (error) throw error;

  return (data ?? []).reduce((sum, s) => sum + s.duration_min, 0);
}

/**
 * Get user's total minutes for the last 7 days
 */
export async function getWeeklyTotalMinutes(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const weekAgoStr = weekAgo.toISOString();

  const { data, error } = await supabase
    .from('study_sessions')
    .select('duration_min')
    .eq('user_id', userId)
    .gte('start_time', weekAgoStr);

  if (error) throw error;

  return (data ?? []).reduce((sum, s) => sum + s.duration_min, 0);
}

/**
 * Get user's session count for last 7 days
 */
export async function getWeeklySessionCount(userId: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const weekAgoStr = weekAgo.toISOString();

  const { count, error } = await supabase
    .from('study_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('start_time', weekAgoStr);

  if (error) throw error;

  return count ?? 0;
}
