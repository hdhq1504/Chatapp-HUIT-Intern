import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/apiService';
import { safeGetItem, safeSetItem, generateId } from '../utils/storage';
import { getConversationKey } from '../storage/helpers';

const ChatContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeChats, setActiveChats] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [messageHistory, setMessageHistory] = useState(new Map());

  // WebSocket client ref
  const stompClient = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const normalizeMessagesForConversation = useCallback(
    (messages, { chatId, chatType = 'contact', otherUserId } = {}) => {
      if (!Array.isArray(messages)) {
        return [];
      }

      if (!user) {
        return messages;
      }

      const resolvePeerId = () => {
        if (otherUserId !== undefined && otherUserId !== null) {
          return otherUserId;
        }

        if (chatType === 'room') {
          return chatId;
        }

        return chatId;
      };

      const peerId = resolvePeerId();

      return messages.map((storedMessage) => {
        const candidateSenderId =
          storedMessage.senderId ??
          storedMessage.userId ??
          storedMessage.sendUserId ??
          storedMessage.fromUserId ??
          storedMessage.fromId ??
          storedMessage.authorId ??
          storedMessage.sender?.id ??
          storedMessage.sender?.userId ??
          null;

        const isCurrentUser = (value) => value !== null && value !== undefined && String(value) === String(user.id);

        let normalizedSender = storedMessage.sender;

        if (normalizedSender !== 'self' && normalizedSender !== 'other') {
          if (candidateSenderId !== null && candidateSenderId !== undefined) {
            normalizedSender = isCurrentUser(candidateSenderId) ? 'self' : 'other';
          } else if (storedMessage.receiverId !== undefined && storedMessage.receiverId !== null) {
            const receiverIsCurrentUser = String(storedMessage.receiverId) === String(user.id);
            normalizedSender = receiverIsCurrentUser ? 'other' : 'self';
          } else if (chatType !== 'room') {
            const inferredToUserId = storedMessage.toUserId ?? storedMessage.recivedMessageUserId ?? null;
            if (inferredToUserId !== null && inferredToUserId !== undefined) {
              normalizedSender = String(inferredToUserId) === String(user.id) ? 'other' : 'self';
            }
          }
        }

        if (normalizedSender !== 'self' && normalizedSender !== 'other') {
          normalizedSender = 'other';
        }

        const fallbackPeerId = peerId ?? storedMessage.chatId ?? storedMessage.receiverId ?? storedMessage.userId;

        const ensuredSenderId =
          candidateSenderId ?? storedMessage.senderId ?? (normalizedSender === 'self' ? user.id : fallbackPeerId);

        const ensuredReceiverId = (() => {
          if (storedMessage.receiverId !== undefined && storedMessage.receiverId !== null) {
            return storedMessage.receiverId;
          }

          if (chatType === 'room') {
            return chatId;
          }

          if (normalizedSender === 'self') {
            return fallbackPeerId ?? chatId;
          }

          return user.id;
        })();

        return {
          ...storedMessage,
          senderId: ensuredSenderId,
          receiverId: ensuredReceiverId,
          sender: normalizedSender,
        };
      });
    },
    [user],
  );

  // Map backend message format to client format - MOVED UP BEFORE USAGE
  const mapBackendMessageToClient = useCallback(
    (backendMessage, options = {}) => {
      if (!backendMessage) return null;

      const { chatId: forcedChatId = null, chatType: forcedChatType = null, otherUserId = null } = options;

      const backendSenderId =
        backendMessage.userId ??
        backendMessage.sendUserId ??
        backendMessage.senderId ??
        backendMessage.sender?.id ??
        backendMessage.authorId ??
        null;

      const inferredChatType =
        forcedChatType ??
        (backendMessage.recivedMessageRoomId || backendMessage.roomId || forcedChatId ? 'room' : 'contact');

      const resolvedChatId =
        forcedChatId ??
        backendMessage.recivedMessageRoomId ??
        backendMessage.roomId ??
        backendMessage.chatId ??
        (inferredChatType === 'room' ? null : otherUserId ?? backendMessage.recivedMessageUserId ?? null);

      const timestampSource =
        backendMessage.dateSent ??
        backendMessage.sendedAt ??
        backendMessage.timestamp ??
        backendMessage.createdAt ??
        null;

      const timestamp = timestampSource ? new Date(timestampSource).getTime() : Date.now();

      const messageType = (backendMessage.messageType || backendMessage.type || 'text').toString().toLowerCase();

      const senderId = backendSenderId ? backendSenderId.toString() : null;
      const isSelf = senderId && user ? String(senderId) === String(user.id) : false;

      const receiverId =
        inferredChatType === 'room'
          ? resolvedChatId
          : isSelf
            ? otherUserId ?? backendMessage.recivedMessageUserId ?? resolvedChatId
            : user?.id ?? null;

      return {
        id: backendMessage.id,
        senderId,
        receiverId,
        senderName:
          backendMessage.userName ??
          backendMessage.senderName ??
          backendMessage.sender?.name ??
          backendMessage.user?.name ??
          'Unknown',
        senderAvatar:
          backendMessage.userAvatar ??
          backendMessage.senderAvatar ??
          backendMessage.sender?.avatar ??
          backendMessage.user?.avatar ??
          null,
        content: backendMessage.content,
        type: messageType,
        timestamp,
        chatId:
          resolvedChatId ??
          (inferredChatType === 'contact'
            ? otherUserId ?? backendMessage.recivedMessageUserId ?? backendMessage.userId ?? null
            : null),
        chatType: inferredChatType,
        status: backendMessage.deleted ? 'deleted' : 'received',
        deleted: backendMessage.deleted ?? false,
        edited: backendMessage.edited ?? false,
        sender: isSelf ? 'self' : 'other',
        roomId: inferredChatType === 'room' ? resolvedChatId ?? null : undefined,
      };
    },
    [user],
  );

  // Handle incoming direct messages
  const handleIncomingMessage = useCallback(
    (messageData) => {
      const peerId =
        messageData.userId ??
        messageData.senderId ??
        messageData.sendUserId ??
        messageData.sender?.id ??
        null;

      const mappedMessage = mapBackendMessageToClient(messageData, {
        chatType: 'contact',
        chatId: peerId,
        otherUserId: peerId,
      });

      if (!mappedMessage || !peerId) {
        return;
      }

      // Add to message history
      const conversationKey = getConversationKey(peerId, user.id);
      const storageKey = `chat_${conversationKey}`;
      const existingMessages = safeGetItem(storageKey, []);
      const normalizedExistingMessages = normalizeMessagesForConversation(existingMessages, {
        chatId: peerId,
        chatType: 'contact',
        otherUserId: peerId,
      });

      let messagesToPersist = null;

      setMessageHistory((prev) => {
        const messages = prev.get(conversationKey) || [];
        const baseMessages = messages.length > 0 ? messages : normalizedExistingMessages;
        const newMessages = [...baseMessages, mappedMessage];
        messagesToPersist = newMessages;
        const updatedHistory = new Map(prev);
        updatedHistory.set(conversationKey, newMessages);
        return updatedHistory;
      });

      safeSetItem(storageKey, messagesToPersist ?? [...normalizedExistingMessages, mappedMessage]);

      // Update active chats
      setActiveChats((prev) => {
        const newChats = new Map(prev);
        const chatHistory = newChats.get(peerId) || [];
        newChats.set(peerId, [...chatHistory, mappedMessage]);
        const baseChatHistory = chatHistory.length > 0 ? chatHistory : normalizedExistingMessages;
        newChats.set(peerId, [...baseChatHistory, mappedMessage]);
        return newChats;
      });

      // Trigger event for UI updates
      window.dispatchEvent(
        new CustomEvent('message-received', {
          detail: { senderId: peerId, message: mappedMessage },
        }),
      );
    },
    [user, mapBackendMessageToClient, normalizeMessagesForConversation],
  );

  // Handle incoming room messages
  const handleIncomingRoomMessage = useCallback(
    (messageData) => {
      const resolvedRoomId =
        messageData.roomId ??
        messageData.recivedMessageRoomId ??
        messageData.chatId ??
        messageData.roomID ??
        null;

      if (!resolvedRoomId) {
        return;
      }

      const mappedMessage = mapBackendMessageToClient(messageData, {
        chatType: 'room',
        chatId: resolvedRoomId,
      });

      if (!mappedMessage) {
        return;
      }

      // Update room message history
      const roomKey = `room_${resolvedRoomId}`;
      const existingMessages = safeGetItem(roomKey, []);
      const normalizedExistingMessages = normalizeMessagesForConversation(existingMessages, {
        chatId: resolvedRoomId,
        chatType: 'room',
      });

      let messagesToPersist = null;

      setMessageHistory((prev) => {
        const updatedHistory = new Map(prev);
        const messages = updatedHistory.get(roomKey) || [];
        const baseMessages = messages.length > 0 ? messages : normalizedExistingMessages;
        const newMessages = [...baseMessages, mappedMessage];
        messagesToPersist = newMessages;
        updatedHistory.set(roomKey, newMessages);
        return updatedHistory;
      });

      safeSetItem(roomKey, messagesToPersist ?? [...normalizedExistingMessages, mappedMessage]);

      // Update active chats
      setActiveChats((prev) => {
        const newChats = new Map(prev);
        const chatHistory = newChats.get(resolvedRoomId) || [];
        const baseChatHistory = chatHistory.length > 0 ? chatHistory : normalizedExistingMessages;
        newChats.set(resolvedRoomId, [...baseChatHistory, mappedMessage]);
        return newChats;
      });

      // Trigger event for UI updates
      window.dispatchEvent(
        new CustomEvent('room-message-received', {
          detail: { roomId: resolvedRoomId, message: mappedMessage },
        }),
      );
    },
    [mapBackendMessageToClient, normalizeMessagesForConversation],
  );

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!token || !user || stompClient.current) return;

    try {
      const client = new Client({
        webSocketFactory: () => {
          // Use the correct backend WebSocket endpoint
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          return new SockJS(`${baseURL}/api/ws`);
        },
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: (frame) => {
          console.log('WebSocket Connected:', frame);
          setIsConnected(true);
          reconnectAttempts.current = 0;

          // Subscribe to user-specific messages
          client.subscribe(`/user/queue/messages`, (message) => {
            try {
              const data = JSON.parse(message.body);
              handleIncomingMessage(data);
            } catch (error) {
              console.error('Error parsing direct message:', error);
            }
          });

          // Subscribe to room messages
          client.subscribe(`/topic/room/+`, (message) => {
            try {
              const data = JSON.parse(message.body);
              const destination = message.headers?.destination || '';
              const roomIdFromDestination = destination.split('/').pop();
              const enriched = {
                ...data,
                roomId: data.roomId ?? data.recivedMessageRoomId ?? roomIdFromDestination ?? data.chatId,
              };
              handleIncomingRoomMessage(enriched);
            } catch (error) {
              console.error('Error parsing room message:', error);
            }
          });

          // Subscribe to online users updates
          client.subscribe('/topic/online', (message) => {
            try {
              const userData = JSON.parse(message.body);
              setOnlineUsers((prev) => new Set([...prev, userData.id]));
            } catch (error) {
              console.error('Error parsing online user:', error);
            }
          });

          client.subscribe('/topic/offline', (message) => {
            try {
              const userData = JSON.parse(message.body);
              setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(userData.id);
                return newSet;
              });
            } catch (error) {
              console.error('Error parsing offline user:', error);
            }
          });

          // Notify server that user is online
          client.publish({
            destination: '/app/user/connect',
            body: JSON.stringify({ email: user.email }),
          });
        },
        onDisconnect: () => {
          console.log('WebSocket Disconnected');
          setIsConnected(false);
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          setIsConnected(false);

          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            setTimeout(() => {
              console.log(`Reconnection attempt ${reconnectAttempts.current}`);
              connectWebSocket();
            }, 3000 * reconnectAttempts.current);
          }
        },
        onWebSocketError: (error) => {
          console.error('WebSocket Error:', error);
        },
      });

      client.activate();
      stompClient.current = client;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  }, [token, user, handleIncomingMessage, handleIncomingRoomMessage]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (stompClient.current) {
      // Notify server that user is going offline
      if (stompClient.current.connected && user) {
        stompClient.current.publish({
          destination: '/app/user/disconnect',
          body: JSON.stringify({ email: user.email }),
        });
      }

      stompClient.current.deactivate();
      stompClient.current = null;
      setIsConnected(false);
    }
  }, [user]);

  // Send message function
  const sendMessage = useCallback(
    async (chatId, message, chatType = 'contact') => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const normalizedContent = (message.content ?? message.text ?? '').toString();
        const messageData = {
          content: normalizedContent,
          messageType: 'TEXT',
          sendUserId: user.id,
          ...(chatType === 'room' ? { recivedMessageRoomId: chatId } : { recivedMessageUserId: chatId }),
        };

        let response;

        // Try WebSocket first, fallback to REST API
        if (isConnected && stompClient.current?.connected) {
          try {
            stompClient.current.publish({
              destination: '/app/sendMessage',
              body: JSON.stringify(messageData),
            });

            // Create local message object for immediate UI update
            response = {
              id: generateId('msg'),
              ...messageData,
              userId: user.id,
              dateSent: new Date().toISOString(),
            };
          } catch (wsError) {
            console.warn('WebSocket send failed, using REST API:', wsError);
            // Fallback to REST API
            const restResponse = await api.sendMessage(messageData);
            response = restResponse.data ?? restResponse;
          }
        } else {
          // Use REST API
          const restResponse = await api.sendMessage(messageData);
          response = restResponse.data ?? restResponse;
        }

        const mappedResponse = mapBackendMessageToClient(
          response
            ? {
                ...response,
                content: response.content ?? normalizedContent,
              }
            : null,
          {
            chatType,
            chatId,
            otherUserId: chatType === 'room' ? undefined : chatId,
          },
        );

        const clientMessage = {
          id: mappedResponse?.id ?? response?.id ?? generateId('msg'),
          senderId: user.id,
          receiverId: chatType === 'room' ? chatId : chatId,
          senderName: user.name || user.username,
          senderAvatar: user.avatar,
          content: normalizedContent,
          type: mappedResponse?.type ?? 'text',
          files: message.files || null,
          timestamp:
            mappedResponse?.timestamp ??
            (response?.dateSent ? new Date(response.dateSent).getTime() : Date.now()),
          chatId,
          chatType,
          status: 'sent',
          sender: 'self',
          roomId: chatType === 'room' ? chatId : mappedResponse?.roomId,
          edited: mappedResponse?.edited ?? false,
          deleted: mappedResponse?.deleted ?? false,
        };

        // Store message locally
        const storageKey = chatType === 'room' ? `room_${chatId}` : `chat_${getConversationKey(user.id, chatId)}`;

        const existingMessages = safeGetItem(storageKey, []);
        const normalizedExistingMessages = normalizeMessagesForConversation(existingMessages, {
          chatId,
          chatType,
          otherUserId: chatType === 'room' ? undefined : chatId,
        });

        let messagesToPersist = null;

        // Update message history
        setMessageHistory((prev) => {
          const key = chatType === 'room' ? `room_${chatId}` : getConversationKey(user.id, chatId);
          const previousMessages = prev.get(key) || [];
          const baseMessages = previousMessages.length > 0 ? previousMessages : normalizedExistingMessages;
          const newMessages = [...baseMessages, clientMessage];

          messagesToPersist = newMessages;

          const updatedHistory = new Map(prev);
          updatedHistory.set(key, newMessages);
          return updatedHistory;
        });

        safeSetItem(storageKey, messagesToPersist ?? [...normalizedExistingMessages, clientMessage]);

        // Update active chats
        setActiveChats((prev) => {
          const newChats = new Map(prev);
          const chatHistory = newChats.get(chatId) || [];
          const baseChatHistory = chatHistory.length > 0 ? chatHistory : normalizedExistingMessages;
          newChats.set(chatId, [...baseChatHistory, clientMessage]);
          return newChats;
        });

        return { success: true, messageData: clientMessage };
      } catch (error) {
        console.error('Failed to send message:', error);
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to send message',
        };
      }
    },
    [user, isConnected, normalizeMessagesForConversation, mapBackendMessageToClient],
  );

  // Get chat history
  const getChatHistory = useCallback(
    (contactId, chatType = 'contact') => {
      if (!user) return [];

      const key = chatType === 'room' ? `room_${contactId}` : getConversationKey(user.id, contactId);

      // First try from memory
      const memoryMessages = messageHistory.get(key) || [];
      if (memoryMessages.length > 0) {
        return memoryMessages;
      }

      // Then try from localStorage
      const storageKey = chatType === 'room' ? `room_${contactId}` : `chat_${key}`;
      const messages = safeGetItem(storageKey, []);

      // Transform messages to have correct sender info for current user
      return messages.map((msg) => ({
        ...msg,
        sender: msg.senderId === user.id ? 'self' : 'other',
      }));
    },
    [user, messageHistory],
  );

  // Load message history from backend
  const loadMessageHistory = useCallback(
    async (contactId, chatType = 'contact') => {
      if (!user) return [];

      try {
        let response;

        if (chatType === 'room') {
          response = await api.getRoomMessages(contactId);
        } else {
          // For direct messages, we might need to get conversation between two users
          response = await api.getConversation(user.id, contactId);
        }

        const rawMessages = response?.data || response?.content || [];
        const messages = rawMessages
          .map((msg) =>
            mapBackendMessageToClient(msg, {
              chatType,
              chatId: contactId,
              otherUserId: chatType === 'room' ? undefined : contactId,
            }),
          )
          .filter(Boolean);

        // Store in memory and localStorage
        const key = chatType === 'room' ? `room_${contactId}` : getConversationKey(user.id, contactId);
        const storageKey = chatType === 'room' ? `room_${contactId}` : `chat_${key}`;

        setMessageHistory((prev) => {
          const updatedHistory = new Map(prev);
          updatedHistory.set(key, messages);
          return updatedHistory;
        });

        safeSetItem(storageKey, messages);
        return messages;
      } catch (error) {
        console.error('Error loading message history:', error);
        return getChatHistory(contactId, chatType); // Fallback to cached data
      }
    },
    [user, getChatHistory, mapBackendMessageToClient],
  );

  // Mark message as read
  const markMessageAsRead = useCallback(async (chatId, messageId) => {
    try {
      await api.markMessagesAsRead(chatId, { messageId });

      // Update local message status
      setMessageHistory((prev) => {
        const updatedHistory = new Map();
        for (const [key, messages] of prev.entries()) {
          updatedHistory.set(
            key,
            messages.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)),
          );
        }
        return updatedHistory;
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Check if user is online
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers],
  );

  // Load online users
  const loadOnlineUsers = useCallback(async () => {
    try {
      const response = await api.getAllUsers();
      const onlineUserIds = response.data.filter((u) => u.status === 'ONLINE').map((u) => u.id);
      setOnlineUsers(new Set(onlineUserIds));
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  }, []);

  // WebSocket connection management
  useEffect(() => {
    if (isAuthenticated && token && user) {
      connectWebSocket();
      loadOnlineUsers();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, token, user, connectWebSocket, disconnectWebSocket, loadOnlineUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const value = {
    sendMessage,
    getChatHistory,
    loadMessageHistory,
    markMessageAsRead,
    isUserOnline,
    onlineUsers,
    activeChats,
    messageHistory,
    isConnected,
    loadOnlineUsers,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
