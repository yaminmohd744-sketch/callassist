import { useState, useRef, useCallback } from 'react';

export function useCallTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  }, [running]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedSeconds(0);
  }, [stopTimer]);

  const formattedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  return { elapsedSeconds, formattedTime, running, startTimer, stopTimer, resetTimer };
}
