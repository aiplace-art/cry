/**
 * Live Updates System
 * WebSocket connection for real-time presale statistics and notifications
 */

import type { LiveUpdate, PresaleProgress, VisitorStats } from '../types/presale';

type UpdateHandler = (update: LiveUpdate) => void;
type ProgressHandler = (progress: PresaleProgress) => void;
type StatsHandler = (stats: VisitorStats) => void;

class LiveUpdatesManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  private updateHandlers: Set<UpdateHandler> = new Set();
  private progressHandlers: Set<ProgressHandler> = new Set();
  private statsHandlers: Set<StatsHandler> = new Set();

  // Simulated mode for development (when WebSocket server is not available)
  private simulatedMode = true;
  private simulationInterval: NodeJS.Timeout | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(wsUrl?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[LiveUpdates] Already connected');
      return;
    }

    // Use simulated mode if no URL provided
    if (!wsUrl) {
      console.log('[LiveUpdates] Starting in simulated mode');
      this.startSimulation();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LiveUpdates] Connected to server');
        this.reconnectAttempts = 0;
        this.simulatedMode = false;
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('[LiveUpdates] WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('[LiveUpdates] Connection closed');
        this.stopPingInterval();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[LiveUpdates] Failed to connect:', error);
      this.startSimulation();
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPingInterval();
    this.stopSimulation();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[LiveUpdates] Max reconnect attempts reached, switching to simulated mode');
      this.startSimulation();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`[LiveUpdates] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'update':
          this.notifyUpdateHandlers(message.data);
          break;
        case 'progress':
          this.notifyProgressHandlers(message.data);
          break;
        case 'stats':
          this.notifyStatsHandlers(message.data);
          break;
        case 'pong':
          // Server acknowledged ping
          break;
        default:
          console.warn('[LiveUpdates] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[LiveUpdates] Failed to parse message:', error);
    }
  }

  /**
   * Start simulated updates for development
   */
  private startSimulation(): void {
    this.simulatedMode = true;
    this.stopSimulation(); // Clear any existing simulation

    console.log('[LiveUpdates] Starting simulated mode');

    // Simulate updates every 5 seconds
    this.simulationInterval = setInterval(() => {
      // Random update type
      const updateTypes = ['purchase', 'milestone', 'visitor', 'progress'];
      const type = updateTypes[Math.floor(Math.random() * updateTypes.length)] as any;

      const update: LiveUpdate = {
        type,
        timestamp: Date.now(),
        data: this.generateSimulatedData(type)
      };

      this.notifyUpdateHandlers(update);

      // Also update progress
      if (Math.random() > 0.5) {
        this.notifyProgressHandlers(this.generateSimulatedProgress());
      }

      // And stats
      if (Math.random() > 0.7) {
        this.notifyStatsHandlers(this.generateSimulatedStats());
      }
    }, 5000);
  }

  /**
   * Stop simulation
   */
  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  /**
   * Generate simulated update data
   */
  private generateSimulatedData(type: string): any {
    switch (type) {
      case 'purchase':
        return {
          amount: Math.floor(Math.random() * 10000) + 500,
          tokens: Math.floor(Math.random() * 50000000) + 1000000,
          address: `0x${Math.random().toString(16).substr(2, 8)}...`,
          country: ['USA', 'UK', 'Germany', 'Japan', 'Singapore'][Math.floor(Math.random() * 5)]
        };

      case 'milestone':
        return {
          message: 'New milestone reached!',
          value: Math.floor(Math.random() * 1000000) + 500000
        };

      case 'visitor':
        return {
          action: ['joined', 'connected_wallet', 'calculated'][Math.floor(Math.random() * 3)],
          count: Math.floor(Math.random() * 100) + 20
        };

      case 'progress':
        return this.generateSimulatedProgress();

      default:
        return {};
    }
  }

  /**
   * Generate simulated progress data
   */
  private generateSimulatedProgress(): PresaleProgress {
    const target = 50000000; // 50M target
    const current = Math.floor(Math.random() * target * 0.7) + target * 0.3;

    return {
      current,
      target,
      percentage: (current / target) * 100,
      remaining: target - current,
      timeLeft: Math.floor(Math.random() * 30 * 24 * 60 * 60) // Random days remaining
    };
  }

  /**
   * Generate simulated visitor stats
   */
  private generateSimulatedStats(): VisitorStats {
    return {
      online: Math.floor(Math.random() * 50) + 20,
      total: Math.floor(Math.random() * 10000) + 5000,
      purchases24h: Math.floor(Math.random() * 100) + 20,
      avgInvestment: Math.floor(Math.random() * 5000) + 1000
    };
  }

  /**
   * Subscribe to live updates
   */
  onUpdate(handler: UpdateHandler): () => void {
    this.updateHandlers.add(handler);
    return () => this.updateHandlers.delete(handler);
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(handler: ProgressHandler): () => void {
    this.progressHandlers.add(handler);
    return () => this.progressHandlers.delete(handler);
  }

  /**
   * Subscribe to stats updates
   */
  onStats(handler: StatsHandler): () => void {
    this.statsHandlers.add(handler);
    return () => this.statsHandlers.delete(handler);
  }

  /**
   * Notify all update handlers
   */
  private notifyUpdateHandlers(update: LiveUpdate): void {
    this.updateHandlers.forEach(handler => {
      try {
        handler(update);
      } catch (error) {
        console.error('[LiveUpdates] Handler error:', error);
      }
    });
  }

  /**
   * Notify all progress handlers
   */
  private notifyProgressHandlers(progress: PresaleProgress): void {
    this.progressHandlers.forEach(handler => {
      try {
        handler(progress);
      } catch (error) {
        console.error('[LiveUpdates] Handler error:', error);
      }
    });
  }

  /**
   * Notify all stats handlers
   */
  private notifyStatsHandlers(stats: VisitorStats): void {
    this.statsHandlers.forEach(handler => {
      try {
        handler(stats);
      } catch (error) {
        console.error('[LiveUpdates] Handler error:', error);
      }
    });
  }

  /**
   * Get recent updates (from cache)
   */
  getRecentUpdates(limit: number = 10): LiveUpdate[] {
    // In production, this would return cached updates
    // For now, return empty array
    return [];
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.simulatedMode;
  }
}

// Export singleton instance
export const liveUpdates = new LiveUpdatesManager();

// Auto-connect in simulated mode for development
if (typeof window !== 'undefined') {
  liveUpdates.connect();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    liveUpdates.disconnect();
  });
}
