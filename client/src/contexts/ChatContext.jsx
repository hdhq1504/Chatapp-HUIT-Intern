import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { api } from '../api/apiService';
import { useAuth } from './AuthContext';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { generateId, getConversationKey } from '../storage/helpers';

const ChatContext = createContext(null);

const MESSAGE_TYPE_ROOM = 'room';
const MESSAGE_TYPE_CONTACT = 'contact';

const normalizeChatType = (chatType) => {
  if (!chatType) {
    return MESSAGE_TYPE_CONTACT;
  }

  return chatType === MESSAGE_TYPE_ROOM ? MESSAGE_TYPE_ROOM : MESSAGE_TYPE_CONTACT;
};

const toStringId = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const parseTimestampToMs = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const messageCacheRef = useRef(new Map());
  const onlineUsersRef = useRef(new Set());

  useEffect(() => {
    if (!user?.id) {
      messageCacheRef.current.clear();
    }
  }, [user?.id]);

  const getCacheKey = useCallback(
    (chatId, chatType = MESSAGE_TYPE_CONTACT) => {
      if (!chatId) return null;

      const normalizedType = normalizeChatType(chatType);
      if (normalizedType === MESSAGE_TYPE_ROOM) {
        return `${MESSAGE_TYPE_ROOM}:${toStringId(chatId)}`;
      }

      if (!user?.id) {
        return null;
      }

      const conversationKey = getConversationKey(user.id, chatId);
      if (!conversationKey) {
        return null;
      }

      return `${MESSAGE_TYPE_CONTACT}:${conversationKey}`;
    },
    [user?.id],
  );

  const getStorageKey = useCallback(
    (chatId, chatType = MESSAGE_TYPE_CONTACT) => {
      if (!chatId) return null;

      const normalizedType = normalizeChatType(chatType);
      if (normalizedType === MESSAGE_TYPE_ROOM) {
        return `room_messages_${toStringId(chatId)}`;
      }

      if (!user?.id) {
        return null;
      }

      const conversationKey = getConversationKey(user.id, chatId);
      if (!conversationKey) {
        return null;
      }

      return `chat_${conversationKey}`;
    },
    [user?.id],
  );

  const mapServerMessage = useCallback(
    (rawMessage = null, fallback = {}) => {
      if (!rawMessage && !fallback) {
        return null;
      }

      const timestampMs =
        parseTimestampToMs(rawMessage?.timestampMs) ??
        parseTimestampToMs(rawMessage?.timestamp) ??
        parseTimestampToMs(rawMessage?.dateSent) ??
        parseTimestampToMs(fallback.timestampMs) ??
        parseTimestampToMs(fallback.timestamp) ??
        Date.now();

      const rawSenderId = rawMessage?.userId ?? fallback.senderId ?? (fallback.sender === 'self' ? user?.id : null);
      const senderId = rawSenderId ? toStringId(rawSenderId) : null;
      const isSelf = senderId && user?.id ? senderId === toStringId(user.id) : fallback.sender === 'self';

      const normalizedType = (() => {
        const sourceType = rawMessage?.messageType ?? fallback.type ?? 'text';
        return typeof sourceType === 'string' ? sourceType.toLowerCase() : 'text';
      })();

      return {
        id: rawMessage?.id ?? fallback.id ?? generateId('msg'),
        content: rawMessage?.content ?? fallback.content ?? '',
        type: normalizedType,
        timestamp: timestampMs,
        timestampMs,
        sender: isSelf ? 'self' : 'other',
        senderId,
        senderName:
          rawMessage?.userName ??
          fallback.senderName ??
          (isSelf ? user?.name || user?.username || 'You' : rawMessage?.userName || ''),
        senderAvatar: rawMessage?.userAvatar ?? fallback.senderAvatar ?? null,
        edited: rawMessage?.edited ?? fallback.edited ?? false,
        deleted: rawMessage?.deleted ?? fallback.deleted ?? false,
      };
    },
    [user?.id, user?.name, user?.username],
  );

  const persistMessages = useCallback(
    (chatId, chatType, messages) => {
      const cacheKey = getCacheKey(chatId, chatType);
      if (!cacheKey) {
        return;
      }

      const normalizedMessages = Array.isArray(messages) ? messages.map((message) => ({ ...message })) : [];

      messageCacheRef.current.set(cacheKey, normalizedMessages);

      const storageKey = getStorageKey(chatId, chatType);
      if (storageKey) {
        safeSetItem(storageKey, normalizedMessages);
      }
    },
    [getCacheKey, getStorageKey],
  );

  const getChatHistory = useCallback(
    (chatId, chatType = MESSAGE_TYPE_CONTACT) => {
      const cacheKey = getCacheKey(chatId, chatType);
      if (!cacheKey) {
        return [];
      }

      if (messageCacheRef.current.has(cacheKey)) {
        return messageCacheRef.current.get(cacheKey) ?? [];
      }

      const storageKey = getStorageKey(chatId, chatType);
      if (!storageKey) {
        return [];
      }

      const stored = safeGetItem(storageKey, []);
      if (Array.isArray(stored) && stored.length > 0) {
        messageCacheRef.current.set(cacheKey, stored);
        return stored;
      }

      return [];
    },
    [getCacheKey, getStorageKey],
  );

  const dedupeAndSortMessages = useCallback((messages) => {
    if (!Array.isArray(messages)) {
      return [];
    }

    const messageMap = new Map();
    messages.forEach((message) => {
      if (!message) return;
      messageMap.set(message.id, message);
    });

    return Array.from(messageMap.values()).sort((a, b) => {
      const aTs = parseTimestampToMs(a?.timestamp) ?? 0;
      const bTs = parseTimestampToMs(b?.timestamp) ?? 0;
      return aTs - bTs;
    });
  }, []);

  const loadDirectMessages = useCallback(
    async (chatId) => {
      if (!user?.id || !chatId) {
        return [];
      }

      try {
        const [messagesToContactResp, messagesToMeResp] = await Promise.all([
          api.getUserMessages(chatId),
          api.getUserMessages(user.id),
        ]);

        const messagesToContact = Array.isArray(messagesToContactResp?.data) ? messagesToContactResp.data : [];
        const messagesToMe = Array.isArray(messagesToMeResp?.data) ? messagesToMeResp.data : [];

        const currentUserId = toStringId(user.id);
        const contactId = toStringId(chatId);

        const sentByMe = messagesToContact.filter((message) => toStringId(message?.userId) === currentUserId);
        const sentByContact = messagesToMe.filter((message) => toStringId(message?.userId) === contactId);

        const normalizedMessages = [...sentByMe, ...sentByContact].map((message) => mapServerMessage(message));
        return dedupeAndSortMessages(normalizedMessages);
      } catch (error) {
        console.error('Failed to load direct messages:', error);
        return getChatHistory(chatId, MESSAGE_TYPE_CONTACT);
      }
    },
    [dedupeAndSortMessages, getChatHistory, mapServerMessage, user?.id],
  );

  const loadRoomMessages = useCallback(
    async (roomId) => {
      if (!roomId) {
        return [];
      }

      try {
        const response = await api.getMessagesByRoomId(roomId, { size: 200 });
        const messages = Array.isArray(response?.data) ? response.data : [];
        const normalizedMessages = messages.map((message) => mapServerMessage(message));
        return dedupeAndSortMessages(normalizedMessages);
      } catch (error) {
        console.error('Failed to load room messages:', error);
        return getChatHistory(roomId, MESSAGE_TYPE_ROOM);
      }
    },
    [dedupeAndSortMessages, getChatHistory, mapServerMessage],
  );

  const loadMessageHistory = useCallback(
    async (chatId, chatType = MESSAGE_TYPE_CONTACT) => {
      const normalizedType = normalizeChatType(chatType);
      if (!chatId) {
        return [];
      }

      const messages =
        normalizedType === MESSAGE_TYPE_ROOM ? await loadRoomMessages(chatId) : await loadDirectMessages(chatId);

      persistMessages(chatId, normalizedType, messages);
      return messages;
    },
    [loadDirectMessages, loadRoomMessages, persistMessages],
  );

  const sendMessage = useCallback(
    async (chatId, messageData, chatType = MESSAGE_TYPE_CONTACT) => {
      const normalizedType = normalizeChatType(chatType);

      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      if (!chatId) {
        return { success: false, error: 'Invalid chat id' };
      }

      const trimmedContent = messageData?.content?.trim();
      if (!trimmedContent) {
        return { success: false, error: 'Message content is empty' };
      }

      try {
        let response;

        if (normalizedType === MESSAGE_TYPE_ROOM) {
          response = await api.sendRoomMessage(chatId, {
            content: trimmedContent,
            messageType: 'TEXT',
          });
        } else {
          response = await api.sendMessage({
            content: trimmedContent,
            messageType: 'TEXT',
            recivedMessageRoomId: null,
            recivedMessageUserId: chatId,
            sendUserId: user.id,
          });
        }

        const serverMessage = response?.data;
        const normalizedMessage = mapServerMessage(serverMessage, {
          ...messageData,
          sender: 'self',
          timestamp: messageData?.timestamp ?? Date.now(),
          id: messageData?.id ?? generateId('msg'),
        });

        const previousMessages = getChatHistory(chatId, normalizedType);
        persistMessages(chatId, normalizedType, [...previousMessages, normalizedMessage]);

        if (normalizedType === MESSAGE_TYPE_ROOM) {
          window.dispatchEvent(
            new CustomEvent('room-message-received', {
              detail: { roomId: chatId, message: normalizedMessage },
            }),
          );
        }

        return { success: true, messageData: normalizedMessage };
      } catch (error) {
        console.error('Error sending message:', error);
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to send message',
        };
      }
    },
    [getChatHistory, mapServerMessage, persistMessages, user?.id],
  );

  const isUserOnline = useCallback((userId) => {
    if (!userId) {
      return false;
    }
    return onlineUsersRef.current.has(toStringId(userId));
  }, []);

  const contextValue = useMemo(
    () => ({
      sendMessage,
      getChatHistory,
      loadMessageHistory,
      isUserOnline,
    }),
    [getChatHistory, isUserOnline, loadMessageHistory, sendMessage],
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export default ChatContext;
