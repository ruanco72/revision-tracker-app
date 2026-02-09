"use client";

/**
 * Timer Component - Crash-Proof Session Timing
 * 
 * Uses timestamp-based calculations for elapsed time. The source of truth is:
 * elapsedSeconds = (Date.now() - startMs - pausedMs) / 1000
 * 
 * This survives app suspension, phone lock, and background kills because
 * it recalculates from absolute timestamps, not accumulated seconds.
 */

import { useEffect, useRef, useState } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';
import { ActiveSession, getElapsedSeconds } from '@/lib/activeSession';

interface TimerProps {
  isRunning: boolean;
  onStop: (seconds: number) => void;
  activeSession: ActiveSession | null;
}

export function Timer({ isRunning, onStop, activeSession }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | undefined>();

  // Try to keep the screen awake while running
  useWakeLock(isRunning);

  // Update displayed seconds based on timestamps (no drift)
  useEffect(() => {
    const update = () => {
      const elapsed = getElapsedSeconds(activeSession);
      setSeconds(elapsed);
    };

    if (isRunning && activeSession) {
      // Update immediately and then every second
      update();
      intervalRef.current = window.setInterval(update, 1000);
    } else {
      // When stopped, reset display
      setSeconds(0);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isRunning, activeSession]);

  // Format seconds to MM:SS display
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Handle stop - compute duration from timestamps via active session
  const handleStop = () => {
    const durationSeconds = getElapsedSeconds(activeSession);
    onStop(durationSeconds);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Large timer display */}
      <div className="text-7xl font-bold text-blue-600 font-mono">
        {formatTime(seconds)}
      </div>

      {/* Stop button - only show when timer is running */}
      {isRunning && (
        <button
          onClick={handleStop}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-xl font-bold rounded-lg transition-colors"
        >
          Stop Session
        </button>
      )}
    </div>
  );
}
