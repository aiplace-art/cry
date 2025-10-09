import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  data: any;
  timestamp: number;
};

type WebSocketHookOptions = {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
};

export function useWebSocket(options: WebSocketHookOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    reconnect = true,
    reconnectInterval = 5000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [url, reconnect, reconnectInterval, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const subscribe = useCallback((channel: string) => {
    send({ type: 'subscribe', channel });
  }, [send]);

  const unsubscribe = useCallback((channel: string) => {
    send({ type: 'unsubscribe', channel });
  }, [send]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}

// Hook for price updates
export function usePriceUpdates(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  useWebSocket({
    onConnect: () => {
      console.log(`Subscribed to price updates for ${symbol}`);
    },
    onMessage: (message) => {
      if (message.type === 'price_update' && message.data.symbol === symbol) {
        setPrice(message.data.price);
        setPriceChange(message.data.change24h || 0);
      }
    },
  });

  return { price, priceChange };
}

// Hook for staking updates
export function useStakingUpdates(address: string) {
  const [stakingData, setStakingData] = useState<any>(null);

  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'staking_update' && message.data.address === address) {
        setStakingData(message.data);
      }
    },
  });

  return stakingData;
}

// Hook for transaction updates
export function useTransactionUpdates(userAddress: string) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'transaction' && message.data.address === userAddress) {
        setTransactions((prev) => [message.data, ...prev].slice(0, 50));
      }
    },
  });

  return transactions;
}
