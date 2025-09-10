import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageService } from '../services/messageService';

const WS_BASE_URL = 'ws://localhost:8080/ws';

export function useRealtime() {
  const { user, isAuthenticated, token } = useAuth();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;
  const messageService = MessageService.getInstance();

  const handleMessage = useCallback((event) => {
    const message = JSON.parse(event.data);
    console.log('Received message:', message);

    switch (message.type) {
      case 'MESSAGE':
        messageService.handleRealtimeMessage(message.data);
        break;

      case 'READ_RECEIPT':
        console.log('Message read:', message);
        break;

      case 'TYPING':
        console.log('User typing:', message);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const connect = useCallback(() => {
    if (!user || !isAuthenticated || !token || socketRef.current) {
      return;
    }

    console.log('Connecting to WebSocket...');

    try {
      const socket = new WebSocket(`${WS_BASE_URL}?token=${token}`);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        socketRef.current = socket;
        reconnectAttempts.current = 0;
      };

      socket.onmessage = handleMessage;

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        socketRef.current = null;
        scheduleReconnect();
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      scheduleReconnect();
    }
  }, [user, isAuthenticated, handleMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting from WebSocket...');
      socketRef.current.close();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
    console.log(`Scheduling reconnection in ${delay}ms...`);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current += 1;
      connect();
    }, delay);
  }, [connect]);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('No real-time connection available');
    }
  }, []);

  const sendTyping = useCallback(
    (toUserId, isTyping = true) => {
      emit('user_typing', {
        fromUserId: user?.id,
        toUserId,
        isTyping,
        timestamp: Date.now(),
      });
    },
    [emit, user],
  );

  const sendReadReceipt = useCallback(
    (messageId, toUserId) => {
      emit('message_read', {
        messageId,
        fromUserId: user?.id,
        toUserId,
        timestamp: Date.now(),
      });
    },
    [emit, user],
  );

  useEffect(() => {
    if (user && isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, isAuthenticated, connect, disconnect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden, reducing real-time activity');
      } else {
        console.log('Page visible, restoring real-time activity');
        if (user && isAuthenticated && !socketRef.current) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isAuthenticated, connect]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network back online, reconnecting...');
      if (user && isAuthenticated) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network offline, disconnecting...');
      disconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, isAuthenticated, connect, disconnect]);

  return {
    isConnected: !!socketRef.current,
    connect,
    disconnect,
    emit,
    sendTyping,
    sendReadReceipt,
  };
}
