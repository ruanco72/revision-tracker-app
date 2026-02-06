/**
 * Authentication Hook
 * 
 * Manages user authentication state and provides simple login/logout/signup.
 */

'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserProfile = {
  user_id: string;
  email?: string;
  display_name?: string | null;
  avatar?: string | null;
  current_streak?: number;
  longest_streak?: number;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user ?? null);
        setLoading(false);
        if (user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] User loaded:', user.email);
          }
          // load profile
          try {
            const { data } = await supabase
              .from('user_profiles')
              .select('user_id, email, display_name, avatar, current_streak, longest_streak')
              .eq('user_id', user.id)
              .single();
            setProfile(data ?? null);
          } catch (e) {
            console.warn('[Auth] Failed to load profile:', e);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to check user:', err);
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Auth state changed:', event, u?.email);
      }
      setUser(u);
      if (u) {
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('user_id, email, display_name, avatar, current_streak, longest_streak')
            .eq('user_id', u.id)
            .single();
          setProfile(data ?? null);
        } catch (e) {
          console.warn('[Auth] Failed to load profile on auth change:', e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // If a user record is returned immediately, create an initial profile row.
    // This ensures `user_profiles` exists for leaderboard/streaks.
    try {
      const user = data?.user;
      if (user) {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          email: user.email,
          current_streak: 0,
          longest_streak: 0,
        });
        // refresh profile in memory
        try {
          const { data: p } = await supabase
            .from('user_profiles')
            .select('user_id, email, display_name, avatar, current_streak, longest_streak')
            .eq('user_id', user.id)
            .single();
          setProfile(p ?? null);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      // Non-fatal: profile creation failure shouldn't block sign-up flow.
      console.error('Failed to create user profile:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('user_id, email, display_name, avatar, current_streak, longest_streak')
        .eq('user_id', user.id)
        .single();
      setProfile(data ?? null);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, profile, refreshProfile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
