import { useState, useEffect, useCallback } from 'react';
import { ChatStorage } from '../utils/chatStorage.jsx';

export const useChatStorage = (contactId) => {
  const [messages, setMessages] = useState([]);
  const [storage, setStorage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize storage khi contactId thay đổi
  useEffect(() => {
    if (contactId) {
      setIsLoading(true);
      const chatStorage = new ChatStorage(`contact_${contactId}`);
      setStorage(chatStorage);

      // Load messages từ storage
      const storedMessages = chatStorage.getMessages();
      setMessages(storedMessages);
      setIsLoading(false);
    } else {
      setStorage(null);
      setMessages([]);
      setIsLoading(false);
    }
  }, [contactId]);

  // Add message function
  const addMessage = useCallback(
    (messageData) => {
      if (!storage) return null;

      const savedMessage = storage.saveMessage(messageData);
      setMessages((prev) => [...prev, savedMessage]);
      return savedMessage;
    },
    [storage],
  );

  // Update message function
  const updateMessage = useCallback(
    (messageId, updates) => {
      if (!storage) return null;

      const updatedMessage = storage.updateMessage(messageId, updates);
      if (updatedMessage) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? updatedMessage : msg)),
        );
      }
      return updatedMessage;
    },
    [storage],
  );

  // Delete message function
  const deleteMessage = useCallback(
    (messageId) => {
      if (!storage) return false;

      const success = storage.deleteMessage(messageId);
      if (success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
      return success;
    },
    [storage],
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    if (!storage) return false;

    const success = storage.clearMessages();
    if (success) {
      setMessages([]);
    }
    return success;
  }, [storage]);

  // Get chat statistics
  const getStats = useCallback(() => {
    return storage ? storage.getStats() : null;
  }, [storage]);

  // Export chat
  const exportChat = useCallback(() => {
    return storage ? storage.exportChat() : null;
  }, [storage]);

  // Import chat
  const importChat = useCallback(
    (exportData) => {
      if (!storage) return false;

      const success = storage.importChat(exportData);
      if (success) {
        const importedMessages = storage.getMessages();
        setMessages(importedMessages);
      }
      return success;
    },
    [storage],
  );

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    getStats,
    exportChat,
    importChat,
    storage,
  };
};
