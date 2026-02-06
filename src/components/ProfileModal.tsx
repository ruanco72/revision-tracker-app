"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/lib/auth';

export function ProfileModal({
  userId,
  onClose,
}: {
  userId?: string | null;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { refreshProfile, signOut, user } = useAuth();

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProfileModal] Mounting with userId:', userId);
    }
    
    (async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("display_name, avatar, email")
          .eq("user_id", userId)
          .single();
        if (error) throw error;
        if (mounted) {
          // Fallback: use email prefix if no display_name
          const name = data?.display_name || data?.email?.split('@')[0] || '';
          // Fallback: use 🔥 if no avatar
          const ava = data?.avatar || '🔥';
          setDisplayName(name);
          setAvatar(ava);
          if (process.env.NODE_ENV === 'development') {
            console.log('[ProfileModal] Profile loaded:', { displayName: name, avatar: ava });
          }
        }
      } catch (err) {
        // ignore - fields will use component state defaults
        if (process.env.NODE_ENV === 'development') {
          console.warn('[ProfileModal] Failed to load profile:', err);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const avatars = ["🚀", "🪐", "🔥", "🌑", "✨"];

  const save = async () => {
    // Guard against missing user ID or email
    if (!userId) {
      setError("User session not found. Please refresh and try again.");
      console.error('[ProfileModal] Save failed: No userId');
      return;
    }

    if (!user?.email) {
      setError("User email not found. Please log out and log back in.");
      console.error('[ProfileModal] Save failed: No user email');
      return;
    }

    setError("");
    setLoading(true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProfileModal] Saving profile:', { userId, displayName, avatar });
    }
    
    try {
      // Validate inputs
      if (displayName.trim().length === 0) {
        setError("Display name cannot be empty");
        setLoading(false);
        return;
      }

      // Try UPDATE first (safer for existing rows)
      const now = new Date().toISOString();
      const { data: updateData, error: updateError } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName.trim(),
          avatar: avatar,
          updated_at: now,
        })
        .eq('user_id', userId)
        .select()
        .single();

      // If update succeeded (row exists), we're done
      if (updateData) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ProfileModal] Profile updated successfully');
        }
        await refreshProfile();
        onClose();
        return;
      }

      // If update found no rows (PGRST116), try INSERT
      if (updateError?.code === 'PGRST116' || !updateData) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ProfileModal] No profile row found, inserting new one');
        }

        const { data: insertData, error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: userId,
            email: user.email,
            display_name: displayName.trim(),
            avatar: avatar,
            current_streak: 0,
            longest_streak: 0,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[ProfileModal] Profile inserted successfully');
        }

        await refreshProfile();
        onClose();
        return;
      }

      // If neither update nor insert worked, throw the update error
      if (updateError) {
        throw updateError;
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to save profile. Please try again.";
      console.error("[ProfileModal] Profile save error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProfileModal] Sign out initiated');
    }
    try {
      await signOut();
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProfileModal] Sign out successful');
      }
      onClose();
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to sign out. Please try again.";
      console.error("[ProfileModal] Sign out error:", err);
      setError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-purple-900/80 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500/40 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm text-purple-300 mb-2">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 bg-purple-800/40 border border-purple-500/20 rounded-md text-white mb-4 disabled:opacity-50"
        />

        <label className="block text-sm text-purple-300 mb-2">Avatar</label>
        <div className="flex gap-2 mb-6">
          {avatars.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              disabled={loading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                avatar === a ? "ring-2 ring-amber-400" : "bg-purple-800/30"
              } disabled:opacity-50`}
              aria-label={`Select avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-purple-300 hover:text-purple-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-md hover:bg-amber-300 disabled:opacity-50"
              aria-label="Save profile changes"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
          
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full px-4 py-2 text-sm text-red-300 hover:text-red-200 border border-red-500/20 rounded-md hover:bg-red-900/20 transition-colors disabled:opacity-50"
            aria-label="Sign out of your account"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
