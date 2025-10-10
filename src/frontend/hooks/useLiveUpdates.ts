/**
 * React Hook for Live Updates
 */

import { useState, useEffect, useCallback } from 'react';
import { liveUpdates } from '../lib/liveUpdates';
import type { LiveUpdate, PresaleProgress, VisitorStats } from '../types/presale';

interface LiveUpdatesState {
  updates: LiveUpdate[];
  progress: PresaleProgress | null;
  stats: VisitorStats | null;
  connected: boolean;
}

const MAX_UPDATES = 20; // Keep last 20 updates

export function useLiveUpdates(wsUrl?: string) {
  const [state, setState] = useState<LiveUpdatesState>({
    updates: [],
    progress: null,
    stats: null,
    connected: false
  });

  /**
   * Handle new update
   */
  const handleUpdate = useCallback((update: LiveUpdate) => {
    setState(prev => ({
      ...prev,
      updates: [update, ...prev.updates].slice(0, MAX_UPDATES)
    }));
  }, []);

  /**
   * Handle progress update
   */
  const handleProgress = useCallback((progress: PresaleProgress) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  /**
   * Handle stats update
   */
  const handleStats = useCallback((stats: VisitorStats) => {
    setState(prev => ({ ...prev, stats }));
  }, []);

  /**
   * Clear updates
   */
  const clearUpdates = useCallback(() => {
    setState(prev => ({ ...prev, updates: [] }));
  }, []);

  // Connect to live updates on mount
  useEffect(() => {
    liveUpdates.connect(wsUrl);

    // Subscribe to updates
    const unsubUpdate = liveUpdates.onUpdate(handleUpdate);
    const unsubProgress = liveUpdates.onProgress(handleProgress);
    const unsubStats = liveUpdates.onStats(handleStats);

    // Check connection status
    const checkConnection = () => {
      setState(prev => ({
        ...prev,
        connected: liveUpdates.isConnected()
      }));
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => {
      unsubUpdate();
      unsubProgress();
      unsubStats();
      clearInterval(connectionInterval);
    };
  }, [wsUrl, handleUpdate, handleProgress, handleStats]);

  return {
    ...state,
    clearUpdates
  };
}
