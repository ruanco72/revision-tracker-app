/**
 * Auth Screen Component
 * 
 * Minimal sign-in / sign-up UI for unauthenticated users.
 * Shows email/password form with toggle between login and signup modes.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationCode, setValidationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Load private signup code from uncommitted config
        const mod = await import('@/config/private').catch(() => null);
        const SIGNUP_CODE = mod?.SIGNUP_CODE;

        if (!SIGNUP_CODE) {
          setError('Sign-up is not available: validation not configured.');
          return;
        }

        if (validationCode.trim() !== SIGNUP_CODE) {
          setError('Validation code incorrect. Please check and try again.');
          return;
        }

        await signUp(email, password);
        setEmail('');
        setPassword('');
        setValidationCode('');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a0f3a 50%, #0f0820 100%)',
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Tracker</h1>
          <p className="text-sm text-purple-300">
            {isSignUp ? 'Create an account to get started' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-purple-900/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/60 transition"
            />
          </div>

          {/* Password input */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-purple-900/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/60 transition"
            />
          </div>

          {isSignUp && (
            <div>
              <input
                type="text"
                placeholder="Validation code"
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value)}
                required
                className="w-full px-4 py-3 bg-purple-900/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/60 transition"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-gray-900 font-semibold rounded-lg transition-all duration-200 active:scale-95"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-purple-300 hover:text-purple-200 transition"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </main>
  );
}
