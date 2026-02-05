'use client';

// Timer component that manages session timing
// Displays time in MM:SS format and handles start/stop logic

import { useEffect, useState } from 'react';

interface TimerProps {
  isRunning: boolean;
  onStop: (minutes: number) => void;
}

export function Timer({ isRunning, onStop }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  // Update timer every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Format seconds to MM:SS display
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Handle stop - calculate minutes and pass to parent
  const handleStop = () => {
    const minutes = Math.round(seconds / 60);
    onStop(minutes);
    setSeconds(0);
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
