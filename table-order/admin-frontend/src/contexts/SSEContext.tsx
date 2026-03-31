import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from './StoreContext';
import type { Order, OrderStatus } from '../types';

type ConnectionMode = 'sse' | 'polling' | 'disconnected';

interface SSEContextValue {
  isConnected: boolean;
  connectionMode: ConnectionMode;
  reconnect: () => void;
}

const SSEContext = createContext<SSEContextValue | null>(null);

const MAX_RECONNECT = 5;
const RECONNECT_INTERVAL = 3000;
const POLLING_INTERVAL = 30000;

export function SSEProvider({ children }: { children: ReactNode }) {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectCountRef = useRef(0);
  const pollingRef = useRef<number | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('disconnected');

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!currentStoreId) return;
    stopPolling();
    setConnectionMode('polling');
    pollingRef.current = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['orders', currentStoreId] });
    }, POLLING_INTERVAL);
  }, [currentStoreId, queryClient, stopPolling]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    stopPolling();
  }, [stopPolling]);

  const connect = useCallback(() => {
    if (!currentStoreId) return;
    disconnect();
    reconnectCountRef.current = 0;

    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const url = `${apiUrl}/admin/orders/stream?store_id=${currentStoreId}&token=${token}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      reconnectCountRef.current = 0;
      setConnectionMode('sse');
      stopPolling();
    };

    es.addEventListener('new_order', (event) => {
      const order: Order = JSON.parse(event.data);
      queryClient.setQueryData<Order[]>(['orders', currentStoreId], (old) =>
        old ? [...old, order] : [order],
      );
    });

    es.addEventListener('order_status_changed', (event) => {
      const { order_id, new_status } = JSON.parse(event.data) as {
        order_id: string;
        new_status: OrderStatus;
      };
      queryClient.setQueryData<Order[]>(['orders', currentStoreId], (old) =>
        old?.map((o) => (o.id === order_id ? { ...o, status: new_status } : o)),
      );
    });

    es.addEventListener('order_deleted', (event) => {
      const { order_id } = JSON.parse(event.data) as { order_id: string };
      queryClient.setQueryData<Order[]>(['orders', currentStoreId], (old) =>
        old?.filter((o) => o.id !== order_id),
      );
    });

    es.addEventListener('table_session_completed', () => {
      queryClient.invalidateQueries({ queryKey: ['orders', currentStoreId] });
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      reconnectCountRef.current += 1;

      if (reconnectCountRef.current <= MAX_RECONNECT) {
        setConnectionMode('disconnected');
        setTimeout(connect, RECONNECT_INTERVAL);
      } else {
        startPolling();
      }
    };
  }, [currentStoreId, queryClient, disconnect, stopPolling, startPolling]);

  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    stopPolling();
    connect();
  }, [connect, stopPolling]);

  useEffect(() => {
    if (currentStoreId) {
      connect();
    }
    return disconnect;
  }, [currentStoreId, connect, disconnect]);

  return (
    <SSEContext.Provider
      value={{
        isConnected: connectionMode === 'sse',
        connectionMode,
        reconnect,
      }}
    >
      {children}
    </SSEContext.Provider>
  );
}

export function useSSE(): SSEContextValue {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within SSEProvider');
  }
  return context;
}
