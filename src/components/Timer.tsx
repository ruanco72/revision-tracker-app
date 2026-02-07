"use client";

// Timer component that manages session timing
// Uses timestamps for accurate elapsed time and attempts to hold a wake lock

import { useEffect, useRef, useState } from 'react';
import { useWakeLock } from '../hooks/useWakeLock';

interface TimerProps {
  isRunning: boolean;
  onStop: (minutes: number) => void;
}

export function Timer({ isRunning, onStop }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  // store start time in a ref so it survives re-renders without causing effects
  const startTimeRef = useRef<number | null>(null);

  // Try to keep the screen awake while running
  useWakeLock(isRunning);

  // Update displayed seconds based on timestamps (no drift)
  useEffect(() => {
    let id: number | undefined;

    const update = () => {
      const start = startTimeRef.current;
      if (!start) return;
      const elapsedMs = Date.now() - start;
      setSeconds(Math.floor(elapsedMs / 1000));
    };

    if (isRunning) {
      // initialize start time if missing
      if (!startTimeRef.current) startTimeRef.current = Date.now();

      // update immediately and then every second
      update();
      id = window.setInterval(update, 1000);
    } else {
      // when stopped externally, reset local state
      setSeconds(0);
      startTimeRef.current = null;
    }

    return () => {
      if (id !== undefined) window.clearInterval(id);
    };
  }, [isRunning]);

  // Format seconds to MM:SS display
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Handle stop - compute duration from timestamps so it's accurate
  const handleStop = () => {
    const start = startTimeRef.current;
    const durationSeconds = start ? Math.floor((Date.now() - start) / 1000) : seconds;
    const minutes = Math.round(durationSeconds / 60);
    onStop(minutes);
    // reset local state
    setSeconds(0);
    startTimeRef.current = null;
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
