import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';
import { ChatStorage } from '../utils/storage/index';
import { useAuth } from '../contexts/AuthContext';

export function useChatStorage(chatId, chatType = 'contact') {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [localStorage] = useState(() => new ChatStorage(chatId));

  const loadingRef = useRef(false);

  const addStorageMessage = useCallback(
    (message) => {
      if (!chatId) return null;

      if (chatType === 'user' && isAuthenticated) {
        return messageService.sendMessage(user.id, chatId, message);
      } else {
        const savedMessage = localStorage.saveMessage(message);
        setMessages((prev) => [...prev, savedMessage]);
        return savedMessage;
      }
    },
    [chatId, chatType, isAuthenticated, user, localStorage],
  );

  useEffect(() => {
    if (chatType === 'user' && user && chatId && isAuthenticated) {
      const conversationKey = messageService.getConversationKey(user.id, chatId);

      const unsubscribe = messageService.subscribe(conversationKey, (newMessages) => {
        setMessages((prev) => {
          const messageIds = new Set(prev.map((m) => m.id));
          const uniqueNewMessages = newMessages.filter((m) => !messageIds.has(m.id));
          return [...prev, ...uniqueNewMessages].sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));
        });
      });

      return unsubscribe;
    }
  }, [chatId, chatType, user, isAuthenticated]);

  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      if (!chatId || loadingRef.current) return;

      try {
        setLoading(true);
        setError(null);
        loadingRef.current = true;

        let loadedMessages = [];
        let pagination = null;

        if (chatType === 'user' && user && isAuthenticated) {
          const response = await messageService.getConversationMessages(user.id, chatId, pageNum, 50);
          loadedMessages = response.messages || [];
          pagination = response.pagination;
        } else {
          loadedMessages = localStorage.getMessages();
          pagination = { hasNext: false };
        }

        if (append) {
          setMessages((prev) => [...loadedMessages, ...prev]);
        } else {
          setMessages(loadedMessages);
        }

        setHasMore(pagination?.hasNext || false);
        setPage(pageNum);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [chatId, chatType, user, isAuthenticated, localStorage],
  );

  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading && chatType === 'user') {
      loadMessages(page + 1, true);
    }
  }, [hasMore, loading, page, loadMessages, chatType]);

  const sendMessage = useCallback(
    async (messageData) => {
      if (!chatId) return null;

      try {
        setError(null);
        let savedMessage;

        if (chatType === 'user' && user && isAuthenticated) {
          savedMessage = await messageService.sendMessage(user.id, chatId, messageData);
        } else {
          savedMessage = localStorage.saveMessage(messageData);
          setMessages((prev) => [...prev, savedMessage]);
        }

        return savedMessage;
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err.message || 'Failed to send message');
        throw err;
      }
    },
    [chatId, chatType, user, isAuthenticated, localStorage],
  );

  const updateMessage = useCallback(
    async (messageId, updates) => {
      if (!chatId) return null;

      try {
        setError(null);
        let updatedMessage;

        if (chatType === 'user' && user && isAuthenticated) {
          updatedMessage = await messageService.updateMessage(messageId, updates);
        } else {
          updatedMessage = localStorage.updateMessage(messageId, updates);
        }

        if (updatedMessage) {
          setMessages((prev) => prev.map((msg) => (msg.id === messageId ? updatedMessage : msg)));
        }

        return updatedMessage;
      } catch (err) {
        console.error('Error updating message:', err);
        setError(err.message || 'Failed to update message');
        throw err;
      }
    },
    [chatId, chatType, user, isAuthenticated, localStorage],
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!chatId) return false;

      try {
        setError(null);
        let success = false;

        if (chatType === 'user' && user && isAuthenticated) {
          await messageService.deleteMessage(messageId);
          success = true;
        } else {
          success = localStorage.deleteMessage(messageId);
        }

        if (success) {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        }

        return success;
      } catch (err) {
        console.error('Error deleting message:', err);
        setError(err.message || 'Failed to delete message');
        throw err;
      }
    },
    [chatId, chatType, user, isAuthenticated, localStorage],
  );

  const markAsRead = useCallback(async () => {
    if (!chatId || chatType !== 'user' || !user || !isAuthenticated) return;

    try {
      await messageService.markMessagesAsRead(user.id, chatId);

      setMessages((prev) => prev.map((msg) => (msg.toUserId === user.id && !msg.read ? { ...msg, read: true } : msg)));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [chatId, chatType, user, isAuthenticated]);

  const clearMessages = useCallback(async () => {
    if (!chatId) return false;

    try {
      setError(null);

      if (chatType === 'user' && user && isAuthenticated) {
        setMessages([]);
        setPage(1);
        setHasMore(true);
      } else {
        localStorage.clearMessages();
        setMessages([]);
      }

      return true;
    } catch (err) {
      console.error('Error clearing messages:', err);
      setError(err.message || 'Failed to clear messages');
      return false;
    }
  }, [chatId, chatType, user, isAuthenticated, localStorage]);

  const getUnreadCount = useCallback(() => {
    if (!user) return 0;
    return messageService.getUnreadCount(messages, user.id);
  }, [messages, user]);

  const refreshMessages = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadMessages(1, false);
  }, [loadMessages]);

  useEffect(() => {
    if (chatId) {
      refreshMessages();
    } else {
      setMessages([]);
      setError(null);
      setPage(1);
      setHasMore(true);
    }
  }, [chatId, refreshMessages]);

  useEffect(() => {
    if (chatType === 'user' && messages.length > 0 && user && isAuthenticated) {
      const hasUnreadMessages = messages.some((msg) => msg.toUserId === user.id && !msg.read);

      if (hasUnreadMessages) {
        markAsRead();
      }
    }
  }, [messages, chatType, user, isAuthenticated, markAsRead]);

  return {
    messages,
    addMessage: addStorageMessage,
    loading,
    error,
    hasMore,
    sendMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    markAsRead,
    getUnreadCount,
    refreshMessages,
    loadMoreMessages,
  };
}
