import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { safeGetItem, safeSetItem, generateId, getConversationKey } from '../utils/storage/index';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeChats, setActiveChats] = useState(new Map());

  // Simulated online users - in real app, this would come from WebSocket
  useEffect(() => {
    // Simulate some users being online
    const simulatedOnlineUsers = new Set([1, 2, 3, 4, 5]);
    setOnlineUsers(simulatedOnlineUsers);

    // In real app: establish WebSocket connection here
    // const ws = new WebSocket('ws://your-server/chat');
    // ws.onmessage = handleIncomingMessage;
  }, []);

  const sendMessage = async (chatId, message, chatType = 'contact') => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const messageData = {
        id: generateId('msg'),
        senderId: user.id,
        receiverId: chatId,
        senderName: user.name || user.username,
        senderAvatar: user.avatar,
        content: message.content || message.text,
        type: message.type || 'text',
        files: message.files || null,
        timestamp: Date.now(),
        chatId,
        chatType,
        status: 'sent',
        sender: 'self', // For UI rendering
      };

      // Tạo unique chat key cho cả 2 user
  const chatKey = `chat_${getConversationKey(user.id, chatId)}`;

  // Lấy tin nhắn hiện tại và lưu an toàn
  const existingMessages = safeGetItem(chatKey, []);
  const updatedMessages = [...existingMessages, messageData];
  safeSetItem(chatKey, updatedMessages);

      // Cập nhật active chats
      setActiveChats((prev) => {
        const newChats = new Map(prev);
        const chatHistory = newChats.get(chatId) || [];
        newChats.set(chatId, [...chatHistory, messageData]);
        return newChats;
      });

      // Simulate message delivery (replace with real WebSocket/API call)
      if (chatType === 'group') {
        await simulateGroupMessageDelivery(messageData);
      } else {
        await simulateDirectMessageDelivery(messageData, chatKey);
      }

      return { success: true, messageData };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: error.message };
    }
  };

  const simulateDirectMessageDelivery = async (messageData, chatKey) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a copy for the receiver with different sender info
    const messageForReceiver = {
      ...messageData,
      sender: 'other', // This will be 'other' for the receiver
      status: 'delivered',
    };

    // In real app: server would handle delivery to recipient
    // For now, we'll trigger a custom event that the receiver can listen to
    window.dispatchEvent(
      new CustomEvent('new-message', {
        detail: {
          chatKey,
          message: messageForReceiver,
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
        },
      }),
    );

    console.log('Message delivered:', messageData);
  };

  const simulateGroupMessageDelivery = async (messageData) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    // In real app: server would broadcast to all group members
    console.log('Message sent to group:', messageData);
  };

  const getChatHistory = (contactId) => {
    if (!user) return [];

  const chatKey = `chat_${getConversationKey(user.id, contactId)}`;
  const messages = safeGetItem(chatKey, []);

    // Transform messages to have correct sender info for current user
    return messages.map((msg) => ({
      ...msg,
      sender: msg.senderId === user.id ? 'self' : 'other',
    }));
  };

  const markMessageAsRead = (chatId, messageId) => {
    // In real app: send read receipt to server
    console.log(`Message ${messageId} in chat ${chatId} marked as read`);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Listen for new messages (simulate real-time updates)
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (event) => {
      const { message, senderId, receiverId } = event.detail;

      // Only process if this message is for current user
      if (receiverId === user.id) {
        setActiveChats((prev) => {
          const newChats = new Map(prev);
          const chatHistory = newChats.get(senderId) || [];
          newChats.set(senderId, [...chatHistory, message]);
          return newChats;
        });

        // Trigger UI update for unread count, etc.
        window.dispatchEvent(
          new CustomEvent('message-received', {
            detail: { senderId, message },
          }),
        );
      }
    };

    window.addEventListener('new-message', handleNewMessage);

    return () => {
      window.removeEventListener('new-message', handleNewMessage);
    };
  }, [user]);

  const value = {
    sendMessage,
    getChatHistory,
    markMessageAsRead,
    isUserOnline,
    onlineUsers,
    activeChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
