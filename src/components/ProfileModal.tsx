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
  const { refreshProfile } = useAuth();

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("display_name, avatar")
          .eq("user_id", userId)
          .single();
        if (error) throw error;
        if (mounted) {
          setDisplayName(data?.display_name ?? "");
          setAvatar(data?.avatar ?? "");
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const avatars = ["🚀", "🪐", "🔥", "🌑", "✨"];

  const save = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const payload: any = { user_id: userId, display_name: displayName };
      if (avatar) payload.avatar = avatar;

      const { error } = await supabase.from("user_profiles").upsert(payload);
      if (error) throw error;
      // refresh auth profile state so UI updates immediately
      await refreshProfile();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-purple-900/80 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>

        <label className="block text-sm text-purple-300 mb-2">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 bg-purple-800/40 border border-purple-500/20 rounded-md text-white mb-4"
        />

        <label className="block text-sm text-purple-300 mb-2">Avatar</label>
        <div className="flex gap-2 mb-4">
          {avatars.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                avatar === a ? "ring-2 ring-amber-400" : "bg-purple-800/30"
              }`}
              aria-label={`Select avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-purple-300 hover:text-purple-100"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-md"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
