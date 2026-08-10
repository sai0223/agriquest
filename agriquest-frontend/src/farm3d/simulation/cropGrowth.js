/* ═══════════════════════════════════════════════════════════════
   Crop Growth Simulation — Timer-based growth engine
   ═══════════════════════════════════════════════════════════════ */
import { useEffect, useRef } from 'react';
import { useFarmState } from './farmState.jsx';

const TICK_INTERVAL_MS = 1000; // 1 tick per second

export function useGrowthSimulation() {
  const { actions } = useFarmState();
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      actions.tickGrowth();
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [actions]);

  // Clean up old notifications periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      actions.clearOldNotifications();
    }, 10000);
    return () => clearInterval(cleanup);
  }, [actions]);
}
