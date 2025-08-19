import { useState, useEffect, useCallback } from 'react';
import { ChatStorage } from '../utils/chatStorage.jsx';

export const useChatStorage = (contactId) => {
  const [messages, setMessages] = useState([]);
  const [storage, setStorage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contactId) {
      setIsLoading(true);
      
      const chatStorage = new ChatStorage(`contact_${contactId}`);
      setStorage(chatStorage);
      
      const storedMessages = chatStorage.getMessages();
      setMessages(storedMessages);
      setIsLoading(false);
    } else {
      setStorage(null);
      setMessages([]);
      setIsLoading(false);
    }
  }, [contactId]);

  const addMessage = useCallback(
    (messageData) => {
      if (!storage) return null;
      const savedMessage = storage.saveMessage(messageData);
      setMessages((prev) => [...prev, savedMessage]);
      return savedMessage;
    },
    [storage],
  );

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

  const clearMessages = useCallback(() => {
    if (!storage) return false;

    const success = storage.clearMessages();
    if (success) {
      setMessages([]);
    }
    return success;
  }, [storage]);

  return { 
    messages, isLoading, addMessage,
    updateMessage, deleteMessage,
    clearMessages, storage
  };
};
