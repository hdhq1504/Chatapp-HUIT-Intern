import { useEffect, useRef, useCallback } from 'react';
import { setupRealtimeConnection } from '../api';
import { messageService } from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';

export function useRealtime() {
  const { user, isAuthenticated } = useAuth();
  const connectionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const handleMessage = useCallback((message) => {
    console.log('Received real-time message:', message);

    switch (message.type) {
      case 'chat_message':
        messageService.handleRealtimeMessage(message.data);
        break;

      case 'message_read':
        console.log('Message read:', message.data);
        break;

      case 'user_typing':
        console.log('User typing:', message.data);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const handleUserStatus = useCallback((statusUpdate) => {
    console.log('User status update:', statusUpdate);
  }, []);

  const connect = useCallback(() => {
    if (!user || !isAuthenticated || connectionRef.current) {
      return;
    }

    console.log('Connecting to real-time service...');

    try {
      const connection = setupRealtimeConnection(
        user.id,
        handleMessage,
        handleUserStatus,
      );

      connectionRef.current = connection;
      reconnectAttempts.current = 0;

      console.log('Real-time connection established');
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      scheduleReconnect();
    }
  }, [user, isAuthenticated, handleMessage, handleUserStatus]);

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      console.log('Disconnecting from real-time service...');
      connectionRef.current.disconnect();
      connectionRef.current = null;
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
    if (connectionRef.current) {
      connectionRef.current.emit(event, data);
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
        if (user && isAuthenticated && !connectionRef.current) {
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
    isConnected: !!connectionRef.current,
    connect,
    disconnect,
    emit,
    sendTyping,
    sendReadReceipt,
  };
}
